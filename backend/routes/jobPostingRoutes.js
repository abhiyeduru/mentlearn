const express = require('express');
const router = express.Router();
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

// @route   POST /api/jobs
// @desc    Create new job posting
// @access  Private (Partner)
router.post('/', verifyPartner, async (req, res) => {
    try {
        // Get partner info
        const partner = await HiringPartner.findOne({ uid: req.partnerUid });
        if (!partner) {
            return res.status(404).json({ error: 'Partner profile not found' });
        }

        // Check if partner is approved
        if (partner.verificationStatus !== 'approved') {
            return res.status(403).json({
                error: 'Your account must be approved before posting jobs',
                verificationStatus: partner.verificationStatus
            });
        }

        const {
            title,
            description,
            jobType,
            category,
            skillsRequired,
            experienceLevel,
            educationRequired,
            minQualifications,
            compensationType,
            salaryRange,
            location,
            workMode,
            applicationDeadline,
            numberOfOpenings,
            responsibilities,
            benefits,
            status,
            visibility
        } = req.body;

        // Create job posting
        const newJob = new JobPosting({
            partnerId: partner._id,
            partnerUid: req.partnerUid,
            companyName: partner.companyName,
            title,
            description,
            jobType,
            category,
            skillsRequired: skillsRequired || [],
            experienceLevel,
            educationRequired,
            minQualifications,
            compensationType,
            salaryRange,
            location,
            workMode,
            applicationDeadline,
            numberOfOpenings,
            responsibilities: responsibilities || [],
            benefits: benefits || [],
            status: status || 'draft',
            visibility: visibility || 'public'
        });

        await newJob.save();

        // Update partner stats if publishing
        if (status === 'active') {
            await partner.incrementJobCount();
            newJob.publishedAt = new Date();
            await newJob.save();
        }

        res.status(201).json({
            message: 'Job posting created successfully',
            job: newJob
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Failed to create job posting' });
    }
});

// @route   GET /api/jobs
// @desc    Get job postings (with filters)
// @access  Public/Private
router.get('/', async (req, res) => {
    try {
        const {
            partnerId,
            partnerUid,
            status,
            jobType,
            category,
            skills,
            experienceLevel,
            workMode,
            search,
            page = 1,
            limit = 20
        } = req.query;

        // Build query
        let query = {};

        if (partnerId) query.partnerId = partnerId;
        if (partnerUid) {
            const partner = await HiringPartner.findOne({ uid: partnerUid });
            if (partner) query.partnerId = partner._id;
        }
        if (status) query.status = status;
        if (jobType) query.jobType = jobType;
        if (category) query.category = category;
        if (experienceLevel) query.experienceLevel = experienceLevel;
        if (workMode) query.workMode = workMode;
        if (skills) {
            const skillsArray = skills.split(',');
            query.skillsRequired = { $in: skillsArray };
        }

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const jobs = await JobPosting.find(query)
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('partnerId', 'companyName companyLogo website');

        const total = await JobPosting.countDocuments(query);

        res.json({
            jobs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// @route   GET /api/jobs/:id
// @desc    Get specific job posting
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const job = await JobPosting.findById(req.params.id)
            .populate('partnerId', 'companyName companyLogo website description industry location');

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Increment view count
        await job.incrementViews();

        res.json({ job });
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private (Partner - owner only)
router.put('/:id', verifyPartner, async (req, res) => {
    try {
        const job = await JobPosting.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Verify ownership
        if (job.partnerUid !== req.partnerUid) {
            return res.status(403).json({ error: 'Not authorized to edit this job' });
        }

        // Update fields
        const allowedUpdates = [
            'title', 'description', 'jobType', 'category', 'skillsRequired',
            'experienceLevel', 'educationRequired', 'minQualifications',
            'compensationType', 'salaryRange', 'location', 'workMode',
            'applicationDeadline', 'numberOfOpenings', 'responsibilities',
            'benefits', 'visibility'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                job[field] = req.body[field];
            }
        });

        job.updatedAt = new Date();
        await job.save();

        res.json({
            message: 'Job updated successfully',
            job
        });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job posting
// @access  Private (Partner - owner only)
router.delete('/:id', verifyPartner, async (req, res) => {
    try {
        const job = await JobPosting.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Verify ownership
        if (job.partnerUid !== req.partnerUid) {
            return res.status(403).json({ error: 'Not authorized to delete this job' });
        }

        // Only allow deletion of draft jobs
        if (job.status !== 'draft') {
            return res.status(400).json({
                error: 'Only draft jobs can be deleted. Close active jobs instead.'
            });
        }

        await JobPosting.findByIdAndDelete(req.params.id);

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

// @route   PATCH /api/jobs/:id/status
// @desc    Update job status (publish, close, etc.)
// @access  Private (Partner - owner only)
router.patch('/:id/status', verifyPartner, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['draft', 'active', 'closed', 'filled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const job = await JobPosting.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Verify ownership
        if (job.partnerUid !== req.partnerUid) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const oldStatus = job.status;
        job.status = status;

        // Handle status-specific updates
        if (status === 'active' && oldStatus === 'draft') {
            job.publishedAt = new Date();
            // Increment partner's active jobs count
            const partner = await HiringPartner.findOne({ uid: req.partnerUid });
            if (partner) {
                await partner.incrementJobCount();
            }
        } else if (status === 'closed' && oldStatus === 'active') {
            job.closedAt = new Date();
            // Decrement partner's active jobs count
            const partner = await HiringPartner.findOne({ uid: req.partnerUid });
            if (partner) {
                await partner.decrementActiveJobs();
            }
        }

        await job.save();

        res.json({
            message: `Job ${status} successfully`,
            job
        });
    } catch (error) {
        console.error('Error updating job status:', error);
        res.status(500).json({ error: 'Failed to update job status' });
    }
});

// @route   GET /api/jobs/partner/my-jobs
// @desc    Get all jobs posted by current partner
// @access  Private (Partner)
router.get('/partner/my-jobs', verifyPartner, async (req, res) => {
    try {
        const partner = await HiringPartner.findOne({ uid: req.partnerUid });
        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        const jobs = await JobPosting.find({ partnerId: partner._id })
            .sort({ createdAt: -1 });

        res.json({ jobs, count: jobs.length });
    } catch (error) {
        console.error('Error fetching partner jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// @route   GET /api/jobs/public/active
// @desc    Get all active public jobs (for student job board)
// @access  Public
router.get('/public/active', async (req, res) => {
    try {
        const {
            jobType,
            skills,
            experienceLevel,
            workMode,
            search,
            page = 1,
            limit = 20
        } = req.query;

        let query = {
            status: 'active',
            visibility: 'public'
        };

        if (jobType) query.jobType = jobType;
        if (experienceLevel) query.experienceLevel = experienceLevel;
        if (workMode) query.workMode = workMode;
        if (skills) {
            const skillsArray = skills.split(',');
            query.skillsRequired = { $in: skillsArray };
        }
        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const jobs = await JobPosting.find(query)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('partnerId', 'companyName companyLogo website industry');

        const total = await JobPosting.countDocuments(query);

        res.json({
            jobs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching active jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

module.exports = router;
