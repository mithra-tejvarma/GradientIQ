import uuid
from sqlalchemy import Column, String, Text, Integer, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class CognitiveType(str, enum.Enum):
    conceptual = "conceptual"
    procedural = "procedural"


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    difficulty_level = Column(Integer, nullable=False)  # 1-10
    cognitive_type = Column(Enum(CognitiveType), nullable=False)
    expected_concepts = Column(JSON, nullable=True)

    # Relationships
    topic = relationship("Topic", back_populates="questions")
    answer_attempts = relationship("AnswerAttempt", back_populates="question")
