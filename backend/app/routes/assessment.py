from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app.auth.dependencies import require_student
from app.models.assessment import Assessment
from app.models.user import User
from app.schemas.assessment import AssessmentCreateSchema, AssessmentResponseSchema
from app.services.capability_service import update_capability

router = APIRouter()

# Minimum answer length to mark assessment as completed (mock logic)
MIN_ANSWER_LENGTH_FOR_COMPLETION = 10


@router.post("/", response_model=AssessmentResponseSchema)
def create_assessment(assessment: AssessmentCreateSchema, db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    """Create a new assessment attempt."""
    # Mock logic: set status as completed or stuck based on answer length
    status = "completed" if len(assessment.student_answer) > MIN_ANSWER_LENGTH_FOR_COMPLETION else "stuck"

    db_assessment = Assessment(
        student_id=assessment.student_id,
        subject_id=assessment.subject_id,
        topic_id=assessment.topic_id,
        question_text=assessment.question_text,
        student_answer=assessment.student_answer,
        status=status
    )
    db.add(db_assessment)
    db.flush()

    # Update capability based on assessment outcome
    update_capability(
        db=db,
        student_id=assessment.student_id,
        subject_id=assessment.subject_id,
        topic_id=assessment.topic_id,
        status=status
    )

    # Commit both assessment and capability updates together
    db.commit()
    db.refresh(db_assessment)

    return db_assessment


@router.get("/student/{student_id}", response_model=List[AssessmentResponseSchema])
def list_student_assessments(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    """
    List all assessments attempted by a student.
    Note: This endpoint uses the legacy Student model (integer IDs) which is separate from 
    the User authentication system (UUID IDs). Full authorization would require migrating 
    the legacy system to use User IDs.
    """
    assessments = db.query(Assessment).filter(Assessment.student_id == student_id).all()
    return assessments
