from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class StartAssessmentRequest(BaseModel):
    subject_id: UUID


class QuestionResponse(BaseModel):
    question_id: UUID
    question_text: str
    topic_id: UUID
    topic_name: str
    difficulty_level: int
    cognitive_type: str


class AnswerSubmitRequest(BaseModel):
    assessment_id: UUID
    question_id: UUID
    answer_text: Optional[str] = None
    progress_percentage: Optional[int] = None
    stopped_at_step: Optional[int] = None


class AssessmentStatusResponse(BaseModel):
    assessment_id: UUID
    subject_id: UUID
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    questions_attempted: int
    current_question: Optional[QuestionResponse] = None
    next_question: Optional[QuestionResponse] = None

    class Config:
        from_attributes = True
