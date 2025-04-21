import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import './StandingsPage.css';

function StandingsPage() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState('premier-league');
  const [error, setError] = useState('');
  
  // Available leagues for the dropdown
  const leagues = [
    { id: 'premier-league', name: 'Premier League', country: 'England' },
    { id: 'la-liga', name: 'La Liga', country: 'Spain' },
    { id: 'bundesliga', name: 'Bundesliga', country: 'Germany' },
    { id: 'serie-a', name: 'Serie A', country: 'Italy' },
  ];

  useEffect(() => {
    // Simulate API call to fetch standings
    setLoading(true);
    setTimeout(() => {
      // Mock data for standings
      const mockStandings = [
        { position: 1, team: 'Manchester City', played: 38, won: 27, drawn: 5, lost: 6, gf: 83, ga: 32, gd: 51, points: 86 },
        { position: 2, team: 'Manchester United', played: 38, won: 21, drawn: 11, lost: 6, gf: 73, ga: 44, gd: 29, points: 74 },
        { position: 3, team: 'Liverpool', played: 38, won: 20, drawn: 9, lost: 9, gf: 68, ga: 42, gd: 26, points: 69 },
        { position: 4, team: 'Chelsea', played: 38, won: 19, drawn: 10, lost: 9, gf: 58, ga: 36, gd: 22, points: 67 },
        { position: 5, team: 'Leicester City', played: 38, won: 20, drawn: 6, lost: 12, gf: 68, ga: 50, gd: 18, points: 66 },
        { position: 6, team: 'West Ham United', played: 38, won: 19, drawn: 8, lost: 11, gf: 62, ga: 47, gd: 15, points: 65 },
        { position: 7, team: 'Tottenham Hotspur', played: 38, won: 18, drawn: 8, lost: 12, gf: 68, ga: 45, gd: 23, points: 62 },
        { position: 8, team: 'Arsenal', played: 38, won: 18, drawn: 7, lost: 13, gf: 55, ga: 39, gd: 16, points: 61 },
        { position: 9, team: 'Leeds United', played: 38, won: 18, drawn: 5, lost: 15, gf: 62, ga: 54, gd: 8, points: 59 },
        { position: 10, team: 'Everton', played: 38, won: 17, drawn: 8, lost: 13, gf: 47, ga: 48, gd: -1, points: 59 },
        { position: 11, team: 'Aston Villa', played: 38, won: 16, drawn: 7, lost: 15, gf: 55, ga: 46, gd: 9, points: 55 },
        { position: 12, team: 'Newcastle United', played: 38, won: 12, drawn: 9, lost: 17, gf: 46, ga: 62, gd: -16, points: 45 },
        { position: 13, team: 'Wolverhampton', played: 38, won: 12, drawn: 9, lost: 17, gf: 36, ga: 52, gd: -16, points: 45 },
        { position: 14, team: 'Crystal Palace', played: 38, won: 12, drawn: 8, lost: 18, gf: 41, ga: 66, gd: -25, points: 44 },
        { position: 15, team: 'Southampton', played: 38, won: 12, drawn: 7, lost: 19, gf: 47, ga: 68, gd: -21, points: 43 },
        { position: 16, team: 'Brighton', played: 38, won: 9, drawn: 14, lost: 15, gf: 40, ga: 46, gd: -6, points: 41 },
        { position: 17, team: 'Burnley', played: 38, won: 10, drawn: 9, lost: 19, gf: 33, ga: 55, gd: -22, points: 39 },
        { position: 18, team: 'Fulham', played: 38, won: 5, drawn: 13, lost: 20, gf: 27, ga: 53, gd: -26, points: 28 },
        { position: 19, team: 'West Bromwich Albion', played: 38, won: 5, drawn: 11, lost: 22, gf: 35, ga: 76, gd: -41, points: 26 },
        { position: 20, team: 'Sheffield United', played: 38, won: 7, drawn: 2, lost: 29, gf: 20, ga: 63, gd: -43, points: 23 },
      ];
      
      setStandings(mockStandings);
      setLoading(false);
    }, 1500);
  }, [selectedLeague]);

  // Handle league selection change
  const handleLeagueChange = (e) => {
    setSelectedLeague(e.target.value);
  };

  // Get current league name
  const getCurrentLeagueName = () => {
    const league = leagues.find(l => l.id === selectedLeague);
    return league ? league.name : 'League Standings';
  };

  // Row styling based on position (European spots, relegation, etc.)
  const baseStyle = {
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease'
  };

  const getRowStyle = (index) => {
    if (index < 3) {
      return {
        ...baseStyle,
        borderLeft: '3px solid #27ae60',
        background: 'linear-gradient(90deg, rgba(39, 174, 96, 0.05), transparent)'
      };
    }
    
    if (index >= 17) {
      return {
        ...baseStyle,
        borderLeft: '3px solid #e74c3c',
        background: 'linear-gradient(90deg, rgba(231, 76, 60, 0.05), transparent)'
      };
    }
    
    return baseStyle;
  };

  const getGDCellStyle = (goalDifference) => {
    const baseStyle = {
      ...tableCellStyle,
      fontWeight: 'bold'
    };
    
    if (goalDifference > 0) {
      return {
        ...baseStyle,
        color: '#27ae60'
      };
    }
    
    if (goalDifference < 0) {
      return {
        ...baseStyle,
        color: '#e74c3c'
      };
    }
    
    return baseStyle;
  };

  // Styles
  const tableHeaderStyle = {
    backgroundColor: 'var(--color-primary)',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, #4a4099 100%)',
    color: 'white',
    padding: '12px 10px',
    textAlign: 'center',
    fontWeight: '600'
  };

  const tableCellStyle = {
    padding: '12px 10px',
    textAlign: 'center',
    borderBottom: '1px solid #eee'
  };

  return (
    <div className="standings-page animate-fade-in">
      <Helmet>
        <title>{getCurrentLeagueName()} Standings - eSkore</title>
        <meta name="description" content={`View current ${getCurrentLeagueName()} standings on eSkore.`} />
      </Helmet>
      
      <div className="standings-container">
        <header className="page-header">
          <h1 className="page-title animate-slide-up">{getCurrentLeagueName()}</h1>
          <p className="page-description animate-fade-in delay-100">
            Current season standings and statistics
          </p>
        </header>
        
        {/* League selection */}
        <div className="league-selector animate-fade-in delay-200">
          <label htmlFor="league-select">Select League:</label>
          <select 
            id="league-select"
            value={selectedLeague}
            onChange={handleLeagueChange}
            className="league-select"
          >
            {leagues.map(league => (
              <option key={league.id} value={league.id}>
                {league.name} ({league.country})
              </option>
            ))}
          </select>
        </div>
        
        {/* Legend */}
        <div className="standings-legend">
          <div className="legend-item">
            <span className="legend-color promotion"></span>
            <span>Champions League</span>
          </div>
          <div className="legend-item">
            <span className="legend-color relegation"></span>
            <span>Relegation</span>
          </div>
        </div>
        
        {/* Table */}
        <div className="standings-table-container animate-fade-in delay-300">
          {loading ? (
            <div className="loading-container" aria-live="polite" role="status">
              <div className="loading-spinner"></div>
              <p>Loading standings...</p>
            </div>
          ) : (
            <table className="table-enhanced standings-table">
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Pos</th>
                  <th style={{...tableHeaderStyle, textAlign: 'left'}}>Team</th>
                  <th style={tableHeaderStyle}>P</th>
                  <th style={tableHeaderStyle}>W</th>
                  <th style={tableHeaderStyle}>D</th>
                  <th style={tableHeaderStyle}>L</th>
                  <th style={tableHeaderStyle}>GF</th>
                  <th style={tableHeaderStyle}>GA</th>
                  <th style={tableHeaderStyle}>GD</th>
                  <th style={tableHeaderStyle}>PTS</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, index) => (
                  <tr 
                    key={team.position} 
                    style={getRowStyle(index)}
                    className={index < 3 ? 'top-team' : index >= 17 ? 'bottom-team' : ''}
                  >
                    <td style={{...tableCellStyle, fontWeight: 'bold'}}>
                      <div className={`position-badge ${index < 4 ? 'promotion' : index >= 17 ? 'relegation' : ''}`}>
                        {team.position}
                      </div>
                    </td>
                    <td style={{...tableCellStyle, textAlign: 'left', fontWeight: 'bold'}}>{team.team}</td>
                    <td style={tableCellStyle}>{team.played}</td>
                    <td style={tableCellStyle}>{team.won}</td>
                    <td style={tableCellStyle}>{team.drawn}</td>
                    <td style={tableCellStyle}>{team.lost}</td>
                    <td style={tableCellStyle}>{team.gf}</td>
                    <td style={tableCellStyle}>{team.ga}</td>
                    <td style={getGDCellStyle(team.gd)}>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                    <td style={{...tableCellStyle, fontWeight: 'bold'}}>{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default StandingsPage;