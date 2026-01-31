import './StatCard.css';

function StatCard({ title, value, subtitle, icon, size = 'normal' }) {
  return (
    <div className={`stat-card ${size === 'large' ? 'stat-card-large' : ''}`}>
      {icon && <div className="stat-card-icon">{icon}</div>}
      <div className="stat-card-content">
        {title && <div className="stat-card-title">{title}</div>}
        <div className="stat-card-value">{value}</div>
        {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

export default StatCard;
