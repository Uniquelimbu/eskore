import React, { useState } from 'react';
import './TabComponents.css';

const Calendar = ({ team, members, isManager }) => {
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Generate the days for the month view
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div key={`day-${day}`} className="calendar-day">
          <div className="day-number">{day}</div>
          <div className="day-events">
            {/* Events would be mapped here */}
          </div>
        </div>
      );
    }
    
    return days;
  };
  
  // Format month name
  const getMonthName = (monthIndex) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
  };
  
  // Handle navigation between months
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };
  
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Team Calendar</h2>
        <div className="calendar-actions">
          <div className="view-toggles">
            <button 
              className={`view-toggle ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button 
              className={`view-toggle ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`view-toggle ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
          </div>
          
          {isManager && (
            <button className="action-button primary">
              <i className="fas fa-plus"></i> Add Event
            </button>
          )}
        </div>
      </div>
      
      <div className="calendar-navigation">
        <button className="nav-button" onClick={() => navigateMonth(-1)}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <h3>{getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}</h3>
        <button className="nav-button" onClick={() => navigateMonth(1)}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div className="calendar-view">
        {viewMode === 'month' && (
          <div className="month-view">
            <div className="weekday-header">
              <div className="weekday">Sun</div>
              <div className="weekday">Mon</div>
              <div className="weekday">Tue</div>
              <div className="weekday">Wed</div>
              <div className="weekday">Thu</div>
              <div className="weekday">Fri</div>
              <div className="weekday">Sat</div>
            </div>
            <div className="month-grid">
              {renderCalendarDays()}
            </div>
          </div>
        )}
        
        {viewMode === 'week' && (
          <div className="week-view">
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>Week View Coming Soon</h3>
              <p>This feature is under development and will be available soon.</p>
            </div>
          </div>
        )}
        
        {viewMode === 'day' && (
          <div className="day-view">
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>Day View Coming Soon</h3>
              <p>This feature is under development and will be available soon.</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="calendar-legend">
        <h3>Event Types</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color match"></div>
            <div className="legend-label">Match</div>
          </div>
          <div className="legend-item">
            <div className="legend-color training"></div>
            <div className="legend-label">Training</div>
          </div>
          <div className="legend-item">
            <div className="legend-color meeting"></div>
            <div className="legend-label">Team Meeting</div>
          </div>
          <div className="legend-item">
            <div className="legend-color social"></div>
            <div className="legend-label">Social Event</div>
          </div>
        </div>
      </div>
      
      <div className="export-section">
        <button className="action-button secondary">
          <i className="fas fa-download"></i> Export Calendar (.ics)
        </button>
      </div>
    </div>
  );
};

export default Calendar;
