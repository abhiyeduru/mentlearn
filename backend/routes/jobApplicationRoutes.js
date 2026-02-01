const express = require('express');
const router = express.Router();
const JobApplication = require('../models/JobApplication');
const JobPosting = require('../models/JobPosting');
const HiringPartner = require('../models/HiringPartner');
const { db } = require('../src/firebase-admin');

// Middleware to verify hiring partner
const verifyPartner = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'hiring_partner') {
            return res.status(403).json({ error: 'Access denied' });
        }

        req.partnerUid = decodedToken.uid;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware to verify student
const verifyStudent = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.studentUid = decodedToken.uid;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// @route   POST /api/applications
// @desc    Create new application (student applies to job)
// @access  Private (Student)
router.post('/', verifyStudent, async (req, res) => {
    try {
        const { jobId, coverLetter } = req.body;

        // Check if job exists and is active
        const job = await JobPosting.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        if (job.status !== 'active') {
            return res.status(400).json({ error: 'This job is no longer accepting applications' });
        }

        // Check for duplicate application
        const isDuplicate = await JobApplication.checkDuplicateApplication(req.studentUid, jobId);
        if (isDuplicate) {
            return res.status(400).json({ error: 'You have already applied to this job' });
        }

        // Get student data from Firebase
        const studentDoc = await db.collection('users').doc(req.studentUid).get();
        if (!studentDoc.exists) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        const studentData = studentDoc.data();

        // Get additional student info (skills, projects, certificates)
        // This would come from your student profile collection
        const studentProfile = {
            name: studentData.name || studentData.firstName + ' ' + studentData.lastName,
            email: studentData.email,
            phone: studentData.phone || '',
            avatar: studentData.avatar || studentData.profilePicture || '',
            resumeUrl: studentData.resumeUrl || '',
            portfolioUrl: studentData.portfolioUrl || '',
            linkedinUrl: studentData.linkedinUrl || '',
            githubUrl: studentData.githubUrl || ''
        };

        // Create application
        const newApplication = new JobApplication({
            jobId,
            partnerId: job.partnerId,
            studentUid: req.studentUid,
            studentInfo: studentProfile,
            coverLetter: coverLetter || '',
            skills: studentData.skills || [],
            education: studentData.education || [],
            experience: studentData.experience || { years: 0, positions: [] },
            projects: studentData.projects || [],
            certificates: studentData.certificates || [],
            aiSkillScores: studentData.aiSkillScores || {},
            status: 'applied',
            statusHistory: [{
                status: 'applied',
                changedBy: req.studentUid,
                changedAt: new Date(),
                notes: 'Application submitted'
            }]
        });

        await newApplication.save();

        // Update job stats
        await job.incrementApplications();

        // Update partner stats
        const partner = await HiringPartner.findById(job.partnerId);
        if (partner) {
            await partner.incrementApplicationCount();
        }

        res.status(201).json({
            message: 'Application submitted successfully',
            application: newApplication
        });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// @route   GET /api/applications
// @desc    Get applications (filtered by role)
// @access  Private
router.get('/', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userRole = userDoc.data().role;
        const { jobId, status, page = 1, limit = 20 } = req.query;

        let query = {};

        // Filter based on role
        if (userRole === 'hiring_partner') {
            const partner = await HiringPartner.findOne({ uid: decodedToken.uid });
            if (!partner) {
                return res.status(404).json({ error: 'Partner not found' });
            }
            query.partnerId = partner._id;
        } else if (userRole === 'student') {
            query.studentUid = decodedToken.uid;
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (jobId) query.jobId = jobId;
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const applications = await JobApplication.find(query)
            .sort({ appliedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('jobId', 'title companyName jobType location workMode salaryRange');

        const total = await JobApplication.countDocuments(query);

        res.json({
            applications,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// @route   GET /api/applications/:id
// @desc    Get specific application
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.id)
            .populate('jobId')
            .populate('partnerId', 'companyName companyLogo website');

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // TODO: Add authorization check (partner or student who owns this application)

        res.json({ application });
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// @route   PATCH /api/applications/:id/status
// @desc    Update application status
// @access  Private (Partner only)
router.patch('/:id/status', verifyPartner, async (req, res) => {
    try {
        const { status, notes } = req.body;

        const validStatuses = ['applied', 'reviewed', 'shortlisted', 'interview-scheduled', 'selected', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const application = await JobApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Verify partner owns this application
        const partner = await HiringPartner.findOne({ uid: req.partnerUid });
        if (!partner || application.partnerId.toString() !== partner._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update status
        await application.updateStatus(status, req.partnerUid, notes || '');

        // Update job stats if shortlisted or selected
        if (status === 'shortlisted') {
            const job = await JobPosting.findById(application.jobId);
            if (job) await job.incrementShortlisted();
        } else if (status === 'selected') {
            const job = await JobPosting.findById(application.jobId);
            if (job) await job.incrementSelected();
            await partner.incrementHireCount();
        }

        res.json({
            message: 'Application status updated successfully',
            application
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

// @route   POST /api/applications/bulk-update
// @desc    Bulk update application statuses
// @access  Private (Partner only)
router.post('/bulk-update', verifyPartner, async (req, res) => {
    try {
        const { applicationIds, status, notes } = req.body;

        if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({ error: 'Invalid application IDs' });
        }

        const validStatuses = ['reviewed', 'shortlisted', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status for bulk update' });
        }

        const partner = await HiringPartner.findOne({ uid: req.partnerUid });
        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        // Update all applications
        const updatePromises = applicationIds.map(async (appId) => {
            const application = await JobApplication.findById(appId);
            if (application && application.partnerId.toString() === partner._id.toString()) {
                return application.updateStatus(status, req.partnerUid, notes || '');
            }
        });

        await Promise.all(updatePromises);

        res.json({
            message: `${applicationIds.length} applications updated successfully`,
            updatedCount: applicationIds.length
        });
    } catch (error) {
        console.error('Error bulk updating applications:', error);
        res.status(500).json({ error: 'Failed to bulk update applications' });
    }
});

// @route   POST /api/applications/:id/note
// @desc    Add note to application
// @access  Private (Partner only)
router.post('/:id/note', verifyPartner, async (req, res) => {
    try {
        const { note } = req.body;

        if (!note || note.trim() === '') {
            return res.status(400).json({ error: 'Note cannot be empty' });
        }

        const application = await JobApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Verify ownership
        const partner = await HiringPartner.findOne({ uid: req.partnerUid });
        if (!partner || application.partnerId.toString() !== partner._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await application.addNote(note, req.partnerUid);

        res.json({
            message: 'Note added successfully',
            application
        });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
});

// @route   PATCH /api/applications/:id/rating
// @desc    Rate application
// @access  Private (Partner only)
router.patch('/:id/rating', verifyPartner, async (req, res) => {
    try {
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const application = await JobApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Verify ownership
        const partner = await HiringPartner.findOne({ uid: req.partnerUid });
        if (!partner || application.partnerId.toString() !== partner._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        application.partnerRating = rating;
        await application.save();

        res.json({
            message: 'Rating updated successfully',
            application
        });
    } catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ error: 'Failed to update rating' });
    }
});

// @route   POST /api/applications/:id/schedule-interview
// @desc    Schedule interview for application
// @access  Private (Partner only)
router.post('/:id/schedule-interview', verifyPartner, async (req, res) => {
    try {
        const { scheduledAt, mode, meetingLink, notes } = req.body;

        const application = await JobApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Verify ownership
        const partner = await HiringPartner.findOne({ uid: req.partnerUid });
        if (!partner || application.partnerId.toString() !== partner._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await application.scheduleInterview({
            scheduledAt: new Date(scheduledAt),
            mode,
            meetingLink,
            notes,
            changedBy: req.partnerUid
        });

        res.json({
            message: 'Interview scheduled successfully',
            application
        });
    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({ error: 'Failed to schedule interview' });
    }
});

// @route   GET /api/applications/:id/timeline
// @desc    Get application status timeline
// @access  Private
router.get('/:id/timeline', async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.id)
            .select('statusHistory');

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ timeline: application.statusHistory });
    } catch (error) {
        console.error('Error fetching timeline:', error);
        res.status(500).json({ error: 'Failed to fetch timeline' });
    }
});

module.exports = router;
