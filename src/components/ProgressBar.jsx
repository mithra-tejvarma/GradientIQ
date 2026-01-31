import './ProgressBar.css';

function ProgressBar({ percentage, label, topic }) {
  return (
    <div className="progress-bar-container">
      {(label || topic) && (
        <div className="progress-bar-header">
          {topic && <span className="progress-bar-topic">{topic}</span>}
          {label && <span className="progress-bar-label">{label}</span>}
        </div>
      )}
      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%` }}
        >
          <span className="progress-bar-text">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
