import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { uploadToCloudinary } from '../../utils/cloudinary.js';

function extractYouTubeId(url) {
  if (!url) return '';
  const re = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const m = url.match(re);
  return m ? m[1] : '';
}

export default function LandingVideos() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [form, setForm] = useState({
    title: '',
    url: '',
    videoFile: null,
    videoType: 'youtube', // 'youtube' or 'upload'
    featured: false,
    order: 0,
    active: true
  });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const snap = await getDocs(collection(db, 'landingVideos'));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => (b.featured === true) - (a.featured === true) || (a.order || 0) - (b.order || 0));
      setList(items);
    } catch (e) {
      console.error('Failed to load videos', e);
      setError('Failed to load landing videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: '', url: '', videoFile: null, videoType: 'youtube', featured: false, order: 0, active: true });
    setEditingId(null);
    setUploadProgress('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.title.trim()) { 
      setError('Title is required'); 
      return; 
    }

    let payload = {
      title: form.title.trim(),
      featured: !!form.featured,
      order: Number(form.order) || 0,
      active: !!form.active,
      updatedAt: new Date().toISOString(),
    };

    try {
      setSaving(true);
      
      // Handle YouTube video
      if (form.videoType === 'youtube') {
        const vid = extractYouTubeId(form.url.trim());
        if (!vid) { 
          setError('Please provide a valid YouTube URL'); 
          setSaving(false);
          return; 
        }
        
        payload = {
          ...payload,
          type: 'youtube',
          url: form.url.trim(),
          videoId: vid,
          thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
        };
        
        if (!editingId) payload.createdAt = new Date().toISOString();
        
        if (editingId) {
          await updateDoc(doc(db, 'landingVideos', editingId), payload);
        } else {
          await setDoc(doc(db, 'landingVideos', vid), payload, { merge: true });
        }
      }
      // Handle uploaded video file
      else if (form.videoType === 'upload') {
        if (!form.videoFile && !editingId) {
          setError('Please select a video file to upload');
          setSaving(false);
          return;
        }
        
        let videoUrl = editingId ? list.find(v => v.id === editingId)?.videoUrl : null;
        let thumbnailUrl = editingId ? list.find(v => v.id === editingId)?.thumbnail : null;
        
        // Upload new video file if provided
        if (form.videoFile) {
          setUploading(true);
          setUploadProgress('Uploading video...');
          
          try {
            videoUrl = await uploadToCloudinary(form.videoFile, 'video');
            setUploadProgress('Video uploaded successfully!');
            
            // Generate thumbnail from video (Cloudinary auto-generates thumbnails)
            thumbnailUrl = videoUrl.replace(/\.(mp4|mov|avi|webm)$/, '.jpg');
          } catch (uploadError) {
            console.error('Video upload failed:', uploadError);
            setError('Failed to upload video: ' + uploadError.message);
            setSaving(false);
            setUploading(false);
            return;
          } finally {
            setUploading(false);
          }
        }
        
        payload = {
          ...payload,
          type: 'upload',
          videoUrl: videoUrl,
          thumbnail: thumbnailUrl,
        };
        
        if (!editingId) payload.createdAt = new Date().toISOString();
        
        if (editingId) {
          await updateDoc(doc(db, 'landingVideos', editingId), payload);
        } else {
          const newDocRef = doc(collection(db, 'landingVideos'));
          await setDoc(newDocRef, payload);
        }
      }
      
      await load();
      resetForm();
    } catch (e) {
      console.error('Save failed', e);
      setError('Failed to save video: ' + e.message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const edit = (item) => {
    setEditingId(item.id);
    const isYoutube = item.type === 'youtube' || item.videoId;
    setForm({
      title: item.title || '',
      url: item.url || (item.videoId ? `https://youtu.be/${item.videoId}` : ''),
      videoFile: null,
      videoType: isYoutube ? 'youtube' : 'upload',
      featured: !!item.featured,
      order: item.order || 0,
      active: !!item.active
    });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await deleteDoc(doc(db, 'landingVideos', id));
      await load();
    } catch (e) {
      console.error('Delete failed', e);
      setError('Failed to delete video');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Landing Videos</h1>
      </div>

      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}
      {uploadProgress && <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700 border border-blue-200">{uploadProgress}</div>}

      <form onSubmit={submit} className="mb-8 p-4 border rounded-lg bg-white shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Video Type Selection */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Video Source</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="videoType"
                value="youtube"
                checked={form.videoType === 'youtube'}
                onChange={(e) => setForm({ ...form, videoType: e.target.value })}
                className="mr-2"
              />
              <span>YouTube Link</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="videoType"
                value="upload"
                checked={form.videoType === 'upload'}
                onChange={(e) => setForm({ ...form, videoType: e.target.value })}
                className="mr-2"
              />
              <span>Upload Video File</span>
            </label>
          </div>
        </div>

        {/* YouTube URL Input */}
        {form.videoType === 'youtube' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">YouTube URL</label>
            <input 
              value={form.url} 
              onChange={e => setForm({ ...form, url: e.target.value })} 
              className="w-full border rounded px-3 py-2" 
              placeholder="https://youtu.be/VIDEO_ID or https://www.youtube.com/watch?v=VIDEO_ID" 
            />
          </div>
        )}

        {/* Video File Upload */}
        {form.videoType === 'upload' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Video File</label>
            <input 
              type="file"
              accept="video/*"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  // Check file size (max 100MB)
                  if (file.size > 100 * 1024 * 1024) {
                    setError('Video file size must be less than 100MB');
                    e.target.value = '';
                    return;
                  }
                  setForm({ ...form, videoFile: file });
                  setError('');
                }
              }}
              className="w-full border rounded px-3 py-2" 
            />
            <p className="text-xs text-gray-500 mt-1">Supported formats: MP4, MOV, AVI, WEBM (Max 100MB)</p>
            {form.videoFile && (
              <p className="text-sm text-green-600 mt-1">Selected: {form.videoFile.name} ({(form.videoFile.size / 1024 / 1024).toFixed(2)} MB)</p>
            )}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Video title" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Order</label>
          <input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex items-center">
          <input id="featured" type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="mr-2" />
          <label htmlFor="featured">Featured</label>
        </div>
        <div className="flex items-center">
          <input id="active" type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="mr-2" />
          <label htmlFor="active">Active</label>
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button 
            type="submit" 
            disabled={saving || uploading} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : (saving ? 'Saving...' : (editingId ? 'Update Video' : 'Add Video'))}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
          )}
        </div>
      </form>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Preview</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Title</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Type</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Featured</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Order</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-500">No videos added</td></tr>
              ) : list.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">
                    <img src={item.thumbnail} alt={item.title} className="w-28 h-16 object-cover rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {item.type === 'upload' ? 'Uploaded Video' : (item.url || 'YouTube')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${item.type === 'upload' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.type === 'upload' ? 'Uploaded' : 'YouTube'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.featured ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{item.order || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => edit(item)} className="px-3 py-1 rounded bg-blue-100 text-blue-700">Edit</button>
                      <button onClick={() => remove(item.id)} className="px-3 py-1 rounded bg-red-100 text-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
