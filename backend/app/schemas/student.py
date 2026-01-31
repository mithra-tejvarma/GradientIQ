from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class StudentSchema(BaseModel):
    id: int
    name: str
    email: str
    overall_capability_score: Optional[float] = 0.0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
