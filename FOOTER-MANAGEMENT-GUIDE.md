# Footer Management System

## Overview
The Footer Management System allows admins to dynamically control footer sections and contact information displayed on the landing page.

## Admin Access
Navigate to: `/admin/footer`

## Features

### 1. Footer Sections Management
Create multiple footer sections with links, similar to the screenshot provided:
- Trending Courses
- Tutorial
- Career Advice Resources
- Any custom section

### 2. Contact Information
Manage the bottom bar contact details:
- Phone number
- Email address
- Copyright text

## How to Use

### Adding a Footer Section

1. **Click "Add Section" button**
2. **Fill in the form:**
   - **Section Title**: e.g., "Trending Courses", "Tutorial", "Career Advice Resources"
   - **Display Order**: Number to control the order (0, 1, 2, etc.)
   - **Links**: Add multiple links with:
     - Link Name: e.g., "Data Science Course"
     - URL: e.g., "/courses/data-science" or full URL

3. **Add Multiple Links**: Click "Add Link" button to add more links to the section
4. **Save**: Click "Create" to save the section

### Example Footer Sections

#### Section 1: Trending Courses
```
Title: Trending Courses
Order: 0
Links:
  - Data Science Course → /courses/data-science
  - Advanced AI & Machine Learning Course → /courses/ai-ml
  - Devops Course → /courses/devops
  - Full Stack Developer Course → /courses/full-stack
  - Machine Learning Course → /courses/machine-learning
  - Data Structure and Algorithms (DSA) Course → /courses/dsa
  - Web Development Course → /courses/web-development
  - System Design Course → /courses/system-design
  - Artificial Intelligence & Machine Learning Course → /courses/ai
```

#### Section 2: Tutorial
```
Title: Tutorial
Order: 1
Links:
  - Data Structure Tutorial → /tutorials/data-structure
  - Python Tutorial → /tutorials/python
  - Java Tutorial → /tutorials/java
  - DBMS Tutorial → /tutorials/dbms
  - C Tutorial → /tutorials/c
  - JavaScript Tutorial → /tutorials/javascript
  - C++ Tutorial → /tutorials/cpp
  - SQL Tutorial → /tutorials/sql
  - Data Science Tutorial → /tutorials/data-science
  - CSS Tutorial → /tutorials/css
  - Software Engineering Tutorial → /tutorials/software-engineering
  - HTML Tutorial → /tutorials/html
```

#### Section 3: Career Advice Resources
```
Title: Career Advice Resources
Order: 2
Links:
  - Software Development → /career/software-development
  - Data Science → /career/data-science
  - Machine Learning → /career/machine-learning
  - Devops → /career/devops
```

### Updating Contact Information

In the "Contact Information" section, you can set:
- **Phone Number**: e.g., "08045579576"
- **Email**: e.g., "contact@mentneo.com"
- **Copyright Text**: e.g., "© 2024 InterviewBit Technologies Pvt. Ltd. All Rights Reserved."

Click "Save Contact Info" to update.

## Footer Display

The footer will automatically display:
1. All active footer sections in order (sorted by the "order" field)
2. Contact information in the bottom bar with:
   - Copyright text on the left
   - "Need Help? Talk to us at [phone]" 
   - "or REQUEST CALLBACK →" link to email

## Database Structure

### Collection: `footerSections`
```javascript
{
  title: "Trending Courses",
  order: 0,
  links: [
    { name: "Data Science Course", url: "/courses/data-science" },
    { name: "Web Development Course", url: "/courses/web-development" }
  ],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Collection: `footerContact`
```javascript
{
  phone: "08045579576",
  email: "contact@mentneo.com",
  copyright: "© 2024 InterviewBit Technologies Pvt. Ltd. All Rights Reserved."
}
```

## Tips

1. **Order Matters**: Use the order field to control how sections appear (left to right)
2. **Link URLs**: Can be internal paths (e.g., `/courses/python`) or external URLs (e.g., `https://example.com`)
3. **Keep it Organized**: Group related links in the same section
4. **Mobile Responsive**: The footer automatically adjusts for mobile devices
5. **Update Anytime**: Changes are reflected immediately on the landing page

## Support

For any issues with the footer management system, contact the development team.
