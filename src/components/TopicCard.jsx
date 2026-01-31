import './TopicCard.css';

function TopicCard({ topic, percentage }) {
  // Clamp percentage between 0 and 100 for safety
  const clampedPercentage = Math.min(100, Math.max(0, percentage || 0));
  
  // Calculate stars based on percentage
  // 0-33% = 1 star, 34-66% = 2 stars, 67-100% = 3 stars
  let filledStars = 1;
  if (clampedPercentage >= 67) {
    filledStars = 3;
  } else if (clampedPercentage >= 34) {
    filledStars = 2;
  }
  
  // Render stars (3 total)
  const stars = [];
  for (let i = 0; i < 3; i++) {
    stars.push(
      <span key={i} className="star">
        {i < filledStars ? '⭐' : '☆'}
      </span>
    );
  }
  
  return (
    <div className="topic-card">
      <div className="topic-name">{topic}</div>
      <div className="topic-stats">
        <div className="topic-percentage">{clampedPercentage}%</div>
        <div className="topic-stars">{stars}</div>
      </div>
    </div>
  );
}

export default TopicCard;
