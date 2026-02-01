import re
from typing import Dict, Tuple, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.answer_attempt import AnswerAttempt
from app.models.assessment import AssessmentAttempt
from app.models.feedback import Feedback, GapType


def analyze_answer_length(answer_text: str) -> Dict[str, any]:
    """
    Analyze answer length and structure.
    Returns word count, character count, and length category.
    """
    if not answer_text:
        return {
            "word_count": 0,
            "char_count": 0,
            "length_category": "empty"
        }
    
    # Count words (split by whitespace)
    words = answer_text.split()
    word_count = len(words)
    char_count = len(answer_text)
    
    # Categorize length
    if word_count == 0:
        length_category = "empty"
    elif word_count < 20:
        length_category = "very_short"
    elif word_count < 50:
        length_category = "short"
    elif word_count < 150:
        length_category = "medium"
    elif word_count < 300:
        length_category = "long"
    else:
        length_category = "very_long"
    
    return {
        "word_count": word_count,
        "char_count": char_count,
        "length_category": length_category
    }


def analyze_sentence_variety(answer_text: str) -> Dict[str, any]:
    """
    Analyze sentence structure variety and complexity.
    Measures sentence count, average length, and variety score.
    """
    if not answer_text:
        return {
            "sentence_count": 0,
            "avg_sentence_length": 0,
            "variety_score": 0,
            "has_variety": False
        }
    
    # Split into sentences (basic split on .!?)
    sentences = re.split(r'[.!?]+', answer_text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    sentence_count = len(sentences)
    if sentence_count == 0:
        return {
            "sentence_count": 0,
            "avg_sentence_length": 0,
            "variety_score": 0,
            "has_variety": False
        }
    
    # Calculate sentence lengths
    sentence_lengths = [len(s.split()) for s in sentences]
    avg_length = sum(sentence_lengths) / sentence_count
    
    # Calculate variety: standard deviation of sentence lengths
    # Higher variety indicates more natural writing
    if sentence_count > 1:
        variance = sum((x - avg_length) ** 2 for x in sentence_lengths) / sentence_count
        variety_score = variance ** 0.5
    else:
        variety_score = 0
    
    # Good variety typically has std dev > 3 words
    has_variety = variety_score > 3.0 and sentence_count > 2
    
    return {
        "sentence_count": sentence_count,
        "avg_sentence_length": round(avg_length, 2),
        "variety_score": round(variety_score, 2),
        "has_variety": has_variety
    }


def analyze_repetition(answer_text: str) -> Dict[str, any]:
    """
    Detect repetitive patterns in text.
    High repetition may indicate low originality or AI generation.
    """
    if not answer_text or len(answer_text.split()) < 10:
        return {
            "repetition_score": 0,
            "repeated_phrases": [],
            "is_repetitive": False
        }
    
    # Convert to lowercase for analysis
    text_lower = answer_text.lower()
    words = text_lower.split()
    
    # Look for repeated 3-gram phrases
    repeated_phrases = []
    phrase_counts = {}
    
    for i in range(len(words) - 2):
        phrase = " ".join(words[i:i+3])
        phrase_counts[phrase] = phrase_counts.get(phrase, 0) + 1
    
    # Find phrases that appear more than once
    for phrase, count in phrase_counts.items():
        if count > 1:
            repeated_phrases.append({"phrase": phrase, "count": count})
    
    # Calculate repetition score (0-100)
    # Higher score means more repetition
    total_phrases = len(words) - 2
    if total_phrases > 0:
        repetition_ratio = sum(p["count"] - 1 for p in repeated_phrases) / total_phrases
        repetition_score = min(100, int(repetition_ratio * 200))
    else:
        repetition_score = 0
    
    is_repetitive = repetition_score > 30
    
    return {
        "repetition_score": repetition_score,
        "repeated_phrases": repeated_phrases[:5],  # Top 5 repeated phrases
        "is_repetitive": is_repetitive
    }


def detect_quality_jump(answer_text: str, previous_answers: list) -> Dict[str, any]:
    """
    Detect sudden jumps in writing quality compared to previous answers.
    Analyzes complexity, vocabulary, and structure changes.
    """
    if not answer_text or not previous_answers:
        return {
            "quality_jump_detected": False,
            "current_complexity": 0,
            "avg_previous_complexity": 0,
            "jump_magnitude": 0
        }
    
    # Calculate complexity score based on:
    # - Average word length
    # - Sentence complexity
    # - Vocabulary diversity
    
    def calculate_complexity(text: str) -> float:
        if not text:
            return 0
        
        words = text.split()
        if not words:
            return 0
        
        # Average word length
        avg_word_len = sum(len(w) for w in words) / len(words)
        
        # Unique word ratio (vocabulary diversity)
        unique_ratio = len(set(words)) / len(words) if len(words) > 0 else 0
        
        # Sentence count
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        words_per_sentence = len(words) / len(sentences) if len(sentences) > 0 else len(words)
        
        # Combine metrics (normalized to 0-100)
        complexity = (avg_word_len * 10) + (unique_ratio * 30) + (words_per_sentence * 2)
        return min(100, complexity)
    
    current_complexity = calculate_complexity(answer_text)
    previous_complexities = [calculate_complexity(ans) for ans in previous_answers if ans]
    
    if not previous_complexities:
        return {
            "quality_jump_detected": False,
            "current_complexity": round(current_complexity, 2),
            "avg_previous_complexity": 0,
            "jump_magnitude": 0
        }
    
    avg_previous_complexity = sum(previous_complexities) / len(previous_complexities)
    jump_magnitude = current_complexity - avg_previous_complexity
    
    # Quality jump detected if current is 25+ points higher than average
    quality_jump_detected = jump_magnitude > 25
    
    return {
        "quality_jump_detected": quality_jump_detected,
        "current_complexity": round(current_complexity, 2),
        "avg_previous_complexity": round(avg_previous_complexity, 2),
        "jump_magnitude": round(jump_magnitude, 2)
    }


def detect_generic_phrasing(answer_text: str) -> Dict[str, any]:
    """
    Detect generic or template-like phrases commonly found in AI-generated text.
    Subject-agnostic patterns that indicate low originality.
    """
    if not answer_text:
        return {
            "generic_score": 0,
            "generic_phrases_found": [],
            "is_generic": False
        }
    
    text_lower = answer_text.lower()
    
    # Common generic patterns (subject-agnostic)
    generic_patterns = [
        r"in conclusion",
        r"to sum up",
        r"in summary",
        r"it is important to note",
        r"it should be noted",
        r"as mentioned earlier",
        r"furthermore",
        r"moreover",
        r"additionally",
        r"on the other hand",
        r"in other words",
        r"that being said",
        r"first and foremost",
        r"last but not least",
        r"it goes without saying",
        r"needless to say",
        r"at the end of the day",
        r"when all is said and done",
        r"the bottom line is",
        r"to put it simply"
    ]
    
    found_phrases = []
    for pattern in generic_patterns:
        if re.search(pattern, text_lower):
            found_phrases.append(pattern)
    
    # Calculate generic score (0-100)
    word_count = len(answer_text.split())
    if word_count > 0:
        # Each generic phrase adds to the score
        generic_score = min(100, len(found_phrases) * 15)
    else:
        generic_score = 0
    
    is_generic = generic_score > 30 or len(found_phrases) >= 3
    
    return {
        "generic_score": generic_score,
        "generic_phrases_found": found_phrases,
        "is_generic": is_generic
    }


def analyze_writing_pattern(answer_attempt: AnswerAttempt, db: Session) -> Dict[str, any]:
    """
    STEP 1: Comprehensive writing pattern analysis.
    Combines all pattern detection methods and flags AI generation or low originality.
    """
    answer_text = answer_attempt.answer_text or ""
    
    # Get previous answers from the same student in the same assessment
    previous_answer_attempts = db.query(AnswerAttempt).filter(
        AnswerAttempt.assessment_id == answer_attempt.assessment_id,
        AnswerAttempt.id != answer_attempt.id
    ).all()
    previous_answers = [ans.answer_text for ans in previous_answer_attempts if ans.answer_text]
    
    # Run all analyses
    length_analysis = analyze_answer_length(answer_text)
    variety_analysis = analyze_sentence_variety(answer_text)
    repetition_analysis = analyze_repetition(answer_text)
    quality_jump_analysis = detect_quality_jump(answer_text, previous_answers)
    generic_analysis = detect_generic_phrasing(answer_text)
    
    # Determine flags
    # AI generation indicators:
    # - Very uniform sentence structure (low variety)
    # - Generic phrasing
    # - Perfect grammar with no variety
    # - Sudden quality jump
    looks_ai_generated = (
        not variety_analysis["has_variety"] and 
        length_analysis["word_count"] > 50 and
        (generic_analysis["is_generic"] or quality_jump_analysis["quality_jump_detected"])
    )
    
    # Low originality indicators:
    # - High repetition
    # - Many generic phrases
    # - Very short or copy-paste patterns
    low_originality = (
        repetition_analysis["is_repetitive"] or
        (generic_analysis["generic_score"] > 40) or
        (length_analysis["word_count"] < 15 and length_analysis["word_count"] > 0)
    )
    
    return {
        "length_analysis": length_analysis,
        "variety_analysis": variety_analysis,
        "repetition_analysis": repetition_analysis,
        "quality_jump_analysis": quality_jump_analysis,
        "generic_analysis": generic_analysis,
        "looks_ai_generated": looks_ai_generated,
        "low_originality": low_originality
    }


def analyze_pause_behavior(answer_attempt: AnswerAttempt, assessment_attempt: AssessmentAttempt) -> Dict[str, any]:
    """
    STEP 2: Pause and behavior analysis.
    Analyzes timing patterns to detect suspicious behaviors.
    """
    # Note: We need submission timestamp to be added to AnswerAttempt model
    # For now, we'll work with available data: started_at, stopped_at_step, progress_percentage
    
    if not assessment_attempt.started_at:
        return {
            "suspicious_pause": False,
            "low_knowledge_signal": False,
            "possible_copy_behavior": False,
            "analysis_details": "Insufficient timing data"
        }
    
    # Check progress and stopped_at_step for low knowledge signals
    progress = answer_attempt.progress_percentage or 0
    stopped_at = answer_attempt.stopped_at_step or 0
    
    # Low knowledge signal: student stops early and makes little progress
    low_knowledge_signal = (stopped_at > 0 and progress < 30) or (progress < 20)
    
    # Check answer quality vs progress
    answer_text = answer_attempt.answer_text or ""
    word_count = len(answer_text.split())
    
    # Possible copy behavior: low progress but suddenly high-quality answer
    # This suggests they may have copied from elsewhere
    possible_copy_behavior = (
        progress < 40 and 
        word_count > 100 and
        stopped_at > 0
    )
    
    # Suspicious pause detection would require actual timestamps
    # We'll flag if progress is inconsistent with answer quality
    suspicious_pause = possible_copy_behavior
    
    return {
        "suspicious_pause": suspicious_pause,
        "low_knowledge_signal": low_knowledge_signal,
        "possible_copy_behavior": possible_copy_behavior,
        "progress_percentage": progress,
        "stopped_at_step": stopped_at,
        "answer_word_count": word_count
    }


def calculate_risk_score(writing_analysis: Dict, behavior_analysis: Dict) -> Dict[str, any]:
    """
    STEP 3: Risk scoring.
    Generates explainable scores and risk flags based on all analyses.
    """
    # Calculate originality score (0-100, higher is better)
    originality_score = 100
    
    # Deduct points for concerning patterns
    if writing_analysis["low_originality"]:
        originality_score -= 30
    
    if writing_analysis["repetition_analysis"]["is_repetitive"]:
        originality_score -= 20
    
    if writing_analysis["generic_analysis"]["is_generic"]:
        originality_score -= 15
    
    # Ensure score stays in valid range
    originality_score = max(0, min(100, originality_score))
    
    # Calculate confidence score (0-100, higher means more confident the answer is authentic)
    confidence_score = 100
    
    # Deduct points for AI generation signals
    if writing_analysis["looks_ai_generated"]:
        confidence_score -= 40
    
    if writing_analysis["quality_jump_analysis"]["quality_jump_detected"]:
        confidence_score -= 25
    
    if behavior_analysis["possible_copy_behavior"]:
        confidence_score -= 30
    
    if behavior_analysis["suspicious_pause"]:
        confidence_score -= 15
    
    # Ensure score stays in valid range
    confidence_score = max(0, min(100, confidence_score))
    
    # Determine risk flag
    # High risk: confidence < 40 or multiple red flags
    # Medium risk: confidence 40-60 or some concerns
    # Low risk: confidence 60-80 with minor concerns
    # None: confidence > 80 and no major concerns
    
    red_flag_count = sum([
        writing_analysis["looks_ai_generated"],
        writing_analysis["low_originality"],
        behavior_analysis["possible_copy_behavior"],
        behavior_analysis["low_knowledge_signal"]
    ])
    
    if confidence_score < 40 or red_flag_count >= 3:
        risk_flag = "high"
    elif confidence_score < 60 or red_flag_count >= 2:
        risk_flag = "medium"
    elif confidence_score < 80 or red_flag_count >= 1:
        risk_flag = "low"
    else:
        risk_flag = "none"
    
    return {
        "originality_score": originality_score,
        "confidence_score": confidence_score,
        "risk_flag": risk_flag,
        "red_flag_count": red_flag_count
    }


def generate_feedback_text(risk_score: Dict, writing_analysis: Dict, behavior_analysis: Dict) -> Optional[str]:
    """
    STEP 4: Feedback integration.
    Generates appropriate feedback text based on risk level and specific issues found.
    """
    risk_flag = risk_score["risk_flag"]
    
    # Only generate feedback for medium or high risk
    if risk_flag not in ["medium", "high"]:
        return None
    
    feedback_messages = []
    
    # Add specific feedback based on issues detected
    if writing_analysis["looks_ai_generated"]:
        feedback_messages.append(
            "Your answer shows patterns that may indicate external assistance. "
            "Try to express concepts in your own words to demonstrate understanding."
        )
    
    if writing_analysis["low_originality"]:
        feedback_messages.append(
            "Your answer contains repetitive patterns or generic phrasing. "
            "Consider using more specific examples and varied sentence structures."
        )
    
    if writing_analysis["repetition_analysis"]["is_repetitive"]:
        feedback_messages.append(
            "Your answer has repetitive content. "
            "Review your response and remove duplicate ideas to improve clarity."
        )
    
    if writing_analysis["quality_jump_analysis"]["quality_jump_detected"]:
        feedback_messages.append(
            "Your answer shows inconsistencies in writing flow compared to previous responses. "
            "Maintain a consistent style to better demonstrate your understanding."
        )
    
    if behavior_analysis["possible_copy_behavior"]:
        feedback_messages.append(
            "The timing and quality patterns suggest possible external reference. "
            "For better learning, try to answer in your own words without external help."
        )
    
    if behavior_analysis["low_knowledge_signal"]:
        feedback_messages.append(
            "Your progress pattern indicates difficulty with the material. "
            "Consider reviewing the topic fundamentals before attempting complex questions."
        )
    
    # If no specific messages, provide a generic one
    if not feedback_messages:
        if risk_flag == "high":
            feedback_messages.append(
                "Your answer shows significant inconsistencies. "
                "Please ensure you're answering in your own words to demonstrate understanding."
            )
        else:  # medium
            feedback_messages.append(
                "Your answer could be improved. "
                "Try to answer in your own words and show your work process."
            )
    
    return " ".join(feedback_messages)


def create_nlp_feedback(answer_attempt: AnswerAttempt, risk_score: Dict, 
                        writing_analysis: Dict, behavior_analysis: Dict, 
                        db: Session) -> Optional[Feedback]:
    """
    Create or update feedback entry with NLP analysis results.
    Only creates feedback for medium or high risk cases.
    """
    risk_flag = risk_score["risk_flag"]
    
    # Only create feedback for medium or high risk
    if risk_flag not in ["medium", "high"]:
        return None
    
    feedback_text = generate_feedback_text(risk_score, writing_analysis, behavior_analysis)
    
    if not feedback_text:
        return None
    
    # Check if feedback already exists for this answer attempt
    existing_feedback = db.query(Feedback).filter(
        Feedback.answer_attempt_id == answer_attempt.id
    ).first()
    
    if existing_feedback:
        # Update existing feedback
        existing_feedback.feedback_text = feedback_text
        existing_feedback.gap_type = GapType.logic  # NLP-detected issues are primarily logic/approach issues
        db.flush()
        return existing_feedback
    else:
        # Create new feedback
        new_feedback = Feedback(
            answer_attempt_id=answer_attempt.id,
            gap_type=GapType.logic,
            feedback_text=feedback_text,
            suggested_next_topic=None  # NLP analysis doesn't suggest specific topics
        )
        db.add(new_feedback)
        db.flush()
        return new_feedback


def analyze_answer_attempt(answer_attempt_id, db: Session) -> Dict[str, any]:
    """
    Main entry point for NLP analysis.
    Performs complete analysis and returns results.
    """
    # Fetch answer attempt
    answer_attempt = db.query(AnswerAttempt).filter(
        AnswerAttempt.id == answer_attempt_id
    ).first()
    
    if not answer_attempt:
        raise ValueError("Answer attempt not found")
    
    # Fetch assessment attempt for timing data
    assessment_attempt = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.id == answer_attempt.assessment_id
    ).first()
    
    if not assessment_attempt:
        raise ValueError("Assessment attempt not found")
    
    # Perform all analyses
    writing_analysis = analyze_writing_pattern(answer_attempt, db)
    behavior_analysis = analyze_pause_behavior(answer_attempt, assessment_attempt)
    risk_score = calculate_risk_score(writing_analysis, behavior_analysis)
    
    # Create feedback if needed
    feedback = create_nlp_feedback(
        answer_attempt, 
        risk_score, 
        writing_analysis, 
        behavior_analysis, 
        db
    )
    
    # Commit changes
    db.commit()
    
    return {
        "originality_score": risk_score["originality_score"],
        "confidence_score": risk_score["confidence_score"],
        "risk_flag": risk_score["risk_flag"],
        "writing_analysis": writing_analysis,
        "behavior_analysis": behavior_analysis,
        "feedback_created": feedback is not None
    }
