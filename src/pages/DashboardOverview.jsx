import './Page.css';
import './DashboardOverview.css';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import TopicCard from '../components/TopicCard';

function DashboardOverview() {
  // Mock data for dashboard
  const overallCapability = 62;
  const totalXP = 120;
  const weeklyGrowth = 8;
  const currentStreak = 4;
  
  const topicCapabilities = [
    { topic: 'Algebra', percentage: 70 },
    { topic: 'Physics', percentage: 40 },
    { topic: 'Coding', percentage: 65 },
    { topic: 'Chemistry', percentage: 55 }
  ];

  return (
    <div className="page">
      <h1>Dashboard</h1>
      
      {/* Overall Capability Score - Top Section */}
      <section className="dashboard-section">
        <StatCard
          title="Overall Capability Score"
          value={`${overallCapability}%`}
          size="large"
        />
      </section>

      {/* Topic-Wise Capability Levels */}
      <section className="dashboard-section">
        <h2 className="section-heading">Topic-Wise Capability Levels</h2>
        <div className="topics-grid">
          {topicCapabilities.map((item) => (
            <TopicCard
              key={item.topic}
              topic={item.topic}
              percentage={item.percentage}
            />
          ))}
        </div>
      </section>

      {/* Bottom Row: XP and Progress Indicators */}
      <div className="dashboard-row">
        {/* Score Points / XP */}
        <section className="dashboard-section dashboard-section-half">
          <h2 className="section-heading">Score Points</h2>
          <StatCard
            value={`${totalXP} XP`}
            subtitle="Earned through correct reasoning and partial progress"
            icon="⭐"
          />
        </section>

        {/* Progress Indicators */}
        <section className="dashboard-section dashboard-section-half">
          <h2 className="section-heading">Progress Indicators</h2>
          <div className="progress-indicators">
            <StatCard
              title="Weekly Growth"
              value={`+${weeklyGrowth}%`}
              icon="📈"
            />
            <StatCard
              title="Current Streak"
              value={`${currentStreak} days`}
              icon="🔥"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardOverview;
