import React, { useState, useEffect } from 'react';
import '../styles/DataAnalystLiveSessions.css';

const DataAnalystLiveSessions = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionParticipants, setSessionParticipants] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/data-analyst/live-sessions-analytics');
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewParticipants = async (sessionId) => {
    try {
      const response = await fetch(`/api/data-analyst/live-sessions/${sessionId}/participants`);
      const data = await response.json();
      setSelectedSession(sessionId);
      setSessionParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const exportToCSV = async (sessionId) => {
    try {
      const response = await fetch(`/api/data-analyst/live-sessions/${sessionId}/export-csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${sessionId}-data.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  return (
    <div className="data-analyst-container">
      <h1>📊 Live Sessions Analytics</h1>

      <div className="analytics-summary">
        <div className="summary-card">
          <h3>Total Sessions</h3>
          <p className="number">{analyticsData.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Participants</h3>
          <p className="number">
            {analyticsData.reduce((sum, s) => sum + (s.participants || 0), 0)}
          </p>
        </div>
        <div className="summary-card">
          <h3>Active Sessions</h3>
          <p className="number">{analyticsData.filter(s => s.isLive).length}</p>
        </div>
      </div>

      <div className="analytics-table">
        <table>
          <thead>
            <tr>
              <th>Session Title</th>
              <th>Instructor</th>
              <th>Date & Time</th>
              <th>Participants</th>
              <th>Duration (mins)</th>
              <th>Avg. Watch Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.map(session => (
              <tr key={session._id}>
                <td className="session-title">{session.title}</td>
                <td>{session.instructor}</td>
                <td>{new Date(session.startTime).toLocaleString()}</td>
                <td className="count">{session.participants || 0}</td>
                <td className="count">{session.duration || '-'}</td>
                <td className="count">{session.avgWatchTime || '-'} mins</td>
                <td>
                  <span className={`status-badge ${session.isLive ? 'live' : 'completed'}`}>
                    {session.isLive ? 'Live' : 'Completed'}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="view-btn"
                    onClick={() => handleViewParticipants(session._id)}
                  >
                    View Details
                  </button>
                  <button 
                    className="export-btn"
                    onClick={() => exportToCSV(session._id)}
                  >
                    Export CSV
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSession && (
        <div className="modal-overlay">
          <div className="modal">
            <button 
              className="close-btn"
              onClick={() => setSelectedSession(null)}
            >
              ✕
            </button>
            <h2>Session Participants</h2>
            <div className="participants-list">
              <table>
                <thead>
                  <tr>
                    <th>Participant Name</th>
                    <th>Email</th>
                    <th>Join Time</th>
                    <th>Watch Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionParticipants.map((p, idx) => (
                    <tr key={idx}>
                      <td>{p.userName}</td>
                      <td>{p.email}</td>
                      <td>{new Date(p.joinTime).toLocaleTimeString()}</td>
                      <td>{p.watchDuration || '-'} mins</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalystLiveSessions;
