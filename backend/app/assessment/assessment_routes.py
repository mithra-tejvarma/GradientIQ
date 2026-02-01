from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.dependencies import get_db
from app.auth.dependencies import require_student
from app.models.user import User
from app.assessment.schemas import (
    StartAssessmentRequest,
    AnswerSubmitRequest,
    AssessmentStatusResponse,
    QuestionResponse
)
from app.assessment import assessment_service


router = APIRouter()


@router.post("/start", response_model=AssessmentStatusResponse)
def start_assessment(
    request: StartAssessmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    """
    Start a new assessment for a student.
    Creates AssessmentAttempt and returns first question.
    """
    assessment, first_question = assessment_service.start_assessment(
        db=db,
        user_id=current_user.id,
        subject_id=request.subject_id
    )
    
    current_question = None
    if first_question:
        current_question = assessment_service.format_question_response(first_question, db)
    
    return AssessmentStatusResponse(
        assessment_id=assessment.id,
        subject_id=assessment.subject_id,
        status=assessment.status.value,
        started_at=assessment.started_at,
        completed_at=assessment.completed_at,
        questions_attempted=0,
        current_question=current_question,
        next_question=None
    )


@router.post("/answer", response_model=AssessmentStatusResponse)
def submit_answer(
    request: AnswerSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    """
    Submit an answer to a question.
    Saves AnswerAttempt and returns next question or assessment status.
    """
    # Verify assessment belongs to current user
    from app.models.assessment import AssessmentAttempt
    assessment = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.id == request.assessment_id,
        AssessmentAttempt.user_id == current_user.id
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found or access denied"
        )
    
    answer_attempt, next_question = assessment_service.submit_answer(
        db=db,
        assessment_id=request.assessment_id,
        question_id=request.question_id,
        answer_text=request.answer_text,
        progress_percentage=request.progress_percentage,
        stopped_at_step=request.stopped_at_step
    )
    
    # Get updated assessment status
    status_data = assessment_service.get_assessment_status(db, request.assessment_id)
    
    if not status_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    next_question_response = None
    if next_question:
        next_question_response = assessment_service.format_question_response(next_question, db)
    
    return AssessmentStatusResponse(
        assessment_id=status_data["assessment"].id,
        subject_id=status_data["assessment"].subject_id,
        status=status_data["assessment"].status.value,
        started_at=status_data["assessment"].started_at,
        completed_at=status_data["assessment"].completed_at,
        questions_attempted=status_data["questions_attempted"],
        current_question=None,
        next_question=next_question_response
    )


@router.get("/status/{assessment_id}", response_model=AssessmentStatusResponse)
def get_assessment_status(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    """
    Get assessment status with progress information.
    Shows questions attempted and completion state.
    """
    # Verify assessment belongs to current user
    from app.models.assessment import AssessmentAttempt
    assessment = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.id == assessment_id,
        AssessmentAttempt.user_id == current_user.id
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found or access denied"
        )
    
    status_data = assessment_service.get_assessment_status(db, assessment_id)
    
    if not status_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    return AssessmentStatusResponse(
        assessment_id=status_data["assessment"].id,
        subject_id=status_data["assessment"].subject_id,
        status=status_data["assessment"].status.value,
        started_at=status_data["assessment"].started_at,
        completed_at=status_data["assessment"].completed_at,
        questions_attempted=status_data["questions_attempted"],
        current_question=None,
        next_question=None
    )
