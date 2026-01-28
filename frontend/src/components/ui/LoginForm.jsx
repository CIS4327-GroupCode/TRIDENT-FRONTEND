import React, { useState, useContext } from 'react'
import { getApiUrl } from '../../config/api'
import { AuthContext } from '../../auth/AuthContext'

export default function LoginForm({ onSuccess = () => {}, onClose = () => {} }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState(null)
  const [showResend, setShowResend] = useState(false)
  const { loginAndRedirect } = useContext(AuthContext)

  async function submit(e){
    e.preventDefault()
    setError(null)
    setResendMessage(null)
    setShowResend(false)
    if(!email || !password){ setError('Email and password are required'); return }

    setLoading(true)
    try{
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      })

      const data = await res.json()
      if(res.ok){
        // assume backend returns { user, token }
        loginAndRedirect({user:data.user, token:data.token})
        onSuccess(data)
        onClose()
      }else{
        const serverError = data && (data.message || data.error)
        setError(serverError || `Login failed (${res.status})`)
        if (data?.code === 'EMAIL_NOT_VERIFIED' || data?.code === 'VERIFICATION_EXPIRED') {
          setShowResend(true)
        }
      }
      setLoading(false)
    }catch(err){
      console.error(err)
      setError('Network error during login')
      setLoading(false)
    }
  }

  async function resendVerification(){
    if (!email) return
    setResendLoading(true)
    setResendMessage(null)
    try {
      const res = await fetch(getApiUrl('/api/auth/resend-verification-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      const data = await res.json()
      if (res.ok) {
        setResendMessage(data?.message || 'Verification email sent. Please check your inbox.')
      } else {
        setResendMessage(data?.error || `Failed to resend email (${res.status})`)
      }
    } catch (err) {
      console.error(err)
      setResendMessage('Network error while resending email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div>
      {error && <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border" role="alert" aria-live="assertive" aria-atomic="true">{error}</div>}
      {showResend && (
        <div className="d-flex align-items-center gap-2 mb-3">
          <button type="button" className="btn btn-outline-mint" onClick={resendVerification} disabled={resendLoading} aria-busy={resendLoading}>
            {resendLoading ? 'Sending...' : 'Resend verification email'}
          </button>
          {resendMessage && <small className="text-muted">{resendMessage}</small>}
        </div>
      )}
      <form onSubmit={submit} aria-label="Sign in form">
        <div className="mb-3">
          <label htmlFor="login-email" className="form-label fw-600 text-gray-800">Email</label>
          <input id="login-email" type="email" className="form-control border-gray-200" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? 'login-error' : undefined} />
        </div>
        <div className="mb-3">
          <label htmlFor="login-password" className="form-label fw-600 text-gray-800">Password</label>
          <input id="login-password" type="password" className="form-control border-gray-200" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? 'login-error' : undefined} />
          <div className="mt-2">
            <a href="/forgot-password" className="btn btn-link p-0 text-decoration-none text-mint-700">Forgot password?</a>
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-outline-mint" disabled={loading} aria-label="Cancel sign in">Cancel</button>
          <button type="submit" className="btn btn-gradient" disabled={loading} aria-busy={loading}>{loading? 'Signing in...':'Sign in'}</button>
        </div>
      </form>
    </div>
  )
}
