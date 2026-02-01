const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// Aggressive anti-hacker messages
const HACKER_MESSAGES = [
  '🖕 FUCK OFF HACKER! Your IP has been logged.',
  '⚠️ NICE TRY ASSHOLE! Security team notified.',
  '🚨 FUCK YOU! This attempt has been reported to authorities.',
  '💀 GET LOST MOTHERFUCKER! Your ass is getting tracked.',
  '⛔ FUCK OFF SCRIPT KIDDIE! You\'re not smart enough.',
  '🔥 STOP TRYING DICKHEAD! We see everything you do.',
  '⚡ FUCK YOU HACKER! This is protected, go away.',
  '🛑 NICE TRY DUMBASS! Better luck next time (never).'
];

// Get random fuck-off message
function getFuckOffMessage() {
  return HACKER_MESSAGES[Math.floor(Math.random() * HACKER_MESSAGES.length)];
}

// Payment-specific rate limiter
const paymentRateLimiter = rateLimit({
  windowMs: parseInt(process.env.PAYMENT_RATE_LIMIT_WINDOW) || 60000, // 1 minute
  max: parseInt(process.env.PAYMENT_RATE_LIMIT_MAX_REQUESTS) || 5, // 5 requests per window
  message: {
    error: getFuckOffMessage(),
    details: 'Too many payment requests detected. Your activity looks suspicious.',
    retryAfter: '60 seconds',
    blocked: true
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis for distributed rate limiting (optional but recommended for production)
  // store: new RedisStore({
  //   client: redisClient,
  //   prefix: 'payment_rl:'
  // }),
  skip: (req) => {
    // Skip rate limiting for admin users (optional)
    return req.user?.role === 'admin';
  },
  keyGenerator: (req) => {
    // Rate limit by user ID and IP
    const userId = req.securePayload?.userId || 'anonymous';
    return `${userId}-${req.ip}`;
  }
});

// Suspicious activity detector
const suspiciousActivityTracker = new Map();

function detectSuspiciousActivity(req, res, next) {
  const userId = req.securePayload?.userId || req.ip;
  const now = Date.now();
  
  if (!suspiciousActivityTracker.has(userId)) {
    suspiciousActivityTracker.set(userId, []);
  }
  
  const activities = suspiciousActivityTracker.get(userId);
  
  // Remove old activities (older than 5 minutes)
  const recentActivities = activities.filter(time => now - time < 300000);
  
  recentActivities.push(now);
  suspiciousActivityTracker.set(userId, recentActivities);
  
  // Check for suspicious patterns
  if (recentActivities.length > 10) {
    console.warn(`⚠️ SUSPICIOUS ACTIVITY DETECTED for user ${userId}`);
    console.warn(`   ${recentActivities.length} payment attempts in 5 minutes`);
    console.warn(`   IP: ${req.ip}`);
    console.warn(`   🚨 POSSIBLE HACKER DETECTED - BLOCKING REQUEST`);
    
    // Log to security monitoring system
    // await logSecurityEvent({
    //   type: 'SUSPICIOUS_PAYMENT_ACTIVITY',
    //   userId,
    //   ip: req.ip,
    //   attempts: recentActivities.length
    // });
    
    return res.status(429).json({
      error: getFuckOffMessage(),
      message: 'Suspicious activity detected. Your IP and user account have been flagged.',
      details: `${recentActivities.length} attempts in 5 minutes - this looks like an attack.`,
      contact: 'If you believe this is an error, contact: support@mentlearn.com',
      blocked: true,
      attackDetected: true
    });
  }
  
  next();
}

// Cleanup old entries every 10 minutes
setInterval(() => {
  const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
  for (const [userId, activities] of suspiciousActivityTracker.entries()) {
    const recentActivities = activities.filter(time => time > tenMinutesAgo);
    if (recentActivities.length === 0) {
      suspiciousActivityTracker.delete(userId);
    } else {
      suspiciousActivityTracker.set(userId, recentActivities);
    }
  }
}, 10 * 60 * 1000);

module.exports = {
  paymentRateLimiter,
  detectSuspiciousActivity,
  getFuckOffMessage
};
