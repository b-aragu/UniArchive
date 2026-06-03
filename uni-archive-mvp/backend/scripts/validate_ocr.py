import sys
import time
from pathlib import Path
import json

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.services.ocr_service import extract_text_from_file

def generate_samples():
    import cv2
    import numpy as np
    import fitz
    
    samples = []
    
    # 1. Images
    for i in range(1, 4):
        filename = f"sample_image_{i}.png"
        img = np.ones((400, 800, 3), dtype=np.uint8) * 255
        cv2.putText(img, f"Academic Image Sample {i}", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
        cv2.putText(img, "This is an example of an academic image containing readable text.", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)
        cv2.putText(img, "Keywords: Machine Learning, Artificial Intelligence, Neural Networks.", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)
        # Add some noise to test preprocessing
        noise = np.random.randint(0, 50, (400, 800, 3), dtype=np.uint8)
        img = cv2.add(img, noise)
        cv2.imwrite(filename, img)
        samples.append(filename)

    # 2. Digital PDFs
    for i in range(1, 4):
        filename = f"sample_digital_pdf_{i}.pdf"
        doc = fitz.open()
        page = doc.new_page()
        text = f"Digital Academic Paper {i}\nAbstract: This paper discusses advanced topics in Computer Science.\n" * 5
        page.insert_text((50, 50), text)
        doc.save(filename)
        doc.close()
        samples.append(filename)

    # 3. Scanned PDFs (Images embedded in PDF)
    for i in range(1, 4):
        filename = f"sample_scanned_pdf_{i}.pdf"
        # Create image
        img = np.ones((600, 800, 3), dtype=np.uint8) * 200 # Greyish background
        cv2.putText(img, f"Scanned Academic Journal {i}", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
        cv2.putText(img, "This PDF simulates a scanned document without native text objects.", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)
        img_filename = f"temp_scan_{i}.png"
        cv2.imwrite(img_filename, img)
        
        # Insert image into PDF
        doc = fitz.open()
        page = doc.new_page(width=800, height=600)
        page.insert_image(page.rect, filename=img_filename)
        doc.save(filename)
        doc.close()
        Path(img_filename).unlink()
        samples.append(filename)
        
    return samples

def run_validation():
    print("Generating samples...")
    samples = generate_samples()
    
    results = []
    
    print("\nStarting OCR Validation Pass...\n")
    for sample in samples:
        print(f"Processing {sample}...")
        start_time = time.time()
        
        try:
            text, conf, method, pages = extract_text_from_file(sample)
            proc_time_ms = (time.time() - start_time) * 1000
            
            results.append({
                "file_name": sample,
                "file_type": sample.split('.')[-1].upper(),
                "extraction_method": method,
                "processing_time_ms": round(proc_time_ms, 2),
                "ocr_confidence": round(conf, 2) if conf is not None else None,
                "extracted_character_count": len(text),
                "success": len(text) > 0
            })
        except Exception as e:
            results.append({
                "file_name": sample,
                "file_type": sample.split('.')[-1].upper(),
                "extraction_method": "error",
                "processing_time_ms": 0.0,
                "ocr_confidence": None,
                "extracted_character_count": 0,
                "success": False,
                "error": str(e)
            })
            
    print("\nCleaning up samples...")
    for sample in samples:
        Path(sample).unlink(missing_ok=True)
        
    with open("ocr_results.json", "w") as f:
        json.dump(results, f, indent=2)
        
    print("\nValidation complete. Results saved to ocr_results.json")

if __name__ == "__main__":
    run_validation()
