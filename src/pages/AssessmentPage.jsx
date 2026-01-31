import { useState, useEffect, useRef } from 'react';
import './Page.css';

function AssessmentPage() {
  // Behavior detection thresholds
  const INACTIVITY_THRESHOLD_SECONDS = 30;
  const FAST_SUBMISSION_TIME_THRESHOLD = 10;
  const MIN_ANSWER_LENGTH = 50;
  const SUBSTANTIAL_ANSWER_LENGTH = 100;
  const SMALL_CHANGE_THRESHOLD = 3;
  const FREQUENT_TYPING_WINDOW_MS = 5000;
  const LARGE_PASTE_THRESHOLD = 50;
  const PASTE_DETECTION_DELAY_MS = 500;

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
  const [behaviorFlags, setBehaviorFlags] = useState([]);
  
  // Behavior tracking refs
  const questionLoadTime = useRef(null);
  const typingEvents = useRef([]);
  const lastActivityTime = useRef(null);
  const hasTypedIncrementally = useRef(false);

  // Initialize refs on mount
  useEffect(() => {
    if (questionLoadTime.current === null) {
      questionLoadTime.current = Date.now();
      lastActivityTime.current = Date.now();
    }
  }, []);

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
  }, [selectedConcept]);

  // Handle typing in the answer textarea
  const handleAnswerChange = (e) => {
    const newText = e.target.value;
    const currentTime = Date.now();
    const timeSinceLastActivity = currentTime - lastActivityTime.current;
    
    // Track typing event
    typingEvents.current.push({
      timestamp: currentTime,
      textLength: newText.length,
      changeSize: Math.abs(newText.length - answerText.length)
    });
    
    // Detect incremental typing (small changes, frequent updates)
    if (typingEvents.current.length > 1) {
      const recentEvents = typingEvents.current.slice(-5);
      const hasSmallChanges = recentEvents.every(event => event.changeSize <= SMALL_CHANGE_THRESHOLD);
      const hasFrequentUpdates = recentEvents.length >= 3 && 
        (recentEvents[recentEvents.length - 1].timestamp - recentEvents[0].timestamp) < FREQUENT_TYPING_WINDOW_MS;
      
      if (hasSmallChanges && hasFrequentUpdates) {
        hasTypedIncrementally.current = true;
      }
    }
    
    // Detect large paste (sudden large text addition)
    const changeSize = Math.abs(newText.length - answerText.length);
    if (changeSize > LARGE_PASTE_THRESHOLD && timeSinceLastActivity > PASTE_DETECTION_DELAY_MS) {
      // This looks like a paste rather than typing
      hasTypedIncrementally.current = false;
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
    if (timeSinceQuestionLoad < FAST_SUBMISSION_TIME_THRESHOLD && answerText.length > MIN_ANSWER_LENGTH) {
      flags.push({
        type: 'fast-submission',
        message: 'Quick submission detected',
        details: 'You submitted quickly! Take your time to review your answer and ensure you\'ve covered all aspects of the question.'
      });
    }
    
    // Pattern 3: No incremental typing (possible paste)
    if (!hasTypedIncrementally.current && answerText.length > SUBSTANTIAL_ANSWER_LENGTH) {
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
    const detectedFlags = analyzeBehaviorPatterns();
    setBehaviorFlags(detectedFlags);
    console.log('Submit clicked - behavior flags:', detectedFlags);
  };

  const handleSaveProgress = () => {
    console.log('Save Progress clicked - logic to be implemented');
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    // Set first concept of the new subject as selected
    const firstConcept = subjects[subject].concepts[0];
    setSelectedConcept(firstConcept);
    // Reset answer and behavior tracking when subject changes
    setAnswerText('');
    setBehaviorFlags([]);
  };

  const handleConceptChange = (concept) => {
    setSelectedConcept(concept);
    // Reset answer and behavior tracking when concept changes
    setAnswerText('');
    setBehaviorFlags([]);
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
          {subjects[selectedSubject].concepts.map((concept) => (
            <button
              key={concept}
              className={`concept-button ${selectedConcept === concept ? 'active' : ''}`}
              onClick={() => handleConceptChange(concept)}
            >
              {concept}
            </button>
          ))}
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
          onChange={handleAnswerChange}
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

      {/* Feedback Placeholder Section */}
      <section className="assessment-section">
        <h2>Feedback</h2>
        {behaviorFlags.length > 0 ? (
          <div className="behavior-feedback">
            {behaviorFlags.map((flag, index) => (
              <div key={index} className="feedback-card">
                <h3 className="feedback-title">💡 {flag.message}</h3>
                <p className="feedback-details">{flag.details}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="placeholder-content">
            <p>Feedback will appear here showing where you are strong or stuck.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default AssessmentPage;
