import './Page.css';
import './AnalysisPage.css';

function AnalysisPage() {
  // Mock data for the 5 skills with values 0-100
  const skillsData = [
    { name: 'Streak', value: 80 },
    { name: 'Reasoning', value: 65 },
    { name: 'Learning Depth', value: 70 },
    { name: 'Accuracy', value: 60 },
    { name: 'Growth', value: 75 }
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
        <div className="skill-graph-container">
          {skillsData.map((skill) => (
            <div key={skill.name} className="skill-bar-item">
              <div className="skill-label">{skill.name}</div>
              <div className="skill-bar-track">
                <div 
                  className="skill-bar-fill" 
                  style={{ width: `${skill.value}%` }}
                >
                  <span className="skill-bar-value">{skill.value}</span>
                </div>
              </div>
            </div>
          ))}
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
