// This component is temporarily disabled and will be re-enabled in a future rollout.
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import PageLayout from '../../../components/layout/PageLayout';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const [leaderboardType, setLeaderboardType] = useState('winRate');
  
  // Mock leaderboard data
  const leaderboardData = [
    { id: 1, rank: 1, name: 'Alex Johnson', avatar: `${process.env.PUBLIC_URL}/images/default-profile.png`, winRate: 78, matches: 145, region: 'North America' },
    { id: 2, rank: 2, name: 'Sarah Williams', avatar: `${process.env.PUBLIC_URL}/images/default-profile.png`, winRate: 75, matches: 122, region: 'Europe' },
    { id: 3, rank: 3, name: 'Miguel Rodriguez', avatar: `${process.env.PUBLIC_URL}/images/default-profile.png`, winRate: 71, matches: 187, region: 'South America' },
    { id: 4, rank: 4, name: 'Emma Chen', avatar: `${process.env.PUBLIC_URL}/images/default-profile.png`, winRate: 70, matches: 163, region: 'Asia Pacific' },
    { id: 5, rank: 5, name: 'James Wilson', avatar: `${process.env.PUBLIC_URL}/images/default-profile.png`, winRate: 68, matches: 201, region: 'North America' },
  ];

  const handleTypeChange = (e) => {
    setLeaderboardType(e.target.value);
  };

  return (
    <div className="leaderboard-page-layout">
      <Sidebar />
      <PageLayout className="leaderboard-page-content" maxWidth="1200px" withPadding={true}>
        <div className="leaderboard-header">
          <h1>Leaderboards</h1>
          <div className="leaderboard-filters">
            <select 
              value={leaderboardType} 
              onChange={handleTypeChange}
              className="leaderboard-type-select"
            >
              <option value="winRate">Win Rate</option>
              <option value="kdaRatio">KDA Ratio</option>
              <option value="totalMatches">Total Matches</option>
            </select>
          </div>
        </div>

        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="rank-column">Rank</th>
                <th className="player-column">Player</th>
                <th className="stat-column">Win Rate</th>
                <th className="matches-column">Matches</th>
                <th className="region-column">Region</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map(player => (
                <tr key={player.id}>
                  <td className="rank-column">{player.rank}</td>
                  <td className="player-column">
                    <div className="player-info">
                      <img src={player.avatar} alt={player.name} className="player-avatar" />
                      <span className="player-name">{player.name}</span>
                    </div>
                  </td>
                  <td className="stat-column">{player.winRate}%</td>
                  <td className="matches-column">{player.matches}</td>
                  <td className="region-column">{player.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageLayout>
    </div>
  );
};

export default LeaderboardPage;
