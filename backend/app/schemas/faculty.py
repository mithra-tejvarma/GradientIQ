from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class WeakTopicSchema(BaseModel):
    topic_id: int
    topic_name: str
    subject_id: int
    capability_score: int
    last_assessment_status: Optional[str] = None
    last_assessment_date: Optional[datetime] = None

    class Config:
        from_attributes = True
