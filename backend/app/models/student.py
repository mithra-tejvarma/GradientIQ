from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Student(Base):
    """
    Legacy Student model - kept for backward compatibility with existing routes.
    For new implementations, use the User model with role='student'.
    """
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    overall_capability_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
