import uuid
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class CapabilityScore(Base):
    """
    New CapabilityScore model with UUID-based IDs.
    Use this for new implementations and adaptive assessments.
    """
    __tablename__ = "capability_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    capability_level = Column(Integer, default=50)  # 0-100
    streak = Column(Integer, default=0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="capability_scores")
    topic = relationship("Topic", back_populates="capability_scores")


# Legacy Capability model - kept for backward compatibility with existing routes
class Capability(Base):
    """
    Legacy Capability model - kept for backward compatibility with existing routes.
    For new implementations, use the CapabilityScore model.
    """
    __tablename__ = "capabilities"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    capability_score = Column(Integer, default=50)  # 0-100, initialize with 50
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("Student")
    subject = relationship("Subject")
    topic = relationship("Topic")
