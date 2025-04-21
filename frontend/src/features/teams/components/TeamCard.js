import React from 'react';
import PropTypes from 'prop-types';

const TeamCard = React.memo(({ team, onFollow }) => {
  return (
    <div 
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
        onClick={() => onFollow(team.id)}
        aria-label={`Follow ${team.name}`}
      >
        Follow
      </button>
    </div>
  );
});

TeamCard.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    logoUrl: PropTypes.string
  }).isRequired,
  onFollow: PropTypes.func.isRequired
};

export default TeamCard;
