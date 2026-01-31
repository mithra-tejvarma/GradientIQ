import './TopicCard.css';

function TopicCard({ topic, percentage }) {
  // Clamp percentage between 0 and 100 for safety
  const clampedPercentage = Math.min(100, Math.max(0, percentage || 0));
  
  // Calculate star rating based on percentage
  const getStars = (percent) => {
    if (percent >= 67) return 3;
    if (percent >= 34) return 2;
    return 1;
  };
  
  const stars = getStars(clampedPercentage);
  const starDisplay = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  
  return (
    <div className="topic-card">
      <div className="topic-card-name">{topic}</div>
      <div className="topic-card-stats">
        <div className="topic-card-percentage">{clampedPercentage}%</div>
        <div className="topic-card-stars">{starDisplay}</div>
      </div>
    </div>
  );
}

export default TopicCard;
