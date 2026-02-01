from app.db.database import Base

# Import all models here for Alembic to detect them
# New models
from app.models.user import User
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.question import Question
from app.models.assessment import AssessmentAttempt, Assessment
from app.models.answer_attempt import AnswerAttempt
from app.models.capability import CapabilityScore, Capability
from app.models.feedback import Feedback, FeedbackLegacy

# Legacy models for backward compatibility
from app.models.student import Student
from app.models.faculty import Faculty

__all__ = [
    "Base",
    # New models
    "User",
    "Subject",
    "Topic",
    "Question",
    "AssessmentAttempt",
    "AnswerAttempt",
    "CapabilityScore",
    "Feedback",
    # Legacy models
    "Student",
    "Faculty",
    "Assessment",
    "Capability",
    "FeedbackLegacy"
]
