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

  // Get current question based on selected concept
  const currentQuestion = mockQuestions[selectedConcept] || {
    difficulty: 'Medium',
    questionText: 'Question not available.'
  };

  // Placeholder handlers
  const handleSubmit = () => {
    console.log('Submit clicked - logic to be implemented');
  };

  const handleSaveProgress = () => {
    console.log('Save Progress clicked - logic to be implemented');
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    // Set first concept of the new subject as selected
    const firstConcept = subjects[subject].concepts[0];
    setSelectedConcept(firstConcept);
  };

  const handleConceptChange = (concept) => {
    setSelectedConcept(concept);
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
        <div className="placeholder-content">
          <p>Feedback will appear here showing where you are strong or stuck.</p>
        </div>
      </section>
    </div>
  );
}

export default AssessmentPage;
