const express = require('express');
const router = express.Router();
const LiveSession = require('../models/LiveSession');
const SessionParticipant = require('../models/SessionParticipant');
const { verifyAuth } = require('../middleware/auth');
const upload = require('../middleware/multer');

// Get all live sessions (Public)
router.get('/', async (req, res) => {
  try {
    const sessions = await LiveSession.find({}).sort({ startTime: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join live session
router.post('/join', verifyAuth, async (req, res) => {
  try {
    const { sessionId, userId, userName } = req.body;
    
    const participant = new SessionParticipant({
      sessionId,
      userId,
      userName,
      email: req.user.email,
      joinTime: new Date(),
    });
    
    await participant.save();
    
    // Update participant count
    await LiveSession.findByIdAndUpdate(
      sessionId,
      { $inc: { participants: 1 } }
    );
    
    res.json({ success: true, message: 'Joined session' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADMIN ROUTES

// Get all sessions (Admin)
router.get('/admin/all', verifyAuth, async (req, res) => {
  try {
    const sessions = await LiveSession.find({}).sort({ startTime: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create live session (Admin)
router.post('/admin/create', verifyAuth, upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, description, instructor, videoUrl, startTime, isLive } = req.body;
    
    const session = new LiveSession({
      title,
      description,
      instructor,
      videoUrl,
      startTime: new Date(startTime),
      thumbnail: req.file ? req.file.path : null,
      isLive: isLive === 'true',
      participants: 0,
      createdAt: new Date(),
    });
    
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update live session (Admin)
router.put('/admin/:id', verifyAuth, async (req, res) => {
  try {
    const { isLive } = req.body;
    const session = await LiveSession.findByIdAndUpdate(
      req.params.id,
      { isLive },
      { new: true }
    );
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete live session (Admin)
router.delete('/admin/:id', verifyAuth, async (req, res) => {
  try {
    await LiveSession.findByIdAndDelete(req.params.id);
    await SessionParticipant.deleteMany({ sessionId: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DATA ANALYST ROUTES

// Get analytics data
router.get('/analytics', verifyAuth, async (req, res) => {
  try {
    const sessions = await LiveSession.find({});
    const analyticsData = await Promise.all(
      sessions.map(async (session) => {
        const participants = await SessionParticipant.find({ sessionId: session._id });
        const avgWatchTime = participants.length > 0
          ? participants.reduce((sum, p) => sum + (p.watchDuration || 0), 0) / participants.length
          : 0;
        
        return {
          ...session.toObject(),
          participants: participants.length,
          avgWatchTime: Math.round(avgWatchTime),
        };
      })
    );
    res.json(analyticsData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get session participants
router.get('/analytics/:sessionId/participants', verifyAuth, async (req, res) => {
  try {
    const participants = await SessionParticipant.find({ 
      sessionId: req.params.sessionId 
    });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export session data to CSV
router.get('/analytics/:sessionId/export-csv', verifyAuth, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.sessionId);
    const participants = await SessionParticipant.find({ 
      sessionId: req.params.sessionId 
    });
    
    let csv = 'Participant Name,Email,Join Time,Watch Duration (mins)\n';
    participants.forEach(p => {
      csv += `"${p.userName}","${p.email}","${new Date(p.joinTime).toLocaleString()}","${p.watchDuration || 0}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="session-${req.params.sessionId}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
