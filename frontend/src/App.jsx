import React from 'react'
import { BrowserRouter , Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Browse from './pages/Browse'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Messages from './pages/Messages'


export default function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/dashboard/:role" element={<Dashboard />} />
        <Route path="/admin" element={
                                <ProtectedRoute requireAdmin={true}>
                                <AdminDashboard />
                                </ProtectedRoute>
                              } 
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    
  )
}
