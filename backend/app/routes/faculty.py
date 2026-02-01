from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List
from app.dependencies import get_db
from app.auth.dependencies import require_faculty
from app.models.student import Student
from app.models.capability import Capability
from app.models.topic import Topic
from app.models.assessment import Assessment
from app.models.user import User
from app.schemas.student import StudentSchema
from app.schemas.faculty import WeakTopicSchema

router = APIRouter()


@router.get("/students", response_model=List[StudentSchema])
def list_all_students(db: Session = Depends(get_db), current_user: User = Depends(require_faculty)):
    """List all students."""
    students = db.query(Student).all()
    return students


@router.get("/student/{student_id}/weak-topics", response_model=List[WeakTopicSchema])
def get_student_weak_topics(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_faculty)):
    """
    Return topics where capability_score < 50.
    Include last assessment status for quick difficulty detection.
    """
    # Get weak topics (capability_score < 50)
    weak_capabilities = db.query(
        Capability.topic_id,
        Topic.name.label("topic_name"),
        Capability.subject_id,
        Capability.capability_score
    ).join(Topic, Capability.topic_id == Topic.id).filter(
        Capability.student_id == student_id,
        Capability.capability_score < 50
    ).all()
    
    if not weak_capabilities:
        return []
    
    # Get all topic_ids for weak topics
    weak_topic_ids = [cap.topic_id for cap in weak_capabilities]
    
    # Subquery to get the latest assessment date per topic
    latest_assessment_subq = db.query(
        Assessment.topic_id,
        func.max(Assessment.created_at).label("max_created_at")
    ).filter(
        Assessment.student_id == student_id,
        Assessment.topic_id.in_(weak_topic_ids)
    ).group_by(Assessment.topic_id).subquery()
    
    # Get all latest assessments for weak topics in a single query
    latest_assessments = db.query(Assessment).join(
        latest_assessment_subq,
        (Assessment.topic_id == latest_assessment_subq.c.topic_id) &
        (Assessment.created_at == latest_assessment_subq.c.max_created_at)
    ).filter(
        Assessment.student_id == student_id
    ).all()
    
    # Create a mapping from topic_id to latest assessment
    assessment_map = {a.topic_id: a for a in latest_assessments}
    
    result = []
    for cap in weak_capabilities:
        last_assessment = assessment_map.get(cap.topic_id)
        result.append(WeakTopicSchema(
            topic_id=cap.topic_id,
            topic_name=cap.topic_name,
            subject_id=cap.subject_id,
            capability_score=cap.capability_score,
            last_assessment_status=last_assessment.status if last_assessment else None,
            last_assessment_date=last_assessment.created_at if last_assessment else None
        ))
    
    return result
