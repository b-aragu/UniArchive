"""
OCR Service pipeline for Phase 6.
Handles extraction of text from PDF and image files with OpenCV preprocessing,
Tesseract OCR, and robust fallback mechanisms.
"""
from __future__ import annotations
import logging
import math
import time
from pathlib import Path
from typing import Any

import cv2
import fitz  # PyMuPDF
import numpy as np
import pytesseract
from PIL import Image

# Configure local logger
logger = logging.getLogger(__name__)

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".bmp"}
PDF_EXTENSIONS = {".pdf"}

class OCRResult:
    def __init__(
        self,
        text: str = "",
        confidence: float | None = None,
        extraction_method: str = "unknown",
        page_count: int = 1,
    ):
        self.text = text
        self.confidence = confidence
        self.extraction_method = extraction_method
        self.page_count = page_count


def preprocess_image_for_ocr(image_np: np.ndarray) -> np.ndarray:
    """
    Apply OpenCV preprocessing steps to improve OCR accuracy.
    - Grayscale
    - Denoising (Median blur)
    - Contrast Enhancement (CLAHE)
    - Binarization (Otsu)
    """
    try:
        # 1. Grayscale
        if len(image_np.shape) == 3:
            gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
        else:
            gray = image_np

        # 2. Denoising
        denoised = cv2.medianBlur(gray, 3)

        # 3. Contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        contrast = clahe.apply(denoised)

        # 4. Binarization (Otsu's thresholding)
        _, binarized = cv2.threshold(contrast, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # 5. Simple Deskewing (if applicable)
        coords = np.column_stack(np.where(binarized > 0))
        if len(coords) > 0:
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
            
            # Only correct small skews
            if abs(angle) > 0.5 and abs(angle) < 15:
                (h, w) = binarized.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                binarized = cv2.warpAffine(
                    binarized, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
                )

        return binarized
    except Exception as e:
        logger.warning(f"Preprocessing failed, returning original image: {e}")
        return image_np


def calculate_confidence(ocr_data: dict) -> float | None:
    """Calculate average confidence from Tesseract image_to_data output."""
    try:
        confidences = [int(conf) for conf in ocr_data.get('conf', []) if conf != '-1']
        if not confidences:
            return None
        return float(sum(confidences)) / len(confidences)
    except Exception as e:
        logger.warning(f"Confidence calculation failed: {e}")
        return None


def run_tesseract_on_image(image_np: np.ndarray) -> tuple[str, float | None]:
    """Run Tesseract OCR on a numpy image array and calculate confidence."""
    try:
        # Convert numpy array back to PIL Image for pytesseract
        pil_img = Image.fromarray(image_np)
        
        # Get detailed data including confidence
        data = pytesseract.image_to_data(pil_img, output_type=pytesseract.Output.DICT)
        text = pytesseract.image_to_string(pil_img)
        
        confidence = calculate_confidence(data)
        
        return text.strip(), confidence
    except Exception as e:
        logger.error(f"Tesseract OCR failed: {e}")
        return "", None


def extract_text_from_pdf(path: Path) -> OCRResult:
    """
    Extract text from PDF. Tries digital extraction first.
    If text is too small/empty, falls back to rendering pages and running OCR.
    """
    try:
        doc = fitz.open(path)
        page_count = len(doc)
        
        # Limit large PDFs to prevent memory/timeout issues
        if page_count > 50:
            logger.warning(f"Large PDF detected ({page_count} pages). Only processing first 50.")
            pages_to_process = 50
        else:
            pages_to_process = page_count

        text_parts = []
        for i in range(pages_to_process):
            text_parts.append(doc[i].get_text("text"))
            
        digital_text = "\n".join(text_parts).strip()
        
        # Check if digital extraction yielded meaningful text (heuristic: > 100 chars)
        if len(digital_text) > 100:
            return OCRResult(
                text=digital_text,
                confidence=100.0,  # Digital text is 100% accurate inherently
                extraction_method="digital_pdf",
                page_count=page_count
            )
            
        # --- Fallback: Scanned PDF OCR ---
        logger.info(f"PDF digital text too small. Falling back to Scanned OCR for {path.name}")
        ocr_text_parts = []
        total_conf = 0.0
        valid_pages = 0
        
        for i in range(pages_to_process):
            page = doc[i]
            # Render page to an image (zoom for better resolution, e.g., 300 DPI approx)
            matrix = fitz.Matrix(2.0, 2.0)
            pix = page.get_pixmap(matrix=matrix)
            
            # Convert fitz pixmap to numpy array (OpenCV format)
            img_np = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
            
            # Remove alpha channel if present
            if pix.n == 4:
                img_np = cv2.cvtColor(img_np, cv2.COLOR_RGBA2BGR)
                
            processed_img = preprocess_image_for_ocr(img_np)
            page_text, page_conf = run_tesseract_on_image(processed_img)
            
            ocr_text_parts.append(page_text)
            if page_conf is not None:
                total_conf += page_conf
                valid_pages += 1
                
        final_text = "\n".join(ocr_text_parts).strip()
        final_conf = (total_conf / valid_pages) if valid_pages > 0 else None
        
        return OCRResult(
            text=final_text,
            confidence=final_conf,
            extraction_method="scanned_pdf_ocr",
            page_count=page_count
        )
        
    except Exception as e:
        logger.error(f"Failed to process PDF {path.name}: {e}")
        return OCRResult(text="", confidence=None, extraction_method="failed_pdf", page_count=0)


def extract_text_from_image(path: Path) -> OCRResult:
    """Extract text from an image file using OpenCV preprocessing and Tesseract."""
    try:
        # Load image via OpenCV
        img_np = cv2.imread(str(path))
        if img_np is None:
            raise ValueError("OpenCV could not read the image.")
            
        processed_img = preprocess_image_for_ocr(img_np)
        text, conf = run_tesseract_on_image(processed_img)
        
        return OCRResult(
            text=text,
            confidence=conf,
            extraction_method="image_ocr",
            page_count=1
        )
    except Exception as e:
        logger.error(f"Failed to process image {path.name}: {e}")
        return OCRResult(text="", confidence=None, extraction_method="failed_image", page_count=0)


def extract_text_from_file(file_path: str) -> tuple[str, float | None, str, int]:
    """
    Main entry point for OCR service.
    Returns: (text, confidence, extraction_method, page_count)
    """
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix in PDF_EXTENSIONS:
        res = extract_text_from_pdf(path)
    elif suffix in IMAGE_EXTENSIONS:
        res = extract_text_from_image(path)
    else:
        logger.warning(f"Unsupported file extension {suffix} for OCR.")
        res = OCRResult(text="", confidence=None, extraction_method="unsupported", page_count=0)

    # Ensure safe fallbacks
    safe_text = res.text if res.text else ""
    return safe_text, res.confidence, res.extraction_method, res.page_count