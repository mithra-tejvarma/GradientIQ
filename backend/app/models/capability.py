from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Capability(Base):
    __tablename__ = "capabilities"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    capability_level = Column(Integer, default=0)  # 0-100

    # Relationships
    student = relationship("Student", back_populates="capabilities")
    topic = relationship("Topic", back_populates="capabilities")
