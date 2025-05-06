import React, { useState } from 'react';
import './TabComponents.css';

const Chat = ({ team, members, isManager }) => {
  const [activeChannel, setActiveChannel] = useState('team');
  const [message, setMessage] = useState('');
  
  // Predefined channels based on team structure
  const channels = [
    { id: 'team', name: 'Team Channel', unread: 0, isPublic: true },
    { id: 'gk', name: 'Goalkeepers', unread: 0, isPublic: true },
    { id: 'def', name: 'Defenders', unread: 0, isPublic: true },
    { id: 'mid', name: 'Midfielders', unread: 0, isPublic: true },
    { id: 'fwd', name: 'Forwards', unread: 0, isPublic: true },
    { id: 'staff', name: 'Staff Only', unread: 0, isPublic: false }
  ];
  
  // Placeholder message data
  const [messages, setMessages] = useState([
    {
      id: 1,
      channelId: 'team',
      userId: 1,
      userName: 'System',
      userAvatar: null,
      content: `Welcome to the ${team.name} Team Chat!`,
      timestamp: new Date(),
      isPinned: true,
      isSystem: true
    }
  ]);
  
  // Filter messages by active channel
  const channelMessages = messages.filter(msg => msg.channelId === activeChannel);
  
  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      channelId: activeChannel,
      userId: members[0]?.id || 1, // Current user
      userName: `${members[0]?.firstName || 'Current'} ${members[0]?.lastName || 'User'}`,
      userAvatar: members[0]?.avatar || null,
      content: message,
      timestamp: new Date(),
      isPinned: false,
      isSystem: false
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };
  
  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="channels-header">
          <h3>Channels</h3>
          {isManager && (
            <button className="channel-action-button">
              <i className="fas fa-plus"></i>
            </button>
          )}
        </div>
        
        <div className="channels-list">
          {channels.map(channel => (
            <div 
              key={channel.id} 
              className={`channel-item ${activeChannel === channel.id ? 'active' : ''}`}
              onClick={() => setActiveChannel(channel.id)}
            >
              <div className="channel-icon">
                {channel.isPublic ? '#' : <i className="fas fa-lock"></i>}
              </div>
              <div className="channel-name">{channel.name}</div>
              {channel.unread > 0 && (
                <div className="unread-badge">{channel.unread}</div>
              )}
            </div>
          ))}
        </div>
        
        <div className="direct-messages-header">
          <h3>Direct Messages</h3>
        </div>
        
        <div className="direct-messages-list">
          {members.length <= 1 ? (
            <div className="no-members-message">
              No team members to message yet.
            </div>
          ) : (
            members.slice(1).map((member, index) => (
              <div 
                key={member.id || index} 
                className="dm-item"
              >
                <div className="dm-avatar">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                  ) : (
                    <div className="avatar-placeholder small">
                      {member.firstName?.[0]}{member.lastName?.[0]}
                    </div>
                  )}
                </div>
                <div className="dm-name">{member.firstName} {member.lastName}</div>
                <div className="online-status online"></div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-channel-info">
            <h3>
              {channels.find(c => c.id === activeChannel)?.isPublic ? (
                <span className="channel-symbol">#</span>
              ) : (
                <i className="fas fa-lock"></i>
              )}
              {channels.find(c => c.id === activeChannel)?.name || 'Channel'}
            </h3>
            <div className="channel-meta">
              {members.length} members
            </div>
          </div>
          
          <div className="chat-actions">
            <button className="chat-action-btn">
              <i className="fas fa-users"></i>
            </button>
            <button className="chat-action-btn">
              <i className="fas fa-info-circle"></i>
            </button>
          </div>
        </div>
        
        <div className="chat-messages">
          {channelMessages.length === 0 ? (
            <div className="no-messages">
              <div className="empty-state-icon">💬</div>
              <h3>No messages yet</h3>
              <p>Be the first to send a message in this channel!</p>
            </div>
          ) : (
            channelMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`message-item ${msg.isPinned ? 'pinned' : ''} ${msg.isSystem ? 'system' : ''}`}
              >
                {msg.isPinned && (
                  <div className="pinned-indicator">
                    <i className="fas fa-thumbtack"></i> Pinned
                  </div>
                )}
                
                <div className="message-avatar">
                  {msg.isSystem ? (
                    <div className="system-avatar">
                      <i className="fas fa-cog"></i>
                    </div>
                  ) : msg.userAvatar ? (
                    <img src={msg.userAvatar} alt={msg.userName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {msg.userName[0]}
                    </div>
                  )}
                </div>
                
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">{msg.userName}</span>
                    <span className="message-time">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="message-text">{msg.content}</div>
                </div>
                
                {isManager && !msg.isSystem && (
                  <div className="message-actions">
                    <button className="message-action-btn" title="Pin Message">
                      <i className="fas fa-thumbtack"></i>
                    </button>
                    <button className="message-action-btn" title="Delete Message">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <form className="message-input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="message-input"
            placeholder={`Message #${channels.find(c => c.id === activeChannel)?.name || 'channel'}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="button" className="input-action-btn" title="Attach File">
            <i className="fas fa-paperclip"></i>
          </button>
          <button type="button" className="input-action-btn" title="Add Emoji">
            <i className="fas fa-smile"></i>
          </button>
          <button 
            type="submit" 
            className="send-button"
            disabled={!message.trim()}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
