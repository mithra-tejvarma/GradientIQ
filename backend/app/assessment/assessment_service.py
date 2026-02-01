from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, Tuple
from datetime import datetime
from app.models.assessment import AssessmentAttempt, AssessmentStatus
from app.models.answer_attempt import AnswerAttempt
from app.models.capability import CapabilityScore
from app.models.question import Question
from app.models.topic import Topic
from app.assessment.schemas import QuestionResponse


def get_initial_topics(db: Session, user_id: UUID, subject_id: UUID) -> list[UUID]:
    """Get initial topics based on lowest capability scores."""
    capability_scores = db.query(CapabilityScore).join(Topic).filter(
        CapabilityScore.user_id == user_id,
        Topic.subject_id == subject_id
    ).order_by(CapabilityScore.capability_level.asc()).limit(3).all()
    
    if capability_scores:
        return [score.topic_id for score in capability_scores]
    
    # If no capability scores exist, get first 3 topics from subject
    topics = db.query(Topic).filter(Topic.subject_id == subject_id).limit(3).all()
    return [topic.id for topic in topics]


def start_assessment(db: Session, user_id: UUID, subject_id: UUID) -> Tuple[AssessmentAttempt, Optional[Question]]:
    """Create a new assessment attempt and return first question."""
    assessment = AssessmentAttempt(
        user_id=user_id,
        subject_id=subject_id,
        status=AssessmentStatus.in_progress
    )
    db.add(assessment)
    db.flush()
    
    # Get initial topics
    initial_topics = get_initial_topics(db, user_id, subject_id)
    
    if not initial_topics:
        db.commit()
        return assessment, None
    
    # Pick first question from first topic
    first_question = db.query(Question).filter(
        Question.topic_id == initial_topics[0]
    ).first()
    
    db.commit()
    db.refresh(assessment)
    
    return assessment, first_question


def submit_answer(
    db: Session,
    assessment_id: UUID,
    question_id: UUID,
    answer_text: Optional[str],
    progress_percentage: Optional[int],
    stopped_at_step: Optional[int]
) -> Tuple[AnswerAttempt, Optional[Question]]:
    """Save answer attempt and return next question."""
    # Create answer attempt
    answer_attempt = AnswerAttempt(
        assessment_id=assessment_id,
        question_id=question_id,
        answer_text=answer_text,
        progress_percentage=progress_percentage,
        stopped_at_step=stopped_at_step
    )
    db.add(answer_attempt)
    db.flush()
    
    # Get current question and topic
    current_question = db.query(Question).filter(Question.id == question_id).first()
    if not current_question:
        db.commit()
        return answer_attempt, None
    
    current_topic_id = current_question.topic_id
    
    # Determine if attempt is partial (thinking break)
    is_partial = (
        (progress_percentage is not None and progress_percentage < 40) or
        (stopped_at_step is not None)
    )
    
    # Select next question
    next_question = select_next_question(
        db,
        assessment_id,
        current_topic_id,
        progress_percentage,
        is_partial
    )
    
    db.commit()
    db.refresh(answer_attempt)
    
    return answer_attempt, next_question


def select_next_question(
    db: Session,
    assessment_id: UUID,
    current_topic_id: UUID,
    progress_percentage: Optional[int],
    is_partial: bool
) -> Optional[Question]:
    """Select next question based on progress and partial state."""
    # Get already answered questions
    answered_question_ids = db.query(AnswerAttempt.question_id).filter(
        AnswerAttempt.assessment_id == assessment_id
    ).all()
    answered_ids = [q_id[0] for q_id in answered_question_ids]
    
    # If student is struggling (progress < 70 or partial), stay on same topic
    if is_partial or (progress_percentage is not None and progress_percentage < 70):
        next_question = db.query(Question).filter(
            Question.topic_id == current_topic_id,
            ~Question.id.in_(answered_ids) if answered_ids else True
        ).first()
        
        if next_question:
            return next_question
    
    # Progress > 70 or no more questions in current topic, move to next topic
    assessment = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.id == assessment_id
    ).first()
    
    if not assessment:
        return None
    
    # Get next topic
    next_topic = db.query(Topic).filter(
        Topic.subject_id == assessment.subject_id,
        Topic.id != current_topic_id
    ).first()
    
    if not next_topic:
        return None
    
    # Get first unanswered question from next topic
    next_question = db.query(Question).filter(
        Question.topic_id == next_topic.id,
        ~Question.id.in_(answered_ids) if answered_ids else True
    ).first()
    
    return next_question


def get_assessment_status(db: Session, assessment_id: UUID) -> Optional[dict]:
    """Get assessment status with progress information."""
    assessment = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.id == assessment_id
    ).first()
    
    if not assessment:
        return None
    
    # Count questions attempted
    questions_attempted = db.query(AnswerAttempt).filter(
        AnswerAttempt.assessment_id == assessment_id
    ).count()
    
    # Get last answered question to determine next
    last_answer = db.query(AnswerAttempt).filter(
        AnswerAttempt.assessment_id == assessment_id
    ).order_by(AnswerAttempt.id.desc()).first()
    
    next_question = None
    if last_answer:
        last_question = db.query(Question).filter(
            Question.id == last_answer.question_id
        ).first()
        
        if last_question:
            next_question = select_next_question(
                db,
                assessment_id,
                last_question.topic_id,
                last_answer.progress_percentage,
                (last_answer.progress_percentage is not None and last_answer.progress_percentage < 40) or
                (last_answer.stopped_at_step is not None)
            )
    
    return {
        "assessment": assessment,
        "questions_attempted": questions_attempted,
        "next_question": next_question
    }


def format_question_response(question: Question, db: Session) -> QuestionResponse:
    """Format question data into response schema."""
    topic = db.query(Topic).filter(Topic.id == question.topic_id).first()
    
    return QuestionResponse(
        question_id=question.id,
        question_text=question.question_text,
        topic_id=question.topic_id,
        topic_name=topic.name if topic else "Unknown",
        difficulty_level=question.difficulty_level,
        cognitive_type=question.cognitive_type.value
    )
