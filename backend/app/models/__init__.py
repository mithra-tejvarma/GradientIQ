from app.models.user import User, UserRole
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.question import Question, CognitiveType
from app.models.assessment import AssessmentAttempt, AssessmentStatus, Assessment
from app.models.answer_attempt import AnswerAttempt
from app.models.capability import CapabilityScore, Capability
from app.models.feedback import Feedback, GapType, FeedbackLegacy

# Legacy models for backward compatibility
from app.models.student import Student
from app.models.faculty import Faculty

__all__ = [
    # New models
    "User",
    "UserRole",
    "Subject",
    "Topic",
    "Question",
    "CognitiveType",
    "AssessmentAttempt",
    "AssessmentStatus",
    "AnswerAttempt",
    "CapabilityScore",
    "Feedback",
    "GapType",
    # Legacy models for backward compatibility
    "Student",
    "Faculty",
    "Assessment",
    "Capability",
    "FeedbackLegacy"
]
