from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AssessmentCreateSchema(BaseModel):
    student_id: int
    subject_id: int
    topic_id: int
    question_text: str
    student_answer: str


class AssessmentResponseSchema(BaseModel):
    id: int
    student_id: int
    subject_id: int
    topic_id: int
    question_text: str
    student_answer: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
