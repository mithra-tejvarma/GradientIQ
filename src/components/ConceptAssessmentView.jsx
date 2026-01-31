import { useState, useEffect, useRef } from 'react';
import './ConceptAssessmentView.css';

// Constants
const PAUSE_THRESHOLD_MS = 2000; // Time threshold for detecting a pause (in milliseconds)

function ConceptAssessmentView({ subject, concept, question, onBack }) {
  // Answer state
  const [answer, setAnswer] = useState('');
  
  // Tracking states
  const [timeSpent, setTimeSpent] = useState(0);
  const [keystrokeLog, setKeystrokeLog] = useState([]);
  const [pauseLog, setPauseLog] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs
  const startTimeRef = useRef(null);
  const lastKeystrokeRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);
  
  // Start timer on component mount
  useEffect(() => {
    startTimeRef.current = Date.now();
    lastKeystrokeRef.current = Date.now();
    
    // Update time spent every second
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeSpent(elapsed);
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
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
    
    alert('Answer submitted! Check console for tracking details.');
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
    </div>
  );
}

export default ConceptAssessmentView;
