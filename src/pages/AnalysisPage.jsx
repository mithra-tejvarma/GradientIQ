import './Page.css';
import './AnalysisPage.css';

function AnalysisPage() {
  // Mock data for the 5 learning metrics
  const learningMetrics = [
    { name: 'Streak', value: '4 days', icon: '🔥' },
    { name: 'Reasoning / IQ', value: '72%', icon: '🧠' },
    { name: 'Learning Depth', value: '65%', icon: '📚' },
    { name: 'Accuracy', value: '78%', icon: '🎯' },
    { name: 'Growth', value: '+8%', icon: '📈' }
  ];

  // Mock data for leaderboard
  const leaderboardData = [
    { rank: 1, name: 'Alex', score: 78 },
    { rank: 2, name: 'Sam', score: 72 },
    { rank: 3, name: 'You', score: 68, isCurrentUser: true }
  ];

  return (
    <div className="page">
      <h1>Analysis</h1>
      
      {/* Analysis Wheel Section */}
      <section className="analysis-section">
        <h2 className="section-heading">Learning Analysis</h2>
        <div className="analysis-wheel-container">
          <div className="analysis-wheel-placeholder">
            <div className="wheel-center">
              <span className="wheel-icon">📊</span>
            </div>
            <div className="metrics-list">
              {learningMetrics.map((metric) => (
                <div key={metric.name} className="metric-item">
                  <span className="metric-icon">{metric.icon}</span>
                  <div className="metric-content">
                    <div className="metric-name">{metric.name}</div>
                    <div className="metric-value">{metric.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="wheel-description">
            Analysis wheel will visualize these 5 learning metrics.
          </p>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="analysis-section">
        <h2 className="section-heading">Leaderboard</h2>
        <div className="leaderboard-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student Name</th>
                <th>Capability Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry) => (
                <tr 
                  key={entry.rank}
                  className={entry.isCurrentUser ? 'current-user' : ''}
                >
                  <td className="rank-cell">#{entry.rank}</td>
                  <td className="name-cell">{entry.name}</td>
                  <td className="score-cell">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AnalysisPage;
