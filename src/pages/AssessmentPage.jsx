import { useState } from 'react';
import './Page.css';
import ConceptAssessmentView from '../components/ConceptAssessmentView';

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

  // Mock questions for each concept (with question types)
  const mockQuestions = {
    'Loops': {
      difficulty: 'Medium',
      questionText: 'Write a loop to find the sum of an array.',
      type: 'Problem Solving'
    },
    'Recursion': {
      difficulty: 'Hard',
      questionText: 'Write a recursive function to calculate the factorial of a number.',
      type: 'Problem Solving'
    },
    'Kinematics': {
      difficulty: 'Medium',
      questionText: 'A car accelerates from rest at 2 m/s². Calculate the distance traveled in 5 seconds.',
      type: 'Problem Solving'
    },
    'Laws of Motion': {
      difficulty: 'Medium',
      questionText: 'Explain Newton\'s Second Law with an example.',
      type: 'Descriptive'
    },
    'Atomic Structure': {
      difficulty: 'Easy',
      questionText: 'Describe the structure of an atom and its subatomic particles.',
      type: 'Descriptive'
    },
    'Bonding': {
      difficulty: 'Medium',
      questionText: 'Explain the difference between ionic and covalent bonding.',
      type: 'Descriptive'
    },
    'Algebra': {
      difficulty: 'Easy',
      questionText: 'Solve for x: 2x + 5 = 15',
      type: 'Problem Solving'
    },
    'Calculus': {
      difficulty: 'Hard',
      questionText: 'Find the derivative of f(x) = x³ + 2x² - 5x + 1',
      type: 'Step-based Explanation'
    },
    'World History': {
      difficulty: 'Medium',
      questionText: 'Discuss the main causes of World War I.',
      type: 'Descriptive'
    },
    'Geography': {
      difficulty: 'Easy',
      questionText: 'Name the seven continents and their relative positions.',
      type: 'Descriptive'
    },
    'Hashing': {
      difficulty: 'Medium',
      questionText: 'Explain how hash functions work and their applications in data security.',
      type: 'Descriptive'
    },
    'Encryption Basics': {
      difficulty: 'Medium',
      questionText: 'What is the difference between symmetric and asymmetric encryption?',
      type: 'Descriptive'
    },
    'Cell Biology': {
      difficulty: 'Easy',
      questionText: 'Describe the main differences between plant and animal cells.',
      type: 'Descriptive'
    },
    'Genetics': {
      difficulty: 'Hard',
      questionText: 'Explain Mendel\'s Law of Segregation with a Punnett square example.',
      type: 'Step-based Explanation'
    }
  };

  // State management
  const [selectedSubject, setSelectedSubject] = useState('Coding');
  const [selectedConcept, setSelectedConcept] = useState('Loops');
  const [showAssessmentView, setShowAssessmentView] = useState(false);

  // Get current question based on selected concept
  const currentQuestion = mockQuestions[selectedConcept] || {
    difficulty: 'Medium',
    questionText: 'Question not available.',
    type: 'Descriptive'
  };
  
  // Placeholder handlers
  const handleStartAssessment = () => {
    setShowAssessmentView(true);
  };
  
  const handleBackToSelection = () => {
    setShowAssessmentView(false);
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    // Set first concept of the new subject as selected
    const firstConcept = subjects[subject].concepts[0];
    setSelectedConcept(firstConcept);
  };

  const handleConceptChange = (concept) => {
    setSelectedConcept(concept);
    setShowAssessmentView(false);
  };

  return (
    <div className="page">
      {showAssessmentView ? (
        <ConceptAssessmentView
          subject={selectedSubject}
          concept={selectedConcept}
          question={currentQuestion}
          onBack={handleBackToSelection}
        />
      ) : (
        <>
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

          {/* Question Preview Section */}
          <section className="assessment-section">
            <h2>Question Preview</h2>
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
              <div className="detail-item">
                <strong>Question Type:</strong> {currentQuestion.type}
              </div>
            </div>
            <div className="question-text">
              <p>{currentQuestion.questionText}</p>
            </div>
          </section>

          {/* Start Assessment Button */}
          <section className="assessment-section">
            <div className="button-group">
              <button onClick={handleStartAssessment} className="submit-button">
                Start Assessment
              </button>
            </div>
          </section>

          {/* Information Section */}
          <section className="assessment-section">
            <h2>Assessment Information</h2>
            <div className="placeholder-content">
              <p>
                Once you start the assessment, the system will track your time, typing activity, and pauses. 
                There is no auto-submit timeout - take your time to provide a thorough answer!
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default AssessmentPage;
