import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBriefcase, FaUsers, FaCheckCircle, FaBuilding, FaPlus, FaEye, FaClock } from 'react-icons/fa';

export default function PartnerDashboard() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalJobsPosted: 0,
        activeJobs: 0,
        totalApplications: 0,
        totalHires: 0
    });
    const [verificationStatus, setVerificationStatus] = useState('pending');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            loadPartnerStats();
        }
    }, [currentUser]);

    const loadPartnerStats = async () => {
        try {
            setLoading(true);
            const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';
            const idToken = await currentUser.getIdToken();

            const response = await fetch(`${apiBase}/hiring-partners/stats`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.stats || {});
                setVerificationStatus(data.verificationStatus || 'pending');
            }
        } catch (err) {
            console.error('Error loading stats:', err);
        } finally {
            setLoading(false);
        }
    };

    // If account is pending approval
    if (verificationStatus === 'pending') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center">
                        <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                            <FaClock className="text-4xl text-yellow-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Account Pending Approval
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Thank you for registering with Mentneo! Your account is currently under review by our admin team.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
                            <ul className="text-left text-blue-800 space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>Our team will review your company details within 24-48 hours</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>You'll receive an email notification once approved</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>After approval, you can post jobs and access student profiles</span>
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Hiring Partner Dashboard</h1>
                            <p className="text-gray-600 mt-1">Welcome back! Manage your recruitment process</p>
                        </div>
                        <button
                            onClick={() => navigate('/partner/jobs/create')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                        >
                            <FaPlus />
                            Post New Job
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Jobs Posted</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalJobsPosted || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FaBriefcase className="text-2xl text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Active Jobs</p>
                                <p className="text-3xl font-bold text-green-600">{stats.activeJobs || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FaEye className="text-2xl text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.totalApplications || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FaUsers className="text-2xl text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Hires</p>
                                <p className="text-3xl font-bold text-indigo-600">{stats.totalHires || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <FaCheckCircle className="text-2xl text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/partner/jobs/create')}
                            className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                        >
                            <FaPlus className="text-2xl text-blue-600 mb-2" />
                            <h3 className="font-semibold text-gray-900">Post a Job</h3>
                            <p className="text-sm text-gray-600">Create a new job opening</p>
                        </button>

                        <button
                            onClick={() => navigate('/partner/students')}
                            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                        >
                            <FaUsers className="text-2xl text-green-600 mb-2" />
                            <h3 className="font-semibold text-gray-900">Discover Students</h3>
                            <p className="text-sm text-gray-600">Browse talented candidates</p>
                        </button>

                        <button
                            onClick={() => navigate('/partner/applications')}
                            className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                        >
                            <FaBriefcase className="text-2xl text-purple-600 mb-2" />
                            <h3 className="font-semibold text-gray-900">View Applications</h3>
                            <p className="text-sm text-gray-600">Manage job applications</p>
                        </button>
                    </div>
                </div>

                {/* Getting Started Guide */}
                {stats.totalJobsPosted === 0 && (
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">🚀 Get Started with Mentneo</h2>
                        <p className="mb-6 text-blue-100">
                            Welcome to the Hiring Partner Portal! Here's how to get started:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-3xl mb-2">1️⃣</div>
                                <h3 className="font-semibold mb-2">Post Your First Job</h3>
                                <p className="text-sm text-blue-100">
                                    Create a job posting with requirements and compensation details
                                </p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-3xl mb-2">2️⃣</div>
                                <h3 className="font-semibold mb-2">Discover Talent</h3>
                                <p className="text-sm text-blue-100">
                                    Browse through our pool of trained and verified students
                                </p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-3xl mb-2">3️⃣</div>
                                <h3 className="font-semibold mb-2">Hire the Best</h3>
                                <p className="text-sm text-blue-100">
                                    Review applications, schedule interviews, and make offers
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
