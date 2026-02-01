import uuid
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class GapType(str, enum.Enum):
    conceptual = "conceptual"
    procedural = "procedural"
    logic = "logic"


class Feedback(Base):
    """
    New Feedback model with UUID-based IDs for adaptive assessment system.
    Links to AnswerAttempt for detailed feedback per answer.
    """
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    answer_attempt_id = Column(UUID(as_uuid=True), ForeignKey("answer_attempts.id"), nullable=False)
    gap_type = Column(Enum(GapType), nullable=True)
    feedback_text = Column(Text, nullable=True)
    suggested_next_topic = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    answer_attempt = relationship("AnswerAttempt", back_populates="feedback")
    suggested_topic = relationship("Topic")


# Legacy Feedback model - kept for backward compatibility with existing routes
class FeedbackLegacy(Base):
    """
    Legacy Feedback model - kept for backward compatibility with existing routes.
    For new implementations, use the Feedback model.
    """
    __tablename__ = "feedback_legacy"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    concept_gap = Column(Text, nullable=True)
    next_steps = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    assessment = relationship("Assessment", back_populates="feedback")
