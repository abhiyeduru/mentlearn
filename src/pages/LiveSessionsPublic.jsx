import React, { useState, useEffect } from 'react';
import '../styles/LiveSessionsPublic.css';

const LiveSessionsPublic = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookForm, setShowBookForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    course: '',
  });

  // Fetch all sessions
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/live-sessions');
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching live sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = (session) => {
    setSelectedSession(session);
    setShowBookForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/live-sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession._id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          college: formData.college,
          course: formData.course,
        }),
      });

      if (response.ok) {
        alert('Booking confirmed! Check your email for details.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          college: '',
          course: '',
        });
        setShowBookForm(false);
        fetchSessions();
      }
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Error booking session. Please try again.');
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filterStatus === 'live') return session.isLive;
    if (filterStatus === 'scheduled') return !session.isLive;
    return true;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading live sessions...</p>
      </div>
    );
  }

  return (
    <div className="live-sessions-public">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="header-content">
          <h1>🔴 Live Sessions</h1>
          <p className="subtitle">Join our live classes and learn from industry experts</p>
        </div>
      </div>

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

      {/* SESSIONS GRID */}
      {filteredSessions.length === 0 ? (
        <div className="no-sessions">
          <p>No sessions available at the moment</p>
        </div>
      ) : (
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
                
                {session.isLive && (
                  <div className="live-indicator">
                    <span className="live-badge">🔴 LIVE</span>
                  </div>
                )}
                
                <div className="overlay-info">
                  <span className="participants-count">👥 {session.bookings || 0} registered</span>
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

                {/* BOOK BUTTON */}
                <button 
                  className="book-btn"
                  onClick={() => handleBookSession(session)}
                >
                  Register Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOOKING MODAL */}
      {showBookForm && selectedSession && (
        <div className="modal-overlay" onClick={() => setShowBookForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowBookForm(false)}>✕</button>
            <h2>Register for Live Session</h2>
            
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
              </div>
            </div>

            {/* BOOKING FORM */}
            <form onSubmit={handleBookSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label>College/Organization</label>
                <input 
                  type="text" 
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  placeholder="Enter your college name"
                />
              </div>

              <div className="form-group">
                <label>Course/Field of Interest</label>
                <input 
                  type="text" 
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="Enter your course"
                />
              </div>

              <button type="submit" className="submit-btn">Confirm Registration</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSessionsPublic;
