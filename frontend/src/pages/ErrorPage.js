import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

function ErrorPage({ error, resetError }) {
  return (
    <div className="error-page animate-fade-in" style={{ 
      padding: '2rem', 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
    }}>
      <Helmet>
        <title>Error Occurred | eSkore</title>
      </Helmet>
      
      <h1 style={{ fontSize: '3rem', color: '#e74c3c' }}>
        Something went wrong
      </h1>
      
      <p style={{ maxWidth: '600px', margin: '1.5rem auto' }}>
        We're sorry, but an error occurred while rendering this page.
      </p>
      
      {error && (
        <div style={{ 
          background: '#f8f8f8', 
          padding: '1rem', 
          borderRadius: '8px',
          maxWidth: '600px',
          marginBottom: '2rem',
          textAlign: 'left',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          color: '#e74c3c'
        }}>
          {error.toString()}
        </div>
      )}
      
      <div>
        <button 
          onClick={resetError}
          style={{ 
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '50px',
            marginRight: '1rem',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
        
        <Link to="/" style={{ 
          background: '#f1f1f1',
          color: '#333',
          padding: '0.75rem 1.5rem',
          borderRadius: '50px',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default ErrorPage;
