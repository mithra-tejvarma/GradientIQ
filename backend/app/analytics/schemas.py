from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from uuid import UUID


class TopicDifficulty(BaseModel):
    topic_id: UUID
    topic_name: str
    failure_rate: float


class TopicImprovement(BaseModel):
    topic_id: UUID
    topic_name: str
    improvement_rate: float


class FacultyOverviewResponse(BaseModel):
    total_students: int
    active_assessments: int
    average_capability_score: float
    most_difficult_topics: List[TopicDifficulty]
    most_improved_topics: List[TopicImprovement]


class TopicCapability(BaseModel):
    topic_id: UUID
    topic_name: str
    capability_level: int


class FeedbackSummary(BaseModel):
    feedback_id: UUID
    gap_type: Optional[str]
    feedback_text: Optional[str]
    created_at: datetime


class DetectedGap(BaseModel):
    gap_type: str
    count: int


class TrendMetric(BaseModel):
    date: str
    value: float


class StudentDetailResponse(BaseModel):
    student_id: UUID
    student_name: str
    overall_capability_score: float
    topic_capabilities: List[TopicCapability]
    recent_feedback: List[FeedbackSummary]
    detected_gaps: List[DetectedGap]
    originality_trend: List[TrendMetric]
    confidence_trend: List[TrendMetric]


class TopicHeatmapItem(BaseModel):
    topic_id: UUID
    topic_name: str
    average_capability: float
    failure_rate: float
    most_common_gap_type: Optional[str]
    recommended_intervention_level: str


class TopicHeatmapResponse(BaseModel):
    topics: List[TopicHeatmapItem]


class LeaderboardEntry(BaseModel):
    rank: int
    student_id: UUID
    student_name: str
    capability_score: float
    streak: int


class LeaderboardResponse(BaseModel):
    leaderboard: List[LeaderboardEntry]


class LearningWheelMetric(BaseModel):
    iq: float
    learning: float
    consistency: float
    originality: float
    accuracy: float


class WeakTopic(BaseModel):
    topic_id: UUID
    topic_name: str
    capability_level: int


class RecommendedConcept(BaseModel):
    topic_id: UUID
    topic_name: str
    reason: str


class StudentSelfInsightsResponse(BaseModel):
    learning_wheel: LearningWheelMetric
    strengths: List[str]
    weak_topics: List[WeakTopic]
    next_recommended_concepts: List[RecommendedConcept]
