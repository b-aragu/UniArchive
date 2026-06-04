# Dynamic Filters & LLM Study Assistant Plan

This document outlines the design and implementation strategy for enhancing document filtering on the Documents page and integrating a focused, cost-effective LLM study assistant into the UniArchive MVP platform.

---

## Part 1: Dynamic Filters

### Current Issue
The `DocumentsPage.tsx` component currently uses hardcoded `<select>` dropdown filters for:
- **Status**: Hardcoded to `"processed"`, `"pending"`, `"failed"`.
- **Extraction Method**: Hardcoded to `"Digital"`, `"Tesseract OCR"`.

These hardcoded values are misaligned with the actual values used by the database and backend:
- **Database Statuses**: `approved`, `pending`, `rejected`, `duplicate_warning`
- **Database Extraction Methods**: `digital_pdf`, `scanned_pdf_ocr`, `image_ocr`, `failed_pdf`, `failed_image`, `unsupported`, `unknown`

### Proposed Fix
Instead of hardcoding, the filters will fetch live distinct values from the backend database to ensure consistency.

#### 1. Backend Endpoint: GET `/api/documents/filter-options`
We will add a new endpoint to query distinct values from the `documents` table:
*   **Path**: `/api/documents/filter-options`
*   **Security**: Requires authentication (`get_current_user`)
*   **SQL Operation**:
    ```sql
    SELECT DISTINCT status FROM documents;
    SELECT DISTINCT extraction_method FROM documents;
    ```
*   **Response Schema**:
    ```json
    {
      "statuses": ["approved", "pending", "rejected", "duplicate_warning"],
      "extraction_methods": ["digital_pdf", "scanned_pdf_ocr", "image_ocr"]
    }
    ```

#### 2. Frontend Integration (`DocumentsPage.tsx`)
We will fetch these options alongside courses, semesters, and document types during page load:
*   Add local states: `filterStatuses` and `filterExtractions`.
*   Fetch via the `fetchLookups` handler:
    ```typescript
    const [coursesRes, typesRes, semestersRes, filterOptionsRes] = await Promise.all([
      apiClient.get('/api/courses'),
      apiClient.get('/api/document-types'),
      apiClient.get('/api/semesters'),
      apiClient.get('/api/documents/filter-options')
    ]);
    ```
*   Implement clean frontend display mapping dictionaries to translate database strings to user-friendly titles:
    ```typescript
    const STATUS_LABELS: Record<string, string> = {
      approved: "Approved",
      pending: "Pending",
      rejected: "Rejected",
      duplicate_warning: "Duplicate Warning"
    };

    const EXTRACTION_LABELS: Record<string, string> = {
      digital_pdf: "Digital PDF (PyMuPDF)",
      scanned_pdf_ocr: "Scanned PDF (Tesseract)",
      image_ocr: "Scanned Image (Tesseract)",
      failed_pdf: "Failed PDF",
      failed_image: "Failed Image",
      unsupported: "Unsupported File",
      unknown: "Unknown Method"
    };
    ```

---

## Part 2: LLM Assistant Integration

### LLM Provider Evaluation

We evaluated two main low-cost/free LLM providers for study assistance features:

| Feature | Groq API | Google Gemini API |
| :--- | :--- | :--- |
| **Primary Models** | Llama 3 (8B, 70B), Mixtral 8x7B | Gemini 1.5 Flash, Gemini 1.5 Pro |
| **Free Tier** | Rate-limited API access (free but low TPM/RPM limit) | Free Tier (15 RPM, 1M TPM, 1,500 RPD) - No credit card required |
| **Speed** | Ultra-fast token generation (hundreds of t/s) | Fast, with low latency for Gemini 1.5 Flash |
| **Context Window** | 8,192 tokens | **1,048,576 tokens** (Industry-leading) |
| **Integration** | OpenAI-compatible endpoint | REST API and native Python SDK |
| **JSON Mode** | Supported | Supported (with structured Pydantic schemas) |
| **Best Suited For** | Sub-second latency requirements | Long documents, high accuracy, free usage |

### Recommendation
**Google Gemini API (using `gemini-1.5-flash`)** is the recommended provider for the UniArchive platform.
1. **Generous Free Tier**: The free tier is highly stable, requires no initial financial commitment, and is ideal for academic demonstrations.
2. **Massive Context Window**: Digital textbooks and OCR text files are often very long. Gemini's 1-million-token context window easily handles large uploads that would break Groq's 8K limit.
3. **Structured Outputs**: Native support for JSON formatting ensures responses match Pydantic schemas exactly.

---

### Backend Endpoints

A new router `backend/app/api/ai.py` will be created to house the AI assistant routes.

#### 1. POST `/api/ai/documents/{id}/summary`
*   **Action**: Summarizes document content.
*   **Process**:
    1. Retrieve the document by ID.
    2. Read `ocr_text`. Truncate to a maximum of 10,000 characters to protect API limits and ensure prompt execution.
    3. Send text to the LLM with instructions to return a structured JSON summary.
*   **Prompt Schema**:
    ```json
    {
      "summary": "High-level summary of the document.",
      "key_topics": ["Topic 1", "Topic 2", "Topic 3"],
      "study_notes": ["Note bullet 1", "Note bullet 2", "Note bullet 3"]
    }
    ```

#### 2. POST `/api/ai/search/explain`
*   **Action**: Explains why search results matched a query.
*   **Request Body**:
    ```json
    {
      "query": "vector similarity",
      "results": [
        {
          "title": "Document Title",
          "snippet": "...relevant snippet text..."
        }
      ]
    }
    ```
*   **Process**: Prompt the LLM to explain the relevance of the matched snippets to the query and summarize the top results collectively.
*   **Response Schema**:
    ```json
    {
      "explanation": "Brief explanation of how the results answer the query.",
      "summary": "Key themes spanning the returned results."
    }
    ```

#### 3. POST `/api/ai/documents/{id}/questions`
*   **Action**: Generates interactive revision questions.
*   **Process**: Send the truncated OCR text to the LLM requesting 5 relevant academic review questions.
*   **Response Schema**:
    ```json
    {
      "questions": [
        "Question 1?",
        "Question 2?"
      ]
    }
    ```

---

### Security & Operational Safeguards

*   **Role Check**: All AI endpoints require a valid login token (`Depends(get_current_user)`).
*   **Strict Truncation**: Inputs are capped (e.g. 10k characters) to avoid cost inflation and token limits.
*   **Secrets Exposure Prevention**: Keys (`GEMINI_API_KEY` or `GROQ_API_KEY`) remain securely on the backend server and are never exposed to the frontend.
*   **Graceful Degradation**:
    *   If the configuration keys are missing, the API returns a standard `503 Service Unavailable` with details: `{"detail": "AI assistant is not configured. Please supply an API key in the environment variables."}`.
    *   The frontend intercepts this error and renders a fallback UI option or helpful notification rather than crashing.

---

### Configuration Variables (`.env`)

```bash
LLM_PROVIDER=gemini       # Options: 'gemini' or 'groq'
GEMINI_API_KEY=AIzaSy...  # API Key for Google AI Studio
GROQ_API_KEY=gsk_...      # API Key for Groq Cloud
LLM_MODEL=gemini-1.5-flash # Default model name
```

---

### Implementation Steps

#### Phase 1: Backend Infrastructure
1. Update `app/core/config.py` to include LLM config settings.
2. Create `app/services/ai_service.py` to handle REST communications with Google Gemini / Groq using `httpx`.
3. Create `app/api/ai.py` specifying the endpoints and Pydantic schemas.
4. Mount the AI router in `app/main.py`.

#### Phase 2: Frontend Integration
1. **Document Filters**:
   - Implement `GET /api/documents/filter-options` client call on `DocumentsPage.tsx`.
   - Replace hardcoded filter options with dynamic options and apply maps.
2. **AI Detail Assistant**:
   - Create an `AIStudyAssistant` card on `DocumentDetailPage.tsx`.
   - Add loading indicators, error fallbacks, and state storage for summaries and generated questions.
3. **AI Search Explainer**:
   - Add an "Explain Search Results" button to `SearchPage.tsx` when query results are active.
   - Present the explanation in a dedicated UI card at the top of the search list.
