import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { FaUser, FaPhone, FaEnvelope, FaGraduationCap, FaClock, FaSpinner } from 'react-icons/fa/index.esm.js';
import { db } from '../../firebase/firebase.js';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'callbackRequests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLeads(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredLeads = statusFilter === 'all'
    ? leads
    : leads.filter((lead) => lead.status === statusFilter);

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">All callback form submissions for data analysts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600">Total Leads</p>
            <p className="text-3xl font-bold text-gray-900">{leads.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{leads.filter(l => l.status === 'pending').length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600">Contacted</p>
            <p className="text-3xl font-bold text-blue-600">{leads.filter(l => l.status === 'contacted').length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600">{leads.filter(l => l.status === 'completed').length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-700 font-semibold">Filter:</span>
          {['all','pending','contacted','completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Education</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">No leads found</td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <FaUser className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{lead.name}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <FaEnvelope className="text-gray-400" /> {lead.email}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <FaPhone className="text-gray-400" /> {lead.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {lead.program || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2">
                        <FaGraduationCap className="text-gray-400" />
                        {lead.educationLevel || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2">
                        <FaClock className="text-gray-400" /> {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                          lead.status === 'completed'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : lead.status === 'contacted'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {lead.status ? lead.status.charAt(0).toUpperCase() + lead.status.slice(1) : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                        {lead.message || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;
