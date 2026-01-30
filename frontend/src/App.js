import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Import all pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import TaproExplore from './pages/TaproExplore';
import StarredPage from './pages/StarredPage';
import DiscoverPage from './pages/DiscoverPage';
import StartupProfile from './pages/StartupProfile';
import InvestorProfile from './pages/InvestorProfile';
import MessagesPage from './pages/MessagesPage';
import StartupPage from './pages/StartupListingPage';
import InvestorRegistration from './pages/InvestorRegistration';
import ProfileManagementPage from './pages/UserProfileManagementPage';
import UserProfile from './pages/UserProfile';
import InvestorProfileManagement from './pages/InvestorProfileManagementPage';
import UserOnboardingForm from './pages/UserOnboardingForm';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/Investor-register" element={<InvestorRegistration />} />

          {/* Protected routes */}
          <Route path="/starred" element={<ProtectedRoute><StarredPage /></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
          <Route path="/startups/:startupId" element={<ProtectedRoute><StartupProfile /></ProtectedRoute>} />
          <Route path="/investors/:investorId" element={<ProtectedRoute><InvestorProfile /></ProtectedRoute>} />
          <Route path="/users/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/list-startup" element={<ProtectedRoute><StartupPage /></ProtectedRoute>} />
          <Route path="/profile/investor/manage" element={<ProtectedRoute><InvestorProfileManagement /></ProtectedRoute>} />
          <Route path="/userOnboard" element={<ProtectedRoute><UserOnboardingForm /></ProtectedRoute>} />
          <Route path="/profile/manage" element={<ProtectedRoute><ProfileManagementPage /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><TaproExplore /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileManagementPage /></ProtectedRoute>} />

          {/* Catch-all route - redirect to home */}
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
