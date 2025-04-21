import React, { useEffect, useState } from 'react';
import { teamsAPI } from '../services/api';
import { handleApiError } from '../../../utils/errorHandler'; // Import the error handler

function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true);
        const response = await teamsAPI.getAll();
        setTeams(response.data);
        setError('');
      } catch (err) {
        // Use the error handler instead of console.error
        handleApiError(err, setError);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

  return (
    <div className="teams-page animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header">
        <h1 className="page-title animate-slide-up">Teams</h1>
        <p className="page-description animate-slide-up delay-100">Discover and follow your favorite teams</p>
      </header>
      
      {loading && (
        <div className="loading-container" aria-live="polite" role="status">
          <div className="loading-spinner"></div>
          <p>Loading teams...</p>
        </div>
      )}
      
      {error && (
        <div 
          className="error-message animate-fade-in" 
          role="alert"
          aria-live="assertive"
          style={{ 
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(198, 40, 40, 0.1)',
            border: '1px solid rgba(198, 40, 40, 0.2)'
          }}>
          <span aria-hidden="true" style={{ marginRight: '8px' }}>⚠️</span>
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <>
          {teams.length > 0 ? (
            <div 
              className="teams-grid animate-fade-in" 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '2rem'
              }}
              role="list"
              aria-label="Teams listing"
            >
              {teams.map((team) => (
                <div 
                  key={team.id} 
                  className="team-card hover-lift animate-fade-in"
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '1.8rem',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                  role="listitem"
                  tabIndex="0"
                >
                  <div 
                    className="team-logo-container"
                    style={{
                      width: '100px',
                      height: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.2rem',
                      background: 'linear-gradient(135deg, #f8f8f8, #eaeaea)',
                      borderRadius: '50%',
                      padding: '5px'
                    }}
                  >
                    {team.logoUrl ? (
                      <img 
                        src={team.logoUrl} 
                        alt={`${team.name} logo`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          borderRadius: '50%'
                        }} 
                      />
                    ) : (
                      <div 
                        className="team-logo-placeholder"
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'var(--color-primary)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2.2rem',
                          fontWeight: 'bold',
                          borderRadius: '50%'
                        }}
                        aria-hidden="true"
                      >
                        {team.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 
                    style={{ 
                      margin: '0', 
                      textAlign: 'center', 
                      color: 'var(--color-text)',
                      fontSize: '1.2rem'
                    }}
                  >
                    {team.name}
                  </h3>
                  <button 
                    className="follow-button animate-fade-in" 
                    style={{
                      marginTop: '1rem',
                      background: 'transparent',
                      border: '1px solid var(--color-primary)',
                      color: 'var(--color-primary)',
                      borderRadius: '20px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      fontWeight: 'bold'
                    }}
                    aria-label={`Follow ${team.name}`}
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p 
              className="no-results animate-fade-in" 
              style={{ 
                textAlign: 'center', 
                fontStyle: 'italic',
                padding: '3rem',
                color: '#666',
                background: '#f9f9f9',
                borderRadius: '8px',
                margin: '2rem 0'
              }}
            >
              No teams found.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default TeamsPage;