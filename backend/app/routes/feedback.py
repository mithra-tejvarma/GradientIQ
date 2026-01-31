from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackResponseSchema

router = APIRouter()


@router.get("/assessment/{assessment_id}", response_model=FeedbackResponseSchema)
def get_assessment_feedback(assessment_id: int, db: Session = Depends(get_db)):
    """Return feedback for a given assessment. Use mock feedback if none exists."""
    feedback = db.query(Feedback).filter(Feedback.assessment_id == assessment_id).first()

    if feedback:
        return feedback

    # Return mock feedback if none exists (id=None indicates mock data)
    return FeedbackResponseSchema(
        id=None,
        assessment_id=assessment_id,
        strengths="Good understanding of basic concepts.",
        weaknesses="Needs more practice with advanced topics.",
        concept_gap="Review foundational material for better clarity.",
        next_steps="Practice more problems and revisit weak areas.",
        created_at=None
    )
