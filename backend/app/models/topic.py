from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)

    # Relationship with subject
    subject = relationship("Subject", back_populates="topics")
    # Relationship with capabilities
    capabilities = relationship("Capability", back_populates="topic")
