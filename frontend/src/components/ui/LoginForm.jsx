import React, { useState, useContext } from 'react'
import { getApiUrl } from '../../config/api'
import { AuthContext } from '../../auth/AuthContext'

export default function LoginForm({ onSuccess = () => {}, onClose = () => {} }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
          <div className="position-relative">
            <input 
              id="login-password" 
              type={showPassword ? "text" : "password"} 
              className="form-control border-gray-200" 
              placeholder="••••••••" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required 
              aria-invalid={error ? 'true' : 'false'} 
              aria-describedby={error ? 'login-error' : undefined}
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none p-0"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ zIndex: 10, marginRight: '0.5rem' }}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-gray-600" viewBox="0 0 16 16">
                  <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                  <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                  <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-gray-600" viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                </svg>
              )}
            </button>
          </div>
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
