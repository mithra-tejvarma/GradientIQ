import uuid
from sqlalchemy import Column, Text, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


class AnswerAttempt(Base):
    __tablename__ = "answer_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessment_attempts.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    answer_text = Column(Text, nullable=True)
    progress_percentage = Column(Integer, nullable=True)
    stopped_at_step = Column(Integer, nullable=True)
    is_correct = Column(Boolean, nullable=True)

    # Relationships
    assessment_attempt = relationship("AssessmentAttempt", back_populates="answer_attempts")
    question = relationship("Question", back_populates="answer_attempts")
    feedback = relationship("Feedback", back_populates="answer_attempt", uselist=False)
