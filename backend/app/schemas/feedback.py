from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FeedbackResponseSchema(BaseModel):
    id: Optional[int] = None
    assessment_id: int
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    concept_gap: Optional[str] = None
    next_steps: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
