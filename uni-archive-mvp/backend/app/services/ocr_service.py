from __future__ import annotations
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image
import pytesseract

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".bmp"}
PDF_EXTENSIONS = {".pdf"}

def extract_text_from_file(file_path: str) -> tuple[str, float | None]:
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix in PDF_EXTENSIONS:
        return extract_text_from_pdf(path)

    if suffix in IMAGE_EXTENSIONS:
        return extract_text_from_image(path)

    return "", None

def extract_text_from_pdf(path: Path) -> tuple[str, float | None]:
    text_parts = []
    try:
        doc = fitz.open(path)
        for page in doc:
            text_parts.append(page.get_text("text"))
        text = "\n".join(text_parts).strip()

        # MVP fallback note: if PDF text is empty, Antigravity Prompt 3 can add page-to-image OCR.
        if text:
            return text, None
        return "", None
    except Exception:
        return "", None

def extract_text_from_image(path: Path) -> tuple[str, float | None]:
    try:
        image = Image.open(path)
        text = pytesseract.image_to_string(image)
        return text.strip(), None
    except Exception:
        return "", None