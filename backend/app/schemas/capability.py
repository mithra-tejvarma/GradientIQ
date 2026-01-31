from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CapabilitySchema(BaseModel):
    id: int
    student_id: int
    subject_id: int
    topic_id: int
    capability_score: int
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True


class CapabilityWithTopicSchema(BaseModel):
    id: int
    student_id: int
    subject_id: int
    topic_id: int
    topic_name: str
    capability_score: int
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True


class OverallCapabilitySchema(BaseModel):
    student_id: int
    average_capability_score: Optional[float] = None
    has_capability_data: bool = False
