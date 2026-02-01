import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/LiveSessionsPage.css';

const LiveSessionsPage = () => {
  // ===== STATE MANAGEMENT =====
  // These variables store data that can change
  const [sessions, setSessions] = useState([]);           // All live sessions
  const [loading, setLoading] = useState(true);           // Is page loading?
  const [showAddForm, setShowAddForm] = useState(false);   // Show admin form?
  const [showJoinForm, setShowJoinForm] = useState(false); // Show join modal?
  const [selectedSession, setSelectedSession] = useState(null); // Current session
  const [thumbnailPreview, setThumbnailPreview] = useState(''); // Image preview
  const [filterStatus, setFilterStatus] = useState('all'); // Filter: all/live/scheduled
  const { user } = useAuth(); // Get logged-in user from Firebase

  // Check if user is admin (you can modify this check)
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@mentlearn.com';

  // Form data object - stores all inputs
  const [formData, setFormData] = useState({
    title: '',           // Session name
    description: '',     // Session details
    instructor: '',      // Who's teaching
    videoUrl: '',        // Where the video is
    thumbnail: null,     // Preview image
    startTime: '',       // When it starts
    isLive: false,       // Is it live now?
  });

  // ===== FETCH SESSIONS =====
  // This runs when page first loads (useEffect with empty [])
  useEffect(() => {
    fetchSessions(); // Get all sessions from database
    
    // Auto-refresh every 30 seconds to show live updates
    const interval = setInterval(fetchSessions, 30000);
    
    // Cleanup: stop refreshing when component unmounts
    return () => clearInterval(interval);
  }, []);

  // Function to get all sessions from backend
  const fetchSessions = async () => {
    try {
      // Make GET request to backend
      const response = await fetch('/api/live-sessions');
      const data = await response.json(); // Convert response to JSON
      setSessions(data);                  // Store in state
    } catch (error) {
      console.error('Error fetching live sessions:', error);
    } finally {
      setLoading(false); // Stop showing loading spinner
    }
  };

  // ===== FORM HANDLING =====
  // When user types in text field or checks checkbox
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Update the specific field in formData
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // When user selects an image file for thumbnail
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file })); // Store file
      
      // Read file and show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result); // Show preview image
      };
      reader.readAsDataURL(file); // Convert to image URL
    }
  };

  // ===== CREATE SESSION (Admin only) =====
  const handleAddSession = async (e) => {
    e.preventDefault(); // Don't reload page

    // Create FormData object for file upload
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('instructor', formData.instructor);
    formDataToSend.append('videoUrl', formData.videoUrl);
    formDataToSend.append('startTime', formData.startTime);
    formDataToSend.append('isLive', formData.isLive);
    if (formData.thumbnail) {
      formDataToSend.append('thumbnail', formData.thumbnail); // Add image file
    }

    try {
      // Send POST request to create session
      const response = await fetch('/api/admin/live-sessions', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        // Success! Reset form
        setFormData({
          title: '',
          description: '',
          instructor: '',
          videoUrl: '',
          thumbnail: null,
          startTime: '',
          isLive: false,
        });
        setThumbnailPreview('');
        setShowAddForm(false);      // Close form
        fetchSessions();             // Refresh list
        alert('Session created successfully!');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error creating session');
    }
  };

  // ===== JOIN SESSION =====
  // When user clicks "Join Now" button
  const handleJoinSession = (session) => {
    setSelectedSession(session); // Remember which session
    setShowJoinForm(true);        // Show join modal
  };

  // When user confirms joining
  const handleJoinSubmit = async (e) => {
    e.preventDefault(); // Don't reload page

    try {
      // Send POST to record this user joining the session
      const response = await fetch('/api/live-sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession._id,
          userId: user.uid,
          userName: user.displayName || 'Guest',
          email: user.email,
        }),
      });

      if (response.ok) {
        // Open video in new tab
        window.open(selectedSession.videoUrl, '_blank');
        setShowJoinForm(false); // Close modal
      }
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Error joining session');
    }
  };

  // ===== DELETE SESSION (Admin only) =====
  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        const response = await fetch(`/api/admin/live-sessions/${sessionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchSessions(); // Refresh list
          alert('Session deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('Error deleting session');
      }
    }
  };

  // ===== TOGGLE LIVE STATUS (Admin only) =====
  // Start or stop a session as live
  const handleToggleLive = async (sessionId, isLive) => {
    try {
      const response = await fetch(`/api/admin/live-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLive: !isLive }), // Toggle the status
      });

      if (response.ok) {
        fetchSessions(); // Refresh list to show updated status
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  // ===== FILTER SESSIONS =====
  // Filter sessions by status (all, live, or scheduled)
  const filteredSessions = sessions.filter(session => {
    if (filterStatus === 'live') return session.isLive;      // Only live ones
    if (filterStatus === 'scheduled') return !session.isLive; // Only scheduled
    return true; // All sessions
  });

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading live sessions...</p>
      </div>
    );
  }

  // ===== RENDER PAGE =====
  return (
    <div className="live-sessions-page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="header-content">
          <h1>🔴 Live Sessions</h1>
          <p className="subtitle">Join live classes and interact with instructors</p>
        </div>
        
        {/* ADMIN BUTTON - Only show if user is admin */}
        {isAdmin && (
          <button 
            className="add-session-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '✕ Cancel' : '+ Add New Session'}
          </button>
        )}
      </div>

      {/* ADMIN FORM - Only show if admin clicks add button */}
      {isAdmin && showAddForm && (
        <div className="admin-form-section">
          <h2>Create New Live Session</h2>
          <form onSubmit={handleAddSession} className="add-session-form">
            <div className="form-grid">
              {/* Title Field */}
              <div className="form-group">
                <label>Session Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter session title"
                  required
                />
              </div>

              {/* Instructor Field */}
              <div className="form-group">
                <label>Instructor Name *</label>
                <input
                  type="text"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  placeholder="Enter instructor name"
                  required
                />
              </div>

              {/* Date & Time Field */}
              <div className="form-group">
                <label>Start Date & Time *</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Video URL Field */}
              <div className="form-group">
                <label>Video URL *</label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  required
                />
              </div>

              {/* Description (full width) */}
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter session description"
                  rows="3"
                />
              </div>

              {/* Thumbnail Upload (full width) */}
              <div className="form-group full-width">
                <label>Thumbnail Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
                {thumbnailPreview && (
                  <img src={thumbnailPreview} alt="Preview" className="thumbnail-preview" />
                )}
              </div>

              {/* Is Live Checkbox */}
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  name="isLive"
                  checked={formData.isLive}
                  onChange={handleInputChange}
                  id="isLiveCheckbox"
                />
                <label htmlFor="isLiveCheckbox">Mark as Live</label>
              </div>
            </div>

            <button type="submit" className="submit-btn">Create Session</button>
          </form>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="filter-tabs">
        <button 
          className={`tab ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Sessions ({sessions.length})
        </button>
        <button 
          className={`tab ${filterStatus === 'live' ? 'active' : ''}`}
          onClick={() => setFilterStatus('live')}
        >
          🔴 Live ({sessions.filter(s => s.isLive).length})
        </button>
        <button 
          className={`tab ${filterStatus === 'scheduled' ? 'active' : ''}`}
          onClick={() => setFilterStatus('scheduled')}
        >
          ⏰ Scheduled ({sessions.filter(s => !s.isLive).length})
        </button>
      </div>

      {/* SESSIONS GRID - Main content */}
      {filteredSessions.length === 0 ? (
        // Show this if no sessions match filter
        <div className="no-sessions">
          <p>No sessions available</p>
        </div>
      ) : (
        // Show grid of session cards
        <div className="sessions-grid">
          {filteredSessions.map(session => (
            <div key={session._id} className={`session-card ${session.isLive ? 'live' : ''}`}>
              
              {/* THUMBNAIL */}
              <div className="card-thumbnail">
                <img 
                  src={session.thumbnail || 'https://via.placeholder.com/400x225?text=Live+Session'} 
                  alt={session.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x225?text=Live+Session';
                  }}
                />
                
                {/* LIVE BADGE - Show if session is live */}
                {session.isLive && (
                  <div className="live-indicator">
                    <span className="live-badge">🔴 LIVE</span>
                  </div>
                )}
                
                {/* PARTICIPANT COUNT */}
                <div className="overlay-info">
                  <span className="participants-count">👥 {session.participants || 0}</span>
                </div>
              </div>

              {/* CARD CONTENT */}
              <div className="card-content">
                <h3 className="session-title">{session.title}</h3>
                <p className="instructor-name">👨‍🏫 {session.instructor}</p>
                <p className="description">{session.description}</p>
                
                {/* SESSION META INFO */}
                <div className="session-meta">
                  <span className="time">⏱️ {new Date(session.startTime).toLocaleString()}</span>
                  <span className={`status ${session.isLive ? 'live' : 'scheduled'}`}>
                    {session.isLive ? '🔴 Live Now' : '⏰ Upcoming'}
                  </span>
                </div>

                {/* CARD ACTIONS */}
                <div className="card-actions">
                  {/* JOIN BUTTON - All users can click this */}
                  <button 
                    className="join-btn"
                    onClick={() => handleJoinSession(session)}
                  >
                    Join Now →
                  </button>

                  {/* ADMIN BUTTONS - Only admin sees these */}
                  {isAdmin && (
                    <div className="admin-actions">
                      <button 
                        className={`toggle-live-btn ${session.isLive ? 'active' : ''}`}
                        onClick={() => handleToggleLive(session._id, session.isLive)}
                        title={session.isLive ? 'End Session' : 'Start Session'}
                      >
                        {session.isLive ? '⏹️ End' : '▶️ Start'}
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteSession(session._id)}
                        title="Delete Session"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JOIN MODAL - Show when user clicks "Join Now" */}
      {showJoinForm && selectedSession && (
        <div className="modal-overlay" onClick={() => setShowJoinForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowJoinForm(false)}>✕</button>
            <h2>Join Live Session</h2>
            
            {/* SESSION PREVIEW */}
            <div className="session-preview">
              <img 
                src={selectedSession.thumbnail || 'https://via.placeholder.com/300x170?text=Live+Session'} 
                alt={selectedSession.title}
              />
              <div className="session-details">
                <h3>{selectedSession.title}</h3>
                <p><strong>Instructor:</strong> {selectedSession.instructor}</p>
                <p><strong>Time:</strong> {new Date(selectedSession.startTime).toLocaleString()}</p>
                <p><strong>Participants:</strong> {selectedSession.participants || 0}</p>
              </div>
            </div>

            {/* JOIN FORM */}
            <form onSubmit={handleJoinSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input 
                  type="text" 
                  value={user?.displayName || ''} 
                  disabled 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled 
                />
              </div>
              <button type="submit" className="submit-btn">Join Session</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSessionsPage;
