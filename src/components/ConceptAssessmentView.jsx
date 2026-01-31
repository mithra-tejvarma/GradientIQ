import { useState, useEffect, useRef } from 'react';
import './ConceptAssessmentView.css';

// Constants
const PAUSE_THRESHOLD_MS = 2000; // Time threshold for detecting a pause (in milliseconds)
const INACTIVITY_THRESHOLD_MS = 30000; // 30 seconds of inactivity to trigger feedback (mock condition)

function ConceptAssessmentView({ subject, concept, question, onBack }) {
  // Answer state
  const [answer, setAnswer] = useState('');
  
  // Tracking states
  const [timeSpent, setTimeSpent] = useState(0);
  const [keystrokeLog, setKeystrokeLog] = useState([]);
  const [pauseLog, setPauseLog] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Refs
  const startTimeRef = useRef(null);
  const lastKeystrokeRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const inactivityTimeoutRef = useRef(null);
  
  // Start timer on component mount
  useEffect(() => {
    startTimeRef.current = Date.now();
    lastKeystrokeRef.current = Date.now();
    
    // Update time spent every second
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeSpent(elapsed);
    }, 1000);
    
    // Set inactivity timeout to show feedback after prolonged inactivity (mock condition)
    const inactivityTimeout = setTimeout(() => {
      setShowFeedback(true);
    }, INACTIVITY_THRESHOLD_MS);
    inactivityTimeoutRef.current = inactivityTimeout;
    
    // Cleanup on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);
  
  // Handle answer change with keystroke tracking
  const handleAnswerChange = (e) => {
    const newValue = e.target.value;
    setAnswer(newValue);
    
    const now = Date.now();
    const timeSinceLastKeystroke = now - lastKeystrokeRef.current;
    
    // Log keystroke timing
    setKeystrokeLog(prev => [...prev, {
      timestamp: now,
      timeSinceLastKeystroke,
      textLength: newValue.length
    }]);
    
    // Detect pause (if more than threshold since last keystroke, it was a pause)
    if (timeSinceLastKeystroke > PAUSE_THRESHOLD_MS && lastKeystrokeRef.current && lastKeystrokeRef.current !== startTimeRef.current) {
      setPauseLog(prev => [...prev, {
        startTime: lastKeystrokeRef.current,
        endTime: now,
        duration: timeSinceLastKeystroke
      }]);
    }
    
    lastKeystrokeRef.current = now;
    setIsTyping(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Reset inactivity timeout on any keystroke
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    inactivityTimeoutRef.current = setTimeout(() => {
      console.log('User stopped progressing - showing feedback (mock condition)');
      setShowFeedback(true);
    }, INACTIVITY_THRESHOLD_MS);
    
    // Set typing to false after threshold of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, PAUSE_THRESHOLD_MS);
  };
  
  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle submit
  const handleSubmit = () => {
    const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    // Log submission data
    console.log('Answer submitted:', {
      subject,
      concept,
      answer,
      timeSpent: totalTime,
      totalKeystrokes: keystrokeLog.length,
      totalPauses: pauseLog.length,
      averageKeystrokeInterval: keystrokeLog.length > 1 
        ? keystrokeLog.slice(1).reduce((sum, log) => sum + log.timeSinceLastKeystroke, 0) / (keystrokeLog.length - 1)
        : 0,
      longestPause: pauseLog.length > 0 
        ? Math.max(...pauseLog.map(p => p.duration))
        : 0
    });
    
    // Show feedback after submission
    setShowFeedback(true);
  };
  
  // Handle save progress
  const handleSaveProgress = () => {
    console.log('Progress saved:', {
      subject,
      concept,
      answer,
      timeSpent: Math.floor((Date.now() - startTimeRef.current) / 1000),
      keystrokeCount: keystrokeLog.length,
      pauseCount: pauseLog.length
    });
    
    alert('Progress saved!');
  };
  
  // Determine if we should show code editor based on subject
  const isCodingSubject = subject === 'Coding';
  
  return (
    <div className="concept-assessment-view">
      {/* Header with back button */}
      <div className="assessment-header">
        <button onClick={onBack} className="back-button">
          ← Back to Concepts
        </button>
        <div className="timer-display">
          ⏱️ Time: {formatTime(timeSpent)}
        </div>
      </div>
      
      {/* Question Details */}
      <div className="assessment-details">
        <h1>{concept}</h1>
        <div className="detail-row">
          <span className="detail-label">Subject:</span>
          <span className="detail-value">{subject}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Difficulty:</span>
          <span className="detail-value">{question.difficulty}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Question Type:</span>
          <span className="detail-value">{question.type || 'Descriptive'}</span>
        </div>
      </div>
      
      {/* Question */}
      <div className="question-section">
        <h2>Question</h2>
        <div className="question-content">
          {question.questionText}
        </div>
      </div>
      
      {/* Answer Input */}
      <div className="answer-section">
        <h2>Your Answer</h2>
        <div className="answer-input-container">
          {isCodingSubject ? (
            <textarea
              className="answer-input code-editor"
              value={answer}
              onChange={handleAnswerChange}
              placeholder="// Write your code here..."
              rows="15"
              spellCheck="false"
            />
          ) : (
            <textarea
              className="answer-input"
              value={answer}
              onChange={handleAnswerChange}
              placeholder="Type your answer here... You can write explanations, steps, or detailed solutions."
              rows="12"
            />
          )}
        </div>
        
        {/* Activity Indicator */}
        <div className="activity-indicator">
          <span className={`typing-status ${isTyping ? 'active' : ''}`}>
            {isTyping ? '✏️ Typing...' : '💭 Thinking...'}
          </span>
          <span className="stats">
            Keystrokes: {keystrokeLog.length} | Pauses: {pauseLog.length}
          </span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={handleSubmit} className="submit-button">
          Submit Answer
        </button>
        <button onClick={handleSaveProgress} className="save-button">
          Save Progress
        </button>
      </div>
      
      {/* Tracking Info (for development/testing) */}
      <div className="tracking-info">
        <details>
          <summary>📊 Tracking Details (Debug Info)</summary>
          <div className="tracking-details">
            <p><strong>Time Spent:</strong> {formatTime(timeSpent)}</p>
            <p><strong>Total Keystrokes:</strong> {keystrokeLog.length}</p>
            <p><strong>Total Pauses ({'>'}  {PAUSE_THRESHOLD_MS / 1000}s):</strong> {pauseLog.length}</p>
            {pauseLog.length > 0 && (
              <p><strong>Longest Pause:</strong> {Math.max(...pauseLog.map(p => p.duration)) / 1000}s</p>
            )}
            <p><strong>Current Status:</strong> {isTyping ? 'Typing' : 'Paused/Thinking'}</p>
          </div>
        </details>
      </div>

      {/* Feedback Section */}
      {showFeedback && (
        <div className="feedback-section">
          <div className="feedback-header">
            <h2>Assessment Feedback</h2>
            <p className="feedback-subtitle">Understanding-based evaluation</p>
          </div>

          <div className="feedback-container">
            {/* What You Did Well */}
            <div className="feedback-block feedback-positive">
              <div className="feedback-block-header">
                <span className="feedback-icon">✔</span>
                <h3>What You Did Well</h3>
              </div>
              <div className="feedback-content">
                <p>Correct understanding of the core concept</p>
                <p>Logical approach in initial steps</p>
              </div>
            </div>

            {/* Where You Got Stuck */}
            <div className="feedback-block feedback-warning">
              <div className="feedback-block-header">
                <span className="feedback-icon">⚠</span>
                <h3>Where You Got Stuck</h3>
              </div>
              <div className="feedback-content">
                <p>Difficulty applying the concept in later steps</p>
                <p>Incomplete reasoning beyond step 2</p>
              </div>
            </div>

            {/* Concept Gap Identified */}
            <div className="feedback-block feedback-info">
              <div className="feedback-block-header">
                <span className="feedback-icon">🧠</span>
                <h3>Concept Gap Identified</h3>
              </div>
              <div className="feedback-content">
                <p>Weak understanding of fundamentals</p>
                <p>Needs revision of base formula / definition</p>
              </div>
            </div>

            {/* What To Learn Next */}
            <div className="feedback-block feedback-suggestion">
              <div className="feedback-block-header">
                <span className="feedback-icon">📘</span>
                <h3>What To Learn Next</h3>
              </div>
              <div className="feedback-content">
                <p>Revise basic concepts</p>
                <p>Practice simpler problems before advancing</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="feedback-actions">
            <button className="retry-button">Retry Concept</button>
            <button className="next-button" disabled>Move to Next Concept</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConceptAssessmentView;
