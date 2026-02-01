import React, { useState, useEffect } from 'react';
import '../styles/AdminLiveSessions.css';

const AdminLiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    videoUrl: '',
    thumbnail: null,
    startTime: '',
    isLive: false,
  });
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/live-sessions');
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('instructor', formData.instructor);
    formDataToSend.append('videoUrl', formData.videoUrl);
    formDataToSend.append('startTime', formData.startTime);
    formDataToSend.append('isLive', formData.isLive);
    if (formData.thumbnail) {
      formDataToSend.append('thumbnail', formData.thumbnail);
    }

    try {
      const response = await fetch('/api/admin/live-sessions', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
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
        setShowForm(false);
        fetchSessions();
      }
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await fetch(`/api/admin/live-sessions/${sessionId}`, {
          method: 'DELETE',
        });
        fetchSessions();
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleToggleLive = async (sessionId, isLive) => {
    try {
      await fetch(`/api/admin/live-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLive: !isLive }),
      });
      fetchSessions();
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  return (
    <div className="admin-live-sessions">
      <div className="header">
        <h1>📹 Live Sessions Management</h1>
        <button 
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add New Session'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Session Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Instructor Name *</label>
                <input
                  type="text"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-row">
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
              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
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

            <div className="form-group checkbox">
              <input
                type="checkbox"
                name="isLive"
                checked={formData.isLive}
                onChange={handleInputChange}
              />
              <label>Mark as Live</label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </form>
        </div>
      )}

      <div className="sessions-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Instructor</th>
              <th>Start Time</th>
              <th>Status</th>
              <th>Participants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr key={session._id}>
                <td>{session.title}</td>
                <td>{session.instructor}</td>
                <td>{new Date(session.startTime).toLocaleString()}</td>
                <td>
                  <span className={`status ${session.isLive ? 'live' : 'scheduled'}`}>
                    {session.isLive ? '🔴 Live' : '⏰ Scheduled'}
                  </span>
                </td>
                <td>{session.participants || 0}</td>
                <td className="actions">
                  <button 
                    className="toggle-btn"
                    onClick={() => handleToggleLive(session._id, session.isLive)}
                    title="Toggle Live Status"
                  >
                    {session.isLive ? 'End' : 'Start'}
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(session._id)}
                    title="Delete Session"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLiveSessions;
