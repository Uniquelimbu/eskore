import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './NotFoundPage.css'; // Add this import line

function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | eSkore</title>
      </Helmet>
      
      <div className="not-found-page animate-fade-in" style={{ 
        padding: '2rem', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background elements */}
        <div className="background-shapes" aria-hidden="true" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          opacity: 0.4
        }}>
          <div className="shape shape-1 animate-float"></div>
          <div className="shape shape-2 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="shape shape-3 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <h1 
          className="animate-slide-up" 
          style={{ 
            fontSize: '8rem', 
            margin: '0', 
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #4a90e2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 5px 30px rgba(46, 31, 94, 0.2)'
          }}>
          404
        </h1>
        
        <h2 
          className="animate-slide-up delay-100" 
          style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Page Not Found
        </h2>
        
        <p 
          className="animate-slide-up delay-200" 
          style={{ 
            maxWidth: '600px', 
            marginBottom: '2rem', 
            fontSize: '1.2rem', 
            color: '#666'
          }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="animate-fade-in delay-300" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link 
            to="/" 
            className="btn btn-primary hover-lift"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/>
            </svg>
            Back to Home
          </Link>
          
          <Link 
            to="/contact" 
            className="btn btn-secondary"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 4a3 3 0 0 0-3 3v6h6V7a3 3 0 0 0-3-3zm0-1h8a4 4 0 0 1 4 4v6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a4 4 0 0 1 4-4zm2.646 1A3.99 3.99 0 0 1 8 7v6h7V7a3 3 0 0 0-3-3H6.646z"/>
              <path d="M11.793 8.5H9v-1h5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.354-.146l-.853-.854zM7 7v1h2v.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V7.5a.5.5 0 0 1 .5-.5H7z"/>
            </svg>
            Contact Support
          </Link>
        </div>
      </div>
    </>
  );
}

export default NotFoundPage;