import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaBuilding, FaSearch, FaFilter, FaCheckCircle, FaHourglassHalf, FaTimes, FaEye } from 'react-icons/fa';

export default function StudentJobBoard() {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('available'); // available, applied
    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [filters, setFilters] = useState({
        jobType: '',
        workMode: '',
        search: ''
    });
    const [selectedJob, setSelectedJob] = useState(null);
    const [showJobModal, setShowJobModal] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');

    useEffect(() => {
        loadJobs();
        if (currentUser) {
            loadMyApplications();
        }
    }, [currentUser]);

    const loadJobs = async () => {
        try {
            setLoading(true);
            const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';

            const params = new URLSearchParams();
            if (filters.jobType) params.append('jobType', filters.jobType);
            if (filters.workMode) params.append('workMode', filters.workMode);
            if (filters.search) params.append('search', filters.search);

            const response = await fetch(`${apiBase}/jobs/public/active?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to load jobs');
            }

            const data = await response.json();
            setJobs(data.jobs || []);
        } catch (err) {
            console.error('Error loading jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadMyApplications = async () => {
        try {
            const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';
            const idToken = await currentUser.getIdToken();

            const response = await fetch(`${apiBase}/applications`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load applications');
            }

            const data = await response.json();
            setMyApplications(data.applications || []);
        } catch (err) {
            console.error('Error loading applications:', err);
        }
    };

    const handleApply = async (jobId) => {
        try {
            setApplying(jobId);
            const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';
            const idToken = await currentUser.getIdToken();

            const response = await fetch(`${apiBase}/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    jobId,
                    coverLetter
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to apply');
            }

            alert('Application submitted successfully!');
            setShowJobModal(false);
            setCoverLetter('');
            loadMyApplications();
        } catch (err) {
            console.error('Error applying:', err);
            alert(err.message || 'Failed to submit application');
        } finally {
            setApplying(null);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            applied: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FaClock },
            reviewed: { bg: 'bg-purple-100', text: 'text-purple-800', icon: FaEye },
            shortlisted: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FaCheckCircle },
            'interview-scheduled': { bg: 'bg-orange-100', text: 'text-orange-800', icon: FaHourglassHalf },
            selected: { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: FaTimes }
        };
        const badge = badges[status] || badges.applied;
        const Icon = badge.icon;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text} flex items-center gap-1`}>
                <Icon className="text-xs" />
                {status.replace('-', ' ').charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </span>
        );
    };

    const hasApplied = (jobId) => {
        return myApplications.some(app => app.jobId._id === jobId || app.jobId === jobId);
    };

    const JobCard = ({ job, showApplyButton = true }) => (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                    {job.partnerId?.companyLogo ? (
                        <img
                            src={job.partnerId.companyLogo}
                            alt={job.companyName}
                            className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <FaBuilding className="text-2xl text-white" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                        <p className="text-gray-600 font-medium">{job.companyName}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.jobType === 'full-time' ? 'bg-green-100 text-green-800' :
                            job.jobType === 'internship' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                        }`}>
                        {job.jobType.replace('-', ' ').toUpperCase()}
                    </span>
                </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-gray-400" />
                    {job.location?.city || 'Remote'} • {job.workMode}
                </span>
                {job.salaryRange && job.salaryRange.min > 0 && (
                    <span className="flex items-center gap-1">
                        <FaMoneyBillWave className="text-gray-400" />
                        ₹{job.salaryRange.min.toLocaleString()} - ₹{job.salaryRange.max.toLocaleString()}/{job.salaryRange.period}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <FaClock className="text-gray-400" />
                    {job.experienceLevel}
                </span>
            </div>

            {job.skillsRequired && job.skillsRequired.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {job.skillsRequired.slice(0, 5).map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {skill}
                        </span>
                    ))}
                    {job.skillsRequired.length > 5 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                            +{job.skillsRequired.length - 5} more
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                    {job.stats?.applications || 0} applicants
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setSelectedJob(job);
                            setShowJobModal(true);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                    >
                        View Details
                    </button>
                    {showApplyButton && !hasApplied(job._id) && (
                        <button
                            onClick={() => {
                                setSelectedJob(job);
                                setShowJobModal(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                        >
                            Apply Now
                        </button>
                    )}
                    {hasApplied(job._id) && (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                            Applied ✓
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Opportunities</h1>
                    <p className="text-gray-600">Explore job openings from our hiring partners</p>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('available')}
                            className={`px-6 py-3 font-medium transition-all ${activeTab === 'available'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Available Jobs ({jobs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('applied')}
                            className={`px-6 py-3 font-medium transition-all ${activeTab === 'applied'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            My Applications ({myApplications.length})
                        </button>
                    </div>
                </div>

                {/* Available Jobs Tab */}
                {activeTab === 'available' && (
                    <>
                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search jobs..."
                                            value={filters.search}
                                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filters.jobType}
                                    onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Job Types</option>
                                    <option value="full-time">Full Time</option>
                                    <option value="part-time">Part Time</option>
                                    <option value="internship">Internship</option>
                                    <option value="freelance">Freelance</option>
                                </select>
                                <select
                                    value={filters.workMode}
                                    onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Work Modes</option>
                                    <option value="remote">Remote</option>
                                    <option value="onsite">Onsite</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>
                            <button
                                onClick={loadJobs}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                                <FaFilter />
                                Apply Filters
                            </button>
                        </div>

                        {/* Jobs List */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Loading jobs...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <FaBriefcase className="text-5xl text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No jobs available at the moment</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {jobs.map((job) => (
                                    <JobCard key={job._id} job={job} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* My Applications Tab */}
                {activeTab === 'applied' && (
                    <div className="space-y-6">
                        {myApplications.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <FaBriefcase className="text-5xl text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">You haven't applied to any jobs yet</p>
                                <button
                                    onClick={() => setActiveTab('available')}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                >
                                    Browse Jobs
                                </button>
                            </div>
                        ) : (
                            myApplications.map((application) => (
                                <div key={application._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                {application.jobId?.title || 'Job Title'}
                                            </h3>
                                            <p className="text-gray-600">{application.jobId?.companyName || 'Company'}</p>
                                        </div>
                                        {getStatusBadge(application.status)}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 mb-1">Applied On</p>
                                            <p className="text-gray-900 font-medium">
                                                {new Date(application.appliedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Job Type</p>
                                            <p className="text-gray-900 font-medium">
                                                {application.jobId?.jobType?.replace('-', ' ') || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Work Mode</p>
                                            <p className="text-gray-900 font-medium">
                                                {application.jobId?.workMode || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {application.interview?.scheduled && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                                            <p className="text-orange-800 font-medium mb-2">Interview Scheduled</p>
                                            <p className="text-sm text-orange-700">
                                                {new Date(application.interview.scheduledAt).toLocaleString()}
                                            </p>
                                            {application.interview.meetingLink && (
                                                <a
                                                    href={application.interview.meetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                                                >
                                                    Join Interview →
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {application.statusHistory && application.statusHistory.length > 0 && (
                                        <div className="border-t border-gray-200 pt-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Application Timeline</p>
                                            <div className="space-y-2">
                                                {application.statusHistory.slice(-3).reverse().map((history, index) => (
                                                    <div key={index} className="flex items-center gap-3 text-sm">
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                        <span className="text-gray-600">
                                                            {new Date(history.changedAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-gray-900 font-medium">
                                                            {history.status.replace('-', ' ')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Job Details Modal */}
            {showJobModal && selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-start gap-4">
                                    {selectedJob.partnerId?.companyLogo ? (
                                        <img
                                            src={selectedJob.partnerId.companyLogo}
                                            alt={selectedJob.companyName}
                                            className="w-20 h-20 object-contain rounded-lg border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                            <FaBuilding className="text-3xl text-white" />
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedJob.title}</h2>
                                        <p className="text-lg text-gray-600">{selectedJob.companyName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowJobModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="text-2xl" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                                <p className="text-gray-700 whitespace-pre-line">{selectedJob.description}</p>
                            </div>

                            {selectedJob.skillsRequired && selectedJob.skillsRequired.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedJob.skillsRequired.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!hasApplied(selectedJob._id) && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Cover Letter (Optional)</h3>
                                    <textarea
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Tell the employer why you're a great fit for this role..."
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowJobModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    Close
                                </button>
                                {!hasApplied(selectedJob._id) && (
                                    <button
                                        onClick={() => handleApply(selectedJob._id)}
                                        disabled={applying === selectedJob._id}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {applying === selectedJob._id ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
