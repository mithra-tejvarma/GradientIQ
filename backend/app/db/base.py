from app.db.database import Base

# Import all models here for Alembic to detect them
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.capability import Capability

__all__ = ["Base", "Student", "Faculty", "Subject", "Topic", "Capability"]
