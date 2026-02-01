from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    status = {
        "status": "ok",
        "database": "connected",
        "auth": "ready",
        "assessment_engine": "ready",
        "nlp_layer": "ready"
    }
    
    try:
        # Test database connection
        db.execute("SELECT 1")
        status["database"] = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        status["database"] = "disconnected"
        status["status"] = "degraded"
    
    return status
