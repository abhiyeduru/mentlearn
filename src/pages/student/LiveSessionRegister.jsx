import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import '../../styles/LiveSessionRegister.css';
import { FaVideo, FaUserGraduate, FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';

const LiveSessionRegister = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [availableSessions, setAvailableSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    selectedSession: '',
    studentLevel: '',
    goals: '',
    preferredTime: '',
    additionalNotes: ''
  });

  useEffect(() => {
    fetchAvailableSessions();
  }, []);

  const fetchAvailableSessions = async () => {
    try {
      const sessionsRef = collection(db, 'liveSessionForms');
      const q = query(sessionsRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableSessions(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save registration to Firebase
      await addDoc(collection(db, 'liveSessionRegistrations'), {
        ...formData,
        userId: currentUser?.uid || null,
        status: 'pending',
        registeredAt: Timestamp.now(),
        createdAt: new Date().toISOString()
      });

      setSubmitted(true);
      
      // Reset form after 3 seconds and show another registration option
      setTimeout(() => {
        setFormData({
          fullName: currentUser?.displayName || '',
          email: currentUser?.email || '',
          phone: '',
          selectedSession: '',
          studentLevel: '',
          goals: '',
          preferredTime: '',
          additionalNotes: ''
        });
        setSubmitted(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('Error submitting registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="live-session-register-page">
        <div className="success-message">
          <div className="success-icon">
            <FaCheckCircle size={64} />
          </div>
          <h2>Registration Successful! 🎉</h2>
          <p>Thank you for registering! Our team will contact you soon with session details.</p>
          <div className="success-actions">
            <button onClick={() => navigate('/student/dashboard')} className="btn-primary">
              Go to Dashboard
            </button>
            <button onClick={() => setSubmitted(false)} className="btn-secondary">
              Register for Another Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-session-register-page">
      {/* Header */}
      <div className="register-header">
        <div className="header-content">
          <FaVideo className="header-icon" size={48} />
          <h1>Register for Live Sessions</h1>
          <p className="subtitle">Join interactive live classes with expert instructors</p>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <div className="benefit-card">
          <FaUserGraduate size={32} />
          <h3>Expert Instructors</h3>
          <p>Learn from industry professionals</p>
        </div>
        <div className="benefit-card">
          <FaCalendarAlt size={32} />
          <h3>Flexible Schedule</h3>
          <p>Choose sessions that fit your time</p>
        </div>
        <div className="benefit-card">
          <FaClock size={32} />
          <h3>Real-time Learning</h3>
          <p>Interactive Q&A sessions</p>
        </div>
      </div>

      {/* Available Sessions Display */}
      {availableSessions.length > 0 && (
        <div className="available-sessions-section">
          <h2 style={{textAlign: 'center', marginBottom: '30px', color: '#fff'}}>
            Available Live Sessions
          </h2>
          <div className="sessions-grid">
            {availableSessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <h3>{session.title}</h3>
                  <span className="session-badge">Active</span>
                </div>
                <div className="session-details">
                  <p><strong>Instructor:</strong> {session.instructor}</p>
                  <p><strong>Date:</strong> {session.sessionDate}</p>
                  <p><strong>Time:</strong> {session.sessionTime}</p>
                  <p><strong>Duration:</strong> {session.duration} minutes</p>
                  <p><strong>Max Participants:</strong> {session.maxParticipants}</p>
                  {session.description && (
                    <p className="session-description">{session.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div className="registration-form-container">
        <form onSubmit={handleSubmit} className="registration-form">
          <h2>Registration Details</h2>

          {/* Personal Information */}
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Session Selection */}
          <div className="form-section">
            <h3>Session Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="selectedSession">Select Session *</label>
                <select
                  id="selectedSession"
                  name="selectedSession"
                  value={formData.selectedSession}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Choose a session --</option>
                  {availableSessions.length === 0 && (
                    <option value="" disabled>No active sessions available</option>
                  )}
                  {availableSessions.map(session => (
                    <option key={session.id} value={session.title}>
                      {session.title} - {session.instructor} ({session.sessionDate} at {session.sessionTime})
                    </option>
                  ))}
                </select>
                {availableSessions.length === 0 && (
                  <p style={{color: '#ff6b6b', fontSize: '12px', marginTop: '8px'}}>
                    No sessions available at the moment. Please check back later.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="studentLevel">Your Current Level *</label>
                <select
                  id="studentLevel"
                  name="studentLevel"
                  value={formData.studentLevel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select your level --</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="preferredTime">Preferred Time Slot</label>
                <select
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select time --</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="evening">Evening (5 PM - 9 PM)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>
          </div>

          {/* Learning Goals */}
          <div className="form-section">
            <h3>Your Learning Goals</h3>
            <div className="form-group full-width">
              <label htmlFor="goals">What do you hope to achieve? *</label>
              <textarea
                id="goals"
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Tell us about your learning goals and what you hope to achieve from this session..."
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="additionalNotes">Additional Notes or Questions</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any specific topics you'd like to cover or questions you have..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Submitting...
                </>
              ) : (
                'Register Now'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LiveSessionRegister;
