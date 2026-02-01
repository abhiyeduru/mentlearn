// Quick setup script to add a test promotional banner to Firestore
// Run this in browser console or Node.js with Firebase Admin SDK

import { collection, addDoc } from 'firebase/firestore';
import { db } from './src/firebase/firebase.js';

async function addTestPromoBanner() {
  try {
    const testBanner = {
      title: "Limited Time Early Access Offer",
      description: "Join our flagship Full Stack Development Program at a special launch price. Limited seats available.",
      imageUrl: "", // You can add an image URL here or upload via admin panel
      originalPrice: 4999,
      offerPrice: 999,
      discount: 80,
      features: [
        "100+ Hours of Content",
        "1:1 Mentorship",
        "Project Portfolio"
      ],
      ctaText: "Enroll Now",
      ctaLink: "/BookDemo",
      footerText: "30-day money-back guarantee. No questions asked.",
      active: true,
      priority: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'promoBanners'), testBanner);
    console.log('✅ Test banner added successfully! Document ID:', docRef.id);
    console.log('🎉 Visit /admin/promo-banners to manage your banner');
    console.log('📸 Upload an image to make it look professional!');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding test banner:', error);
    throw error;
  }
}

// If running directly, execute the function
if (typeof window !== 'undefined') {
  console.log('To add a test banner, call: addTestPromoBanner()');
}

export default addTestPromoBanner;
