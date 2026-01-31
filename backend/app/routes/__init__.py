from app.routes.students import router as students_router
from app.routes.subjects import router as subjects_router
from app.routes.topics import router as topics_router
from app.routes.assessment import router as assessment_router
from app.routes.feedback import router as feedback_router

__all__ = ["students_router", "subjects_router", "topics_router", "assessment_router", "feedback_router"]
