from sqlalchemy import Column, Integer, String
from app.db.database import Base


class Faculty(Base):
    """
    Legacy Faculty model - kept for backward compatibility with existing routes.
    For new implementations, use the User model with role='faculty'.
    """
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
