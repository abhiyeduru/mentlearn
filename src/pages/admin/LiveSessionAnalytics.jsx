import React, { useState, useEffect } from 'react';
import '../../styles/LiveSessionAnalytics.css';

const LiveSessionAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionBookings, setSessionBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleViewBookings = async (sessionId) => {
    try {
      const response = await fetch(`/api/data-analyst/live-sessions/${sessionId}/bookings`);
      const data = await response.json();
      setSelectedSession(sessionId);
      setSessionBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const exportToCSV = async (sessionId) => {
    try {
      const response = await fetch(`/api/data-analyst/live-sessions/${sessionId}/export-csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-bookings-${sessionId}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const filteredBookings = sessionBookings.filter(booking =>
    booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading analytics...</div>;

  return (
    <div className="live-session-analytics">
      <h1>📊 Live Sessions Analytics & Leads</h1>

      <div className="analytics-summary">
        <div className="summary-card">
          <h3>Total Sessions</h3>
          <p className="number">{analyticsData.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Bookings</h3>
          <p className="number">
            {analyticsData.reduce((sum, s) => sum + (s.bookings || 0), 0)}
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
              <th>Bookings</th>
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
                <td className="count">{session.bookings || 0}</td>
                <td>
                  <span className={`status-badge ${session.isLive ? 'live' : 'completed'}`}>
                    {session.isLive ? 'Live' : 'Completed'}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="view-btn"
                    onClick={() => handleViewBookings(session._id)}
                  >
                    View Leads
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
            <h2>Session Bookings/Leads</h2>
            
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bookings-list">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>College</th>
                    <th>Course</th>
                    <th>Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, idx) => (
                    <tr key={idx}>
                      <td>{booking.name}</td>
                      <td>{booking.email}</td>
                      <td>{booking.phone}</td>
                      <td>{booking.college || '-'}</td>
                      <td>{booking.course || '-'}</td>
                      <td>{new Date(booking.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && (
                <p className="no-data">No bookings found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSessionAnalytics;
