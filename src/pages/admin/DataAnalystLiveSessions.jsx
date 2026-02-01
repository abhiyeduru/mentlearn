import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaUsers, 
  FaCalendarCheck, 
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaDownload,
  FaVideo
} from 'react-icons/fa';
import '../../styles/DataAnalystLiveSessions.css';

const DataAnalystLiveSessions = () => {
  const [activeTab, setActiveTab] = useState('registrations'); // registrations, sessions, create
  const [registrations, setRegistrations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state for creating sessions
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    instructor: '',
    instructorBio: '',
    sessionDate: '',
    sessionTime: '',
    duration: '60',
    maxParticipants: '50',
    topics: '',
    prerequisites: '',
    isActive: true,
    meetingLink: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRegistrations(),
        fetchSessions()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const regsRef = collection(db, 'liveSessionRegistrations');
      const q = query(regsRef, orderBy('registeredAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const sessionsRef = collection(db, 'liveSessionForms');
      const q = query(sessionsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Handle registration status update
  const updateRegistrationStatus = async (regId, newStatus) => {
    try {
      const regRef = doc(db, 'liveSessionRegistrations', regId);
      await updateDoc(regRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      await fetchRegistrations();
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  // Handle session form creation
  const handleSessionFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSessionForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'liveSessionForms'), {
        ...sessionForm,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Reset form
      setSessionForm({
        title: '',
        description: '',
        instructor: '',
        instructorBio: '',
        sessionDate: '',
        sessionTime: '',
        duration: '60',
        maxParticipants: '50',
        topics: '',
        prerequisites: '',
        isActive: true,
        meetingLink: ''
      });

      alert('Session created successfully!');
      setActiveTab('sessions');
      await fetchSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error creating session');
    } finally {
      setLoading(false);
    }
  };

  const toggleSessionStatus = async (sessionId, currentStatus) => {
    try {
      const sessionRef = doc(db, 'liveSessionForms', sessionId);
      await updateDoc(sessionRef, {
        isActive: !currentStatus,
        updatedAt: Timestamp.now()
      });
      await fetchSessions();
    } catch (error) {
      console.error('Error toggling session status:', error);
    }
  };

  const deleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteDoc(doc(db, 'liveSessionForms', sessionId));
        await fetchSessions();
        alert('Session deleted successfully!');
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('Error deleting session');
      }
    }
  };

  // Export registrations to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Session', 'Level', 'Goals', 'Status', 'Date'];
    const csvData = filteredRegistrations.map(reg => [
      reg.fullName,
      reg.email,
      reg.phone,
      reg.selectedSession,
      reg.studentLevel,
      reg.goals,
      reg.status,
      new Date(reg.registeredAt?.toDate()).toLocaleDateString()
    ]);

    const csv = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-session-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
    const matchesSearch = 
      reg.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.selectedSession?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Statistics
  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    contacted: registrations.filter(r => r.status === 'contacted').length,
    confirmed: registrations.filter(r => r.status === 'confirmed').length,
    activeSessions: sessions.filter(s => s.isActive).length
  };

  if (loading && registrations.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="data-analyst-live-sessions">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <FaVideo size={40} />
          <div>
            <h1>Live Sessions Management</h1>
            <p>Manage registrations and create live session forms</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FaUsers />
          </div>
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Total Registrations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <FaCalendarCheck />
          </div>
          <div className="stat-details">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <FaVideo />
          </div>
          <div className="stat-details">
            <h3>{stats.activeSessions}</h3>
            <p>Active Sessions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <FaUsers />
          </div>
          <div className="stat-details">
            <h3>{stats.confirmed}</h3>
            <p>Confirmed</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={activeTab === 'registrations' ? 'active' : ''}
          onClick={() => setActiveTab('registrations')}
        >
          <FaUsers /> Registrations ({stats.total})
        </button>
        <button 
          className={activeTab === 'sessions' ? 'active' : ''}
          onClick={() => setActiveTab('sessions')}
        >
          <FaVideo /> Sessions ({sessions.length})
        </button>
        <button 
          className={activeTab === 'create' ? 'active' : ''}
          onClick={() => setActiveTab('create')}
        >
          <FaPlus /> Create Session
        </button>
      </div>

      {/* Registrations Tab */}
      {activeTab === 'registrations' && (
        <div className="registrations-section">
          {/* Filters and Search */}
          <div className="controls-bar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, email, or session..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              <button 
                className={filterStatus === 'all' ? 'active' : ''}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button 
                className={filterStatus === 'pending' ? 'active' : ''}
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </button>
              <button 
                className={filterStatus === 'contacted' ? 'active' : ''}
                onClick={() => setFilterStatus('contacted')}
              >
                Contacted
              </button>
              <button 
                className={filterStatus === 'confirmed' ? 'active' : ''}
                onClick={() => setFilterStatus('confirmed')}
              >
                Confirmed
              </button>
            </div>
            <button className="export-btn" onClick={exportToCSV}>
              <FaDownload /> Export CSV
            </button>
          </div>

          {/* Registrations Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Session</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.fullName}</td>
                    <td>{reg.email}</td>
                    <td>{reg.phone}</td>
                    <td className="session-name">{reg.selectedSession}</td>
                    <td>
                      <span className={`badge badge-${reg.studentLevel}`}>
                        {reg.studentLevel}
                      </span>
                    </td>
                    <td>
                      <select
                        value={reg.status || 'pending'}
                        onChange={(e) => updateRegistrationStatus(reg.id, e.target.value)}
                        className={`status-select status-${reg.status || 'pending'}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      {reg.registeredAt ? 
                        new Date(reg.registeredAt.toDate()).toLocaleDateString() : 
                        'N/A'
                      }
                    </td>
                    <td>
                      <button 
                        className="btn-icon"
                        onClick={() => {
                          setSelectedRegistration(reg);
                          setShowModal(true);
                        }}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRegistrations.length === 0 && (
              <div className="empty-state">
                <p>No registrations found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="sessions-section">
          <div className="sessions-grid">
            {sessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <h3>{session.title}</h3>
                  <button 
                    className={`toggle-btn ${session.isActive ? 'active' : ''}`}
                    onClick={() => toggleSessionStatus(session.id, session.isActive)}
                    title={session.isActive ? 'Active' : 'Inactive'}
                  >
                    {session.isActive ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
                <div className="session-body">
                  <p className="session-description">{session.description}</p>
                  <div className="session-meta">
                    <div className="meta-item">
                      <strong>Instructor:</strong> {session.instructor}
                    </div>
                    <div className="meta-item">
                      <strong>Date:</strong> {session.sessionDate}
                    </div>
                    <div className="meta-item">
                      <strong>Time:</strong> {session.sessionTime}
                    </div>
                    <div className="meta-item">
                      <strong>Duration:</strong> {session.duration} minutes
                    </div>
                    <div className="meta-item">
                      <strong>Max Participants:</strong> {session.maxParticipants}
                    </div>
                  </div>
                  {session.topics && (
                    <div className="session-topics">
                      <strong>Topics:</strong>
                      <p>{session.topics}</p>
                    </div>
                  )}
                </div>
                <div className="session-actions">
                  <button 
                    className="btn-delete"
                    onClick={() => deleteSession(session.id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {sessions.length === 0 && (
            <div className="empty-state">
              <FaVideo size={64} />
              <p>No sessions created yet</p>
              <button 
                className="btn-primary"
                onClick={() => setActiveTab('create')}
              >
                Create Your First Session
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Session Tab */}
      {activeTab === 'create' && (
        <div className="create-session-section">
          <div className="form-container">
            <h2>Create New Live Session</h2>
            <form onSubmit={handleCreateSession}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Session Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={sessionForm.title}
                    onChange={handleSessionFormChange}
                    required
                    placeholder="e.g., Introduction to React Hooks"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="instructor">Instructor Name *</label>
                  <input
                    type="text"
                    id="instructor"
                    name="instructor"
                    value={sessionForm.instructor}
                    onChange={handleSessionFormChange}
                    required
                    placeholder="Enter instructor name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sessionDate">Session Date *</label>
                  <input
                    type="date"
                    id="sessionDate"
                    name="sessionDate"
                    value={sessionForm.sessionDate}
                    onChange={handleSessionFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sessionTime">Session Time *</label>
                  <input
                    type="time"
                    id="sessionTime"
                    name="sessionTime"
                    value={sessionForm.sessionTime}
                    onChange={handleSessionFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes) *</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={sessionForm.duration}
                    onChange={handleSessionFormChange}
                    required
                    min="30"
                    max="180"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maxParticipants">Max Participants *</label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={sessionForm.maxParticipants}
                    onChange={handleSessionFormChange}
                    required
                    min="10"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={sessionForm.description}
                    onChange={handleSessionFormChange}
                    required
                    rows="4"
                    placeholder="Describe what students will learn in this session..."
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="instructorBio">Instructor Bio</label>
                  <textarea
                    id="instructorBio"
                    name="instructorBio"
                    value={sessionForm.instructorBio}
                    onChange={handleSessionFormChange}
                    rows="3"
                    placeholder="Brief bio about the instructor..."
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="topics">Topics Covered</label>
                  <textarea
                    id="topics"
                    name="topics"
                    value={sessionForm.topics}
                    onChange={handleSessionFormChange}
                    rows="3"
                    placeholder="List the main topics that will be covered..."
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="prerequisites">Prerequisites</label>
                  <textarea
                    id="prerequisites"
                    name="prerequisites"
                    value={sessionForm.prerequisites}
                    onChange={handleSessionFormChange}
                    rows="2"
                    placeholder="Any prerequisites for students..."
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="meetingLink">Meeting Link</label>
                  <input
                    type="url"
                    id="meetingLink"
                    name="meetingLink"
                    value={sessionForm.meetingLink}
                    onChange={handleSessionFormChange}
                    placeholder="Zoom/Google Meet link (optional)"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={sessionForm.isActive}
                      onChange={handleSessionFormChange}
                    />
                    <span>Active (visible to students)</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setActiveTab('sessions')}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Details Modal */}
      {showModal && selectedRegistration && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registration Details</h2>
              <button onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <label>Full Name:</label>
                <p>{selectedRegistration.fullName}</p>
              </div>
              <div className="detail-group">
                <label>Email:</label>
                <p>{selectedRegistration.email}</p>
              </div>
              <div className="detail-group">
                <label>Phone:</label>
                <p>{selectedRegistration.phone}</p>
              </div>
              <div className="detail-group">
                <label>Selected Session:</label>
                <p>{selectedRegistration.selectedSession}</p>
              </div>
              <div className="detail-group">
                <label>Student Level:</label>
                <p>{selectedRegistration.studentLevel}</p>
              </div>
              <div className="detail-group">
                <label>Preferred Time:</label>
                <p>{selectedRegistration.preferredTime || 'Not specified'}</p>
              </div>
              <div className="detail-group">
                <label>Learning Goals:</label>
                <p>{selectedRegistration.goals}</p>
              </div>
              {selectedRegistration.additionalNotes && (
                <div className="detail-group">
                  <label>Additional Notes:</label>
                  <p>{selectedRegistration.additionalNotes}</p>
                </div>
              )}
              <div className="detail-group">
                <label>Registration Date:</label>
                <p>
                  {selectedRegistration.registeredAt ? 
                    new Date(selectedRegistration.registeredAt.toDate()).toLocaleString() : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalystLiveSessions;
