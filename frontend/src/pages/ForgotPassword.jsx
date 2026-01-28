import React, { useState } from 'react'
import { getApiUrl } from '../config/api'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email) {
      setError('Email is required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(getApiUrl('/api/auth/request-password-reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })

      const data = await res.json()
      if (res.ok) {
        setMessage(data?.message || 'If that email is registered, a reset link has been sent.')
      } else {
        setError(data?.error || `Request failed (${res.status})`)
      }
    } catch (err) {
      console.error(err)
      setError('Network error while requesting reset. Please try again.')
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
            <h2 className="fw-700 mb-2">Forgot your password?</h2>
            <p className="text-muted">Enter your email and we’ll send a reset link if your account exists.</p>

            {error && <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border" role="alert" aria-live="assertive">{error}</div>}
            {message && <div className="alert alert-success bg-success bg-opacity-10 border-success border" role="status" aria-live="polite">{message}</div>}

            <form onSubmit={handleSubmit} aria-label="Request password reset">
              <div className="mb-3">
                <label htmlFor="reset-email" className="form-label fw-600 text-gray-800">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  className="form-control border-gray-200"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-gradient" disabled={loading} aria-busy={loading}>
                  {loading ? 'Sending...' : 'Send reset link'}
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
