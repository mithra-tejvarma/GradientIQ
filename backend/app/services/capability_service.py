from sqlalchemy.orm import Session
from app.models.capability import Capability


def update_capability(db: Session, student_id: int, subject_id: int, topic_id: int, status: str) -> Capability:
    """
    Update capability score based on assessment status.
    
    Rules:
    - if status == "completed": +5 (max 100)
    - if status == "stuck": -5 (min 0)
    - if status == "incomplete": no change
    
    If capability does not exist for the student/subject/topic combination,
    a new one is created with score = 50.
    
    Note: This function does not commit the transaction. The caller is responsible
    for committing or rolling back the transaction.
    """
    # Find existing capability or create new one
    capability = db.query(Capability).filter(
        Capability.student_id == student_id,
        Capability.subject_id == subject_id,
        Capability.topic_id == topic_id
    ).first()
    
    if capability is None:
        # Initialize new topic with score = 50
        capability = Capability(
            student_id=student_id,
            subject_id=subject_id,
            topic_id=topic_id,
            capability_score=50
        )
        db.add(capability)
        db.flush()
    
    # Update score based on status
    if status == "completed":
        capability.capability_score = min(100, capability.capability_score + 5)
    elif status == "stuck":
        capability.capability_score = max(0, capability.capability_score - 5)
    # status == "incomplete": no change
    
    db.flush()
    return capability
