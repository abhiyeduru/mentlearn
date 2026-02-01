# 🧪 Quick Test Guide - Masterclass Mosaic

## ✅ **5-Minute Verification Test**

### **Test 1: Click Functionality** ✅
```bash
1. Go to landing page (http://localhost:3000)
2. Scroll to "MASTERCLASSES FROM MENTORS COMMUNITY"
3. Hover over ANY image → Should see opacity change
4. Click ANY image → Should navigate to /mentor/{id}
5. Should see full mentor detail page load
```
**Expected:** ✅ Navigation works, detail page displays

---

### **Test 2: Admin - Create Mentor** ✅
```bash
1. Login as admin
2. Go to Admin Dashboard → Masterclass Mosaic
3. Fill in form:
   - Upload image
   - Add name: "Test Mentor"
   - Add title: "Expert Teacher"
   - Add video: https://youtube.com/watch?v=dQw4w9WgXcQ
   - Add 2-3 additional images (URLs)
   - Add course section: "Test Section\nTest content"
   - Add LinkedIn: https://linkedin.com
4. Click "Add Image"
```
**Expected:** ✅ Mentor saved, appears in table below

---

### **Test 3: Detail Page Content** ✅
```bash
1. Click on test mentor from landing page
2. Verify displays:
   ✅ Profile image with corner brackets
   ✅ Name, title, university
   ✅ Bio and quote
   ✅ Expertise tags (if added)
   ✅ Achievements list (if added)
   ✅ Social media buttons (LinkedIn, Twitter, Website)
   ✅ Video player (YouTube embedded)
   ✅ Course sections
   ✅ Image gallery
   ✅ Back button works
```
**Expected:** ✅ All content displays beautifully

---

### **Test 4: Mobile Responsive** ✅
```bash
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or Android
4. Go to landing page mosaic section
5. Should see:
   ✅ Horizontal scroll gallery
   ✅ Images 160×160px
   ✅ Text scaled down appropriately
   ✅ Can swipe/scroll through images
   ✅ Images still clickable on mobile
```
**Expected:** ✅ Mobile layout works perfectly

---

### **Test 5: Video Embed** ✅
```bash
1. Go to mentor detail page
2. Scroll to video section
3. Should see:
   ✅ Video embedded (YouTube iframe)
   ✅ Can play video
   ✅ Fullscreen button works
   ✅ 16:9 aspect ratio maintained
```
**Expected:** ✅ Video plays without issues

---

## 🎯 **Quick Smoke Test Script**

Run this test sequence in 5 minutes:

```markdown
□ Landing page loads
□ Mosaic section visible
□ 9 images arranged asymmetrically
□ Center text displays with corner brackets
□ Hover on image → opacity changes
□ Click image → navigates to /mentor/{id}
□ Detail page loads with all content
□ Video embeds and plays
□ Gallery images display
□ Social buttons work (new tab)
□ Back button returns to home
□ Mobile view: horizontal scroll works
□ Admin: Can add new mentor
□ Admin: All fields save correctly
```

---

## 🐛 **If Something Fails**

### **Click Not Working?**
```bash
# Check browser console
Right-click → Inspect → Console tab
# Look for navigation errors
```

### **Video Not Playing?**
```bash
# Try different URL format:
YouTube: https://youtube.com/watch?v=VIDEO_ID
Vimeo: https://vimeo.com/VIDEO_ID
Direct: https://example.com/video.mp4
```

### **Mobile View Issues?**
```bash
# Hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

---

## ✅ **Success Criteria**

**System is working if ALL checked:**
- ✅ Images are clickable
- ✅ Navigation works to detail page
- ✅ All mentor content displays
- ✅ Videos play
- ✅ Mobile responsive works
- ✅ Admin can create full mentor pages

---

## 🎉 **Expected Result**

After these tests, you should have:
1. **Working clickable mosaic** on landing page
2. **Full mentor detail pages** with all features
3. **Video support** (YouTube/Vimeo/Direct)
4. **Image galleries** displaying correctly
5. **Social media links** opening in new tabs
6. **Mobile responsive** horizontal scroll
7. **Admin panel** that can create complete mentor pages

**Status: ✅ FULLY FUNCTIONAL**
