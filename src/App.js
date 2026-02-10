import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LearnIQRoutes from './LearnIQRoutes';
// Import protected route components
import { ProtectedRoute } from './components/ProtectedRoutes';
import CreatorRoute from './components/CreatorRoute';
import AdminLayout from './components/layouts/AdminLayout';
import CreatorLayout from './components/layouts/CreatorLayout';
import ExternalRedirect from './components/ExternalRedirect';
import RoleBasedRedirect from './components/RoleBasedRedirect';

// Public pages
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/AboutUs'; // Import the new About Us page
import CookiesPage from './pages/CookiesPage'; // Import our cookies page
import Login from './pages/Login';
import ModernLogin from './pages/ModernLogin';
import NewLoginPage from './pages/NewLoginPage'; // Import our new login page
import GradientLogin from './pages/GradientLogin'; // Import our gradient login page
import Signup from './pages/Signup';
import NewSignupPage from './pages/NewSignupPage'; // Import our new signup page
import GradientSignup from './pages/GradientSignup'; // Import our gradient signup page
import FullStackCoursePage from './pages/FullStackCoursePage'; // Import our new course landing page
import ForgotPassword from './pages/ForgotPassword';
import Unauthorized from './pages/Unauthorized';
import DirectAdminAccess from './pages/DirectAdminAccess';
import DebugPage from './pages/DebugPage';
import DebugAdvanced from './pages/DebugAdvanced';
import SimpleDashboard from './pages/SimpleDashboard';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CancellationRefunds from './pages/CancellationRefunds';
import Shipping from './pages/Shipping';
import BookDemo from './pages/BookDemo';
import HireFromUs from './pages/HireFromUs'; // Import the Hire From Us page
import Reviews from './pages/Reviews';
import Academy from './pages/Academy'; // <-- Add this import
import TechWave from './pages/TechWave'; // Import TechWave page
import ChatUs from './pages/ChatUs'; // Import ChatUs page
import TechCareer from './pages/TechCareer'; // Import TechCareer page
import CreateTestCreator from './pages/CreateTestCreator'; // Import Create Test Creator page
import CreateTestCreatorDirect from './pages/CreateTestCreatorDirect'; // Import Direct Test Creator page
import PublicCoursesPage from './pages/PublicCoursesPage'; // Import Public Courses Page
import CourseDetailsPage from './pages/CourseDetailsPage'; // Import Course Details Page
import RazorpayCheckout from './pages/RazorpayCheckout'; // Import Razorpay Checkout
import PaymentSuccess from './pages/PaymentSuccess'; // Import Payment Success
import AcademyTrack from './pages/AcademyTrack';
import MentorDetail from './pages/MentorDetail'; // Import Mentor Detail page
import IntensiveTrack from './pages/IntensiveTrack';
import Launchpad from './pages/Launchpad';
import CallbackRequest from './pages/CallbackRequest';
import JoinLiveSession from './pages/JoinLiveSession';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCreators from './pages/admin/ManageCreators';
import ManageCourses from './pages/admin/ManageCourses';
import ManageStudents from './pages/admin/ManageStudents';
import ManageColleges from './pages/admin/ManageColleges';
import ManageShowcaseVideos from './pages/admin/ManageShowcaseVideos';
import ViewLiveBookings from './pages/admin/ViewLiveBookings';
import ManageEnrollments from './pages/admin/ManageEnrollments';
import VerifyPayments from './pages/admin/VerifyPayments';
import Payments from './pages/admin/Payments';
import DataAnalystDashboard from './pages/admin/DataAnalystDashboard';
import ManageCoupons from './pages/admin/ManageCoupons';
import LandingVideos from './pages/admin/LandingVideos';
import MasterclassMosaic from './pages/admin/MasterclassMosaic';
import ManageWhyMentneo from './pages/admin/ManageWhyMentneo';
import ManageHiringPartners from './pages/admin/ManageHiringPartners';
import AdminPromoBanners from './pages/AdminPromoBanners';
import AdminTestimonials from './pages/AdminTestimonials';
import AdminMasterclasses from './pages/AdminMasterclasses';
import AdminLearnerExperiences from './pages/AdminLearnerExperiences';
import AdminFooter from './pages/AdminFooter';
import SupportTickets from './pages/admin/SupportTickets';
import Leads from './pages/admin/Leads';
import ManageDataAnalysts from './pages/admin/ManageDataAnalysts';
import CallbackRequests from './pages/admin/CallbackRequests';
import AdvisorRequests from './pages/admin/AdvisorRequests';
import PartnerRequests from './pages/admin/PartnerRequests';
import PartnerWithUs from './pages/PartnerWithUs';
import ManageLiveSessions from './pages/admin/ManageLiveSessions';
import LiveSessionAnalytics from './pages/admin/LiveSessionAnalytics';
import ManageReviews from './pages/admin/ManageReviews';

// Student pages - Modern LearnIQ Templates Only
// Old pages have been removed - using LearnIQ templates from LearnIQRoutes.js
import InterviewPrep from './pages/student/InterviewPrep';
import QuizAttempt from './pages/student/QuizAttempt';
import StudentQuizzes from './pages/student/StudentQuizzes';
import ReferAndEarn from './pages/student/ReferAndEarn';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResults from './pages/student/QuizResults';
import StudentCourses from './pages/student/StudentCourses';
import StudentOurCourses from './pages/student/StudentOurCourses';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import CourseEnrollment from './pages/student/CourseEnrollment';
import CoursePaymentSuccess from './pages/student/CoursePaymentSuccess';
import LiveSessions from './pages/student/LiveSessions';
import LiveSessionsPublic from './pages/LiveSessionsPublic';
import LiveSessionRegister from './pages/student/LiveSessionRegister';
import DataAnalystLiveSessions from './pages/admin/DataAnalystLiveSessions';
import HiringPartnerRegister from './pages/partner/HiringPartnerRegister';
import HiringPartnerLogin from './pages/partner/HiringPartnerLogin';
import PartnerDashboard from './pages/partner/PartnerDashboard';

// Creator pages
import CreatorDashboard from './pages/creator/Dashboard';
import CreatorCourses from './pages/creator/Courses';
import CreatorProfile from './pages/creator/Profile';
import CreatorEnrollments from './pages/creator/Enrollments';
import AssignmentSubmissions from './pages/creator/AssignmentSubmissions';

// Create route protection components for different roles
function AdminRoute({ children }) {
  const { userRole, loading, currentUser } = useAuth();

  console.log('🛡️ AdminRoute check:', { userRole, loading, currentUserExists: !!currentUser });

  if (loading) {
    console.log('⏳ AdminRoute: Still loading authentication...');
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    console.log('❌ AdminRoute: Access denied. User role is:', userRole, '(expected: admin)');
    return <Navigate to="/unauthorized" />;
  }

  console.log('✅ AdminRoute: Access granted for admin');
  return children;
}

function DataAnalystRoute({ children }) {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'data_analyst' && userRole !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function HiringPartnerRoute({ children }) {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'hiring_partner') {
    return <Navigate to="/partner/login" />;
  }

  return children;
}

// Create a redirect component instead of defining DataAnalystAccess twice
function AnalyticsRedirect() {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (userRole === 'admin' || userRole === 'data_analyst') {
      navigate('/data-analyst/dashboard');
    } else {
      navigate('/unauthorized');
    }
  }, [currentUser, userRole, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Data Analytics Dashboard...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/home-classic" element={<LandingPage />} />
              <Route path="/home-old" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/courses" element={<PublicCoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
              <Route path="/courses/:courseId/checkout" element={<RazorpayCheckout />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/courses/full-stack-development" element={<FullStackCoursePage />} />
              <Route path="/login" element={<GradientLogin />} />
              <Route path="/signup" element={<GradientSignup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/login-old" element={<Login />} />
              <Route path="/modern-login" element={<ModernLogin />} />
              <Route path="/new-login" element={<NewLoginPage />} />
              <Route path="/signup-old" element={<Signup />} />
              <Route path="/new-signup" element={<NewSignupPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/debug-advanced" element={<DebugAdvanced />} />
              <Route path="/simple" element={<SimpleDashboard />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cancellation-refunds" element={<CancellationRefunds />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/abhi" element={<ExternalRedirect to="https://mentneodashboard.vercel.app/login" />} />
              <Route path="/demo" element={<BookDemo />} />
              <Route path="/hire-from-us" element={<HireFromUs />} />
              <Route path="/callback" element={<CallbackRequest />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<PartnerWithUs />} />
              <Route path="/partner-with-us" element={<PartnerWithUs />} />

              {/* Partner Portal Routes */}
              <Route path="/partner/register" element={<HiringPartnerRegister />} />
              <Route path="/partner/login" element={<HiringPartnerLogin />} />
              <Route path="/partner/dashboard" element={
                <ProtectedRoute>
                  <HiringPartnerRoute>
                    <PartnerDashboard />
                  </HiringPartnerRoute>
                </ProtectedRoute>
              } />
              <Route path="/programs/academy-track" element={<AcademyTrack />} />
              <Route path="/programs/intensive-track" element={<IntensiveTrack />} />
              <Route path="/programs/launchpad" element={<Launchpad />} />
              {/* Add this route for Academy page */}
              <Route path="/courses/academy" element={<Academy />} />
              <Route path="/courses/techwave" element={<TechWave />} />
              <Route path="/courses/tech-career" element={<TechCareer />} />
              <Route path="/chat-us" element={<ChatUs />} />
              <Route path="/create-test-creator" element={<CreateTestCreator />} />
              <Route path="/create-test-creator-direct" element={<CreateTestCreatorDirect />} />
              <Route path="/live-sessions" element={<LiveSessionsPublic />} />
              <Route path="/live-sessions/register" element={<LiveSessionRegister />} />
              <Route path="/join-live-session" element={<JoinLiveSession />} />
              <Route path="/live" element={<LiveSessionRegister />} /> {/* Short alias */}
              <Route path="/register-live" element={<LiveSessionRegister />} /> {/* Explicit alias */}

              {/* Mentor Detail Page */}
              <Route path="/mentor/:id" element={<MentorDetail />} />

              {/* Emergency Admin Access */}
              <Route path="/emergency-admin" element={<DirectAdminAccess />} />

              {/* Admin Routes with new layout */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route path="dashboard" element={<DataAnalystDashboard />} />
                <Route path="courses" element={<ManageCourses />} />
                <Route path="coupons" element={<ManageCoupons />} />
                <Route path="landing-videos" element={<LandingVideos />} />
                <Route path="why-mentneo" element={<ManageWhyMentneo />} />
                <Route path="hiring-partners" element={<ManageHiringPartners />} />
                <Route path="masterclass-mosaic" element={<MasterclassMosaic />} />
                <Route path="promo-banners" element={<AdminPromoBanners />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="masterclasses" element={<AdminMasterclasses />} />
                <Route path="footer" element={<AdminFooter />} />
                <Route path="learner-experiences" element={<AdminLearnerExperiences />} />
                <Route path="callback-requests" element={<CallbackRequests />} />
                <Route path="advisor-requests" element={<AdvisorRequests />} />
                <Route path="partner-requests" element={<PartnerRequests />} />
                <Route path="data-analysts" element={<ManageDataAnalysts />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="colleges" element={<ManageColleges />} />
                <Route path="showcase-videos" element={<ManageShowcaseVideos />} />
                <Route path="live-bookings" element={<ViewLiveBookings />} />
                <Route path="live-sessions-manage" element={<DataAnalystLiveSessions />} />
                <Route path="creators" element={<ManageCreators />} />
                <Route path="enrollments" element={<ManageEnrollments />} />
                <Route path="payments" element={<Payments />} />
                <Route path="verify-payments" element={<VerifyPayments />} />
                <Route path="reports" element={<DataAnalystDashboard />} />
                <Route path="settings" element={<DataAnalystDashboard />} />
                <Route path="live-sessions" element={<ManageLiveSessions />} />
                <Route path="reviews" element={<ManageReviews />} />
              </Route>

              {/* Legacy Admin Routes */}
              <Route path="/admin-old/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin-old/courses" element={<AdminRoute><ManageCourses /></AdminRoute>} />
              <Route path="/admin-old/students" element={<AdminRoute><ManageStudents /></AdminRoute>} />
              <Route path="/admin-old/enrollments" element={<AdminRoute><ManageEnrollments /></AdminRoute>} />
              <Route path="/admin-old/payments" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin-old/verify-payments" element={<AdminRoute><VerifyPayments /></AdminRoute>} />

              {/* Creator Routes */}
              <Route path="/creator" element={<CreatorRoute><CreatorLayout /></CreatorRoute>}>
                <Route path="dashboard" element={<CreatorDashboard />} />
                <Route path="courses" element={<CreatorCourses />} />
                <Route path="enrollments" element={<CreatorEnrollments />} />
                <Route path="assignment-submissions" element={<AssignmentSubmissions />} />
                <Route path="profile" element={<CreatorProfile />} />
              </Route>

              {/* Student Routes - Using Modern LearnIQ Templates */}
              {/* LearnIQ Dashboard Routes */}
              <Route path="/student/*" element={<LearnIQRoutes />} />

              {/* Legacy redirects to LearnIQ templates */}
              <Route path="/student/dashboard" element={<Navigate to="/student/student-dashboard" replace />} />
              <Route path="/student/new-dashboard" element={<Navigate to="/student/student-dashboard" replace />} />
              <Route path="/student/simple-dashboard" element={<Navigate to="/student/student-dashboard" replace />} />

              {/* Keep essential functional pages */}
              <Route path="/student/courses" element={<ProtectedRoute><StudentCourses /></ProtectedRoute>} />
              <Route path="/student/our-courses" element={<ProtectedRoute><StudentOurCourses /></ProtectedRoute>} />
              <Route path="/student/enroll/:courseId" element={<ProtectedRoute><CourseEnrollment /></ProtectedRoute>} />
              <Route path="/payment/success" element={<ProtectedRoute><CoursePaymentSuccess /></ProtectedRoute>} />
              <Route path="/student/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
              <Route path="/student/refer-and-earn" element={<ProtectedRoute><ReferAndEarn /></ProtectedRoute>} />
              <Route path="/student/quiz/:quizId" element={<ProtectedRoute><QuizAttempt /></ProtectedRoute>} />
              <Route path="/student/quizzes" element={<ProtectedRoute><StudentQuizzes /></ProtectedRoute>} />
              <Route path="/student/quizzes/:quizId/take/:assignmentId" element={<ProtectedRoute><TakeQuiz /></ProtectedRoute>} />
              <Route path="/student/quizzes/:quizId/results/:assignmentId" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
              <Route path="/student/live-sessions" element={<ProtectedRoute><LiveSessions /></ProtectedRoute>} />
              <Route path="/student/live-sessions/register" element={<LiveSessionRegister />} />

              {/* Auth Routes */}

              {/* Payment Routes */}
              <Route
                path="/course/:courseId/enroll"
                element={
                  <ProtectedRoute>
                    <CourseEnrollment />
                  </ProtectedRoute>
                }
              />
              <Route path="/course/:courseId/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
              <Route path="/payment-flow" element={<Navigate to="/student/student-dashboard" replace />} />

              {/* Legacy dashboard routes - redirect to role-based dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              } />
              <Route path="/course/:courseId" element={<Navigate to="/student/student-dashboard/course/:courseId" replace />} />
              <Route path="/course/:courseId/learn" element={<Navigate to="/student/student-dashboard/course/:courseId" replace />} />

              {/* Admin Dashboard */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </ProtectedRoute>
              } />

              {/* Data Analyst Dashboard */}
              <Route path="/data-analyst/dashboard" element={
                <ProtectedRoute>
                  <DataAnalystRoute>
                    <DataAnalystDashboard />
                  </DataAnalystRoute>
                </ProtectedRoute>
              } />
              <Route path="/data-analyst/leads" element={
                <ProtectedRoute>
                  <DataAnalystRoute>
                    <Leads />
                  </DataAnalystRoute>
                </ProtectedRoute>
              } />
              <Route path="/data-analyst/support-tickets" element={
                <ProtectedRoute>
                  <DataAnalystRoute>
                    <SupportTickets />
                  </DataAnalystRoute>
                </ProtectedRoute>
              } />
              <Route path="/data-analyst/live-sessions" element={
                <ProtectedRoute>
                  <DataAnalystRoute>
                    <LiveSessionAnalytics />
                  </DataAnalystRoute>
                </ProtectedRoute>
              } />
              <Route path="/data-analyst/live-sessions-management" element={
                <ProtectedRoute>
                  <DataAnalystRoute>
                    <DataAnalystLiveSessions />
                  </DataAnalystRoute>
                </ProtectedRoute>
              } />

              {/* Add easy access route for analytics */}
              <Route path="/analytics" element={<AnalyticsRedirect />} />

              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
