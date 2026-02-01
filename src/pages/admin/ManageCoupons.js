import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: 10,
    active: true,
    startDate: '',
    expiryDate: '',
    maxDiscount: '',
    minAmount: ''
  });

  const loadCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by expiry descending, then active
      list.sort((a, b) => {
        const ad = new Date(a.expiryDate || 0).getTime();
        const bd = new Date(b.expiryDate || 0).getTime();
        return bd - ad;
      });
      setCoupons(list);
    } catch (e) {
      console.error('Failed to load coupons', e);
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const resetForm = () => {
    setForm({ code: '', type: 'percentage', value: 10, active: true, startDate: '', expiryDate: '', maxDiscount: '', minAmount: '' });
    setEditingCode(null);
    setShowForm(false);
  };

  const handleEdit = (c) => {
    setForm({
      code: c.code || c.id || '',
      type: c.type || 'percentage',
      value: c.value || 0,
      active: !!c.active,
      startDate: c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : '',
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().slice(0, 10) : '',
      maxDiscount: c.maxDiscount || '',
      minAmount: c.minAmount || ''
    });
    setEditingCode(c.code || c.id);
    setShowForm(true);
  };

  const validateForm = () => {
    if (!form.code || !/^[A-Z0-9_-]{3,20}$/.test(form.code)) return 'Code must be 3-20 chars (A-Z, 0-9, _ or -)';
    if (!['percentage', 'fixed'].includes(form.type)) return 'Type must be percentage or fixed';
    const val = Number(form.value);
    if (Number.isNaN(val) || val <= 0) return 'Value must be a positive number';
    if (form.type === 'percentage' && (val <= 0 || val > 100)) return 'Percentage must be between 1 and 100';
    if (form.expiryDate && isNaN(new Date(form.expiryDate).getTime())) return 'Invalid expiry date';
    if (form.startDate && isNaN(new Date(form.startDate).getTime())) return 'Invalid start date';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validateForm();
    if (err) { setError(err); return; }

    try {
      setSaving(true);
      const code = form.code.toUpperCase();
      const payload = {
        code,
        type: form.type,
        value: Number(form.value),
        active: !!form.active,
        // store dates as ISO strings so backend check `new Date(expiryDate)` works
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
        maxDiscount: form.maxDiscount !== '' ? Number(form.maxDiscount) : null,
        minAmount: form.minAmount !== '' ? Number(form.minAmount) : null,
        updatedAt: new Date().toISOString(),
        createdAt: editingCode ? undefined : new Date().toISOString()
      };

      if (editingCode && editingCode !== code) {
        // If code changed, delete old doc and create new one
        await deleteDoc(doc(db, 'coupons', editingCode));
      }
      await setDoc(doc(db, 'coupons', code), payload, { merge: true });
      setSuccess(editingCode ? 'Coupon updated' : 'Coupon created');
      await loadCoupons();
      resetForm();
    } catch (e) {
      console.error('Failed to save coupon', e);
      setError(e.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', code));
      setSuccess('Coupon deleted');
      await loadCoupons();
    } catch (e) {
      console.error('Delete failed', e);
      setError('Failed to delete coupon');
    }
  };

  const toggleActive = async (c) => {
    try {
      await updateDoc(doc(db, 'coupons', c.code || c.id), { active: !c.active, updatedAt: new Date().toISOString() });
      await loadCoupons();
    } catch (e) {
      console.error('Toggle active failed', e);
      setError('Failed to update status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Coupons</h1>
        <button
          onClick={() => { setShowForm(true); setEditingCode(null); setForm({ code: '', type: 'percentage', value: 10, active: true, startDate: '', expiryDate: '', maxDiscount: '', minAmount: '' }); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> New Coupon
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded bg-green-50 text-green-700 border border-green-200">{success}</div>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className="mb-8 p-4 border rounded-lg bg-white shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().trim() })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., SAVE20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="w-full border rounded px-3 py-2"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Active</label>
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="mr-2"
              />
              <span>{form.active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date (optional)</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expiry Date (optional)</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Discount (₹, optional)</label>
            <input
              type="number"
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
              className="w-full border rounded px-3 py-2"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min Order Amount (₹, optional)</label>
            <input
              type="number"
              value={form.minAmount}
              onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
              className="w-full border rounded px-3 py-2"
              min="0"
            />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              {saving ? 'Saving...' : (editingCode ? 'Update Coupon' : 'Create Coupon')}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Code</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Type</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Value</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Active</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Start</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Expiry</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-gray-500">No coupons yet</td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const code = c.code || c.id;
                  const start = c.startDate ? new Date(c.startDate).toLocaleDateString() : '-';
                  const expiry = c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : '-';
                  return (
                    <tr key={code} className="border-t">
                      <td className="px-4 py-3 font-mono text-sm">{code}</td>
                      <td className="px-4 py-3 capitalize">{c.type}</td>
                      <td className="px-4 py-3">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {c.active ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />} {c.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{start}</td>
                      <td className="px-4 py-3">{expiry}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => toggleActive({ ...c, code })}
                            className={`px-3 py-1 rounded ${c.active ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                          >
                            {c.active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleEdit({ ...c, code })}
                            className="px-3 py-1 rounded bg-blue-100 text-blue-700 flex items-center"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(code)}
                            className="px-3 py-1 rounded bg-red-100 text-red-700 flex items-center"
                          >
                            <FaTrash className="mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
