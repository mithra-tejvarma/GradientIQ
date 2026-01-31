from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.dependencies import get_db
from app.models.capability import Capability
from app.models.topic import Topic
from app.schemas.capability import CapabilityWithTopicSchema, OverallCapabilitySchema

router = APIRouter()


@router.get("/student/{student_id}", response_model=List[CapabilityWithTopicSchema])
def get_student_capabilities(student_id: int, db: Session = Depends(get_db)):
    """Return topic-wise capability levels for a student."""
    capabilities = db.query(
        Capability.id,
        Capability.student_id,
        Capability.subject_id,
        Capability.topic_id,
        Topic.name.label("topic_name"),
        Capability.capability_score,
        Capability.last_updated
    ).join(Topic, Capability.topic_id == Topic.id).filter(
        Capability.student_id == student_id
    ).all()
    
    return [
        CapabilityWithTopicSchema(
            id=c.id,
            student_id=c.student_id,
            subject_id=c.subject_id,
            topic_id=c.topic_id,
            topic_name=c.topic_name,
            capability_score=c.capability_score,
            last_updated=c.last_updated
        )
        for c in capabilities
    ]


@router.get("/student/{student_id}/overall", response_model=OverallCapabilitySchema)
def get_student_overall_capability(student_id: int, db: Session = Depends(get_db)):
    """Return average capability score for a student."""
    result = db.query(func.avg(Capability.capability_score)).filter(
        Capability.student_id == student_id
    ).scalar()
    
    if result is not None:
        return OverallCapabilitySchema(
            student_id=student_id,
            average_capability_score=float(result),
            has_capability_data=True
        )
    else:
        return OverallCapabilitySchema(
            student_id=student_id,
            average_capability_score=None,
            has_capability_data=False
        )
