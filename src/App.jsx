import React from 'react';
import {HashRouter as Router,Routes,Route,Navigate} from 'react-router-dom';
import {QuestProvider} from '@questlabs/react-sdk';
import '@questlabs/react-sdk/dist/style.css';
import {AuthProvider,useAuth} from './contexts/AuthContext';
import questConfig from './config/questConfig';
import PrivateRoute from './components/Auth/PrivateRoute';

// Import components
import RoleSelector from './components/Auth/RoleSelector';
import RoleBasedLogin from './components/Auth/RoleBasedLogin';
import DemoAccounts from './components/Auth/DemoAccounts';
import OnboardingPage from './components/Auth/OnboardingPage';
import AdminNavbar from './components/Layout/AdminNavbar';
import Navbar from './components/Layout/Navbar';

// Admin Components
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import PupilImport from './components/Admin/PupilImport';
import ClassManagement from './components/Admin/ClassManagement';
import TimetableManagement from './components/Admin/TimetableManagement';
import TimetableSettings from './components/Admin/TimetableSettings';
import JournalReview from './components/Admin/JournalReview';
import AISettings from './components/Admin/AISettings';
import Analytics from './components/Admin/Analytics';
import SystemHealth from './components/Admin/SystemHealth';

// Teacher Components
import TeacherDashboard from './components/Teacher/Dashboard';
import SchemesOfWork from './components/Teacher/SchemesOfWork';
import LessonPlans from './components/Teacher/LessonPlans';
import ClassManagementTeacher from './components/Teacher/ClassManagement';
import JournalReviewTeacher from './components/Teacher/JournalReview';
import Reports from './components/Teacher/Reports';

// Pupil Components
import PupilDashboard from './components/Pupil/PupilDashboard';
import LearningJournal from './components/Pupil/LearningJournal';
import WorkSubmission from './components/Pupil/WorkSubmission';

function AppContent() {
  const {isAuthenticated,user,loading}=useAuth();

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

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login/:role" element={<RoleBasedLogin />} />
        <Route path="/demo-accounts" element={<DemoAccounts />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {!isAuthenticated ? (
          <Route path="*" element={<RoleSelector />} />
        ) : (
          <>
            {/* Admin Routes */}
            <Route path="/admin" element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-gray-50">
                  <AdminNavbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <AdminDashboard />
                  </main>
                </div>
              </PrivateRoute>
            } />
            
            <Route path="/admin/users" element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-gray-50">
                  <AdminNavbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <UserManagement />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/admin/pupils" element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-gray-50">
                  <AdminNavbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <PupilImport />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/admin/classes" element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-gray-50">
                  <AdminNavbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ClassManagement />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/admin/timetable" element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-gray-50">
                  <AdminNavbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <TimetableManagement />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/admin/timetable-settings" element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-gray-50">
                  <AdminNavbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <TimetableSettings />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/admin/journal-review" element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-gray-50">
                  <AdminNavbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <JournalReview />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/admin/ai-settings" element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-gray-50">
                  <AdminNavbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <AISettings />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/admin/analytics" element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-gray-50">
                  <AdminNavbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Analytics />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/admin/system" element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-gray-50">
                  <AdminNavbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <SystemHealth />
                  </main>
                </div>
              </PrivateRoute>
            } />

            {/* Teacher Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute allowedRoles={['teacher']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <TeacherDashboard />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/schemes" element={
              <PrivateRoute allowedRoles={['teacher']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <SchemesOfWork />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/lessons" element={
              <PrivateRoute allowedRoles={['teacher']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <LessonPlans />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/pupils" element={
              <PrivateRoute allowedRoles={['teacher']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ClassManagementTeacher />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/class-management" element={
              <PrivateRoute allowedRoles={['teacher']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ClassManagementTeacher />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/journal-review" element={
              <PrivateRoute allowedRoles={['teacher']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <JournalReviewTeacher />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/reports" element={
              <PrivateRoute allowedRoles={['teacher']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Reports />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/assessments" element={
              <PrivateRoute allowedRoles={['teacher']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessments</h2>
                      <p className="text-gray-600">Assessment tools coming soon...</p>
                    </div>
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/settings" element={
              <PrivateRoute allowedRoles={['teacher']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
                      <p className="text-gray-600">Settings panel coming soon...</p>
                    </div>
                  </main>
                </div>
              </PrivateRoute>
            } />

            {/* Pupil Routes */}
            <Route path="/pupil-dashboard" element={
              <PrivateRoute allowedRoles={['pupil']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <PupilDashboard />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/my-work" element={
              <PrivateRoute allowedRoles={['pupil']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <WorkSubmission />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/learning-journal" element={
              <PrivateRoute allowedRoles={['pupil']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <LearningJournal />
                  </main>
                </div>
              </PrivateRoute>
            } />

            <Route path="/feedback" element={
              <PrivateRoute allowedRoles={['pupil']}>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">My Feedback</h2>
                      <p className="text-gray-600">Feedback dashboard coming soon...</p>
                    </div>
                  </main>
                </div>
              </PrivateRoute>
            } />

            {/* Default Redirect */}
            <Route path="/" element={
              <Navigate to={
                user?.user_metadata?.role === 'admin' ? '/admin' :
                user?.user_metadata?.role === 'teacher' ? '/dashboard' :
                '/pupil-dashboard'
              } replace />
            } />
          </>
        )}
      </Routes>
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