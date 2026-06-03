# UniArchive: Viva & Defense Preparation Guide

This guide contains likely questions from the examination panel and model answers to help the team defend the technical decisions made during the UniArchive project.

## 1. System Architecture
**Q: Why did you choose a decoupled architecture (FastAPI + React) instead of a monolithic framework like Django or Laravel?**
**A:** "A decoupled architecture allows the backend and frontend to scale independently. FastAPI was specifically chosen because it is inherently asynchronous, which is critical when handling long-running, CPU-bound tasks like OCR and vector embedding generation without blocking other user requests."

**Q: How does the system handle concurrent users uploading large files?**
**A:** "Currently, in the MVP, uploads are handled synchronously within the FastAPI thread, taking about 0.6 seconds per document. For a production environment, this is our main identified bottleneck. We plan to decouple the OCR and Embedding steps into a background task queue (like Celery) so the user gets an immediate 'Processing' response."

## 2. OCR (Optical Character Recognition)
**Q: Why use OpenCV before Tesseract?**
**A:** "Tesseract performs poorly on raw, noisy images with low contrast. By using OpenCV to convert the image to grayscale, apply Gaussian blur to remove noise, and use adaptive thresholding, we create a high-contrast binary image. This significantly improves Tesseract's accuracy on handwritten or poorly scanned documents."

**Q: How do you differentiate between a digital PDF and a scanned PDF?**
**A:** "Our pipeline attempts to extract text using `PyMuPDF` first. If the resulting text is empty or falls below a character threshold (meaning the PDF only contains images), the pipeline automatically falls back to rasterizing the PDF to images and passing them through the OCR pipeline."

## 3. Semantic Search & FAISS
**Q: What is a Vector Embedding?**
**A:** "A vector embedding is a mathematical representation of a piece of text. We use the Sentence-BERT model (`all-MiniLM-L6-v2`) to convert text into an array of 384 floating-point numbers. Sentences with similar meanings will have vectors that point in a similar direction in that 384-dimensional space."

**Q: Why FAISS instead of standard PostgreSQL for semantic search?**
**A:** "PostgreSQL is excellent for exact keyword matching (FTS) using B-Trees or GIN indexes, but it cannot natively compute distance between high-dimensional vectors quickly. FAISS (Facebook AI Similarity Search) is highly optimized for calculating inner-product distances across thousands of vectors in milliseconds."

## 4. Hybrid Search (RRF)
**Q: How do you combine the results of Keyword Search and Semantic Search?**
**A:** "We use Reciprocal Rank Fusion (RRF). Because keyword scores and semantic cosine similarities operate on completely different numerical scales, we cannot simply add them together. RRF assigns a new score based purely on the document's rank (position) in both lists. If a document is #1 in keyword and #2 in semantic, RRF pushes it to the absolute top of the final results."

## 5. Duplicate Detection
**Q: How do you prevent identical files from being uploaded twice?**
**A:** "We use Perceptual Hashing (pHash). Unlike MD5 or SHA256 hashes, which completely change if a single pixel is altered, pHash evaluates the structural features of an image. If a student uploads a slightly compressed version of the same scanned CAT, the pHash Hamming distance will be very small (<= 15), allowing us to flag it as a near-duplicate and alert the user."

## 6. Database & Security
**Q: How is the system secured against unauthorized access?**
**A:** "We implemented JSON Web Tokens (JWT) for stateless authentication. Passwords are securely hashed using `bcrypt` before hitting the database. The API utilizes FastAPI dependencies to protect routes, ensuring only users with an 'Administrator' role can access the analytics and duplicate review endpoints."
