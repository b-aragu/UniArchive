import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.services.ocr_service import extract_text_from_file

def test_ocr():
    test_files = [
        "test_image.png",
        "test_digital.pdf"
    ]
    
    # Create dummy files for testing
    import cv2
    import numpy as np
    
    print("Generating test image...")
    # Create a white image with black text
    img = np.ones((200, 600, 3), dtype=np.uint8) * 255
    cv2.putText(img, "UniArchive OCR Testing", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
    cv2.putText(img, "Scanned Document Simulation", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 1)
    cv2.imwrite("test_image.png", img)
    
    import fitz
    print("Generating test digital PDF...")
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 100), "UniArchive Digital PDF Testing")
    page.insert_text((50, 150), "This text is directly selectable.")
    doc.save("test_digital.pdf")
    doc.close()
    
    for filename in test_files:
        print(f"\n--- Testing {filename} ---")
        try:
            text, conf, method, pages = extract_text_from_file(filename)
            print(f"Extraction Method: {method}")
            print(f"Page Count: {pages}")
            print(f"Confidence: {conf}")
            print(f"Extracted Text:\n{text}")
        except Exception as e:
            print(f"Failed: {e}")
            
    # Cleanup
    for filename in test_files:
        Path(filename).unlink(missing_ok=True)

if __name__ == "__main__":
    test_ocr()
