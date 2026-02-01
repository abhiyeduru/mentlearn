const express = require('express');
const router = express.Router();
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

        // Check if partner is approved
        const partner = await HiringPartner.findOne({ uid: decodedToken.uid });
        if (!partner || partner.verificationStatus !== 'approved') {
            return res.status(403).json({
                error: 'Your account must be approved to access student profiles',
                verificationStatus: partner?.verificationStatus || 'not_found'
            });
        }

        req.partnerUid = decodedToken.uid;
        req.partnerId = partner._id;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// @route   GET /api/students/discover
// @desc    Discover students with advanced filters
// @access  Private (Partner - approved only)
router.get('/discover', verifyPartner, async (req, res) => {
    try {
        const {
            skills,
            domain,
            experienceLevel,
            courseCompleted,
            minSkillScore,
            search,
            page = 1,
            limit = 20,
            sortBy = 'recent' // recent, skillScore, experience
        } = req.query;

        // Build Firestore query
        let studentsRef = db.collection('users').where('role', '==', 'student');

        // Filter by visibility (students who opted in to be visible to partners)
        // Assuming we add a field 'visibleToPartners' in student profiles
        studentsRef = studentsRef.where('visibleToPartners', '==', true);

        // Get all students first, then filter in memory (Firestore limitations)
        const snapshot = await studentsRef.get();
        let students = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            students.push({
                uid: doc.id,
                ...data
            });
        });

        // Apply filters
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
            students = students.filter(student => {
                if (!student.skills || !Array.isArray(student.skills)) return false;
                const studentSkills = student.skills.map(s =>
                    typeof s === 'string' ? s.toLowerCase() : s.name?.toLowerCase()
                );
                return skillsArray.some(skill => studentSkills.includes(skill));
            });
        }

        if (domain) {
            students = students.filter(student =>
                student.domain?.toLowerCase() === domain.toLowerCase() ||
                student.category?.toLowerCase() === domain.toLowerCase()
            );
        }

        if (experienceLevel) {
            students = students.filter(student => {
                const exp = student.experience?.years || 0;
                switch (experienceLevel) {
                    case 'fresher': return exp === 0;
                    case '0-1': return exp >= 0 && exp <= 1;
                    case '1-2': return exp > 1 && exp <= 2;
                    case '2-5': return exp > 2 && exp <= 5;
                    case '5+': return exp > 5;
                    default: return true;
                }
            });
        }

        if (courseCompleted) {
            students = students.filter(student => {
                if (!student.completedCourses || !Array.isArray(student.completedCourses)) return false;
                return student.completedCourses.some(course =>
                    course.toLowerCase().includes(courseCompleted.toLowerCase())
                );
            });
        }

        if (minSkillScore) {
            const minScore = parseInt(minSkillScore);
            students = students.filter(student => {
                const score = student.aiSkillScores?.overall || 0;
                return score >= minScore;
            });
        }

        if (search) {
            const searchLower = search.toLowerCase();
            students = students.filter(student => {
                const name = (student.name || student.firstName + ' ' + student.lastName || '').toLowerCase();
                const email = (student.email || '').toLowerCase();
                const skills = (student.skills || []).join(' ').toLowerCase();
                return name.includes(searchLower) ||
                    email.includes(searchLower) ||
                    skills.includes(searchLower);
            });
        }

        // Sort students
        switch (sortBy) {
            case 'skillScore':
                students.sort((a, b) => {
                    const scoreA = a.aiSkillScores?.overall || 0;
                    const scoreB = b.aiSkillScores?.overall || 0;
                    return scoreB - scoreA;
                });
                break;
            case 'experience':
                students.sort((a, b) => {
                    const expA = a.experience?.years || 0;
                    const expB = b.experience?.years || 0;
                    return expB - expA;
                });
                break;
            case 'recent':
            default:
                students.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateB - dateA;
                });
        }

        // Pagination
        const total = students.length;
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedStudents = students.slice(startIndex, endIndex);

        // Remove sensitive data before sending
        const sanitizedStudents = paginatedStudents.map(student => ({
            uid: student.uid,
            name: student.name || student.firstName + ' ' + student.lastName,
            email: student.email,
            avatar: student.avatar || student.profilePicture,
            skills: student.skills || [],
            domain: student.domain || student.category,
            experience: {
                years: student.experience?.years || 0
            },
            education: student.education || [],
            completedCourses: student.completedCourses || [],
            aiSkillScores: student.aiSkillScores || {},
            location: student.location || {},
            portfolioUrl: student.portfolioUrl,
            linkedinUrl: student.linkedinUrl,
            githubUrl: student.githubUrl
        }));

        res.json({
            students: sanitizedStudents,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error discovering students:', error);
        res.status(500).json({ error: 'Failed to discover students' });
    }
});

// @route   GET /api/students/:uid/profile
// @desc    Get detailed student profile
// @access  Private (Partner - approved only)
router.get('/:uid/profile', verifyPartner, async (req, res) => {
    try {
        const { uid } = req.params;

        // Get student from Firebase
        const studentDoc = await db.collection('users').doc(uid).get();

        if (!studentDoc.exists) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const studentData = studentDoc.data();

        // Check if student is visible to partners
        if (studentData.visibleToPartners === false) {
            return res.status(403).json({
                error: 'This student has opted out of partner visibility'
            });
        }

        // Get student's projects, certificates, etc. from respective collections
        // This is a simplified version - adjust based on your actual data structure
        const profile = {
            uid: studentDoc.id,
            name: studentData.name || studentData.firstName + ' ' + studentData.lastName,
            email: studentData.email,
            phone: studentData.phone,
            avatar: studentData.avatar || studentData.profilePicture,
            bio: studentData.bio || studentData.about,
            location: studentData.location || {},

            // Skills
            skills: studentData.skills || [],

            // Education
            education: studentData.education || [],

            // Experience
            experience: studentData.experience || { years: 0, positions: [] },

            // Projects
            projects: studentData.projects || [],

            // Certificates
            certificates: studentData.certificates || [],

            // Courses
            completedCourses: studentData.completedCourses || [],
            enrolledCourses: studentData.enrolledCourses || [],

            // AI Skill Scores
            aiSkillScores: studentData.aiSkillScores || {},

            // Links
            resumeUrl: studentData.resumeUrl,
            portfolioUrl: studentData.portfolioUrl,
            linkedinUrl: studentData.linkedinUrl,
            githubUrl: studentData.githubUrl,

            // Metadata
            joinedAt: studentData.createdAt,
            lastActive: studentData.lastLoginAt
        };

        res.json({ profile });
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ error: 'Failed to fetch student profile' });
    }
});

// @route   GET /api/students/:uid/resume
// @desc    Get student resume URL (for download)
// @access  Private (Partner - approved only)
router.get('/:uid/resume', verifyPartner, async (req, res) => {
    try {
        const { uid } = req.params;

        const studentDoc = await db.collection('users').doc(uid).get();

        if (!studentDoc.exists) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const studentData = studentDoc.data();

        if (!studentData.resumeUrl) {
            return res.status(404).json({ error: 'Resume not available' });
        }

        // Log resume access for transparency
        // You could create a ResumeAccess collection to track who accessed whose resume
        await db.collection('resumeAccessLog').add({
            studentUid: uid,
            partnerUid: req.partnerUid,
            partnerId: req.partnerId,
            accessedAt: new Date().toISOString()
        });

        res.json({
            resumeUrl: studentData.resumeUrl,
            studentName: studentData.name || studentData.firstName + ' ' + studentData.lastName
        });
    } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(500).json({ error: 'Failed to fetch resume' });
    }
});

// @route   POST /api/students/shortlist
// @desc    Add student to shortlist (for future job invitations)
// @access  Private (Partner - approved only)
router.post('/shortlist', verifyPartner, async (req, res) => {
    try {
        const { studentUid, notes } = req.body;

        if (!studentUid) {
            return res.status(400).json({ error: 'Student UID is required' });
        }

        // Create or update shortlist entry
        const shortlistRef = db.collection('partnerShortlists').doc(`${req.partnerUid}_${studentUid}`);

        await shortlistRef.set({
            partnerUid: req.partnerUid,
            partnerId: req.partnerId.toString(),
            studentUid,
            notes: notes || '',
            shortlistedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }, { merge: true });

        res.json({
            message: 'Student added to shortlist successfully',
            shortlistId: shortlistRef.id
        });
    } catch (error) {
        console.error('Error adding to shortlist:', error);
        res.status(500).json({ error: 'Failed to add student to shortlist' });
    }
});

// @route   GET /api/students/shortlist
// @desc    Get partner's shortlisted students
// @access  Private (Partner - approved only)
router.get('/shortlist', verifyPartner, async (req, res) => {
    try {
        const shortlistSnapshot = await db.collection('partnerShortlists')
            .where('partnerUid', '==', req.partnerUid)
            .get();

        const shortlistedStudents = [];

        for (const doc of shortlistSnapshot.docs) {
            const shortlistData = doc.data();

            // Get student details
            const studentDoc = await db.collection('users').doc(shortlistData.studentUid).get();

            if (studentDoc.exists) {
                const studentData = studentDoc.data();
                shortlistedStudents.push({
                    shortlistId: doc.id,
                    student: {
                        uid: studentDoc.id,
                        name: studentData.name || studentData.firstName + ' ' + studentData.lastName,
                        email: studentData.email,
                        avatar: studentData.avatar || studentData.profilePicture,
                        skills: studentData.skills || [],
                        aiSkillScores: studentData.aiSkillScores || {}
                    },
                    notes: shortlistData.notes,
                    shortlistedAt: shortlistData.shortlistedAt
                });
            }
        }

        res.json({
            shortlistedStudents,
            count: shortlistedStudents.length
        });
    } catch (error) {
        console.error('Error fetching shortlist:', error);
        res.status(500).json({ error: 'Failed to fetch shortlist' });
    }
});

// @route   DELETE /api/students/shortlist/:studentUid
// @desc    Remove student from shortlist
// @access  Private (Partner - approved only)
router.delete('/shortlist/:studentUid', verifyPartner, async (req, res) => {
    try {
        const { studentUid } = req.params;
        const shortlistId = `${req.partnerUid}_${studentUid}`;

        await db.collection('partnerShortlists').doc(shortlistId).delete();

        res.json({ message: 'Student removed from shortlist' });
    } catch (error) {
        console.error('Error removing from shortlist:', error);
        res.status(500).json({ error: 'Failed to remove from shortlist' });
    }
});

module.exports = router;
