# Phase 7 Semantic Search Implementation Report

**Project:** UniArchive  
**Phase:** Phase 7 (Semantic Search)  
**Date Executed:** June 3, 2026

---

## 1. Objective
The objective of Phase 7 was to introduce semantic vector search capabilities to UniArchive, allowing users to query documents by contextual meaning rather than relying strictly on exact keyword matching. This capability is crucial for an academic archive where terminology can vary (e.g., "AI" vs. "Artificial Intelligence").

---

## 2. Architecture & Tech Stack

The semantic search engine consists of three primary layers:
1. **Embedding Generation:** `sentence-transformers` utilizing the `all-MiniLM-L6-v2` model. This model provides an optimal balance between latency and semantic accuracy, generating dense 384-dimensional vectors.
2. **Vector Indexing (In-Memory):** Facebook AI Similarity Search (`faiss-cpu`) is used for real-time nearest-neighbor retrieval. The vectors are normalized (L2 norm) and indexed using `IndexFlatIP` (Inner Product, which is equivalent to Cosine Similarity for normalized vectors). This is wrapped in an `IndexIDMap` to support explicit mapping to database identifiers.
3. **Persistence (PostgreSQL & Disk):** The raw vectors are serialized to bytes and stored in the PostgreSQL `embeddings` table alongside chunk text. The in-memory FAISS index is flushed to disk (`faiss_index.bin`) upon modification.

---

## 3. Key Design Decisions

### 3.1 `faiss_id` Mapping Strategy
FAISS explicitly requires 64-bit integer IDs when using `IndexIDMap`. Since the core UniArchive database schema uses UUIDs for primary keys (`embeddings.id`, `documents.id`), a direct mapping is impossible without data loss (hashing UUIDs introduces collision risks).

**Resolution:** An auto-incrementing integer column named `faiss_id` was added to the `embeddings` table (using PostgreSQL `IDENTITY`). FAISS indexes the vector against this `faiss_id`. During a search, the backend queries FAISS, retrieves the `faiss_id`s, and performs a single database lookup `WHERE faiss_id IN (...)` to fetch the corresponding Document metadata and text chunks.

### 3.2 Sliding Window Chunking
Academic documents are often lengthy (exceeding standard transformer token limits, typically 512 tokens). Passing an entire document to the SBERT model would result in truncation and loss of information.

**Resolution:** The OCR text is processed through a sliding window algorithm before embedding. 
*   **Chunk Size:** 500 characters.
*   **Overlap:** 50 characters to ensure context isn't severed arbitrarily at chunk boundaries.
Each chunk is embedded individually, and when a search is performed, the system retrieves the highest-scoring chunk for a given document to act as the "snippet."

### 3.3 Fault Tolerance
Embedding generation can be computationally heavy or fail if a document contains unexpected garbled OCR output. The upload API route (`/api/upload`) was designed to handle semantic indexing failures gracefully. If `process_and_store_document` throws an exception, the upload API still returns a `200 OK` response with the successfully extracted `ocr_text`. The failure is logged for administrators to retry via the backfill script later.

---

## 4. Testing & Validation

A comprehensive test suite (`test_semantic.py`) was executed to validate the isolated components:
*   **Model Validation:** Confirmed that `all-MiniLM-L6-v2` loads natively without external API calls and outputs exact `(1, 384)` dimension arrays.
*   **Chunking Logic:** Verified that strings exceeding the window size are correctly split and overlapped.
*   **End-to-End Pipeline:** Successfully simulated a document processing run, inserting vectors into the database, generating a FAISS index, and performing a semantic search that correctly identified the target document based on a conceptually similar query ("artificial intelligence" matching "Machine learning").

## 5. Next Steps (Phase 8)
With both PostgreSQL Full-Text Search (Phase 5) and Semantic Vector Search (Phase 7) fully operational, the system is prepared for **Phase 8: Hybrid Search**. In Phase 8, we will combine the normalized scores of both subsystems using Reciprocal Rank Fusion (RRF) to provide state-of-the-art hybrid retrieval.
