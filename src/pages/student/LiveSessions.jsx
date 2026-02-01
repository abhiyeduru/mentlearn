import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/LiveSessions.css';

const LiveSessions = () => {
  // ===== STATE MANAGEMENT =====
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { user, currentUser } = useAuth();

  // ===== FETCH SESSIONS =====
  useEffect(() => {
    fetchSessions();
    // Auto-refresh every 30 seconds
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

  // ===== JOIN SESSION =====
  const handleJoinSession = (session) => {
    setSelectedSession(session);
    setShowJoinForm(true);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/live-sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession._id,
          userId: currentUser?.uid,
          userName: currentUser?.displayName || user?.name || 'Guest',
          email: currentUser?.email || user?.email,
        }),
      });

      if (response.ok) {
        // Open video in new tab
        window.open(selectedSession.videoUrl, '_blank');
        setShowJoinForm(false);
        // Refresh to update participant count
        fetchSessions();
      }
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Error joining session');
    }
  };

  // ===== FILTER SESSIONS =====
  const filteredSessions = sessions.filter(session => {
    if (filterStatus === 'live') return session.isLive;
    if (filterStatus === 'scheduled') return !session.isLive;
    return true;
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
                
                {/* LIVE BADGE */}
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

                {/* JOIN BUTTON */}
                <button 
                  className="join-btn"
                  onClick={() => handleJoinSession(session)}
                >
                  Join Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JOIN MODAL */}
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
                  value={currentUser?.displayName || user?.name || ''} 
                  disabled 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={currentUser?.email || user?.email || ''} 
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

export default LiveSessions;
