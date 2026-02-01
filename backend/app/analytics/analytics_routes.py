from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.dependencies import get_db
from app.auth.dependencies import require_faculty, require_student, get_current_user
from app.models.user import User
from app.analytics.schemas import (
    FacultyOverviewResponse,
    StudentDetailResponse,
    TopicHeatmapResponse,
    LeaderboardResponse,
    StudentSelfInsightsResponse
)
from app.analytics.analytics_service import (
    get_faculty_overview,
    get_student_detail,
    get_topics_heatmap,
    get_leaderboard,
    get_student_self_insights
)

router = APIRouter()


@router.get("/faculty/overview", response_model=FacultyOverviewResponse)
def faculty_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """
    Faculty Dashboard Overview
    
    Returns key metrics for faculty dashboard:
    - Total students count
    - Active assessments count
    - Average capability score across all students
    - Most difficult topics (based on failure rates)
    - Most improved topics (based on capability growth)
    
    Access: Faculty only
    """
    return get_faculty_overview(db)


@router.get("/faculty/student/{student_id}", response_model=StudentDetailResponse)
def faculty_student_detail(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """
    Student Detail View for Faculty
    
    Returns comprehensive analytics for a specific student:
    - Overall capability score
    - Topic-wise capability levels
    - Recent feedback summaries
    - Detected learning gaps (conceptual/procedural/logic)
    - Originality and confidence trends over time
    
    Access: Faculty only
    """
    try:
        return get_student_detail(db, student_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/faculty/topics/heatmap", response_model=TopicHeatmapResponse)
def faculty_topics_heatmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """
    Topic Heatmap for Faculty
    
    Returns aggregated metrics per topic:
    - Average capability score
    - Failure rate
    - Most common gap type
    - Recommended intervention level (low/medium/high)
    
    Useful for identifying topics that need attention.
    
    Access: Faculty only
    """
    return get_topics_heatmap(db)


@router.get("/leaderboard", response_model=LeaderboardResponse)
def leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Student Leaderboard
    
    Ranks students based on:
    - Capability growth (not raw marks)
    - Learning streak
    - Learning consistency
    
    Returns:
    - Rank
    - Student name
    - Capability score
    - Streak
    
    Access: Authenticated users (students and faculty)
    """
    return get_leaderboard(db)


@router.get("/student/self", response_model=StudentSelfInsightsResponse)
def student_self_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    """
    Student Self-Insights Dashboard
    
    Returns personalized learning insights for the logged-in student:
    
    Learning Wheel Metrics (5 dimensions):
    - IQ: Reasoning quality (performance on difficult questions)
    - Learning: Capability growth over time
    - Consistency: Learning streak and regularity
    - Originality: Uniqueness of approach
    - Accuracy: Overall correctness percentage
    
    Additional Insights:
    - Strengths (top performing topics)
    - Weak topics (areas needing improvement)
    - Next recommended concepts (personalized suggestions)
    
    Access: Student only (shows own data)
    """
    try:
        return get_student_self_insights(db, current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
