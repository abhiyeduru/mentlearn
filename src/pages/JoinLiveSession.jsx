import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/JoinLiveSession.css';

const JoinLiveSession = () => {
  // ===== STATE =====
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [showEnrolledStudents, setShowEnrolledStudents] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const isAdmin = userRole === 'admin';

  // Form data for booking
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    course: '',
  });

  // ===== FETCH SESSIONS =====
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
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== VIEW ENROLLED STUDENTS =====
  const handleViewEnrolledStudents = async (session) => {
    setSelectedSession(session);
    try {
      const response = await fetch(`/api/live-sessions/${session._id}/bookings`);
      const data = await response.json();
      setEnrolledStudents(data);
      setShowEnrolledStudents(true);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    }
  };

  // ===== BOOK SESSION =====
  const handleBookSession = (session) => {
    setSelectedSession(session);
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.displayName || '',
        email: currentUser.email || '',
      }));
    }
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

    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

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
        alert('✅ Booking confirmed! Check your email for session details.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          college: '',
          course: '',
        });
        setShowBookForm(false);
        fetchSessions();
      } else {
        alert('Error booking session. Please try again.');
      }
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Error booking session');
    }
  };

  // ===== JOIN SESSION =====
  const handleJoinSession = (session) => {
    if (!session.isLive) {
      alert('⏰ This session is not live yet. Please try again when it starts.');
      return;
    }
    window.open(session.videoUrl, '_blank');
  };

  // ===== FILTER SESSIONS =====
  const filteredSessions = sessions.filter(session => {
    if (filterStatus === 'live') return session.isLive;
    if (filterStatus === 'scheduled') return !session.isLive;
    return true;
  });

  const filteredStudents = enrolledStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading live sessions...</p>
      </div>
    );
  }

  return (
    <div className="join-live-session-page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="header-content">
          <h1>🔴 Join Live Sessions</h1>
          <p className="subtitle">Connect with instructors and learn in real-time</p>
        </div>
      </div>

      {/* ADMIN HEADER */}
      {isAdmin && (
        <div className="admin-header">
          <span className="admin-badge">👨‍💼 Admin View</span>
          <p>You have full access to manage and monitor all live sessions</p>
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

      {/* SESSIONS GRID */}
      {filteredSessions.length === 0 ? (
        <div className="no-sessions">
          <p>No sessions available</p>
        </div>
      ) : (
        <div className="sessions-container">
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
                    <span className="live-badge">🔴 LIVE NOW</span>
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
                
                {/* SESSION META */}
                <div className="session-meta">
                  <span className="time">⏱️ {new Date(session.startTime).toLocaleString()}</span>
                  <span className={`status ${session.isLive ? 'live' : 'scheduled'}`}>
                    {session.isLive ? '🔴 Live' : '⏰ Upcoming'}
                  </span>
                </div>

                {/* ACTION BUTTONS */}
                <div className="action-buttons">
                  <button 
                    className={`join-btn ${!session.isLive ? 'disabled' : ''}`}
                    onClick={() => handleJoinSession(session)}
                    disabled={!session.isLive}
                    title={session.isLive ? 'Join session' : 'Session not live yet'}
                  >
                    {session.isLive ? '▶️ Join Now' : '⏳ Waiting'}
                  </button>
                  
                  <button 
                    className="register-btn"
                    onClick={() => handleBookSession(session)}
                  >
                    📝 Register
                  </button>

                  {isAdmin && (
                    <button 
                      className="students-btn"
                      onClick={() => handleViewEnrolledStudents(session)}
                    >
                      👥 View Students ({session.bookings || 0})
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ENROLLED STUDENTS MODAL (Admin Only) */}
      {isAdmin && showEnrolledStudents && selectedSession && (
        <div className="modal-overlay" onClick={() => setShowEnrolledStudents(false)}>
          <div className="modal large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Enrolled Students - {selectedSession.title}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowEnrolledStudents(false)}
              >
                ✕
              </button>
            </div>

            {/* SESSION STATS */}
            <div className="session-stats">
              <div className="stat-card">
                <h4>Total Registrations</h4>
                <p className="stat-number">{filteredStudents.length}</p>
              </div>
              <div className="stat-card">
                <h4>Instructor</h4>
                <p className="stat-text">{selectedSession.instructor}</p>
              </div>
              <div className="stat-card">
                <h4>Session Time</h4>
                <p className="stat-text">{new Date(selectedSession.startTime).toLocaleString()}</p>
              </div>
            </div>

            {/* SEARCH */}
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            {/* STUDENTS TABLE */}
            <div className="students-table">
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
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, idx) => (
                      <tr key={idx}>
                        <td className="name">{student.name}</td>
                        <td className="email">{student.email}</td>
                        <td className="phone">{student.phone}</td>
                        <td>{student.college || '-'}</td>
                        <td>{student.course || '-'}</td>
                        <td className="date">{new Date(student.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No students found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* EXPORT BUTTON */}
            <div className="modal-footer">
              <button className="export-btn" onClick={() => {
                const csv = ['Name,Email,Phone,College,Course,Registered At'];
                filteredStudents.forEach(s => {
                  csv.push(`"${s.name}","${s.email}","${s.phone}","${s.college || ''}","${s.course || ''}","${new Date(s.createdAt).toLocaleString()}"`);
                });
                const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `session-students-${selectedSession._id}.csv`;
                a.click();
              }}>
                📥 Export to CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING FORM MODAL */}
      {showBookForm && selectedSession && (
        <div className="modal-overlay" onClick={() => setShowBookForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button 
              className="close-btn"
              onClick={() => setShowBookForm(false)}
            >
              ✕
            </button>

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
                <label>Full Name * <span className="required">required</span></label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email * <span className="required">required</span></label>
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
                <label>Phone Number * <span className="required">required</span></label>
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

              <button type="submit" className="submit-btn">✅ Confirm Registration</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinLiveSession;
