# 🚀 Complete Deployment Guide - Mentlearn Platform

## 🎯 Deployment Overview

**Frontend (React)** → Deploy to **Vercel**  
**Backend (Node.js/Express)** → Deploy to **Render**

---

## ✅ Current Deployment Status

### Live Deployments:
- **Frontend**: https://mentlearn.vercel.app
- **Backend**: https://mentlearn-backend-1212.onrender.com
- **Vercel Account**: `mentneo` (abhis-projects-9c290dd6)
- **Project Name**: `mentlearn`

---

## 🌐 Frontend Deployment (Vercel)

### Method 1: Deploy via Vercel CLI (Recommended)

#### Prerequisites:
- Vercel CLI installed: `npm i -g vercel`
- Logged into Vercel: `vercel login`

#### Steps:

1. **Navigate to Frontend Directory**
```bash
cd /Users/yeduruabhiram/Desktop/abhi2mentneo/mentlearn
```

2. **Deploy to Production**
```bash
vercel --prod
```

3. **Answer Prompts**:
   - Set up and deploy? **Yes**
   - Which scope? **abhi's projects**
   - Link to existing project? **Yes** (select `mentlearn`)
   - Want to modify settings? **No**

4. **Wait for Deployment** (2-4 minutes)

**✅ Your site will be live!**

---

### Method 2: Deploy via GitHub + Vercel Dashboard

#### 1. Push Code to GitHub
```bash
cd /Users/yeduruabhiram/Desktop/abhi2mentneo/mentlearn
git add .
git commit -m "Deploy to production"
git push origin main
```

#### 2. Connect to Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Login with account: **mentneo**
3. Click **"Add New"** → **"Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./` (or leave blank)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

#### 3. Set Environment Variables

Go to **Project Settings** → **Environment Variables** and add:

```env
# Backend API
REACT_APP_API_URL=https://mentlearn-backend-1212.onrender.com
REACT_APP_API_BASE=https://mentlearn-backend-1212.onrender.com/api

# Razorpay LIVE
REACT_APP_RAZORPAY_KEY_ID=rzp_live_RW6hQg5iL5Thm2

# Firebase
REACT_APP_FIREBASE_API_KEY=AIzaSyD5TM1O1F1T49UKMbUG0nI7k19FHk6Cvr0
REACT_APP_FIREBASE_AUTH_DOMAIN=mentor-app-238c6.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=mentor-app-238c6
REACT_APP_FIREBASE_STORAGE_BUCKET=mentor-app-238c6.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=943754909900
REACT_APP_FIREBASE_APP_ID=1:943754909900:web:cef25346ffae73d2e20a69
REACT_APP_FIREBASE_MEASUREMENT_ID=G-8T3CMHE740

# Cloudinary
REACT_APP_CLOUDINARY_CLOUD_NAME=dp8bfdbab
REACT_APP_CLOUDINARY_UPLOAD_PRESET=mentneo_uploads

# Build Configuration
CI=false
GENERATE_SOURCEMAP=false
```

#### 4. Deploy

Click **"Deploy"** - Vercel will automatically build and deploy.

---

### Important: Vercel Configuration File

A `vercel.json` file is included in the project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "framework": null,
  "env": {
    "CI": "false",
    "GENERATE_SOURCEMAP": "false",
    "NODE_ENV": "production"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures:
- ✅ Correct build configuration
- ✅ Client-side routing works (React Router)
- ✅ Build doesn't fail on warnings

---

## 🖥️ Backend Deployment (Render)

### Prerequisites
- Render account connected to GitHub
- Backend already deployed at: `https://mentlearn-backend-1212.onrender.com`

### Steps (if redeploying):

#### 1. Push Backend Code
```bash
cd /Users/yeduruabhiram/Desktop/abhi2mentneo/mentlearn
git add backend/
git commit -m "Update backend"
git push origin main
```

#### 2. Render Auto-Deploys

If auto-deploy is enabled, Render will automatically redeploy when you push to `main`.

#### 3. Manual Deploy (if needed)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your service: `mentlearn-backend-1212`
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

### Backend Environment Variables

Ensure these are set in Render:

```env
NODE_ENV=production
PORT=10000

# CORS - Frontend Origins
FRONTEND_ORIGIN=https://mentlearn.vercel.app,http://localhost:3000

# Razorpay LIVE
RAZORPAY_KEY_ID=rzp_live_RW6hQg5iL5Thm2
RAZORPAY_SECRET=your_secret_here

# Firebase Admin SDK (ONE LINE JSON)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

---

## 🔍 Accessing Your Deployment

### Vercel Dashboard Access:

**Direct Project Link**: https://vercel.com/abhis-projects-9c290dd6/mentlearn

**Account**: `mentneo`

**If you can't see the project:**
1. Make sure you're logged into the **mentneo** account
2. Check you're in the correct team/organization
3. Use the direct link above

---

### Disable Deployment Protection (Make Site Public):

By default, Vercel may enable deployment protection. To make your site publicly accessible:

1. Go to: https://vercel.com/abhis-projects-9c290dd6/mentlearn/settings
2. Find **"Deployment Protection"**
3. Turn OFF **"Vercel Authentication"**
4. Save changes

Now anyone can access your site without logging in!

---

## ✅ Post-Deployment Checklist

### Backend Verification
- [ ] Service status is "Live" in Render dashboard
- [ ] Health check works: `curl https://new-version-mentlearn-3.onrender.com/api/health`
- [ ] Environment variables are set
- [ ] Logs show no errors

### Frontend Verification
- [ ] Site loads without errors
- [ ] No blank pages
- [ ] Login/signup works
- [ ] Can browse courses
- [ ] Payment flow works
- [ ] No console errors in browser DevTools

### Integration Tests
- [ ] Frontend connects to backend API
- [ ] CORS is working (no CORS errors)
- [ ] Payment gateway integration works
- [ ] Firebase authentication works
- [ ] Images load from Cloudinary

---

## 🔧 Common Issues & Solutions

### Issue: "404: NOT_FOUND" after deployment
**Cause**: Deployed from wrong directory (parent instead of `mentlearn`)  
**Solution**: 
```bash
cd /Users/yeduruabhiram/Desktop/abhi2mentneo/mentlearn
vercel --prod
```

### Issue: Build fails with "Treating warnings as errors"
**Cause**: CI=true treats warnings as errors  
**Solution**: Set `CI=false` in environment variables (already in `vercel.json`)

### Issue: Routes don't work (404 on refresh)
**Cause**: Missing rewrites for client-side routing  
**Solution**: `vercel.json` includes rewrites configuration

### Issue: Can't see project in Vercel dashboard
**Cause**: Logged into different account  
**Solution**: 
- Login with **mentneo** account
- Use direct link: https://vercel.com/abhis-projects-9c290dd6/mentlearn

### Issue: Site shows Vercel login page
**Cause**: Deployment protection enabled  
**Solution**: Disable "Vercel Authentication" in project settings

### Issue: CORS errors between frontend and backend
**Solution**: Add Vercel URL to `FRONTEND_ORIGIN` in Render:
```
https://mentlearn.vercel.app,http://localhost:3000
```

### Issue: Environment variables not working
**Solution**: 
- All React env vars MUST start with `REACT_APP_`
- Redeploy after adding/changing env vars
- Check they're set for "Production" environment

---

## 🌐 Production URLs

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://mentlearn.vercel.app |
| Backend API | Render | https://mentlearn-backend-1212.onrender.com |
| Health Check | Render | https://mentlearn-backend-1212.onrender.com/api/health |
| Vercel Dashboard | Vercel | https://vercel.com/abhis-projects-9c290dd6/mentlearn |

---

## 🚀 Quick Deploy Commands

### Deploy Frontend:
```bash
cd /Users/yeduruabhiram/Desktop/abhi2mentneo/mentlearn
vercel --prod
```

### Check Deployment Status:
```bash
vercel ls
```

### Check Logged-in Account:
```bash
vercel whoami
```

### View Project Info:
```bash
cat .vercel/project.json
```

---

## 📊 Deployment Monitoring

### Check Build Logs:
1. Go to Vercel project dashboard
2. Click on latest deployment
3. View "Build Logs" tab

### Check Runtime Logs (Backend):
1. Go to Render dashboard
2. Click on your service
3. View "Logs" tab

### Test API Connection:
```bash
# Test backend health
curl https://mentlearn-backend-1212.onrender.com/api/health

# Test from frontend (browser console)
fetch(process.env.REACT_APP_API_URL + '/api/health')
  .then(r => r.json())
  .then(console.log)
```

---

**Last Updated**: February 2, 2026  
**Deployment Status**: ✅ Live and Working
