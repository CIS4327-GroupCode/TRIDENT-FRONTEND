import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Browse from './pages/Browse'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Messages from './pages/Messages'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectMilestonesPage from './pages/ProjectMilestonesPage'
import ProjectApplicationsPage from './pages/ProjectApplicationsPage'
import NotificationsPage from './pages/NotificationsPage'
import ResearcherProfilePage from './pages/ResearcherProfilePage'
import Agreements from './pages/Agreements'
import AgreementDetail from './pages/AgreementDetail'
import NotFound from './pages/NotFound'


export default function App() {
  return (

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/milestones" element={<ProtectedRoute requiredPermission="canViewDashboard"><ProjectMilestonesPage /></ProtectedRoute>} />
        <Route path="/projects/:id/applications" element={<ProtectedRoute requiredPermission="canManageProjects"><ProjectApplicationsPage /></ProtectedRoute>} />
        <Route path="/researcher/:id" element={<ProtectedRoute requiredPermission="canViewResearcherProfile"><ResearcherProfilePage /></ProtectedRoute>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/dashboard/:role" element={
          <ProtectedRoute requiredPermission="canViewDashboard">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
                                <ProtectedRoute requiredPermission="canViewAdminPanel">
                                <AdminDashboard />
                                </ProtectedRoute>
                              } 
        />
        <Route path="/settings" element={<ProtectedRoute requiredPermission="canManageSettings"><Settings /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute requiredPermission="canViewMessages"><Messages /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute requiredPermission="canViewMessages"><NotificationsPage /></ProtectedRoute>} />
        <Route path="/agreements" element={<ProtectedRoute requiredPermission="canViewAgreements"><Agreements /></ProtectedRoute>} />
        <Route path="/agreements/:id" element={<ProtectedRoute requiredPermission="canViewAgreements"><AgreementDetail /></ProtectedRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

  )
}
