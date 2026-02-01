import React, { useState, useEffect } from 'react';
import { FaBuilding, FaCheck, FaTimes, FaBan, FaEye, FaEnvelope, FaGlobe, FaUsers, FaCalendar, FaBriefcase } from 'react-icons/fa';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAuth } from '../../contexts/AuthContext';

export default function ManagePartnerAccounts() {
    const { currentUser } = useAuth();
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected, suspended
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        try {
            setLoading(true);
            const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';

            const response = await fetch(`${apiBase}/hiring-partners/admin/all`);

            if (!response.ok) {
                throw new Error('Failed to load partners');
            }

            const data = await response.json();
            setPartners(data.partners || []);
        } catch (err) {
            console.error('Error loading partners:', err);
            setError('Failed to load hiring partners');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (partnerId, status) => {
        try {
            setError('');
            setSuccess('');

            const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';

            const adminUid = currentUser?.uid || 'admin';

            const response = await fetch(`${apiBase}/hiring-partners/admin/${partnerId}/verify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status,
                    adminUid
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update partner status');
            }

            if (status === 'approved') {
                setSuccess(`Partner approved successfully! Opening dashboard...`);
                loadPartners();

                // Auto-redirect to partner dashboard after 2 seconds
                setTimeout(() => {
                    window.open(`/partner/dashboard?uid=${partnerId}`, '_blank');
                }, 2000);
            } else {
                setSuccess(`Partner ${status} successfully`);
                loadPartners();
            }
        } catch (err) {
            console.error('Error verifying partner:', err);
            setError('Failed to update partner status');
        }
    };

    const handleSuspend = async (partnerId, suspend) => {
        try {
            setError('');
            setSuccess('');

            const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';

            const response = await fetch(`${apiBase}/hiring-partners/admin/${partnerId}/suspend`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ suspend })
            });

            if (!response.ok) {
                throw new Error('Failed to suspend partner');
            }

            setSuccess(`Partner ${suspend ? 'suspended' : 'activated'} successfully`);
            loadPartners();
        } catch (err) {
            console.error('Error suspending partner:', err);
            setError('Failed to update partner status');
        }
    };

    const filteredPartners = partners.filter(partner => {
        if (filter === 'all') return true;
        return partner.verificationStatus === filter;
    });

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            suspended: 'bg-gray-100 text-gray-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: FaCalendar,
            approved: FaCheck,
            rejected: FaTimes,
            suspended: FaBan
        };
        const Icon = icons[status] || FaBuilding;
        return <Icon className="inline mr-1" />;
    };

    const getStatusLabel = (status) => {
        if (!status) return 'Unknown';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Manage Hiring Partners
                    </h1>
                    <p className="text-gray-600">
                        Review and manage company registrations for the hiring partner portal
                    </p>
                </div>

                {/* Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700">{success}</p>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Partners</p>
                                <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
                            </div>
                            <FaBuilding className="text-3xl text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending Approval</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {partners.filter(p => p.verificationStatus === 'pending').length}
                                </p>
                            </div>
                            <FaCalendar className="text-3xl text-yellow-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {partners.filter(p => p.verificationStatus === 'approved').length}
                                </p>
                            </div>
                            <FaCheck className="text-3xl text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Suspended</p>
                                <p className="text-2xl font-bold text-gray-600">
                                    {partners.filter(p => p.verificationStatus === 'suspended').length}
                                </p>
                            </div>
                            <FaBan className="text-3xl text-gray-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6 p-4">
                    <div className="flex flex-wrap gap-2">
                        {['all', 'pending', 'approved', 'rejected', 'suspended'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Partners List */}
                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Loading partners...</p>
                        </div>
                    ) : filteredPartners.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FaBuilding className="text-5xl mx-auto mb-4 text-gray-300" />
                            <p>No partners found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredPartners.map((partner) => (
                                <div key={partner._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        {/* Partner Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                {partner.companyLogo ? (
                                                    <img
                                                        src={partner.companyLogo}
                                                        alt={partner.companyName}
                                                        className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <FaBuilding className="text-2xl text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900">
                                                        {partner.companyName}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <FaEnvelope className="text-gray-400" />
                                                            {partner.email}
                                                        </span>
                                                        {partner.website && (
                                                            <a
                                                                href={partner.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-blue-600 hover:underline"
                                                            >
                                                                <FaGlobe />
                                                                Website
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Industry</p>
                                                    <p className="text-sm font-medium text-gray-900">{partner.industry || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Company Size</p>
                                                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                                        <FaUsers className="text-gray-400" />
                                                        {partner.companySize || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Location</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {partner.location?.city || partner.location?.country || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Contact Person */}
                                            {partner.contactPerson && (
                                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                                    <p className="text-xs text-gray-500 mb-1">Contact Person</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {partner.contactPerson.name}
                                                        {partner.contactPerson.designation && ` - ${partner.contactPerson.designation}`}
                                                    </p>
                                                    {partner.contactPerson.phone && (
                                                        <p className="text-sm text-gray-600">{partner.contactPerson.phone}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Description */}
                                            {partner.description && (
                                                <p className="text-sm text-gray-600 mb-4">{partner.description}</p>
                                            )}

                                            {/* Stats */}
                                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <FaBriefcase className="text-gray-400" />
                                                    {partner.stats?.totalJobsPosted || 0} Jobs Posted
                                                </span>
                                                <span>
                                                    {partner.stats?.totalApplications || 0} Applications
                                                </span>
                                                <span>
                                                    {partner.stats?.totalHires || 0} Hires
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status and Actions */}
                                        <div className="ml-6 flex flex-col items-end gap-3">
                                            {/* Status Badge */}
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(partner.verificationStatus || 'pending')}`}>
                                                {getStatusIcon(partner.verificationStatus || 'pending')}
                                                {getStatusLabel(partner.verificationStatus || 'pending')}
                                            </span>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2">
                                                {partner.verificationStatus === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleVerify(partner._id, 'approved')}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                                                        >
                                                            <FaCheck />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerify(partner._id, 'rejected')}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
                                                        >
                                                            <FaTimes />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {partner.verificationStatus === 'approved' && (
                                                    <button
                                                        onClick={() => handleSuspend(partner._id, true)}
                                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2"
                                                    >
                                                        <FaBan />
                                                        Suspend
                                                    </button>
                                                )}

                                                {partner.verificationStatus === 'suspended' && (
                                                    <button
                                                        onClick={() => handleSuspend(partner._id, false)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                                                    >
                                                        <FaCheck />
                                                        Activate
                                                    </button>
                                                )}
                                            </div>

                                            {/* Registration Date */}
                                            <p className="text-xs text-gray-500">
                                                Registered: {new Date(partner.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
