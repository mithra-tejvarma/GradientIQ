import { useState } from 'react';
import './Page.css';

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
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [conceptScores, setConceptScores] = useState({});
  const [unlockedConcepts, setUnlockedConcepts] = useState({
    'Coding': ['Loops'],
    'Physics': ['Kinematics'],
    'Chemistry': ['Atomic Structure'],
    'Mathematics': ['Algebra'],
    'Social Studies': ['World History'],
    'Cryptography': ['Hashing'],
    'Biology': ['Cell Biology']
  });

  // Get current question based on selected concept
  const currentQuestion = mockQuestions[selectedConcept] || {
    difficulty: 'Medium',
    questionText: 'Question not available.'
  };

  // Mock NLP and behavior analysis
  const analyzeAnswer = (answerText) => {
    // Mock analysis based on answer length and keywords
    const words = answerText.trim().split(/\s+/).filter(w => w.length > 0);
    const answerLength = words.length;
    const hasCode = /function|for|while|if|return|const|let|var/.test(answerText);
    const hasMath = /\d+|equation|formula|calculate/.test(answerText);
    const hasExplanation = answerLength > 20;
    
    // Determine if answer seems incomplete (behavior pattern)
    const isIncomplete = answerLength < 10 || (!hasCode && !hasMath && !hasExplanation);
    
    // Calculate quality score (mock NLP signal)
    let qualityScore = 0;
    if (answerLength >= 10) qualityScore += 30;
    if (answerLength >= 30) qualityScore += 20;
    if (hasCode || hasMath) qualityScore += 30;
    if (hasExplanation) qualityScore += 20;
    
    // Determine performance level
    let performanceLevel = 'poor';
    if (qualityScore >= 70) performanceLevel = 'excellent';
    else if (qualityScore >= 50) performanceLevel = 'good';
    else if (qualityScore >= 30) performanceLevel = 'fair';
    
    return {
      qualityScore,
      performanceLevel,
      isIncomplete,
      answerLength,
      hasCode,
      hasMath,
      hasExplanation
    };
  };

  // Generate feedback based on analysis
  const generateFeedback = (analysis, concept, difficulty) => {
    const feedback = {
      understood: [],
      reasoningIssues: [],
      nextSteps: [],
      capabilityScore: analysis.qualityScore,
      shouldReinforce: false,
      shouldUnlock: false
    };

    // What was understood
    if (analysis.hasCode) {
      feedback.understood.push('You demonstrated coding ability');
    }
    if (analysis.hasMath) {
      feedback.understood.push('You showed understanding of mathematical concepts');
    }
    if (analysis.hasExplanation) {
      feedback.understood.push('You provided detailed explanations');
    }
    if (analysis.answerLength >= 30) {
      feedback.understood.push('You gave a thorough response');
    }

    // Where reasoning broke
    if (analysis.isIncomplete) {
      feedback.reasoningIssues.push('Your answer appears incomplete - consider elaborating more');
      feedback.shouldReinforce = true;
    }
    if (analysis.answerLength < 10) {
      feedback.reasoningIssues.push('Response is too brief to assess understanding');
      feedback.shouldReinforce = true;
    }
    if (!analysis.hasCode && difficulty === 'Hard' && concept === 'Recursion') {
      feedback.reasoningIssues.push('Missing code implementation for this concept');
    }
    if (!analysis.hasExplanation && difficulty !== 'Easy') {
      feedback.reasoningIssues.push('Consider adding more explanation to demonstrate understanding');
    }

    // What to study next
    if (analysis.performanceLevel === 'excellent') {
      feedback.nextSteps.push('Great work! You\'re ready for more challenging concepts');
      feedback.shouldUnlock = true;
    } else if (analysis.performanceLevel === 'good') {
      feedback.nextSteps.push('Good progress! Review the key concepts and try advanced problems');
    } else if (analysis.isIncomplete) {
      feedback.nextSteps.push('Review the basic concepts before moving forward');
      feedback.nextSteps.push(`Focus on understanding the fundamentals of ${concept}`);
    } else {
      feedback.nextSteps.push(`Practice more problems related to ${concept}`);
    }

    // Add specific recommendations based on concept
    if (concept === 'Loops') {
      feedback.nextSteps.push('Try implementing different loop types (for, while, do-while)');
    } else if (concept === 'Recursion') {
      feedback.nextSteps.push('Practice base cases and recursive calls');
    }

    return feedback;
  };

  // Placeholder handlers
  const handleSubmit = () => {
    if (!answer.trim()) {
      setFeedback({
        understood: [],
        reasoningIssues: ['No answer provided'],
        nextSteps: ['Please write your answer before submitting'],
        capabilityScore: 0,
        shouldReinforce: true,
        shouldUnlock: false
      });
      return;
    }

    // Analyze the answer
    const analysis = analyzeAnswer(answer);
    const generatedFeedback = generateFeedback(analysis, selectedConcept, currentQuestion.difficulty);
    
    // Update concept score
    setConceptScores(prev => ({
      ...prev,
      [selectedConcept]: generatedFeedback.capabilityScore
    }));

    // Handle unlocking based on performance
    if (generatedFeedback.shouldUnlock) {
      const subjectConcepts = subjects[selectedSubject].concepts;
      const currentIndex = subjectConcepts.indexOf(selectedConcept);
      if (currentIndex < subjectConcepts.length - 1) {
        const nextConcept = subjectConcepts[currentIndex + 1];
        setUnlockedConcepts(prev => ({
          ...prev,
          [selectedSubject]: [...(prev[selectedSubject] || []), nextConcept]
        }));
        generatedFeedback.nextSteps.push(`🎉 Unlocked next concept: ${nextConcept}!`);
      }
    }

    setFeedback(generatedFeedback);
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

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    // Set first unlocked concept of the new subject as selected
    const unlockedForSubject = unlockedConcepts[subject] || [];
    const firstConcept = unlockedForSubject[0] || subjects[subject].concepts[0];
    setSelectedConcept(firstConcept);
    setAnswer('');
    setFeedback(null);
  };

  const handleConceptChange = (concept) => {
    setSelectedConcept(concept);
    setAnswer('');
    setFeedback(null);
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
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
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
      <section className="assessment-section">
        <h2>Feedback</h2>
        {!feedback ? (
          <div className="placeholder-content">
            <p>Feedback will appear here showing where you are strong or stuck.</p>
          </div>
        ) : (
          <div className="feedback-content">
            {/* Capability Score */}
            <div className="feedback-score">
              <h3>Concept Capability Score: {feedback.capabilityScore}%</h3>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ width: `${feedback.capabilityScore}%` }}
                />
              </div>
            </div>

            {/* What was understood */}
            <div className="feedback-section-box">
              <h3>✅ What Was Understood</h3>
              {feedback.understood.length > 0 ? (
                <ul>
                  {feedback.understood.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="feedback-empty">No clear understanding demonstrated yet.</p>
              )}
            </div>

            {/* Where reasoning broke */}
            {feedback.reasoningIssues.length > 0 && (
              <div className="feedback-section-box warning">
                <h3>⚠️ Where Reasoning Broke</h3>
                <ul>
                  {feedback.reasoningIssues.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                {feedback.shouldReinforce && (
                  <div className="reinforcement-alert">
                    <strong>📚 Reinforcement Needed:</strong> Review basic concepts before continuing.
                  </div>
                )}
              </div>
            )}

            {/* What to study next */}
            <div className="feedback-section-box success">
              <h3>📖 What to Study Next</h3>
              <ul>
                {feedback.nextSteps.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Topic Strength/Weakness Summary */}
            <div className="feedback-section-box">
              <h3>📊 Topic Strength Assessment</h3>
              {feedback.capabilityScore >= 70 ? (
                <p className="strength-indicator strong">
                  <strong>Strong:</strong> You have a good grasp of {selectedConcept}. 
                  {feedback.shouldUnlock && ' Ready for more advanced concepts!'}
                </p>
              ) : feedback.capabilityScore >= 40 ? (
                <p className="strength-indicator moderate">
                  <strong>Moderate:</strong> You understand some aspects of {selectedConcept}, 
                  but need more practice.
                </p>
              ) : (
                <p className="strength-indicator weak">
                  <strong>Weak:</strong> {selectedConcept} needs more attention. 
                  Review the fundamentals and practice basic problems.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AssessmentPage;
