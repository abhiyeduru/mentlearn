const mongoose = require('mongoose');

const sessionParticipantSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveSession',
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  joinTime: {
    type: Date,
    default: Date.now,
  },
  watchDuration: {
    type: Number, // in minutes
    default: 0,
  },
});

module.exports = mongoose.model('SessionParticipant', sessionParticipantSchema);
