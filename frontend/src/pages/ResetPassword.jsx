import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiUrl } from '../config/api'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const token = useMemo(() => new URLSearchParams(location.search).get('token'), [location.search])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!token) {
      setError('Reset token is missing. Please use the link from your email.')
      return
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(getApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password })
      })

      const data = await res.json()
      if (res.ok) {
        setMessage(data?.message || 'Password reset successfully. You can now sign in.')
        setTimeout(() => navigate('/', { replace: true }), 1500)
      } else {
        setError(data?.error || data?.message || `Reset failed (${res.status})`)
      }
    } catch (err) {
      console.error(err)
      setError('Network error while resetting password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content">
        <section className="container py-5">
          <div className="card-soft p-4 border-mint-100" style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2 className="fw-700 mb-2">Reset password</h2>
            <p className="text-muted">Enter your new password below.</p>

            {error && <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border" role="alert" aria-live="assertive">{error}</div>}
            {message && <div className="alert alert-success bg-success bg-opacity-10 border-success border" role="status" aria-live="polite">{message}</div>}

            <form onSubmit={handleSubmit} aria-label="Reset password">
              <div className="mb-3">
                <label htmlFor="new-password" className="form-label fw-600 text-gray-800">New password</label>
                <input
                  id="new-password"
                  type="password"
                  className="form-control border-gray-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirm-password" className="form-label fw-600 text-gray-800">Confirm password</label>
                <input
                  id="confirm-password"
                  type="password"
                  className="form-control border-gray-200"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-gradient" disabled={loading} aria-busy={loading}>
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
