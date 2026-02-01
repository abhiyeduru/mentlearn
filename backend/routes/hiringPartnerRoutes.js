const express = require('express');
const router = express.Router();
const { admin, db } = require('../src/firebase-admin');

// Firestore collections
const partnersCollection = db.collection('hiringPartners');
const jobsCollection = db.collection('jobPostings');
const applicationsCollection = db.collection('jobApplications');

// Middleware to verify hiring partner authentication
const verifyPartner = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Check if user has hiring_partner role
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'hiring_partner') {
            return res.status(403).json({ error: 'Access denied. Hiring partner role required.' });
        }

        req.partnerUid = decodedToken.uid;
        req.partnerEmail = decodedToken.email;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// @route   POST /api/hiring-partners/register
// @desc    Register a new hiring partner
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const {
            uid,
            email,
            companyName,
            website,
            industry,
            companySize,
            location,
            description,
            contactPerson
        } = req.body;

        // Check if partner already exists
        const existingPartner = await partnersCollection.doc(uid).get();
        if (existingPartner.exists) {
            return res.status(400).json({ error: 'Partner already registered' });
        }

        // Create new hiring partner document
        const partnerData = {
            uid,
            email,
            companyName,
            website,
            industry,
            companySize,
            location: location || {},
            description: description || '',
            contactPerson: contactPerson || {},
            verificationStatus: 'pending',
            subscriptionPlan: 'free',
            subscriptionStatus: 'active',
            isActive: true,
            stats: {
                totalJobsPosted: 0,
                activeJobs: 0,
                totalApplications: 0,
                totalHires: 0
            },
            settings: {
                emailNotifications: true,
                autoReplyEnabled: false
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await partnersCollection.doc(uid).set(partnerData);

        // Also update user document with hiring_partner role
        await db.collection('users').doc(uid).set({
            uid,
            email,
            role: 'hiring_partner',
            companyName,
            verificationStatus: 'pending',
            createdAt: new Date().toISOString(),
            onboardingComplete: false
        }, { merge: true });

        // Create notification for admins
        await db.collection('notifications').add({
            type: 'new_partner_registration',
            title: 'New Hiring Partner Registration',
            message: `${companyName} has registered and is awaiting approval`,
            partnerId: uid,
            partnerName: companyName,
            partnerEmail: email,
            read: false,
            createdAt: new Date().toISOString(),
            targetRole: 'admin',
            actionUrl: `/admin/partner-accounts`
        });


        res.status(201).json({
            message: 'Registration successful. Awaiting admin approval.',
            partner: {
                uid,
                companyName,
                verificationStatus: 'pending'
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// @route   GET /api/hiring-partners/profile
// @desc    Get partner profile
// @access  Private (Partner)
router.get('/profile', verifyPartner, async (req, res) => {
    try {
        const partnerDoc = await partnersCollection.doc(req.partnerUid).get();
        if (!partnerDoc.exists) {
            return res.status(404).json({ error: 'Partner profile not found' });
        }

        res.json({ partner: { id: partnerDoc.id, ...partnerDoc.data() } });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// @route   PUT /api/hiring-partners/profile
// @desc    Update partner profile
// @access  Private (Partner)
router.put('/profile', verifyPartner, async (req, res) => {
    try {
        const updates = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        // Remove fields that shouldn't be updated directly
        delete updates.uid;
        delete updates.email;
        delete updates.verificationStatus;
        delete updates.stats;
        delete updates.createdAt;

        await partnersCollection.doc(req.partnerUid).update(updates);

        const updatedDoc = await partnersCollection.doc(req.partnerUid).get();
        res.json({
            message: 'Profile updated successfully',
            partner: { id: updatedDoc.id, ...updatedDoc.data() }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// @route   GET /api/hiring-partners/stats
// @desc    Get partner dashboard statistics
// @access  Private (Partner)
router.get('/stats', verifyPartner, async (req, res) => {
    try {
        const partnerDoc = await partnersCollection.doc(req.partnerUid).get();
        if (!partnerDoc.exists) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        const data = partnerDoc.data();
        res.json({
            stats: data.stats || {},
            verificationStatus: data.verificationStatus,
            subscriptionPlan: data.subscriptionPlan,
            subscriptionStatus: data.subscriptionStatus
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// @route   GET /api/hiring-partners/verification-status
// @desc    Check partner verification status
// @access  Private (Partner)
router.get('/verification-status', verifyPartner, async (req, res) => {
    try {
        const partnerDoc = await partnersCollection.doc(req.partnerUid).get();
        if (!partnerDoc.exists) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        const data = partnerDoc.data();
        res.json({
            verificationStatus: data.verificationStatus,
            approvedAt: data.approvedAt,
            canPostJobs: data.verificationStatus === 'approved'
        });
    } catch (error) {
        console.error('Error checking verification:', error);
        res.status(500).json({ error: 'Failed to check verification status' });
    }
});

// Admin routes for managing hiring partners
// @route   GET /api/hiring-partners/admin/all
// @desc    Get all hiring partners (admin only)
// @access  Private (Admin)
router.get('/admin/all', async (req, res) => {
    try {
        const snapshot = await partnersCollection.orderBy('createdAt', 'desc').get();
        const partners = [];

        snapshot.forEach(doc => {
            partners.push({
                _id: doc.id,
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({ partners, count: partners.length });
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ error: 'Failed to fetch partners' });
    }
});

// @route   PATCH /api/hiring-partners/admin/:partnerId/verify
// @desc    Approve or reject partner (admin only)
// @access  Private (Admin)
router.patch('/admin/:partnerId/verify', async (req, res) => {
    try {
        const { partnerId } = req.params;
        const { status, adminUid } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const partnerDoc = await partnersCollection.doc(partnerId).get();
        if (!partnerDoc.exists) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        const updates = {
            verificationStatus: status,
            approvedBy: adminUid,
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await partnersCollection.doc(partnerId).update(updates);

        // Update user document
        await db.collection('users').doc(partnerId).update({
            verificationStatus: status,
            approvedAt: new Date().toISOString()
        });

        const updatedDoc = await partnersCollection.doc(partnerId).get();
        res.json({
            message: `Partner ${status} successfully`,
            partner: { id: updatedDoc.id, ...updatedDoc.data() }
        });
    } catch (error) {
        console.error('Error verifying partner:', error);
        res.status(500).json({ error: 'Failed to verify partner' });
    }
});

// @route   PATCH /api/hiring-partners/admin/:partnerId/suspend
// @desc    Suspend or activate partner (admin only)
// @access  Private (Admin)
router.patch('/admin/:partnerId/suspend', async (req, res) => {
    try {
        const { partnerId } = req.params;
        const { suspend } = req.body;

        const partnerDoc = await partnersCollection.doc(partnerId).get();
        if (!partnerDoc.exists) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        const updates = {
            verificationStatus: suspend ? 'suspended' : 'approved',
            isActive: !suspend,
            updatedAt: new Date().toISOString()
        };

        await partnersCollection.doc(partnerId).update(updates);

        const updatedDoc = await partnersCollection.doc(partnerId).get();
        res.json({
            message: `Partner ${suspend ? 'suspended' : 'activated'} successfully`,
            partner: { id: updatedDoc.id, ...updatedDoc.data() }
        });
    } catch (error) {
        console.error('Error suspending partner:', error);
        res.status(500).json({ error: 'Failed to update partner status' });
    }
});

module.exports = router;
