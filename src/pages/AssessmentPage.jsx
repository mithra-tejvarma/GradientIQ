import './Page.css';

function AssessmentPage() {
  // Mock question data
  const mockQuestion = {
    subject: 'Coding',
    topics: ['Loops', 'Arrays'],
    difficulty: 'Medium',
    questionText: 'Question: Write a loop to find the sum of an array.'
  };

  // Placeholder handlers
  const handleSubmit = () => {
    console.log('Submit clicked - logic to be implemented');
  };

  const handleSaveProgress = () => {
    console.log('Save Progress clicked - logic to be implemented');
  };

  return (
    <div className="page">
      <h1>Assessment</h1>
      
      {/* Question Display Section */}
      <section className="assessment-section">
        <h2>Question Details</h2>
        <div className="question-details">
          <div className="detail-item">
            <strong>Subject:</strong> {mockQuestion.subject}
          </div>
          <div className="detail-item">
            <strong>Topics:</strong> {mockQuestion.topics.join(', ')}
          </div>
          <div className="detail-item">
            <strong>Difficulty:</strong> {mockQuestion.difficulty}
          </div>
        </div>
        <div className="question-text">
          <p>{mockQuestion.questionText}</p>
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
