"""
Validation script for Hybrid Search (Phase 8).
"""
import logging
from app.db.database import SessionLocal
from app.services.search_service import search_documents
from app.services.semantic_service import search_semantic
from app.services.hybrid_search_service import search_hybrid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_hybrid_search():
    db = SessionLocal()
    query = "database normalization"
    
    logger.info(f"--- KEYWORD SEARCH for '{query}' ---")
    keyword_results = search_documents(db, query, limit=5)
    for i, (doc, snippet, _) in enumerate(keyword_results):
        logger.info(f"Rank {i+1}: {doc.title} | Snippet: {snippet}")
        
    logger.info(f"--- SEMANTIC SEARCH for '{query}' ---")
    semantic_results = search_semantic(db, query, limit=5)
    for i, res in enumerate(semantic_results):
        logger.info(f"Rank {i+1}: {res['title']} | Score: {res['score']:.4f}")
        
    logger.info(f"--- HYBRID SEARCH (RRF) for '{query}' ---")
    hybrid_results = search_hybrid(db, query, limit=5)
    for i, res in enumerate(hybrid_results):
        logger.info(f"Rank {i+1}: {res['title']} | RRF Score: {res['hybrid_score']:.4f} | KR: {res['keyword_rank']} | SR: {res['semantic_rank']}")

    db.close()

if __name__ == "__main__":
    test_hybrid_search()
