import uuid
from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)

    # Relationships
    topics = relationship("Topic", back_populates="subject")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="subject")
