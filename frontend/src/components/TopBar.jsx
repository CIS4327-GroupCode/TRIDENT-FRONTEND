import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import Modal from './ui/Modal'
import SignUpForm from './ui/SignUpForm'
import LoginForm from './ui/LoginForm'
import NotificationBell from './notifications/NotificationBell'
// Import Link from react-router-dom to handle navigation to the profile/dashboard
import { Link } from 'react-router-dom' 

function UtilityNav({ isMobile = false }){
  const { isAuthenticated } = useAuth();
  const navClass = isMobile ? "nav flex-column" : "d-none d-lg-flex gap-3";
  
  return (
    <nav className={navClass}>
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/browse" className="nav-link">Browse Projects</Link>
      <a href="#about" className="nav-link">About</a>
      <a href="#how" className="nav-link">How it Works</a>
      <a href="#pricing" className="nav-link">Pricing</a>
      <a href="#faq" className="nav-link">FAQ</a>
      <a href="#contact" className="nav-link">Contact</a>
      {isAuthenticated && (
        <Link to="/messages" className="nav-link">Messages</Link>
      )}
    </nav>
  )
}

export default function TopBar() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState('nonprofit')
  const [mode, setMode] = useState('signup') // 'signup' | 'login'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const auth = useAuth()

  // Determine the user's role for the Profile link
  const userRole = auth.user?.role || 'user'; // Assuming 'role' is stored on the user object

  return (
    <header className="bg-white shadow-sm">
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between">
          {/* LEFT SIDE */}
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="text-decoration-none text-dark">
              <div className="h5 mb-0">Trident</div>
            </Link>
            <UtilityNav />
          </div>

          {/* RIGHT SIDE */}
          <div className="d-flex align-items-center gap-2">
            {auth && auth.isAuthenticated ? (
              // === LOGGED IN STATE ===
              <>
                <div className="d-none d-md-flex align-items-center gap-2">
                  {/* Display User Name */}
                  <span className="text-dark d-none d-lg-inline">
                    Hi, <strong className="fw-semibold">{auth.user?.name || auth.user?.email}</strong>
                  </span>

                  {/* Notification Bell */}
                  <NotificationBell />

                  {/* Dashboard Button */}
                  <Link
                    to={userRole === 'admin' ? '/admin' : `/dashboard/${userRole}`}
                    className="btn btn-primary btn-sm"
                  >
                    Dashboard
                  </Link>

                  {/* Settings Button */}
                  <Link
                    to="/settings"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Settings
                  </Link>

                  {/* Logout Button */}
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => auth.logout()}
                  >
                    Logout
                  </button>
                </div>

                {/* Mobile Hamburger Menu */}
                <button
                  className="btn btn-outline-secondary d-md-none"
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon">☰</span>
                </button>
              </>
            ) : (
              // === LOGGED OUT STATE ===
              <>
                <div className="d-none d-md-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-link text-muted" 
                    onClick={() => { setMode('login'); setOpen(true) }}
                  >
                    Sign In
                  </button>

                  <div className="dropdown" id='signup-dropdown'>
                    <button className="btn btn-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Sign Up</button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><button className="dropdown-item" onClick={() => { setRole('nonprofit'); setMode('signup'); setOpen(true) }}>Nonprofit</button></li>
                      <li><button className="dropdown-item" onClick={() => { setRole('researcher'); setMode('signup'); setOpen(true) }}>Researcher</button></li>
                    </ul>
                  </div>
                </div>

                {/* Mobile Hamburger Menu */}
                <button
                  className="btn btn-outline-secondary d-md-none"
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon">☰</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="d-md-none mt-3 border-top pt-3">
            <UtilityNav isMobile={true} />
            
            {auth && auth.isAuthenticated ? (
              <div className="mt-3 d-flex flex-column gap-2">
                <span className="text-dark mb-2">
                  Hi, <strong>{auth.user?.name || auth.user?.email}</strong>
                </span>
                <Link
                  to={userRole === 'admin' ? '/admin' : `/dashboard/${userRole}`}
                  className="btn btn-primary btn-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => { auth.logout(); setMobileMenuOpen(false) }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-3 d-flex flex-column gap-2">
                <button 
                  type="button" 
                  className="btn btn-link text-muted" 
                  onClick={() => { setMode('login'); setOpen(true); setMobileMenuOpen(false) }}
                >
                  Sign In
                </button>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => { setRole('nonprofit'); setMode('signup'); setOpen(true); setMobileMenuOpen(false) }}
                >
                  Sign Up as Nonprofit
                </button>
                <button 
                  className="btn btn-outline-primary btn-sm" 
                  onClick={() => { setRole('researcher'); setMode('signup'); setOpen(true); setMobileMenuOpen(false) }}
                >
                  Sign Up as Researcher
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        {mode === 'signup' ? (
          <SignUpForm role={role} onClose={() => setOpen(false)} />
        ) : (
          <LoginForm onClose={() => setOpen(false)} onSuccess={(data)=>{ /* you can store token or user here */ }} />
        )}
      </Modal>
    </header>
  )
}