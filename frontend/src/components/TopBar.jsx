import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import Modal from './ui/Modal'
import SignUpForm from './ui/SignUpForm'
import LoginForm from './ui/LoginForm'
import NotificationBell from './notifications/NotificationBell'
// Import Link from react-router-dom to handle navigation to the profile/dashboard
import { Link } from 'react-router-dom' 

function getDisplayName(user) {
  if (!user) return 'User'
  return user.name || user.profile?.name || user.email || 'User'
}

function getInitials(value) {
  if (!value) return 'U'
  const parts = value.trim().split(/\s+/)
  const [first, second] = parts
  if (first && second) return `${first[0]}${second[0]}`.toUpperCase()
  return first?.slice(0, 2).toUpperCase() || 'U'
}

function UtilityNav({ isMobile = false }){
  const { isAuthenticated } = useAuth();
  const navClass = isMobile ? "nav flex-column" : "d-none d-lg-flex gap-3";
  
  return (
    <nav className={navClass} aria-label="Main navigation">
      <a href="#about" className="nav-link">About</a>
      <a href="#how" className="nav-link">How it Works</a>
      <a href="#pricing" className="nav-link">Pricing</a>
      <a href="#faq" className="nav-link">FAQ</a>
      <a href="#contact" className="nav-link">Contact</a>
    </nav>
  )
}

function UserMenu({ user, userRole, onLogout }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const displayName = getDisplayName(user)
  const initials = getInitials(displayName)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && open) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu-trigger btn btn-light btn-sm"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`User menu for ${displayName}`}
        onClick={() => setOpen(!open)}
      >
        <span className="user-avatar" aria-hidden="true">{initials}</span>
        <span className="user-name d-none d-lg-inline">{displayName}</span>
        <span className="user-caret" aria-hidden="true">▼</span>
      </button>

      {open && (
        <div className="user-menu-dropdown shadow-sm" role="menu">
          <div className="user-menu-header">
            <span className="user-avatar" aria-hidden="true">{initials}</span>
            <div className="ms-2">
              <div className="fw-semibold">{displayName}</div>
              {user?.email && <div className="text-muted small">{user.email}</div>}
            </div>
          </div>

          <div className="user-menu-divider" role="separator" />

          <Link
            to={userRole === 'admin' ? '/admin' : `/dashboard/${userRole}`}
            className="user-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/settings"
            className="user-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Profile & Settings
          </Link>
          <Link
            to="/messages"
            className="user-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Messages
          </Link>
          <Link
            to="/browse"
            className="user-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Browse Projects
          </Link>

          <div className="user-menu-divider" role="separator" />

          <button type="button" className="user-menu-item text-danger" role="menuitem" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default function TopBar() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState('nonprofit')
  const [mode, setMode] = useState('signup') // 'signup' | 'login'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const auth = useAuth()

  const displayName = getDisplayName(auth.user)
  const displayInitials = getInitials(displayName)

  const handleLogout = () => {
    auth.logout()
    setMobileMenuOpen(false)
  }

  // Determine the user's role for the Profile link
  const userRole = auth.user?.role || 'user'; // Assuming 'role' is stored on the user object

  return (
    <header className="topbar" role="banner">
      <div className="container-center topbar-content">
        <div className="d-flex align-items-center justify-content-between w-100">
          {/* LEFT SIDE */}
          <div className="d-flex align-items-center gap-4">
            <Link to="/" className="text-decoration-none topbar-logo">
              <div className="fw-800">Trident</div>
            </Link>
            <UtilityNav />
          </div>

          {/* RIGHT SIDE */}
          <div className="d-flex align-items-center gap-2">
            {auth && auth.isAuthenticated ? (
              // === LOGGED IN STATE ===
              <>
                <div className="d-none d-md-flex align-items-center gap-3">
                  <NotificationBell />
                  <UserMenu user={auth.user} userRole={userRole} onLogout={handleLogout} />
                </div>

                {/* Mobile Hamburger Menu */}
                <button
                  className="btn btn-topbar-mobile d-md-none"
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
                <div className="d-none d-md-flex gap-2 align-items-center">
                  <button 
                    type="button" 
                    className="btn btn-topbar-link" 
                    onClick={() => { setMode('login'); setOpen(true) }}
                  >
                    Sign In
                  </button>

                  <div className="dropdown" id='signup-dropdown'>
                    <button className="btn btn-gradient btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">Sign Up</button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><button className="dropdown-item" onClick={() => { setRole('nonprofit'); setMode('signup'); setOpen(true) }}>Nonprofit</button></li>
                      <li><button className="dropdown-item" onClick={() => { setRole('researcher'); setMode('signup'); setOpen(true) }}>Researcher</button></li>
                    </ul>
                  </div>
                </div>

                {/* Mobile Hamburger Menu */}
                <button
                  className="btn btn-topbar-mobile d-md-none"
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
          <div className="topbar-mobile-menu d-md-none mt-3 border-top pt-3">
            <UtilityNav isMobile={true} />
            
            {auth && auth.isAuthenticated ? (
              <div className="mt-3 d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="user-avatar user-avatar-sm">{displayInitials}</span>
                  <div>
                    <div className="fw-semibold">{displayName}</div>
                    {auth.user?.email && <div className="text-muted small">{auth.user.email}</div>}
                  </div>
                </div>
                <Link
                  to={userRole === 'admin' ? '/admin' : `/dashboard/${userRole}`}
                  className="btn btn-gradient btn-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="btn btn-outline-mint btn-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile & Settings
                </Link>
                <Link
                  to="/messages"
                  className="btn btn-outline-mint btn-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
                <Link
                  to="/browse"
                  className="btn btn-outline-mint btn-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Projects
                </Link>
                <button
                  className="btn btn-outline-mint btn-sm"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-3 d-flex flex-column gap-2">
                <button 
                  type="button" 
                  className="btn btn-topbar-link" 
                  onClick={() => { setMode('login'); setOpen(true); setMobileMenuOpen(false) }}
                >
                  Sign In
                </button>
                <button 
                  className="btn btn-gradient btn-sm w-100" 
                  onClick={() => { setRole('nonprofit'); setMode('signup'); setOpen(true); setMobileMenuOpen(false) }}
                >
                  Sign Up as Nonprofit
                </button>
                <button 
                  className="btn btn-outline-mint btn-sm w-100" 
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
