import './ProgressBar.css';

function ProgressBar({ percentage, label, topic }) {
  // Clamp percentage between 0 and 100 for safety
  const clampedPercentage = Math.min(100, Math.max(0, percentage || 0));
  
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
          style={{ width: `${clampedPercentage}%` }}
        >
          <span className="progress-bar-text">{clampedPercentage}%</span>
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
