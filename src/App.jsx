import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QuestProvider } from '@questlabs/react-sdk';
import '@questlabs/react-sdk/dist/style.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import questConfig from './config/questConfig';

// Auth Components
import RoleSelector from './components/Auth/RoleSelector';
import RoleBasedLogin from './components/Auth/RoleBasedLogin';
import DemoAccounts from './components/Auth/DemoAccounts';
import OnboardingPage from './components/Auth/OnboardingPage';

// Layout Components
import Navbar from './components/Layout/Navbar';
import AdminNavbar from './components/Layout/AdminNavbar';

// Teacher Components
import TeacherDashboard from './components/Teacher/Dashboard';
import SchemesOfWork from './components/Teacher/SchemesOfWork';
import LessonPlans from './components/Teacher/LessonPlans';
import ClassManagement from './components/Teacher/ClassManagement';
import Reports from './components/Teacher/Reports';
import JournalReview from './components/Teacher/JournalReview';

// Pupil Components
import PupilDashboard from './components/Pupil/PupilDashboard';
import WorkSubmission from './components/Pupil/WorkSubmission';
import LearningJournal from './components/Pupil/LearningJournal';

// Admin Components
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import AISettings from './components/Admin/AISettings';
import AdminClassManagement from './components/Admin/ClassManagement';
import PupilImport from './components/Admin/PupilImport';
import TimetableManagement from './components/Admin/TimetableManagement';
import TimetableSettings from './components/Admin/TimetableSettings';
import SystemHealth from './components/Admin/SystemHealth';
import Analytics from './components/Admin/Analytics';
import AdminJournalReview from './components/Admin/JournalReview';

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login/:role" element={<RoleBasedLogin />} />
          <Route path="/demo-accounts" element={<DemoAccounts />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<RoleSelector />} />
        </Routes>
      </Router>
    );
  }

  const userRole = user?.user_metadata?.role;
  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'teacher';
  const isPupil = userRole === 'pupil';

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAdmin ? <AdminNavbar /> : <Navbar />}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Admin Routes */}
            {isAdmin && (
              <>
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/pupils" element={<PupilImport />} />
                <Route path="/admin/ai-settings" element={<AISettings />} />
                <Route path="/admin/classes" element={<AdminClassManagement />} />
                <Route path="/admin/timetable" element={<TimetableManagement />} />
                <Route path="/admin/timetable-settings" element={<TimetableSettings />} />
                <Route path="/admin/journal-review" element={<AdminJournalReview />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/admin/system" element={<SystemHealth />} />
              </>
            )}

            {/* Teacher Routes */}
            {isTeacher && (
              <>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<TeacherDashboard />} />
                <Route path="/class-management" element={<ClassManagement />} />
                <Route path="/schemes" element={<SchemesOfWork />} />
                <Route path="/lessons" element={<LessonPlans />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/journal-review" element={<JournalReview />} />
                <Route path="/pupils" element={<div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900">Pupils Management</h2>
                  <p className="text-gray-600 mt-2">Coming Soon</p>
                </div>} />
                <Route path="/assessments" element={<div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900">Assessments</h2>
                  <p className="text-gray-600 mt-2">Coming Soon</p>
                </div>} />
                <Route path="/settings" element={<div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                  <p className="text-gray-600 mt-2">Coming Soon</p>
                </div>} />
              </>
            )}

            {/* Pupil Routes */}
            {isPupil && (
              <>
                <Route path="/" element={<Navigate to="/pupil-dashboard" replace />} />
                <Route path="/pupil-dashboard" element={<PupilDashboard />} />
                <Route path="/my-work" element={<WorkSubmission />} />
                <Route path="/learning-journal" element={<LearningJournal />} />
                <Route path="/feedback" element={<div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900">Feedback History</h2>
                  <p className="text-gray-600 mt-2">Coming Soon</p>
                </div>} />
              </>
            )}

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <QuestProvider
      apiKey={questConfig.APIKEY}
      entityId={questConfig.ENTITYID}
      apiType="PRODUCTION"
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QuestProvider>
  );
}

export default App;