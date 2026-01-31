from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.dependencies import get_db
from app.models.topic import Topic
from app.schemas.topic import TopicSchema

router = APIRouter()


@router.get("/", response_model=List[TopicSchema])
def list_topics(
    subject_id: Optional[int] = Query(None, description="Filter topics by subject ID"),
    db: Session = Depends(get_db)
):
    """Get all topics, optionally filtered by subject_id."""
    query = db.query(Topic)
    if subject_id is not None:
        query = query.filter(Topic.subject_id == subject_id)
    topics = query.all()
    return topics
