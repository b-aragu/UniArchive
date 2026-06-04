from __future__ import annotations
import json
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

# Fallback/Mock data generators
def get_mock_summary():
    return {
        "summary": "AI assistant is running in demo mode. Add an API key for live generation. This document appears to cover essential academic topics, providing a structured breakdown of concepts, methodologies, and findings.",
        "key_topics": ["Demo Mode Active", "Academic Methodology", "Core Concepts", "Key Findings"],
        "study_notes": [
            "To enable live AI generation, please set a valid GEMINI_API_KEY or GROQ_API_KEY in your backend .env file.",
            "This mock notice is generated automatically by the backend fallback service.",
            "Study Notes: Review the syllabus, identify primary theorems, and perform key practice exercises."
        ],
        "demo_mode": True
    }

def get_mock_questions():
    return {
        "questions": [
            "AI assistant is running in demo mode. Add an API key for live generation.",
            "What are the main objectives described in this document?",
            "How does the author support the primary hypothesis?",
            "What are the limitations of the methodology presented?"
        ],
        "answers": [
            "Configure GEMINI_API_KEY or GROQ_API_KEY in backend/.env to get live answers.",
            "Refer to the introduction and abstract sections of the document.",
            "Through experimental results, data analysis, and literature comparison.",
            "Sample size constraints, validation scope, and environmental assumptions."
        ],
        "difficulty": "Intermediate (Demo Mode)",
        "demo_mode": True
    }

def get_mock_explanation(query: str):
    return {
        "explanation": f"AI assistant is running in demo mode. Add an API key for live generation. Your query '{query}' matches academic documents in the library based on full-text index matching and metadata relevancy.",
        "why_results_match": [
            "Configure a valid LLM API key in backend/.env for dynamic, AI-powered matching explanations.",
            "Results contain keywords directly matching the query terms.",
            "Relevancy scores indicate high word density in title or content."
        ],
        "suggested_next_queries": [
            "Try searching with more specific course codes",
            "Filter by extraction method or status to narrow results",
            "Configure GROQ_API_KEY for live suggestions"
        ],
        "demo_mode": True
    }


def call_llm(system_prompt: str, user_content: str) -> dict | None:
    """Helper to query the configured LLM provider using httpx REST calls."""
    provider = (settings.llm_provider or "").lower().strip()
    
    # Cap input text size to avoid prompt length blowups
    cap_limit = settings.llm_text_limit or 10000
    capped_content = user_content[:cap_limit]

    # Verify if credentials are configured
    if provider == "gemini" and not settings.gemini_api_key:
        logger.info("Gemini provider selected but GEMINI_API_KEY is not set. Falling back to mock response.")
        return None
    elif provider == "groq" and not settings.groq_api_key:
        logger.info("Groq provider selected but GROQ_API_KEY is not set. Falling back to mock response.")
        return None
    elif provider not in ("gemini", "groq"):
        logger.info(f"Unknown or unsupported LLM provider '{provider}'. Falling back to mock response.")
        return None

    try:
        if provider == "gemini":
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.llm_model}:generateContent?key={settings.gemini_api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{
                    "parts": [{
                        "text": f"{system_prompt}\n\nDocument Text:\n{capped_content}"
                    }]
                }],
                "generationConfig": {
                    "responseMimeType": "application/json"
                }
            }
            logger.info(f"Sending request to Gemini model: {settings.llm_model}")
            with httpx.Client(timeout=15.0) as client:
                response = client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                res_data = response.json()
                text_out = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_out)

        elif provider == "groq":
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": settings.llm_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": capped_content}
                ],
                "response_format": {"type": "json_object"}
            }
            logger.info(f"Sending request to Groq model: {settings.llm_model}")
            with httpx.Client(timeout=15.0) as client:
                response = client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                res_data = response.json()
                text_out = res_data["choices"][0]["message"]["content"]
                return json.loads(text_out)

    except Exception as e:
        logger.error(f"Error calling LLM provider '{provider}': {e}", exc_info=True)
        return None


def generate_document_summary(ocr_text: str) -> dict:
    """Generates structured document summary using the active LLM provider."""
    system_prompt = (
        "You are an expert academic assistant. Generate a structured summary of the provided document text.\n"
        "You MUST respond with a valid JSON object only. Do NOT wrap the JSON in markdown formatting.\n"
        "The JSON object must follow this exact schema:\n"
        "{\n"
        '  "summary": "A concise paragraph summarizing the document.",\n'
        '  "key_topics": ["Topic 1", "Topic 2", "Topic 3"],\n'
        '  "study_notes": ["Important note 1", "Important note 2", "Important note 3"]\n'
        "}"
    )
    result = call_llm(system_prompt, ocr_text)
    if not result:
        return get_mock_summary()
    result["demo_mode"] = False
    return result


def generate_document_questions(ocr_text: str) -> dict:
    """Generates structured study revision questions using the active LLM provider."""
    system_prompt = (
        "You are an expert academic assistant. Generate revision study questions based on the provided document text.\n"
        "You MUST respond with a valid JSON object only. Do NOT wrap the JSON in markdown formatting.\n"
        "The JSON object must follow this exact schema:\n"
        "{\n"
        '  "questions": ["Question 1", "Question 2", "Question 3"],\n'
        '  "answers": ["Answer 1", "Answer 2", "Answer 3"],\n'
        '  "difficulty": "Easy, Intermediate, or Hard"\n'
        "}"
    )
    result = call_llm(system_prompt, ocr_text)
    if not result:
        return get_mock_questions()
    result["demo_mode"] = False
    return result


def generate_search_explanation(query: str, results: list[dict]) -> dict:
    """Explains search query results and lists why they match using the active LLM provider."""
    system_prompt = (
        "You are an expert search relevance assistant. Explain why the following document results match the user's search query.\n"
        "You MUST respond with a valid JSON object only. Do NOT wrap the JSON in markdown formatting.\n"
        "The JSON object must follow this exact schema:\n"
        "{\n"
        '  "explanation": "A high-level explanation of how the results address the user query.",\n'
        '  "why_results_match": ["Explanation for result 1", "Explanation for result 2"],\n'
        '  "suggested_next_queries": ["Suggested query 1", "Suggested query 2"]\n'
        "}"
    )
    # Serialize search results to brief summaries
    results_summary = []
    for r in results:
        results_summary.append({
            "id": str(r.get("id", "")),
            "title": r.get("title", ""),
            "course": r.get("course", {}).get("code", "") if r.get("course") else "",
            "snippet": (r.get("ocr_text", "") or "")[:400]
        })
    user_content = f"Search Query: {query}\n\nSearch Results:\n{json.dumps(results_summary, indent=2)}"
    result = call_llm(system_prompt, user_content)
    if not result:
        return get_mock_explanation(query)
    result["demo_mode"] = False
    return result
