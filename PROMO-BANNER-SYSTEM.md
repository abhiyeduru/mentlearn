# Promotional Banner Management System

## Overview
The promotional banner system allows admins to dynamically create, edit, and manage promotional banners that appear on the landing page. No code changes required!

## Features
- 🖼️ **Image Upload**: Upload banner images directly to Firebase Storage
- 📝 **Rich Content**: Add title, description, pricing, features, and CTA buttons
- 🎯 **Priority System**: Control which banner shows first
- ⚡ **Real-time Updates**: Changes reflect immediately on the landing page
- 🔒 **Active/Inactive Toggle**: Enable or disable banners without deleting them

## Accessing the Admin Panel

1. Navigate to: `https://yoursite.com/admin/promo-banners`
2. Or use the admin sidebar: **Admin Dashboard → Promo Banners**

## Creating a New Banner

### Step 1: Click "Add Banner"
Click the blue "+ Add Banner" button in the top right

### Step 2: Upload Banner Image
1. Click "Upload Image" button
2. Select your promotional image (recommended: 1920x800px)
3. Wait for upload to complete
4. Preview appears below the upload button

### Step 3: Fill in Details

#### Basic Information
- **Title**: Main headline (e.g., "Limited Time Early Access Offer")
- **Description**: Supporting text below the title

#### Pricing (Optional)
- **Original Price**: Strike-through price (e.g., 4999)
- **Offer Price**: Highlighted offer price (e.g., 999)
- **Discount %**: Auto-calculated discount badge (e.g., 80)

#### Features (Optional)
- Add up to 3+ key features
- Each feature appears in a highlighted box
- Examples: "100+ Hours of Content", "1:1 Mentorship", "Project Portfolio"
- Click "+ Add Feature" to add more

#### Call-to-Action (CTA)
- **CTA Button Text**: Button label (e.g., "Enroll Now")
- **CTA Link**: Where the button leads (e.g., "/BookDemo", "/courses")

#### Footer Text (Optional)
- Small text below CTA button
- Example: "30-day money-back guarantee. No questions asked."

#### Settings
- **Priority**: Higher numbers show first (1-100)
- **Active**: Toggle to enable/disable the banner

### Step 4: Save
Click "Create Banner" to publish

## Editing an Existing Banner

1. Click the **pencil icon** (Edit) next to any banner
2. Modify fields as needed
3. Click "Update Banner" to save changes

## Deleting a Banner

1. Click the **trash icon** (Delete) next to the banner
2. Confirm deletion in the popup
3. Banner is permanently removed

## Banner Display Logic

- **Only active banners** appear on the landing page
- **Highest priority banner** is displayed if multiple active banners exist
- Banner section **auto-hides** if no active banners exist
- Changes are **instant** - refresh the landing page to see updates

## Database Structure

Banners are stored in Firestore collection: `promoBanners`

### Document Schema
```javascript
{
  title: "Limited Time Offer",              // String
  description: "Join our program...",       // String
  imageUrl: "https://...",                  // String (Firebase Storage URL)
  originalPrice: 4999,                      // Number
  offerPrice: 999,                          // Number
  discount: 80,                             // Number (percentage)
  features: [                               // Array of strings
    "100+ Hours of Content",
    "1:1 Mentorship",
    "Project Portfolio"
  ],
  ctaText: "Enroll Now",                    // String
  ctaLink: "/BookDemo",                     // String (route path)
  footerText: "30-day money-back...",       // String
  active: true,                             // Boolean
  priority: 1,                              // Number (1-100)
  createdAt: "2025-01-01T00:00:00Z",       // ISO String
  updatedAt: "2025-01-01T00:00:00Z"        // ISO String
}
```

## Design Guidelines

### Image Recommendations
- **Dimensions**: 1920x800px (or similar wide aspect ratio)
- **Format**: JPG, PNG, WebP
- **Size**: Under 500KB for fast loading
- **Style**: Match the blue-to-purple gradient theme
- **Text**: Avoid text in image (use title/description fields)

### Color Scheme
The banner automatically uses:
- Gradient border: Blue (#007bff) to Purple (#8b5cf6)
- Background: White with 95% opacity
- Text: Gray-900 for headings, Gray-600 for body
- Buttons: Blue (#007bff)

### Best Practices
1. **Keep it simple**: One clear offer per banner
2. **Strong CTA**: Use action words like "Enroll Now", "Get Started", "Claim Offer"
3. **Clear value**: Highlight the discount or benefit prominently
4. **Limited features**: 3-5 features maximum for readability
5. **Test on mobile**: Ensure images look good on small screens

## Troubleshooting

### Banner not showing on landing page
- ✅ Check if banner is marked as "Active"
- ✅ Verify priority is set (higher = shows first)
- ✅ Refresh browser cache (Cmd+Shift+R on Mac)
- ✅ Check browser console for errors

### Image not uploading
- ✅ Check file size (should be under 5MB)
- ✅ Verify file format (JPG, PNG, WebP supported)
- ✅ Check Firebase Storage rules
- ✅ Ensure admin has proper permissions

### Changes not reflecting
- ✅ Hard refresh the landing page
- ✅ Clear browser cache
- ✅ Check if you clicked "Save" or "Update Banner"
- ✅ Verify Firestore connection in console

## Firebase Storage Setup

Images are stored in: `promo-banners/` folder in Firebase Storage

### Storage Rules (already configured)
```
service firebase.storage {
  match /b/{bucket}/o {
    match /promo-banners/{imageId} {
      allow read: if true;  // Public read access
      allow write: if request.auth != null;  // Authenticated users only
    }
  }
}
```

## Example Banner Configuration

### Flash Sale Banner
```
Title: "Flash Sale - 80% OFF All Courses!"
Description: "Limited time offer - Enroll today and save big on our premium courses"
Image: Upload promotional graphic
Original Price: 4999
Offer Price: 999
Discount: 80
Features:
  - "100+ Hours of Content"
  - "Lifetime Access"
  - "Certificate of Completion"
CTA Text: "Claim Offer Now"
CTA Link: "/courses"
Footer: "Offer ends in 48 hours. No code needed."
Priority: 100
Active: ✅
```

### New Course Launch
```
Title: "New Course: Full Stack Development"
Description: "Master React, Node.js, and MongoDB in 12 weeks with expert mentors"
Image: Upload course preview
Offer Price: 1999
Features:
  - "Live Sessions Weekly"
  - "Real-world Projects"
  - "Job Assistance"
CTA Text: "Enroll Today"
CTA Link: "/BookDemo"
Footer: "Early bird pricing - Limited to first 50 students"
Priority: 90
Active: ✅
```

## Support

For technical issues or questions:
- Check Firebase Console for data
- Review browser console for errors
- Contact development team

---

**Last Updated**: December 19, 2025
**Version**: 1.0
