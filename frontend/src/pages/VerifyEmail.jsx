import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiUrl } from '../config/api'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Verification token is missing. Please check your email link and try again.')
      return
    }

    let isActive = true

    async function verify() {
      try {
        const res = await fetch(getApiUrl(`/api/auth/verify-email?token=${encodeURIComponent(token)}`), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        const data = await res.json()
        if (!isActive) return

        if (res.ok) {
          setStatus('success')
          setMessage(data?.message || 'Email verified successfully! Redirecting to home...')
          setTimeout(() => navigate('/', { replace: true }), 1500)
        } else {
          setStatus('error')
          setMessage(data?.error || data?.message || 'Verification failed. Please try again.')
        }
      } catch (err) {
        console.error(err)
        if (!isActive) return
        setStatus('error')
        setMessage('Network error while verifying. Please try again.')
      }
    }

    verify()

    return () => { isActive = false }
  }, [location.search, navigate])

  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content">
        <section className="container py-5">
          <div className="card-soft p-4 border-mint-100">
            <h2 className="fw-700 mb-2">Email Verification</h2>
            <p className={status === 'success' ? 'text-success' : status === 'error' ? 'text-danger' : 'text-muted'}>
              {message}
            </p>
            {status === 'error' && (
              <div className="mt-3">
                <button className="btn btn-gradient" onClick={() => navigate('/', { replace: true })}>
                  Go to home
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
