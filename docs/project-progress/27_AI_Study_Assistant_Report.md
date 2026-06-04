# Progress Report: AI Study Assistant Integration

This report documents the design, implementation, and verification of the **AI Study Assistant** phase in the UniArchive platform.

---

## 📖 Feature Overview
The AI Study Assistant integrates an optional, smart tutoring companion into the student's learning library. It enables dynamic summary generation, study questions with revealable answers, and search result explanations, using low-overhead direct REST connections (no external heavy SDKs).

---

## ⚙️ Configuration Setup
The AI assistant is configured in `backend/app/core/config.py` and managed via environment variables in `backend/.env`.

### 1. General Config Keys
- `LLM_PROVIDER`: Decides the active provider (`gemini` or `groq`).
- `LLM_MODEL`: Specifies the target model name.
- `LLM_TEXT_LIMIT`: Characters limit (default `10000`) to prevent excessively long token inputs and save costs.

### 2. Gemini Configuration
To use Google Gemini:
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
LLM_MODEL=gemini-1.5-flash
LLM_TEXT_LIMIT=10000
```

### 3. Groq Configuration
To use Groq Cloud APIs:
```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
LLM_MODEL=llama-3.3-70b-versatile
LLM_TEXT_LIMIT=10000
```

---

## 🤖 Demo Fallback Mode (No API Key)
If neither `GEMINI_API_KEY` nor `GROQ_API_KEY` is configured (or if the configured provider fails), the backend falls back gracefully to a simulation mode.

- **Outcome**: Instead of crashing or returning `503 Service Unavailable`, the API returns a structured mock response containing realistic sample data.
- **Demo Mode Label**: Every fallback response includes `"demo_mode": true`.
- **Frontend Behavior**: The frontend automatically checks for `demo_mode` and renders a clean yellow warning banner:
  `⚠️ AI assistant is running in demo mode. Add an API key for live generation.`

---

## 🛡️ Security & Privacy Considerations
1. **Requires Login**: All AI endpoints enforce authenticated session validation (`Depends(get_current_user)`).
2. **Private Data Protection**: No passwords, JWT tokens, email addresses, or user private metadata are sent to the external LLM provider. Only document OCR texts or search snippets are transmitted.
3. **Prompt Caps**: Raw text inputs are truncated using `LLM_TEXT_LIMIT` to safeguard against prompt injection risks and contain usage quotas.
4. **No Heavy SDKs**: Connecting to providers is handled solely via `httpx` REST APIs. This prevents third-party packages from executing arbitrary code or introducing bloat into the backend environment.

---

## 🛠️ API Endpoint Specifications

### 1. `POST /api/ai/documents/{id}/summary`
Generates a structured overview of the document contents.
- **Input**: Document ID (`UUID`).
- **Response**:
  ```json
  {
    "summary": "A concise paragraph summarizing the document.",
    "key_topics": ["Topic 1", "Topic 2", "Topic 3"],
    "study_notes": ["Note 1", "Note 2"],
    "demo_mode": false
  }
  ```

### 2. `POST /api/ai/documents/{id}/questions`
Creates revision study questions.
- **Input**: Document ID (`UUID`).
- **Response**:
  ```json
  {
    "questions": ["Question 1", "Question 2"],
    "answers": ["Answer 1", "Answer 2"],
    "difficulty": "Intermediate",
    "demo_mode": false
  }
  ```

### 3. `POST /api/ai/search/explain`
Explains search result relevance based on the search query.
- **Input**:
  ```json
  {
    "query": "database systems",
    "result_ids": ["uuid-1", "uuid-2"]
  }
  ```
- **Response**:
  ```json
  {
    "explanation": "High-level description of results correlation.",
    "why_results_match": ["Reason 1", "Reason 2"],
    "suggested_next_queries": ["Suggested query 1", "Suggested query 2"],
    "demo_mode": false
  }
  ```

---

## 🎨 Frontend UI Integrations

### 1. Document Detail Page
- Adds an **AI Study Assistant** block at the bottom of the page.
- Provides interactive buttons to trigger **Generate Summary** or **Generate Revision Questions**.
- Renders key topics as badge tags, study notes as lists, and revision questions as interactive accordion blocks where answers can be expanded/collapsed on-click.

### 2. Search Page
- Integrates an **Explain Results** button alongside the result count.
- Populates an explanation card detailing relevance criteria, matching metrics, and clickable suggestion badges to auto-fill subsequent queries.

---

## 🔍 Build & Verification Results
- **Backend Build Check**: Passed. Modules load successfully without runtime type resolution errors.
- **Frontend Production Build**: Completed with **zero errors/warnings**.
- **Browser Validation**: Verified both detail page summary/question routines and search explanation workflows under active local execution.
