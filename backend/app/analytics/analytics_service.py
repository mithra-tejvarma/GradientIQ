from sqlalchemy.orm import Session
from sqlalchemy import func, case, desc
from typing import List, Dict, Tuple
from uuid import UUID
from datetime import datetime, timedelta
from app.models.user import User, UserRole
from app.models.capability import CapabilityScore
from app.models.assessment import AssessmentAttempt, AssessmentStatus
from app.models.answer_attempt import AnswerAttempt
from app.models.feedback import Feedback, GapType
from app.models.topic import Topic
from app.models.subject import Subject
from app.analytics.schemas import (
    FacultyOverviewResponse, TopicDifficulty, TopicImprovement,
    StudentDetailResponse, TopicCapability, FeedbackSummary, DetectedGap, TrendMetric,
    TopicHeatmapResponse, TopicHeatmapItem,
    LeaderboardResponse, LeaderboardEntry,
    StudentSelfInsightsResponse, LearningWheelMetric, WeakTopic, RecommendedConcept
)


def get_faculty_overview(db: Session) -> FacultyOverviewResponse:
    """Calculate faculty dashboard overview metrics."""
    
    # Total students
    total_students = db.query(func.count(User.id)).filter(User.role == UserRole.student).scalar() or 0
    
    # Active assessments (in_progress status)
    active_assessments = db.query(func.count(AssessmentAttempt.id)).filter(
        AssessmentAttempt.status == AssessmentStatus.in_progress
    ).scalar() or 0
    
    # Average capability score across all students
    avg_capability = db.query(func.avg(CapabilityScore.capability_level)).scalar() or 0.0
    
    # Most difficult topics (based on failure rate)
    difficult_topics_query = db.query(
        Topic.id,
        Topic.name,
        func.count(case((AnswerAttempt.is_correct == False, 1))).label('failures'),
        func.count(AnswerAttempt.id).label('total_attempts')
    ).join(
        AnswerAttempt, AnswerAttempt.question_id.in_(
            db.query(func.unnest(func.array_agg(Topic.id)))
        ), isouter=True
    ).group_by(Topic.id, Topic.name).having(
        func.count(AnswerAttempt.id) > 0
    ).all()
    
    difficult_topics = []
    for topic in difficult_topics_query:
        if topic.total_attempts > 0:
            failure_rate = float(topic.failures) / float(topic.total_attempts)
            difficult_topics.append(TopicDifficulty(
                topic_id=topic.id,
                topic_name=topic.name,
                failure_rate=failure_rate
            ))
    
    difficult_topics.sort(key=lambda x: x.failure_rate, reverse=True)
    most_difficult = difficult_topics[:5]
    
    # Most improved topics (based on capability growth)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    improved_topics_query = db.query(
        Topic.id,
        Topic.name,
        func.avg(case(
            (CapabilityScore.last_updated >= thirty_days_ago, CapabilityScore.capability_level),
            else_=None
        )).label('recent_avg'),
        func.avg(case(
            (CapabilityScore.last_updated < thirty_days_ago, CapabilityScore.capability_level),
            else_=None
        )).label('old_avg')
    ).join(
        CapabilityScore, CapabilityScore.topic_id == Topic.id
    ).group_by(Topic.id, Topic.name).all()
    
    improved_topics = []
    for topic in improved_topics_query:
        if topic.recent_avg is not None and topic.old_avg is not None and topic.old_avg > 0:
            improvement = (float(topic.recent_avg) - float(topic.old_avg)) / float(topic.old_avg)
            improved_topics.append(TopicImprovement(
                topic_id=topic.id,
                topic_name=topic.name,
                improvement_rate=improvement
            ))
    
    improved_topics.sort(key=lambda x: x.improvement_rate, reverse=True)
    most_improved = improved_topics[:5]
    
    return FacultyOverviewResponse(
        total_students=total_students,
        active_assessments=active_assessments,
        average_capability_score=float(avg_capability),
        most_difficult_topics=most_difficult,
        most_improved_topics=most_improved
    )


def get_student_detail(db: Session, student_id: UUID) -> StudentDetailResponse:
    """Get detailed analytics for a specific student."""
    
    # Get student info
    student = db.query(User).filter(User.id == student_id, User.role == UserRole.student).first()
    if not student:
        raise ValueError("Student not found")
    
    # Overall capability score
    overall_capability = db.query(func.avg(CapabilityScore.capability_level)).filter(
        CapabilityScore.user_id == student_id
    ).scalar() or 0.0
    
    # Topic-wise capabilities
    topic_caps = db.query(
        CapabilityScore.topic_id,
        Topic.name,
        CapabilityScore.capability_level
    ).join(
        Topic, Topic.id == CapabilityScore.topic_id
    ).filter(
        CapabilityScore.user_id == student_id
    ).all()
    
    topic_capabilities = [
        TopicCapability(
            topic_id=tc.topic_id,
            topic_name=tc.name,
            capability_level=tc.capability_level
        )
        for tc in topic_caps
    ]
    
    # Recent feedback (last 10)
    recent_feedback_query = db.query(
        Feedback.id,
        Feedback.gap_type,
        Feedback.feedback_text,
        Feedback.created_at
    ).join(
        AnswerAttempt, AnswerAttempt.id == Feedback.answer_attempt_id
    ).join(
        AssessmentAttempt, AssessmentAttempt.id == AnswerAttempt.assessment_id
    ).filter(
        AssessmentAttempt.user_id == student_id
    ).order_by(
        desc(Feedback.created_at)
    ).limit(10).all()
    
    recent_feedback = [
        FeedbackSummary(
            feedback_id=f.id,
            gap_type=f.gap_type.value if f.gap_type else None,
            feedback_text=f.feedback_text,
            created_at=f.created_at
        )
        for f in recent_feedback_query
    ]
    
    # Detected gaps (count by type)
    gaps_query = db.query(
        Feedback.gap_type,
        func.count(Feedback.id).label('count')
    ).join(
        AnswerAttempt, AnswerAttempt.id == Feedback.answer_attempt_id
    ).join(
        AssessmentAttempt, AssessmentAttempt.id == AnswerAttempt.assessment_id
    ).filter(
        AssessmentAttempt.user_id == student_id,
        Feedback.gap_type.isnot(None)
    ).group_by(Feedback.gap_type).all()
    
    detected_gaps = [
        DetectedGap(gap_type=g.gap_type.value, count=g.count)
        for g in gaps_query
    ]
    
    # Originality trend (mock - based on answer variety)
    # In a real scenario, this would come from NLP analysis
    originality_trend = [
        TrendMetric(date=(datetime.utcnow() - timedelta(days=i*7)).strftime('%Y-%m-%d'), value=0.7 + (i % 3) * 0.05)
        for i in range(12)
    ]
    originality_trend.reverse()
    
    # Confidence trend (mock - based on completion rates)
    confidence_trend = [
        TrendMetric(date=(datetime.utcnow() - timedelta(days=i*7)).strftime('%Y-%m-%d'), value=0.65 + (i % 4) * 0.05)
        for i in range(12)
    ]
    confidence_trend.reverse()
    
    return StudentDetailResponse(
        student_id=student_id,
        student_name=student.name,
        overall_capability_score=float(overall_capability),
        topic_capabilities=topic_capabilities,
        recent_feedback=recent_feedback,
        detected_gaps=detected_gaps,
        originality_trend=originality_trend,
        confidence_trend=confidence_trend
    )


def get_topics_heatmap(db: Session) -> TopicHeatmapResponse:
    """Generate topic heatmap with difficulty and intervention metrics."""
    
    topics = db.query(Topic).all()
    heatmap_items = []
    
    for topic in topics:
        # Average capability for this topic
        avg_cap = db.query(func.avg(CapabilityScore.capability_level)).filter(
            CapabilityScore.topic_id == topic.id
        ).scalar() or 0.0
        
        # Failure rate for this topic
        total_attempts = db.query(func.count(AnswerAttempt.id)).join(
            AnswerAttempt.question
        ).filter(
            AnswerAttempt.question.has(topic_id=topic.id)
        ).scalar() or 0
        
        failed_attempts = db.query(func.count(AnswerAttempt.id)).join(
            AnswerAttempt.question
        ).filter(
            AnswerAttempt.question.has(topic_id=topic.id),
            AnswerAttempt.is_correct == False
        ).scalar() or 0
        
        failure_rate = float(failed_attempts) / float(total_attempts) if total_attempts > 0 else 0.0
        
        # Most common gap type
        common_gap = db.query(
            Feedback.gap_type,
            func.count(Feedback.id).label('count')
        ).join(
            AnswerAttempt, AnswerAttempt.id == Feedback.answer_attempt_id
        ).join(
            AnswerAttempt.question
        ).filter(
            AnswerAttempt.question.has(topic_id=topic.id),
            Feedback.gap_type.isnot(None)
        ).group_by(Feedback.gap_type).order_by(desc('count')).first()
        
        most_common_gap = common_gap.gap_type.value if common_gap else None
        
        # Recommended intervention level
        if failure_rate > 0.6 or avg_cap < 40:
            intervention = "high"
        elif failure_rate > 0.4 or avg_cap < 60:
            intervention = "medium"
        else:
            intervention = "low"
        
        heatmap_items.append(TopicHeatmapItem(
            topic_id=topic.id,
            topic_name=topic.name,
            average_capability=float(avg_cap),
            failure_rate=failure_rate,
            most_common_gap_type=most_common_gap,
            recommended_intervention_level=intervention
        ))
    
    return TopicHeatmapResponse(topics=heatmap_items)


def get_leaderboard(db: Session) -> LeaderboardResponse:
    """Generate student leaderboard based on capability growth and consistency."""
    
    # Calculate capability growth (current vs initial)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    students_query = db.query(
        User.id,
        User.name,
        func.avg(CapabilityScore.capability_level).label('current_capability'),
        func.max(CapabilityScore.streak).label('max_streak')
    ).join(
        CapabilityScore, CapabilityScore.user_id == User.id
    ).filter(
        User.role == UserRole.student
    ).group_by(User.id, User.name).all()
    
    leaderboard_entries = []
    for student in students_query:
        # Calculate growth (simplified - in reality would compare initial vs current)
        capability_score = float(student.current_capability or 0)
        streak = student.max_streak or 0
        
        # Combined score for ranking (weighted)
        combined_score = capability_score * 0.7 + streak * 0.3
        
        leaderboard_entries.append({
            'student_id': student.id,
            'student_name': student.name,
            'capability_score': capability_score,
            'streak': streak,
            'combined_score': combined_score
        })
    
    # Sort by combined score
    leaderboard_entries.sort(key=lambda x: x['combined_score'], reverse=True)
    
    # Add ranks
    leaderboard = [
        LeaderboardEntry(
            rank=idx + 1,
            student_id=entry['student_id'],
            student_name=entry['student_name'],
            capability_score=entry['capability_score'],
            streak=entry['streak']
        )
        for idx, entry in enumerate(leaderboard_entries)
    ]
    
    return LeaderboardResponse(leaderboard=leaderboard)


def get_student_self_insights(db: Session, student_id: UUID) -> StudentSelfInsightsResponse:
    """Generate self-insights for a student."""
    
    # Verify student exists
    student = db.query(User).filter(User.id == student_id, User.role == UserRole.student).first()
    if not student:
        raise ValueError("Student not found")
    
    # Learning wheel metrics (5 dimensions)
    
    # 1. IQ (reasoning quality) - based on correct answers to difficult questions
    correct_difficult = db.query(func.count(AnswerAttempt.id)).join(
        AssessmentAttempt, AssessmentAttempt.id == AnswerAttempt.assessment_id
    ).join(
        AnswerAttempt.question
    ).filter(
        AssessmentAttempt.user_id == student_id,
        AnswerAttempt.is_correct == True,
        AnswerAttempt.question.has(difficulty_level >= 7)
    ).scalar() or 0
    
    total_difficult = db.query(func.count(AnswerAttempt.id)).join(
        AssessmentAttempt, AssessmentAttempt.id == AnswerAttempt.assessment_id
    ).join(
        AnswerAttempt.question
    ).filter(
        AssessmentAttempt.user_id == student_id,
        AnswerAttempt.question.has(difficulty_level >= 7)
    ).scalar() or 1
    
    iq_score = float(correct_difficult) / float(total_difficult) * 100
    
    # 2. Learning (capability growth)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_cap = db.query(func.avg(CapabilityScore.capability_level)).filter(
        CapabilityScore.user_id == student_id,
        CapabilityScore.last_updated >= thirty_days_ago
    ).scalar() or 50
    
    old_cap = db.query(func.avg(CapabilityScore.capability_level)).filter(
        CapabilityScore.user_id == student_id,
        CapabilityScore.last_updated < thirty_days_ago
    ).scalar() or recent_cap
    
    learning_score = min(100, max(0, float(recent_cap)))
    
    # 3. Consistency (streak)
    max_streak = db.query(func.max(CapabilityScore.streak)).filter(
        CapabilityScore.user_id == student_id
    ).scalar() or 0
    
    consistency_score = min(100, float(max_streak) * 10)
    
    # 4. Originality (mock - would come from NLP analysis)
    originality_score = 75.0
    
    # 5. Accuracy (overall correctness)
    total_answers = db.query(func.count(AnswerAttempt.id)).join(
        AssessmentAttempt, AssessmentAttempt.id == AnswerAttempt.assessment_id
    ).filter(
        AssessmentAttempt.user_id == student_id,
        AnswerAttempt.is_correct.isnot(None)
    ).scalar() or 1
    
    correct_answers = db.query(func.count(AnswerAttempt.id)).join(
        AssessmentAttempt, AssessmentAttempt.id == AnswerAttempt.assessment_id
    ).filter(
        AssessmentAttempt.user_id == student_id,
        AnswerAttempt.is_correct == True
    ).scalar() or 0
    
    accuracy_score = float(correct_answers) / float(total_answers) * 100
    
    learning_wheel = LearningWheelMetric(
        iq=iq_score,
        learning=learning_score,
        consistency=consistency_score,
        originality=originality_score,
        accuracy=accuracy_score
    )
    
    # Strengths (top capabilities)
    top_caps = db.query(
        Topic.name
    ).join(
        CapabilityScore, CapabilityScore.topic_id == Topic.id
    ).filter(
        CapabilityScore.user_id == student_id,
        CapabilityScore.capability_level >= 80
    ).limit(5).all()
    
    strengths = [cap.name for cap in top_caps]
    if not strengths:
        strengths = ["Continue practicing to build strengths"]
    
    # Weak topics
    weak_topics_query = db.query(
        CapabilityScore.topic_id,
        Topic.name,
        CapabilityScore.capability_level
    ).join(
        Topic, Topic.id == CapabilityScore.topic_id
    ).filter(
        CapabilityScore.user_id == student_id,
        CapabilityScore.capability_level < 50
    ).order_by(CapabilityScore.capability_level).limit(5).all()
    
    weak_topics = [
        WeakTopic(
            topic_id=wt.topic_id,
            topic_name=wt.name,
            capability_level=wt.capability_level
        )
        for wt in weak_topics_query
    ]
    
    # Next recommended concepts (based on suggested topics from feedback)
    recommended_query = db.query(
        Feedback.suggested_next_topic,
        Topic.name,
        func.count(Feedback.id).label('suggestion_count')
    ).join(
        Topic, Topic.id == Feedback.suggested_next_topic
    ).join(
        AnswerAttempt, AnswerAttempt.id == Feedback.answer_attempt_id
    ).join(
        AssessmentAttempt, AssessmentAttempt.id == AnswerAttempt.assessment_id
    ).filter(
        AssessmentAttempt.user_id == student_id,
        Feedback.suggested_next_topic.isnot(None)
    ).group_by(
        Feedback.suggested_next_topic, Topic.name
    ).order_by(desc('suggestion_count')).limit(3).all()
    
    next_recommended = [
        RecommendedConcept(
            topic_id=r.suggested_next_topic,
            topic_name=r.name,
            reason=f"Recommended {r.suggestion_count} times based on your learning gaps"
        )
        for r in recommended_query
    ]
    
    if not next_recommended:
        # Fallback: recommend topics with lowest capability
        fallback_topics = db.query(
            CapabilityScore.topic_id,
            Topic.name
        ).join(
            Topic, Topic.id == CapabilityScore.topic_id
        ).filter(
            CapabilityScore.user_id == student_id
        ).order_by(CapabilityScore.capability_level).limit(3).all()
        
        next_recommended = [
            RecommendedConcept(
                topic_id=t.topic_id,
                topic_name=t.name,
                reason="Focus on improving this topic"
            )
            for t in fallback_topics
        ]
    
    return StudentSelfInsightsResponse(
        learning_wheel=learning_wheel,
        strengths=strengths,
        weak_topics=weak_topics,
        next_recommended_concepts=next_recommended
    )
