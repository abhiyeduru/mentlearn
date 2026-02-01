import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { uploadToCloudinary } from '../../utils/cloudinary.js';

export default function MasterclassMosaic() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    imageFile: null,
    videoFile: null,
    alt: '',
    name: '',
    title: '',
    university: '',
    bio: '',
    quote: '',
    expertise: '',
    achievements: '',
    videoUrl: '',
    additionalImages: '',
    courseSections: '',
    linkedIn: '',
    twitter: '',
    website: '',
    liveSessions: '',
    studentsCount: '',
    coursesCount: '',
    rating: '',
    experience: '',
    testimonials: '',
    size: { width: 200, height: 200 },
    order: 0,
    visible: true
  });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const snap = await getDocs(collection(db, 'masterclassMosaic'));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      setList(items);
    } catch (e) {
      console.error('Failed to load images', e);
      setError('Failed to load mosaic images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ 
      imageFile: null,
      videoFile: null, 
      alt: '', 
      name: '',
      title: '',
      university: '',
      bio: '',
      quote: '',
      expertise: '',
      achievements: '',
      videoUrl: '',
      additionalImages: '',
      courseSections: '',
      linkedIn: '',
      twitter: '',
      website: '',
      liveSessions: '',
      studentsCount: '',
      coursesCount: '',
      rating: '',
      experience: '',
      testimonials: '',
      size: { width: 200, height: 200 }, 
      order: 0, 
      visible: true 
    });
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.videoFile && !form.imageFile && !editingId) {
      setError('Please select a video or image file');
      return;
    }

    try {
      setSaving(true);
      
      let imageUrl = editingId ? list.find(v => v.id === editingId)?.imageUrl : null;
      let videoUrl = editingId ? list.find(v => v.id === editingId)?.videoUrl : '';
      
      // Upload new video if provided
      if (form.videoFile) {
        setUploading(true);
        try {
          videoUrl = await uploadToCloudinary(form.videoFile, 'video');
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
      
      // Upload new thumbnail image if provided
      if (form.imageFile) {
        setUploading(true);
        try {
          imageUrl = await uploadToCloudinary(form.imageFile, 'image');
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          setError('Failed to upload image: ' + uploadError.message);
          setSaving(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      const payload = {
        imageUrl: imageUrl,
        videoUrl: videoUrl,
        alt: form.alt.trim() || 'Masterclass image',
        name: form.name.trim() || '',
        title: form.title.trim() || '',
        university: form.university.trim() || '',
        bio: form.bio.trim() || '',
        quote: form.quote.trim() || '',
        expertise: form.expertise ? form.expertise.split(',').map(s => s.trim()).filter(Boolean) : [],
        achievements: form.achievements ? form.achievements.split('\n').map(s => s.trim()).filter(Boolean) : [],
        additionalImages: form.additionalImages ? form.additionalImages.split('\n').map(s => s.trim()).filter(Boolean) : [],
        courseSections: form.courseSections ? form.courseSections.split('\n\n').map(s => s.trim()).filter(Boolean) : [],
        linkedIn: form.linkedIn.trim() || '',
        twitter: form.twitter.trim() || '',
        website: form.website.trim() || '',
        liveSessions: form.liveSessions ? JSON.parse(form.liveSessions) : [],
        studentsCount: form.studentsCount.trim() || '',
        coursesCount: form.coursesCount.trim() || '',
        rating: form.rating.trim() || '',
        experience: form.experience.trim() || '',
        testimonials: form.testimonials ? JSON.parse(form.testimonials) : [],
        size: form.size,
        order: Number(form.order) || 0,
        visible: !!form.visible,
        updatedAt: new Date().toISOString(),
      };

      if (!editingId) payload.createdAt = new Date().toISOString();

      if (editingId) {
        await updateDoc(doc(db, 'masterclassMosaic', editingId), payload);
      } else {
        const newDocRef = doc(collection(db, 'masterclassMosaic'));
        await setDoc(newDocRef, payload);
      }

      await load();
      resetForm();
    } catch (e) {
      console.error('Save failed', e);
      setError('Failed to save image: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm({
      imageFile: null,
      videoFile: null,
      alt: item.alt || '',
      name: item.name || '',
      title: item.title || '',
      university: item.university || '',
      bio: item.bio || '',
      quote: item.quote || '',
      expertise: item.expertise ? item.expertise.join(', ') : '',
      achievements: item.achievements ? item.achievements.join('\n') : '',
      videoUrl: item.videoUrl || '',
      additionalImages: item.additionalImages ? item.additionalImages.join('\n') : '',
      courseSections: item.courseSections ? item.courseSections.join('\n\n') : '',
      linkedIn: item.linkedIn || '',
      twitter: item.twitter || '',
      website: item.website || '',
      liveSessions: item.liveSessions ? JSON.stringify(item.liveSessions, null, 2) : '',
      studentsCount: item.studentsCount || '',
      coursesCount: item.coursesCount || '',
      rating: item.rating || '',
      experience: item.experience || '',
      testimonials: item.testimonials ? JSON.stringify(item.testimonials, null, 2) : '',
      size: item.size || { width: 200, height: 200 },
      order: item.order || 0,
      visible: !!item.visible
    });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await deleteDoc(doc(db, 'masterclassMosaic', id));
      await load();
    } catch (e) {
      console.error('Delete failed', e);
      setError('Failed to delete image');
    }
  };

  const toggleVisible = async (item) => {
    try {
      await updateDoc(doc(db, 'masterclassMosaic', item.id), {
        visible: !item.visible
      });
      await load();
    } catch (e) {
      console.error('Toggle failed', e);
      setError('Failed to toggle visibility');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Masterclasses Mosaic Images</h1>
        <div className="text-sm text-gray-600">
          Total: {list.length} images | Visible: {list.filter(i => i.visible).length}
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}
      {uploading && <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700 border border-blue-200">Uploading image...</div>}

      <form onSubmit={submit} className="mb-8 p-4 border rounded-lg bg-white shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Landscape Video File (Main Display) *</label>
          <input 
            type="file"
            accept="video/*"
            onChange={e => {
              const file = e.target.files[0];
              if (file) {
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
          <p className="text-xs text-gray-500 mt-1">Upload landscape video (16:9 aspect ratio recommended). Max 100MB. This will be the main display on mentor detail page.</p>
          {form.videoFile && (
            <p className="text-sm text-green-600 mt-1">Selected: {form.videoFile.name}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Thumbnail Image (Optional)</label>
          <input 
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files[0];
              if (file) {
                if (file.size > 10 * 1024 * 1024) {
                  setError('Image file size must be less than 10MB');
                  e.target.value = '';
                  return;
                }
                setForm({ ...form, imageFile: file });
                setError('');
              }
            }}
            className="w-full border rounded px-3 py-2" 
          />
          <p className="text-xs text-gray-500 mt-1">Thumbnail for mosaic grid and video poster. Max 10MB.</p>
          {form.imageFile && (
            <p className="text-sm text-green-600 mt-1">Selected: {form.imageFile.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Alt Text</label>
          <input 
            value={form.alt} 
            onChange={e => setForm({ ...form, alt: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="Image description" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mentor Name</label>
          <input 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="e.g., Dr. Jane Smith" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title / Position</label>
          <input 
            value={form.title} 
            onChange={e => setForm({ ...form, title: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="e.g., Senior Data Scientist at Google" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">University / Education</label>
          <input 
            value={form.university} 
            onChange={e => setForm({ ...form, university: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="e.g., Stanford University, MIT" 
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea 
            value={form.bio} 
            onChange={e => setForm({ ...form, bio: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="Brief biography..." 
            rows="3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Quote</label>
          <textarea 
            value={form.quote} 
            onChange={e => setForm({ ...form, quote: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="Inspirational quote..." 
            rows="2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Expertise (comma-separated)</label>
          <input 
            value={form.expertise} 
            onChange={e => setForm({ ...form, expertise: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="e.g., Machine Learning, AI, Data Science" 
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Achievements (one per line)</label>
          <textarea 
            value={form.achievements} 
            onChange={e => setForm({ ...form, achievements: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="List achievements, one per line..." 
            rows="4"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Additional Images (one URL per line)</label>
          <textarea 
            value={form.additionalImages} 
            onChange={e => setForm({ ...form, additionalImages: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" 
            rows="3"
          />
          <p className="text-xs text-gray-500 mt-1">Gallery images for the mentor page</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Course Sections (separate sections with blank line)</label>
          <textarea 
            value={form.courseSections} 
            onChange={e => setForm({ ...form, courseSections: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="Section 1 Title&#10;Section 1 description...&#10;&#10;Section 2 Title&#10;Section 2 description..." 
            rows="6"
          />
          <p className="text-xs text-gray-500 mt-1">Course content sections - separate with double line break</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
          <input 
            value={form.linkedIn} 
            onChange={e => setForm({ ...form, linkedIn: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="https://linkedin.com/in/..." 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Twitter URL</label>
          <input 
            value={form.twitter} 
            onChange={e => setForm({ ...form, twitter: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="https://twitter.com/..." 
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Website URL</label>
          <input 
            value={form.website} 
            onChange={e => setForm({ ...form, website: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="https://example.com" 
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Live Sessions (JSON Array)</label>
          <textarea 
            value={form.liveSessions} 
            onChange={e => setForm({ ...form, liveSessions: e.target.value })} 
            className="w-full border rounded px-3 py-2 font-mono text-sm" 
            placeholder='[{"title":"Introduction to AI","date":"2026-01-15","time":"10:00 AM EST","description":"Learn AI basics","registrationUrl":"https://example.com/register"}]' 
            rows="6"
          />
          <p className="text-xs text-gray-500 mt-1">JSON array of live session objects with title, date, time, description, registrationUrl</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Students Count</label>
          <input 
            value={form.studentsCount} 
            onChange={e => setForm({ ...form, studentsCount: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="5000" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Courses Count</label>
          <input 
            value={form.coursesCount} 
            onChange={e => setForm({ ...form, coursesCount: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="25" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rating</label>
          <input 
            value={form.rating} 
            onChange={e => setForm({ ...form, rating: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="4.8" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Years Experience</label>
          <input 
            value={form.experience} 
            onChange={e => setForm({ ...form, experience: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="10" 
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Student Testimonials (JSON Array)</label>
          <textarea 
            value={form.testimonials} 
            onChange={e => setForm({ ...form, testimonials: e.target.value })} 
            className="w-full border rounded px-3 py-2 font-mono text-sm" 
            placeholder='[{"text":"This course changed my life!","studentName":"John Doe","studentRole":"Software Engineer","studentImage":"https://example.com/image.jpg"}]' 
            rows="6"
          />
          <p className="text-xs text-gray-500 mt-1">JSON array of testimonial objects with text, studentName, studentRole, studentImage (optional)</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Size Preset</label>
          <select 
            className="w-full border rounded px-3 py-2"
            onChange={e => {
              const presets = {
                'small': { width: 180, height: 180 },
                'medium': { width: 220, height: 220 },
                'large': { width: 280, height: 280 },
                'hero': { width: 320, height: 320 },
                'largest': { width: 360, height: 360 },
                'custom': form.size
              };
              const selected = e.target.value;
              if (selected !== 'custom') {
                setForm({ ...form, size: presets[selected] });
              }
            }}
          >
            <option value="custom">Custom Size</option>
            <option value="small">Small (180×180px)</option>
            <option value="medium">Medium (220×220px)</option>
            <option value="large">Large (280×280px)</option>
            <option value="hero">Hero (320×320px)</option>
            <option value="largest">Largest (360×360px)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Width (px)</label>
          <input 
            type="number"
            value={form.size.width} 
            onChange={e => setForm({ ...form, size: { ...form.size, width: Number(e.target.value) || 200 } })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="200" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Height (px)</label>
          <input 
            type="number"
            value={form.size.height} 
            onChange={e => setForm({ ...form, size: { ...form.size, height: Number(e.target.value) || 200 } })} 
            className="w-full border rounded px-3 py-2" 
            placeholder="200" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Position (0-8)</label>
          <input 
            type="number" 
            value={form.order} 
            onChange={e => setForm({ ...form, order: e.target.value })} 
            className="w-full border rounded px-3 py-2" 
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
        </div>

        <div className="flex items-center">
          <input 
            id="visible" 
            type="checkbox" 
            checked={form.visible} 
            onChange={e => setForm({ ...form, visible: e.target.checked })} 
            className="mr-2" 
          />
          <label htmlFor="visible">Visible</label>
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button 
            type="submit" 
            disabled={saving || uploading} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : (saving ? 'Saving...' : (editingId ? 'Update Image' : 'Add Image'))}
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
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Alt Text</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Size</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Position</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Visible</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-500">No images added. Add 9 images for the mosaic layout.</td></tr>
              ) : list.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">
                    <img src={item.imageUrl} alt={item.alt} className="w-20 h-20 object-cover rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{item.alt || 'No alt text'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-gray-100">
                      {item.size ? `${item.size.width}×${item.size.height}px` : 'Default'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-700">Position {item.order || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleVisible(item)}
                      className={`px-2 py-1 rounded text-xs ${item.visible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {item.visible ? 'Yes' : 'No'}
                    </button>
                  </td>
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

      <div className="mt-6 p-6 bg-white border-2 border-blue-200 rounded-lg relative">
        {/* Decorative Corner Lines - All Four Corners Matching Landing Page */}
        <div className="absolute top-0 left-0" style={{ width: '60px', height: '60px', borderTop: '3px solid #6C6FF5', borderLeft: '3px solid #6C6FF5' }}></div>
        <div className="absolute top-0 right-0" style={{ width: '60px', height: '60px', borderTop: '3px solid #6C6FF5', borderRight: '3px solid #6C6FF5' }}></div>
        <div className="absolute bottom-0 left-0" style={{ width: '60px', height: '60px', borderBottom: '3px solid #6C6FF5', borderLeft: '3px solid #6C6FF5' }}></div>
        <div className="absolute bottom-0 right-0" style={{ width: '60px', height: '60px', borderBottom: '3px solid #6C6FF5', borderRight: '3px solid #6C6FF5' }}></div>
        
        <h3 className="font-bold text-blue-900 mb-3 text-lg" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Design Preview</h3>
        <div className="text-center my-6 py-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/30">
          <div style={{ fontFamily: 'Playfair Display, Georgia, serif', letterSpacing: '1px' }}>
            <div style={{ fontSize: '20px', fontWeight: 400, color: '#000000', lineHeight: 1.1, marginBottom: '2px', textTransform: 'uppercase' }}>
              MASTERCLASSES
            </div>
            <div style={{ fontSize: '20px', fontWeight: 400, color: '#000000', lineHeight: 1.1, marginBottom: '4px', textTransform: 'uppercase' }}>
              FROM
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#6366F1', lineHeight: 1.0, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              MENTORS
            </div>
            <div style={{ fontSize: '26px', fontWeight: 400, color: '#A0A0A0', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              COMMUNITY
            </div>
          </div>
        </div>
        
        <h3 className="font-semibold text-blue-900 mb-2 mt-6">💡 Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Add exactly 9 images for the perfect asymmetric mosaic layout</li>
          <li>• Frame sizes: Pos 0: 320×320px (Hero top) | Pos 1: 280×280px (Large left) | Pos 2: 220×220px (Medium left)</li>
          <li className="ml-4 text-xs">Pos 3: 180×180px (Small left) | Pos 4: 360×360px (Largest center) | Pos 5: 280×280px (Large right)</li>
          <li className="ml-4 text-xs">Pos 6: 220×220px (Medium right) | Pos 7: 180×180px (Small right) | Pos 8: 220×220px (Accent)</li>
          <li>• Size presets: Small 180×180 | Medium 220×220 | Large 280×280 | Hero 320×320 | Largest 360×360</li>
          <li>• Center space (420×260px) is reserved for text overlay</li>
          <li>• Minimum 24px gap between frames for clean spacing</li>
          <li>• Corner brackets appear on all four corners (60px, 3px stroke, #6C6FF5)</li>
        </ul>
      </div>
    </div>
  );
}
