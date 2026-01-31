import { useState, useEffect, useRef } from 'react';
import './Page.css';
import { generateNLPSignals } from '../utils/nlpAnalysis';

// Behavior detection thresholds
const INACTIVITY_THRESHOLD_SECONDS = 30;
const FAST_SUBMISSION_TIME_THRESHOLD_SECONDS = 10;
const SUBSTANTIAL_ANSWER_LENGTH = 100;
const SMALL_CHANGE_THRESHOLD = 3;
const FREQUENT_TYPING_WINDOW_MS = 5000;
const LARGE_PASTE_THRESHOLD = 50;
const PASTE_DETECTION_DELAY_MS = 500;
const MAX_TYPING_EVENTS = 100; // Limit array size to prevent memory issues

function AssessmentPage() {
  // Mock data structure for subjects and concepts
  const subjects = {
    'Coding': {
      concepts: ['Loops', 'Recursion']
    },
    'Physics': {
      concepts: ['Kinematics', 'Laws of Motion']
    },
    'Chemistry': {
      concepts: ['Atomic Structure', 'Bonding']
    },
    'Mathematics': {
      concepts: ['Algebra', 'Calculus']
    },
    'Social Studies': {
      concepts: ['World History', 'Geography']
    },
    'Cryptography': {
      concepts: ['Hashing', 'Encryption Basics']
    },
    'Biology': {
      concepts: ['Cell Biology', 'Genetics']
    }
  };

  // Mock questions for each concept
  const mockQuestions = {
    'Loops': {
      difficulty: 'Medium',
      questionText: 'Write a loop to find the sum of an array.'
    },
    'Recursion': {
      difficulty: 'Hard',
      questionText: 'Write a recursive function to calculate the factorial of a number.'
    },
    'Kinematics': {
      difficulty: 'Medium',
      questionText: 'A car accelerates from rest at 2 m/s². Calculate the distance traveled in 5 seconds.'
    },
    'Laws of Motion': {
      difficulty: 'Medium',
      questionText: 'Explain Newton\'s Second Law with an example.'
    },
    'Atomic Structure': {
      difficulty: 'Easy',
      questionText: 'Describe the structure of an atom and its subatomic particles.'
    },
    'Bonding': {
      difficulty: 'Medium',
      questionText: 'Explain the difference between ionic and covalent bonding.'
    },
    'Algebra': {
      difficulty: 'Easy',
      questionText: 'Solve for x: 2x + 5 = 15'
    },
    'Calculus': {
      difficulty: 'Hard',
      questionText: 'Find the derivative of f(x) = x³ + 2x² - 5x + 1'
    },
    'World History': {
      difficulty: 'Medium',
      questionText: 'Discuss the main causes of World War I.'
    },
    'Geography': {
      difficulty: 'Easy',
      questionText: 'Name the seven continents and their relative positions.'
    },
    'Hashing': {
      difficulty: 'Medium',
      questionText: 'Explain how hash functions work and their applications in data security.'
    },
    'Encryption Basics': {
      difficulty: 'Medium',
      questionText: 'What is the difference between symmetric and asymmetric encryption?'
    },
    'Cell Biology': {
      difficulty: 'Easy',
      questionText: 'Describe the main differences between plant and animal cells.'
    },
    'Genetics': {
      difficulty: 'Hard',
      questionText: 'Explain Mendel\'s Law of Segregation with a Punnett square example.'
    }
  };

  // State management
  const [selectedSubject, setSelectedSubject] = useState('Coding');
  const [selectedConcept, setSelectedConcept] = useState('Loops');
  const [answerText, setAnswerText] = useState('');
  const [nlpFeedback, setNlpFeedback] = useState(null);

  // Get current question based on selected concept
  const currentQuestion = mockQuestions[selectedConcept] || {
    difficulty: 'Medium',
    questionText: 'Question not available.'
  };

  // Reset behavior tracking when question changes
  useEffect(() => {
    questionLoadTime.current = Date.now();
    typingEvents.current = [];
    lastActivityTime.current = Date.now();
    hasTypedIncrementally.current = false;
    hasPastedContent.current = false;
  }, [selectedConcept]);

  // Handle typing in the answer textarea
  const handleAnswerChange = (e) => {
    const newText = e.target.value;
    const currentTime = Date.now();
    const timeSinceLastActivity = currentTime - lastActivityTime.current;
    
    // Track typing event with size limit to prevent memory issues
    typingEvents.current.push({
      timestamp: currentTime,
      textLength: newText.length,
      changeSize: Math.abs(newText.length - answerText.length)
    });
    
    // Keep only the most recent events
    if (typingEvents.current.length > MAX_TYPING_EVENTS) {
      typingEvents.current = typingEvents.current.slice(-MAX_TYPING_EVENTS);
    }
    
    // Detect incremental typing (small changes, frequent updates)
    if (typingEvents.current.length > 1) {
      const recentEvents = typingEvents.current.slice(-5);
      // Ensure we have enough events to analyze
      if (recentEvents.length >= 3) {
        const hasSmallChanges = recentEvents.every(event => event.changeSize <= SMALL_CHANGE_THRESHOLD);
        const hasFrequentUpdates = 
          (recentEvents[recentEvents.length - 1].timestamp - recentEvents[0].timestamp) < FREQUENT_TYPING_WINDOW_MS;
        
        if (hasSmallChanges && hasFrequentUpdates) {
          hasTypedIncrementally.current = true;
        }
      }
    }
    
    // Detect large paste (sudden large text addition)
    const changeSize = Math.abs(newText.length - answerText.length);
    if (changeSize > LARGE_PASTE_THRESHOLD && timeSinceLastActivity > PASTE_DETECTION_DELAY_MS) {
      // This looks like a paste rather than typing
      hasPastedContent.current = true;
    }
    
    lastActivityTime.current = currentTime;
    setAnswerText(newText);
  };

  // Analyze behavior patterns
  const analyzeBehaviorPatterns = () => {
    const flags = [];
    const currentTime = Date.now();
    const timeSinceQuestionLoad = (currentTime - questionLoadTime.current) / 1000; // in seconds
    
    // Pattern 1: Long inactivity pause after question load
    if (typingEvents.current.length > 0) {
      const firstTypingTime = typingEvents.current[0].timestamp;
      const inactivityBeforeTyping = (firstTypingTime - questionLoadTime.current) / 1000;
      
      if (inactivityBeforeTyping > INACTIVITY_THRESHOLD_SECONDS) {
        flags.push({
          type: 'inactivity',
          message: 'Possible lack of clarity',
          details: 'We noticed a pause before starting. If the question was unclear, feel free to ask for clarification or review the concept materials.'
        });
      }
    }
    
    // Pattern 2: Very fast full answer submission
    if (timeSinceQuestionLoad < FAST_SUBMISSION_TIME_THRESHOLD_SECONDS && answerText.length > SUBSTANTIAL_ANSWER_LENGTH) {
      flags.push({
        type: 'fast-submission',
        message: 'Quick submission detected',
        details: 'You submitted quickly! Take your time to review your answer and ensure you\'ve covered all aspects of the question.'
      });
    }
    
    // Pattern 3: No incremental typing (possible paste)
    if (!hasTypedIncrementally.current && hasPastedContent.current && answerText.length > SUBSTANTIAL_ANSWER_LENGTH) {
      flags.push({
        type: 'no-incremental',
        message: 'Review fundamentals recommended',
        details: 'Your answer appears complete. Consider reviewing the fundamental concepts to strengthen your understanding and build confidence.'
      });
    }
    
    return flags;
  };

  // Placeholder handlers
  const handleSubmit = () => {
    console.log('Submit clicked - analyzing answer...');
    
    // Generate NLP analysis
    const analysis = generateNLPSignals(answerText, selectedConcept);
    setNlpFeedback(analysis);
    
    // Scroll to feedback section
    setTimeout(() => {
      document.querySelector('.feedback-section')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const handleSaveProgress = () => {
    console.log('Progress saved:', {
      subject: selectedSubject,
      concept: selectedConcept,
      answer,
      conceptScores
    });
    alert('Progress saved successfully!');
  };

  const handleConceptChange = (concept) => {
    setSelectedConcept(concept);
    // Reset answer and behavior tracking when concept changes
    setAnswerText('');
    setBehaviorFlags([]);
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    // Set first unlocked concept of the new subject as selected
    const unlockedForSubject = unlockedConcepts[subject] || [];
    const firstConcept = unlockedForSubject[0] || subjects[subject].concepts[0];
    setSelectedConcept(firstConcept);
    // Clear feedback and answer when changing subject
    setNlpFeedback(null);
    setAnswerText('');
  };

  const handleConceptChange = (concept) => {
    setSelectedConcept(concept);
    // Clear feedback when changing concept
    setNlpFeedback(null);
  };

  return (
    <div className="page">
      <h1>Assessment</h1>
      
      {/* Subject Selector Section */}
      <section className="assessment-section">
        <h2>Select Subject</h2>
        <div className="subject-selector">
          {Object.keys(subjects).map((subject) => (
            <button
              key={subject}
              className={`subject-button ${selectedSubject === subject ? 'active' : ''}`}
              onClick={() => handleSubjectChange(subject)}
            >
              {subject}
            </button>
          ))}
        </div>
      </section>

      {/* Concept Selector Section */}
      <section className="assessment-section">
        <h2>Select Concept</h2>
        <div className="concept-selector">
          {subjects[selectedSubject].concepts.map((concept) => {
            const isUnlocked = (unlockedConcepts[selectedSubject] || []).includes(concept);
            const score = conceptScores[concept];
            return (
              <button
                key={concept}
                className={`concept-button ${selectedConcept === concept ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                onClick={() => isUnlocked && handleConceptChange(concept)}
                disabled={!isUnlocked}
                title={!isUnlocked ? 'Complete previous concept to unlock' : ''}
              >
                {concept}
                {!isUnlocked && ' 🔒'}
                {score !== undefined && ` (${score}%)`}
              </button>
            );
          })}
        </div>
      </section>

      {/* Question Display Section */}
      <section className="assessment-section">
        <h2>Question Details</h2>
        <div className="question-details">
          <div className="detail-item">
            <strong>Subject:</strong> {selectedSubject}
          </div>
          <div className="detail-item">
            <strong>Concept:</strong> {selectedConcept}
          </div>
          <div className="detail-item">
            <strong>Difficulty:</strong> {currentQuestion.difficulty}
          </div>
        </div>
        <div className="question-text">
          <p>{currentQuestion.questionText}</p>
        </div>
      </section>

      {/* Answer Writing Section */}
      <section className="assessment-section">
        <h2>Write your answer / steps / code</h2>
        <textarea
          className="answer-input"
          placeholder="Type your answer here... You can write explanations, steps, or code."
          rows="10"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
        />
      </section>

      {/* Submit & Progress Controls */}
      <section className="assessment-section">
        <div className="button-group">
          <button onClick={handleSubmit} className="submit-button">
            Submit Answer
          </button>
          <button onClick={handleSaveProgress} className="save-button">
            Save Progress
          </button>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="assessment-section feedback-section">
        <h2>Feedback</h2>
        {!nlpFeedback ? (
          <div className="placeholder-content">
            <p>Submit your answer to receive feedback on your response quality.</p>
          </div>
        ) : (
          <div className="nlp-feedback-container">
            {/* Disclaimer */}
            <div className="feedback-disclaimer">
              <span className="disclaimer-icon">ℹ️</span>
              <p>
                <strong>Note:</strong> This is a heuristic analysis providing probabilistic indicators, 
                not definitive judgments. Results are meant as constructive feedback.
              </p>
            </div>

            {/* Main Signal Card */}
            <div className={`feedback-signal-card signal-${nlpFeedback.signal.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="signal-header">
                <h3>{nlpFeedback.signal}</h3>
                <span className={`confidence-badge confidence-${nlpFeedback.confidence}`}>
                  {nlpFeedback.confidence} confidence
                </span>
              </div>
              <p className="signal-description">{nlpFeedback.description}</p>
              <div className="overall-score">
                <span className="score-label">Overall Score:</span>
                <span className="score-value">{nlpFeedback.overallScore}/100</span>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="feedback-metrics">
              <h3>Analysis Details</h3>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-icon">🔑</span>
                    <h4>Concept Keywords</h4>
                  </div>
                  <div className="metric-score">{nlpFeedback.details.keywords.score}/100</div>
                  <p className="metric-detail">
                    {nlpFeedback.details.keywords.matchedKeywords.length} of {nlpFeedback.details.keywords.totalKeywords} key terms found
                  </p>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-icon">📊</span>
                    <h4>Logical Flow</h4>
                  </div>
                  <div className="metric-score">{nlpFeedback.details.flow.score}/100</div>
                  <p className="metric-detail">
                    {nlpFeedback.details.flow.structured ? 'Structured response' : 'Could be more organized'}
                  </p>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-icon">🔄</span>
                    <h4>Repetition Check</h4>
                  </div>
                  <div className="metric-score">{nlpFeedback.details.repetition.score}/100</div>
                  <p className="metric-detail">
                    {nlpFeedback.details.repetition.hasHighRepetition 
                      ? 'Some repetitive patterns detected' 
                      : 'Good variety in expression'}
                  </p>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-icon">📝</span>
                    <h4>Content Pattern</h4>
                  </div>
                  <div className="metric-score">{nlpFeedback.details.paste.score}/100</div>
                  <p className="metric-detail">
                    {nlpFeedback.details.paste.possiblePaste 
                      ? 'Large text blocks detected' 
                      : 'Natural writing pattern'}
                  </p>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {nlpFeedback.suggestions.length > 0 && (
              <div className="feedback-suggestions">
                <h3>Suggestions for Improvement</h3>
                <ul>
                  {nlpFeedback.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default AssessmentPage;
