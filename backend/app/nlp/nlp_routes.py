from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.dependencies import get_db
from app.auth.dependencies import require_student
from app.models.user import User
from app.models.answer_attempt import AnswerAttempt
from app.nlp.nlp_service import analyze_answer_attempt


router = APIRouter()


class NLPAnalysisResponse(BaseModel):
    """Response schema for NLP analysis endpoint"""
    originality_score: int
    confidence_score: int
    risk_flag: str
    feedback_created: bool
    details: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


@router.post("/analyze/{answer_attempt_id}", response_model=NLPAnalysisResponse)
def analyze_answer(
    answer_attempt_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    """
    POST /nlp/analyze/{answer_attempt_id}
    
    Analyzes a student's answer using NLP and behavioral patterns.
    
    - Requires student authentication
    - Performs writing pattern analysis (length, variety, repetition, quality jumps, generic phrasing)
    - Performs pause and behavior analysis (suspicious pauses, low knowledge signals, copy behavior)
    - Calculates risk scores (originality_score, confidence_score, risk_flag)
    - Stores feedback for medium/high risk cases
    
    Returns:
    - originality_score: 0-100, higher means more original
    - confidence_score: 0-100, higher means more confident the answer is authentic
    - risk_flag: "none" | "low" | "medium" | "high"
    - feedback_created: whether feedback was stored
    - details: detailed analysis results (optional)
    """
    # Verify answer attempt exists and belongs to the student
    answer_attempt = db.query(AnswerAttempt).filter(
        AnswerAttempt.id == answer_attempt_id
    ).first()
    
    if not answer_attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer attempt not found"
        )
    
    # Verify the answer attempt belongs to the current student
    assessment_attempt = answer_attempt.assessment_attempt
    if not assessment_attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated assessment attempt not found"
        )
    
    if assessment_attempt.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only analyze your own answers"
        )
    
    # Perform NLP analysis
    try:
        analysis_result = analyze_answer_attempt(answer_attempt_id, db)
        
        return NLPAnalysisResponse(
            originality_score=analysis_result["originality_score"],
            confidence_score=analysis_result["confidence_score"],
            risk_flag=analysis_result["risk_flag"],
            feedback_created=analysis_result["feedback_created"],
            details={
                "writing_analysis": {
                    "looks_ai_generated": analysis_result["writing_analysis"]["looks_ai_generated"],
                    "low_originality": analysis_result["writing_analysis"]["low_originality"],
                    "word_count": analysis_result["writing_analysis"]["length_analysis"]["word_count"],
                    "sentence_count": analysis_result["writing_analysis"]["variety_analysis"]["sentence_count"],
                    "repetition_score": analysis_result["writing_analysis"]["repetition_analysis"]["repetition_score"],
                    "generic_score": analysis_result["writing_analysis"]["generic_analysis"]["generic_score"]
                },
                "behavior_analysis": {
                    "suspicious_pause": analysis_result["behavior_analysis"]["suspicious_pause"],
                    "low_knowledge_signal": analysis_result["behavior_analysis"]["low_knowledge_signal"],
                    "possible_copy_behavior": analysis_result["behavior_analysis"]["possible_copy_behavior"]
                }
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing answer: {str(e)}"
        )
