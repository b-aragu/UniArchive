# Phase 8 Hybrid Search Implementation Plan

**Project:** UniArchive  
**Phase Target:** Phase 8  

---

## 1. Objective
Design the implementation strategy for Hybrid Search. This will combine the exact-match precision of PostgreSQL Full-Text Search (Phase 5) with the contextual recall of FAISS/SBERT Semantic Search (Phase 7) into a single, unified ranking.

## 2. Core Methodology: Reciprocal Rank Fusion (RRF)
Scores from BM25/`ts_rank` (Postgres) and Inner-Product similarity (FAISS) exist on entirely different mathematical scales. Normalizing them directly is difficult and error-prone. We will use Reciprocal Rank Fusion (RRF), a state-of-the-art technique that scores documents based on their ordinal rankings across different search engines, rather than their raw scores.

**RRF Formula:**
`RRF_Score = 1 / (k + rank_postgres) + 1 / (k + rank_faiss)`
*(where `k` is a smoothing constant, typically 60).*

## 3. Implementation Steps

### Step 1: Execute Independent Searches
*   Accept a single `query` string from the user.
*   Fire the `search_documents` (Postgres FTS) method. Extract the resulting document IDs and their ranks (1st, 2nd, 3rd...).
*   Fire the `search_semantic` (FAISS) method simultaneously. Extract the resulting document IDs and their ranks.

### Step 2: RRF Aggregation
*   Create an aggregation dictionary mapping `document_id` to its calculated RRF score.
*   Iterate through the Postgres results, applying `1 / (60 + rank)`.
*   Iterate through the FAISS results, applying `1 / (60 + rank)`, adding to the existing score if the document was found in both lists.

### Step 3: Result Formatting
*   Sort the combined dictionary by the final `RRF_Score` in descending order.
*   Since FAISS returns specific `matching_chunk`s and Postgres returns `ts_headline` snippets, the final unified response must cleanly present the "Best Snippet". If a document was found via both, prefer the Semantic chunk as the display snippet, but highlight keyword matches within it.

## 4. API Design Updates
**Modify `GET /api/search`**
*   Add a query parameter `mode=hybrid` (defaulting to `keyword` for backward compatibility during rollout).
*   Response schema will include a new `search_type: "hybrid"` and the `relevance_score` will be the computed RRF float.

## 5. Testing & Evaluation Strategy
*   **Evaluation Metrics:** Precision@K and Recall@K using a manually annotated ground-truth set of 20 queries.
*   **Unit Testing:** Create mock lists of ranking data to ensure the RRF math functions perfectly regardless of database connection states.
*   **Integration Testing:** Ensure the response time of a Hybrid query does not exceed 1.5x the time of the slowest individual query (as they should run concurrently or sequentially fast enough).
