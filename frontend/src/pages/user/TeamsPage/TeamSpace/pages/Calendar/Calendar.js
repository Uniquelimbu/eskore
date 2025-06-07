import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collapseSidebar, expandSidebar } from '../../../../../../utils/sidebarUtils';
import './Calendar.css';

const Calendar = ({ team, members, isManager }) => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Ensure sidebar is collapsed when Calendar page loads
  useEffect(() => {
    console.log('Calendar: Attempting to collapse sidebar');
    
    // Use a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      collapseSidebar();
    }, 50);
    
    return () => {
      clearTimeout(timer);
      // Don't expand here - let TeamSpace handle it
    };
  }, []);
  
  const handleBackClick = () => {
    console.log('Calendar: Expanding sidebar and navigating back');
    expandSidebar();
    navigate(`/teams/${teamId}/space`);
  };
  
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        setLoading(true);
        // API call would go here in a production app
        // For now, set dummy data
        const dummyEvents = [
          {
            id: 1,
            title: 'Team Practice',
            date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            location: 'Main Field',
            type: 'practice'
          },
          {
            id: 2,
            title: 'Home Game vs. Rival Team',
            date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
            location: 'Home Stadium',
            type: 'game'
          }
        ];
        
        setEvents(dummyEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError('Failed to load calendar events. Please try again.');
        setLoading(false);
      }
    };
    
    fetchCalendarEvents();
  }, [teamId]);
  
  const renderEvents = () => {
    if (events.length === 0) {
      return (
        <div className="empty-calendar">
          <p>No upcoming events scheduled</p>
          {isManager && (
            <button className="add-event-btn">
              Add First Event
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div className="events-list">
        {events.map(event => (
          <div key={event.id} className={`event-card ${event.type}`}>
            <div className="event-date">
              {new Date(event.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="event-details">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-location">{event.location}</p>
              <p className="event-time">
                {new Date(event.date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  if (loading) return <div className="calendar-loading">Loading calendar...</div>;
  if (error) return <div className="calendar-error">{error}</div>;
  
  // Keep only the back button in the header
  return (
    <div className="calendar-page">
      <div className="back-button-container">
        <button className="back-button" onClick={handleBackClick}>
          &larr; Back
        </button>
      </div>
      
      <div className="calendar-content">
        <div className="upcoming-events">
          <h3>Upcoming Events</h3>
          {renderEvents()}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
