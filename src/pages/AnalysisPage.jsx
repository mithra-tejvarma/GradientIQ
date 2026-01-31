import './Page.css';
import './AnalysisPage.css';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function AnalysisPage() {
  // Mock data for the radar chart - 5 metrics
  const radarData = {
    labels: ['Speed', 'Reliability', 'Comfort', 'Safety', 'Efficiency'],
    datasets: [
      {
        label: 'Learning Metrics',
        data: [75, 60, 70, 55, 65],
        backgroundColor: 'rgba(100, 108, 255, 0.2)',
        borderColor: 'rgba(100, 108, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(100, 108, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(100, 108, 255, 1)'
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          color: 'rgba(255, 255, 255, 0.6)',
          backdropColor: 'transparent',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(100, 108, 255, 0.3)'
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.95)',
          font: {
            size: 16,
            weight: '600'
          }
        },
        angleLines: {
          color: 'rgba(100, 108, 255, 0.3)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(100, 108, 255, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return context.parsed.r + ' / 100';
          }
        }
      }
    }
  };

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
          <div className="radar-chart-wrapper">
            <Radar data={radarData} options={radarOptions} />
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
