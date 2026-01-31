import './Page.css';
import './AnalysisPage.css';

function AnalysisPage() {

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
          <div className="star-map-container">
            <div className="star-map">
              {/* Axes */}
              <div className="axis axis-1"></div>
              <div className="axis axis-2"></div>
              <div className="axis axis-3"></div>
              <div className="axis axis-4"></div>
              <div className="axis axis-5"></div>
              
              {/* Filled polygon */}
              <div className="star-polygon"></div>
              
              {/* Labels */}
              <div className="star-label label-1">IQ / Reasoning</div>
              <div className="star-label label-2">Learning Depth</div>
              <div className="star-label label-3">Accuracy</div>
              <div className="star-label label-4">Consistency</div>
              <div className="star-label label-5">Growth</div>
            </div>
          </div>
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
