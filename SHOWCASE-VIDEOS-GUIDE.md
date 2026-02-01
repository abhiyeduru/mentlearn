# 🎬 Showcase Videos Section - Complete Guide

## Overview
A premium video showcase section displayed before the footer on the landing page. Admin can upload and manage promotional videos/masterclasses with full control over content and appearance.

---

## ✨ Features

### Landing Page Display
- **Premium Dark Theme**: Gradient background (gray-900 → blue-900 → purple-900)
- **Video Carousel**: Swipeable video cards with navigation
- **Responsive Layout**: 2-column layout (video left, content right)
- **Embedded Videos**: YouTube/Vimeo iframe support
- **Rich Content**: Title, description, instructor, highlights, CTAs
- **Auto-convert URLs**: Paste any YouTube URL, auto-converts to embed format

### Admin Panel Features
- **Full CRUD Operations**: Create, Read, Update, Delete videos
- **Easy Video Upload**: Just paste YouTube URL
- **Rich Metadata**: Category, instructor, highlights
- **Dual CTAs**: Primary and secondary call-to-action buttons
- **Priority Control**: Order videos by priority
- **Active/Inactive Toggle**: Show/hide videos without deletion
- **Thumbnail Support**: Optional custom thumbnails
- **Real-time Preview**: See thumbnail and details in admin list

---

## 🚀 How to Use

### For Admins

#### Access Admin Panel
1. Login as admin
2. Navigate to: `/admin/showcase-videos`
3. Or from admin dashboard sidebar

#### Add New Video
1. Click **"Add New Video"** button
2. Fill in the form:
   - **Video Title** (required): e.g., "Masterclass | Dare to Dream"
   - **Description**: Brief overview of the video
   - **Category**: e.g., Masterclass, Tutorial, Demo
   - **Instructor Name**: Who's teaching/presenting
   - **Video URL** (required): YouTube or Vimeo URL
     - Paste: `https://youtube.com/watch?v=VIDEO_ID`
     - OR: `https://www.youtube.com/embed/VIDEO_ID`
     - Auto-converts to embed format
   - **Thumbnail URL** (optional): Custom thumbnail image
   - **Highlights** (up to 3): Key takeaways or features
   - **Primary CTA**: Button text and link (e.g., "Join Free Demo" → /callback)
   - **Secondary CTA** (optional): Second button
   - **Footer Text**: Small text at bottom (e.g., guarantee)
   - **Priority**: Higher number = shows first
   - **Active**: Toggle to show/hide on landing page
3. Click **"Add Video"**

#### Edit Video
1. Find video in the list
2. Click **"Edit"** button
3. Modify any field
4. Click **"Update Video"**

#### Delete Video
1. Find video in the list
2. Click **"Delete"** button
3. Confirm deletion

---

## 📊 Firestore Collection Structure

**Collection**: `showcaseVideos`

### Document Fields
```javascript
{
  title: "Masterclass | Dare to Dream",
  description: "Learn from industry experts how to accelerate your career",
  category: "Masterclass",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  thumbnailUrl: "https://example.com/thumb.jpg", // Optional
  instructor: "Anshuman Singh",
  highlights: [
    "Career growth strategies",
    "Industry insights",
    "Live Q&A session"
  ],
  ctaText: "Join Free Demo",
  ctaLink: "/callback",
  secondaryCtaText: "Learn More",      // Optional
  secondaryCtaLink: "/courses",        // Optional
  footerText: "30-day money-back guarantee. No questions asked.",
  priority: 10,                         // Higher = shows first
  active: true,                         // Show/hide toggle
  createdAt: "2025-01-09T10:30:00Z",
  updatedAt: "2025-01-09T10:30:00Z"
}
```

---

## 🎨 Design Specifications

### Section Layout
- **Background**: Dark gradient with animated blobs
- **Container**: Max-width 7xl, centered
- **Header**: Badge + Title + Subtitle
- **Video Cards**: 2-column grid (video | content)

### Video Card Components
1. **Left Side (Video)**
   - Embedded iframe (YouTube/Vimeo)
   - Aspect ratio: 16:9
   - Min height: 300px (mobile), 400px (desktop)
   - Fallback: Thumbnail or icon

2. **Right Side (Content)**
   - Category badge (blue)
   - Title (2xl-3xl, bold, white)
   - Description (gray-300)
   - Instructor card (avatar + name)
   - Highlights list (checkmarks)
   - CTA buttons (gradient primary, ghost secondary)
   - Footer text (xs, gray-500)

### Navigation
- **Previous/Next Buttons**: Circular, white/10 background
- **Dots Indicator**: Active = gradient bar, Inactive = small dots
- **Auto-scroll**: Optional (can add timer)

---

## 🔧 Technical Implementation

### Files Created/Modified

1. **Landing Page** (`src/pages/LandingPage.js`)
   - Added state: `showcaseVideos`, `loadingShowcaseVideos`, `currentVideoIndex`
   - Added useEffect to fetch from Firestore
   - Added video showcase section before footer

2. **Admin Panel** (`src/pages/admin/ManageShowcaseVideos.js`)
   - Complete CRUD interface
   - Form validation
   - YouTube URL auto-conversion
   - Priority sorting

3. **Routes** (`src/App.js`)
   - Added route: `/admin/showcase-videos`

### Key Functions

**YouTube URL Conversion**:
```javascript
const extractYouTubeEmbedUrl = (url) => {
  // Converts watch URL to embed URL
  // https://youtube.com/watch?v=ABC → https://youtube.com/embed/ABC
};
```

**Priority Sorting**:
```javascript
videos.sort((a, b) => (b.priority || 0) - (a.priority || 0));
```

---

## 📱 Responsive Design

### Desktop (lg+)
- 2-column layout (50/50 split)
- Large video embeds (400px min height)
- Side-by-side CTA buttons

### Tablet (md)
- 2-column maintained
- Slightly smaller spacing
- Stacked CTAs

### Mobile (sm)
- Single column (video on top, content below)
- Full-width video (300px min height)
- Full-width CTAs
- Adjusted padding and text sizes

---

## 🎯 Use Cases

### 1. Masterclass Promotion
- Upload recorded masterclass session
- Add instructor details
- Highlight key topics
- CTA: "Join Free Demo"

### 2. Course Demo
- Show course preview video
- List course benefits
- Add instructor credentials
- CTA: "Enroll Now"

### 3. Success Stories
- Student testimonial video
- Career journey highlights
- Company placement info
- CTA: "Start Your Journey"

### 4. Live Session Replay
- Recent workshop recording
- Event highlights
- Speaker information
- CTA: "Register for Next Event"

---

## ⚙️ Configuration

### Carousel Settings
- **Transition**: 500ms ease-in-out
- **Controls**: Manual (prev/next buttons + dots)
- **Auto-play**: Disabled (can enable if needed)

### Video Embed Settings
- **Allow**: accelerometer, autoplay, clipboard-write, encrypted-media, gyroscope, picture-in-picture
- **Full Screen**: Enabled
- **Frame Border**: 0

---

## 🐛 Troubleshooting

### Video Not Showing?
- ✅ Check if video is marked as "Active"
- ✅ Verify YouTube URL is correct
- ✅ Check if video has public access
- ✅ Try pasting embed URL directly

### Thumbnail Not Loading?
- ✅ Verify image URL is publicly accessible
- ✅ Check image URL uses HTTPS
- ✅ YouTube auto-generates thumbnails (may not need custom)

### Order Not Working?
- ✅ Check priority values (higher = first)
- ✅ Make sure different videos have different priorities
- ✅ Refresh admin page after saving

---

## 🎨 Customization Options

### Change Theme Colors
Edit in LandingPage.js:
```javascript
// Background gradient
className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"

// Category badge
className="bg-blue-500/20 text-blue-300"

// CTA button
className="bg-gradient-to-r from-blue-600 to-purple-600"
```

### Adjust Layout
```javascript
// Video/Content split
<div className="grid grid-cols-1 lg:grid-cols-2">
  {/* Change lg:grid-cols-2 to adjust ratio */}
</div>
```

### Add Auto-Play
```javascript
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentVideoIndex(prev => 
      prev < showcaseVideos.length - 1 ? prev + 1 : 0
    );
  }, 5000); // Change every 5 seconds
  
  return () => clearInterval(timer);
}, [showcaseVideos.length]);
```

---

## 📈 Analytics & Tracking

### Recommended Tracking Events
1. **Video View**: When carousel shows a video
2. **CTA Click**: When user clicks primary/secondary button
3. **Video Play**: If using custom player
4. **Carousel Navigation**: Track prev/next button usage

### Implementation Example
```javascript
<Link 
  to={video.ctaLink}
  onClick={() => {
    // Track in Google Analytics
    gtag('event', 'showcase_video_cta_click', {
      video_title: video.title,
      cta_text: video.ctaText
    });
  }}
>
  {video.ctaText}
</Link>
```

---

## 🚀 Future Enhancements

### Possible Additions
- ✅ Auto-play carousel
- ✅ Video view count tracking
- ✅ A/B testing for CTAs
- ✅ Video categories filter
- ✅ Search functionality
- ✅ Bulk upload
- ✅ Video analytics dashboard
- ✅ Schedule videos (publish date)
- ✅ Multi-language support

---

## 📞 Support

### Common Questions

**Q: Can I use Vimeo instead of YouTube?**
A: Yes! Just paste the Vimeo embed URL.

**Q: How many videos can I add?**
A: Unlimited. Use priority to control order.

**Q: Can I hide a video without deleting?**
A: Yes! Uncheck "Active" toggle.

**Q: Can I schedule videos?**
A: Not yet, but you can manually activate them when ready.

---

## ✅ Checklist for Adding Videos

- [ ] Video recorded and uploaded to YouTube
- [ ] Video set to Public or Unlisted
- [ ] Title is compelling and clear
- [ ] Description is informative
- [ ] Category selected
- [ ] Instructor name added
- [ ] 2-3 key highlights written
- [ ] Primary CTA text and link set
- [ ] Priority assigned
- [ ] Active toggle checked
- [ ] Preview on landing page
- [ ] Test CTA links work

---

## 🎉 Success!

Your showcase video section is now live! Videos will appear before the footer on your landing page with a premium, professional design.

**Admin URL**: `/admin/showcase-videos`
**Preview URL**: `/` (scroll to bottom, above footer)

---

## 📝 Notes

- Videos are sorted by priority (highest first)
- Only active videos appear on landing page
- Changes reflect immediately (no cache)
- Mobile-optimized and fully responsive
- SEO-friendly iframe implementation
- Performance-optimized with lazy loading

---

**Last Updated**: January 9, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
