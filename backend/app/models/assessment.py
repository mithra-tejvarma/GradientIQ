import uuid
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class AssessmentStatus(str, enum.Enum):
    in_progress = "in_progress"
    completed = "completed"


class AssessmentAttempt(Base):
    """
    New AssessmentAttempt model with UUID-based IDs and simplified structure.
    Use this for new implementations and adaptive assessments.
    """
    __tablename__ = "assessment_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(AssessmentStatus), nullable=False, default=AssessmentStatus.in_progress)

    # Relationships
    user = relationship("User", back_populates="assessment_attempts")
    subject = relationship("Subject", back_populates="assessment_attempts")
    answer_attempts = relationship("AnswerAttempt", back_populates="assessment_attempt")


# Legacy Assessment model - kept for backward compatibility with existing routes
class Assessment(Base):
    """
    Legacy Assessment model - kept for backward compatibility with existing routes.
    For new implementations, use the AssessmentAttempt model.
    """
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    student_answer = Column(Text, nullable=False)
    status = Column(String, nullable=False)  # values: completed, stuck, incomplete
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student")
    subject = relationship("Subject")
    topic = relationship("Topic")
    feedback = relationship("FeedbackLegacy", back_populates="assessment", uselist=False)
