import React from 'react'
import { BrowserRouter , Routes, Route } from 'react-router-dom'
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
import ResearcherProfilePage from './pages/ResearcherProfilePage'


export default function App() {
  return (

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/researcher/:id" element={<ResearcherProfilePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/dashboard/:role" element={
                                          <ProtectedRoute requiredRole={['nonprofit', 'researcher']}>
                                            <Dashboard />
                                          </ProtectedRoute>
                                        } 
        />
        <Route path="/admin" element={
                                <ProtectedRoute requiredRole="admin">
                                <AdminDashboard />
                                </ProtectedRoute>
                              } 
        />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    
  )
}
