import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../tabs/TabComponents.css';

const Calendar = ({ team, members, isManager }) => {
  const { teamId } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'match',
    location: '',
    description: ''
  });
  
  useEffect(() => {
    // Fetch calendar events for this team
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // const response = await fetch(`/api/teams/${teamId}/events`);
        // const data = await response.json();
        
        // For demo purposes, we'll use localStorage
        const savedEvents = localStorage.getItem(`team_${teamId}_events`);
        let parsedEvents = [];
        
        if (savedEvents) {
          try {
            parsedEvents = JSON.parse(savedEvents);
          } catch (error) {
            console.error('Error parsing saved events:', error);
          }
        }
        
        setEvents(parsedEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team events:', error);
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [teamId]);
  
  const handleAddEvent = (e) => {
    e.preventDefault();
    
    const eventToAdd = {
      id: Date.now(), // Use timestamp as temporary ID
      ...newEvent,
      teamId
    };
    
    const updatedEvents = [...events, eventToAdd];
    
    // Save to localStorage for demo purposes
    localStorage.setItem(`team_${teamId}_events`, JSON.stringify(updatedEvents));
    
    // Update state
    setEvents(updatedEvents);
    
    // Reset form
    setNewEvent({
      title: '',
      date: '',
      time: '',
      type: 'match',
      location: '',
      description: ''
    });
    
    setShowAddEvent(false);
  };
  
  const handleDeleteEvent = (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    const updatedEvents = events.filter(event => event.id !== eventId);
    
    // Save to localStorage for demo purposes
    localStorage.setItem(`team_${teamId}_events`, JSON.stringify(updatedEvents));
    
    // Update state
    setEvents(updatedEvents);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Group events by month and day for calendar display
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.date);
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    
    if (!acc[month]) {
      acc[month] = {};
    }
    
    if (!acc[month][day]) {
      acc[month][day] = [];
    }
    
    acc[month][day].push(event);
    return acc;
  }, {});
  
  if (loading) return <div>Loading team calendar...</div>;
  
  return (
    <div className="team-page calendar-page">
      <div className="calendar-header">
        <h2>Team Calendar</h2>
        {isManager && (
          <button 
            className="add-event-btn" 
            onClick={() => setShowAddEvent(!showAddEvent)}
          >
            {showAddEvent ? 'Cancel' : 'Add Event'}
          </button>
        )}
      </div>
      
      {showAddEvent && (
        <form onSubmit={handleAddEvent} className="add-event-form">
          <div className="form-group">
            <label htmlFor="eventTitle">Title:</label>
            <input
              type="text"
              id="eventTitle"
              name="title"
              value={newEvent.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventDate">Date:</label>
              <input
                type="date"
                id="eventDate"
                name="date"
                value={newEvent.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="eventTime">Time:</label>
              <input
                type="time"
                id="eventTime"
                name="time"
                value={newEvent.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="eventType">Type:</label>
            <select
              id="eventType"
              name="type"
              value={newEvent.type}
              onChange={handleInputChange}
            >
              <option value="match">Match</option>
              <option value="training">Training</option>
              <option value="meeting">Meeting</option>
              <option value="tournament">Tournament</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="eventLocation">Location:</label>
            <input
              type="text"
              id="eventLocation"
              name="location"
              value={newEvent.location}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="eventDescription">Description:</label>
            <textarea
              id="eventDescription"
              name="description"
              value={newEvent.description}
              onChange={handleInputChange}
              rows="3"
            ></textarea>
          </div>
          
          <button type="submit" className="submit-btn">Add Event</button>
        </form>
      )}
      
      <div className="calendar-container">
        {Object.entries(groupedEvents).length > 0 ? (
          Object.entries(groupedEvents).map(([month, days]) => (
            <div key={month} className="calendar-month">
              <h3>{month}</h3>
              
              {Object.entries(days).map(([day, dayEvents]) => (
                <div key={`${month}-${day}`} className="calendar-day">
                  <div className="day-header">
                    <span className="day-number">{day}</span>
                  </div>
                  
                  <div className="day-events">
                    {dayEvents.map(event => (
                      <div key={event.id} className={`event-card ${event.type}`}>
                        <div className="event-time">{event.time}</div>
                        <div className="event-title">{event.title}</div>
                        <div className="event-details">
                          {event.location && <div className="event-location">{event.location}</div>}
                          {event.description && <div className="event-description">{event.description}</div>}
                        </div>
                        {isManager && (
                          <button 
                            className="delete-event-btn" 
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No events scheduled. {isManager ? 'Add events to get started!' : 'Check back later for updates.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
