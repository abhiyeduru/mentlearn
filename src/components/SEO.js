import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
  author = 'Mentneo'
}) => {
  const location = useLocation();
  const currentUrl = `https://www.mentlearn.in${location.pathname}`;

  const defaultTitle = 'Mentneo - Full Stack Development Program | Expert Mentorship & Live Sessions';
  const defaultDescription = 'Transform your college life into a career launchpad with Mentneo. Learn Full Stack Development, Data Analytics with expert mentors through live sessions.';
  const defaultKeywords = 'Mentneo, full stack development, MERN stack, data analytics, coding bootcamp, online learning, expert mentorship, live sessions';
  const defaultImage = 'https://www.mentlearn.in/mentneo-social.jpg';

  const pageTitle = title ? `${title} | Mentneo` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;
  const pageImage = image || defaultImage;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update meta tags
    updateMetaTag('name', 'description', pageDescription);
    updateMetaTag('name', 'keywords', pageKeywords);
    updateMetaTag('name', 'author', author);
    updateMetaTag('name', 'robots', 'index, follow, max-image-preview:large');

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', pageTitle);
    updateMetaTag('property', 'og:description', pageDescription);
    updateMetaTag('property', 'og:image', pageImage);
    updateMetaTag('property', 'og:url', currentUrl);
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:site_name', 'Mentneo');

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', pageTitle);
    updateMetaTag('name', 'twitter:description', pageDescription);
    updateMetaTag('name', 'twitter:image', pageImage);
    updateMetaTag('name', 'twitter:site', '@mentneo');

    // Update canonical link
    updateCanonicalLink(currentUrl);
  }, [pageTitle, pageDescription, pageKeywords, pageImage, currentUrl, type, author]);

  const updateMetaTag = (attribute, key, content) => {
    let element = document.querySelector(`meta[${attribute}="${key}"]`);
    if (element) {
      element.setAttribute('content', content);
    } else {
      element = document.createElement('meta');
      element.setAttribute(attribute, key);
      element.setAttribute('content', content);
      document.head.appendChild(element);
    }
  };

  const updateCanonicalLink = (url) => {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', url);
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', url);
      document.head.appendChild(canonical);
    }
  };

  return null;
};

export default SEO;

// SEO Configuration for different pages
export const SEOConfig = {
  home: {
    title: 'Home',
    description: 'Transform your college life into a career launchpad. Learn Full Stack Development with expert mentors through interactive live sessions and personalized guidance.',
    keywords: 'Mentneo, full stack development, online learning platform, coding bootcamp, MERN stack, React, Node.js, expert mentorship'
  },
  courses: {
    title: 'Courses',
    description: 'Explore our comprehensive courses in Full Stack Development, Data Analytics, MERN Stack and more. Learn with expert mentors and hands-on projects.',
    keywords: 'programming courses, full stack course, data analytics course, MERN stack, web development, coding classes'
  },
  liveSessions: {
    title: 'Live Sessions',
    description: 'Join interactive live coding sessions with industry experts. Get real-time guidance, ask questions, and learn with peers in scheduled sessions.',
    keywords: 'live coding sessions, interactive learning, real-time mentorship, coding workshops, online classes'
  },
  mentors: {
    title: 'Expert Mentors',
    description: 'Learn from industry professionals with years of experience. Our mentors provide personalized guidance to help you achieve your career goals.',
    keywords: 'coding mentors, tech mentors, programming instructors, industry experts, career guidance'
  },
  reviews: {
    title: 'Student Reviews & Testimonials',
    description: 'Read success stories and reviews from our students. See how Mentneo has transformed careers and helped students land their dream jobs.',
    keywords: 'student reviews, testimonials, success stories, coding bootcamp reviews, student feedback'
  },
  pricing: {
    title: 'Pricing & Plans',
    description: 'Affordable pricing plans for every student. Choose the plan that fits your learning goals and budget. Start your tech career today.',
    keywords: 'course pricing, bootcamp cost, affordable coding courses, learning plans, student pricing'
  },
  about: {
    title: 'About Us',
    description: 'Learn about Mentneo\'s mission to transform college students into industry-ready professionals through expert mentorship and practical learning.',
    keywords: 'about mentneo, our mission, education platform, online learning, career transformation'
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with Mentneo. Have questions about our courses or need guidance? Our team is here to help you start your learning journey.',
    keywords: 'contact mentneo, support, customer service, get in touch, help center'
  },
  blog: {
    title: 'Blog & Resources',
    description: 'Stay updated with the latest in tech, coding tutorials, career advice, and industry insights from Mentneo experts.',
    keywords: 'tech blog, coding tutorials, programming tips, career advice, industry insights'
  },
  faq: {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about Mentneo courses, enrollment, pricing, live sessions, and more.',
    keywords: 'FAQ, frequently asked questions, help, course information, enrollment questions'
  }
};
