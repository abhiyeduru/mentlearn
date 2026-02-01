import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/LiveSessions.css';

const LiveSessions = () => {
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchLiveSessions();
  }, []);

  const fetchLiveSessions = async () => {
    try {
      const response = await fetch('/api/live-sessions');
      const data = await response.json();
      setLiveSessions(data);
    } catch (error) {
      console.error('Error fetching live sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClick = (session) => {
    setSelectedSession(session);
    setShowJoinForm(true);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/live-sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession._id,
          userId: user.uid,
          userName: user.displayName,
        }),
      });
      window.open(selectedSession.videoUrl, '_blank');
      setShowJoinForm(false);
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  if (loading) return <div className="loading">Loading live sessions...</div>;

  return (
    <div className="live-sessions-container">
      <h1>🔴 Live Sessions</h1>
      
      {liveSessions.length === 0 ? (
        <p className="no-sessions">No live sessions available</p>
      ) : (
        <div className="sessions-grid">
          {liveSessions.map((session) => (
            <div key={session._id} className="session-card">
              <div className="session-thumbnail">
                <img src={session.thumbnail} alt={session.title} />
                {session.isLive && <span className="live-badge">🔴 LIVE</span>}
              </div>
              <div className="session-info">
                <h3>{session.title}</h3>
                <p className="instructor">Instructor: {session.instructor}</p>
                <p className="description">{session.description}</p>
                <div className="session-meta">
                  <span>👥 {session.participants || 0} watching</span>
                  <span>⏱️ {new Date(session.startTime).toLocaleTimeString()}</span>
                </div>
                <button 
                  className="join-btn"
                  onClick={() => handleJoinClick(session)}
                >
                  Join Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showJoinForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowJoinForm(false)}>✕</button>
            <h2>Join Live Session</h2>
            <form onSubmit={handleJoinSubmit}>
              <div className="form-group">
                <label>Session:</label>
                <input type="text" value={selectedSession?.title} disabled />
              </div>
              <div className="form-group">
                <label>Your Name:</label>
                <input type="text" value={user?.displayName || ''} disabled />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" value={user?.email || ''} disabled />
              </div>
              <button type="submit" className="submit-btn">Join Live Session</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSessions;
