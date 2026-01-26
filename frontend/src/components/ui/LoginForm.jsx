import React, { useState, useContext } from 'react'
import { getApiUrl } from '../../config/api'
import { AuthContext } from '../../auth/AuthContext'

export default function LoginForm({ onSuccess = () => {}, onClose = () => {} }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { loginAndRedirect } = useContext(AuthContext)

  async function submit(e){
    e.preventDefault()
    setError(null)
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
        setError((data && data.error) || `Login failed (${res.status})`)
      }
      setLoading(false)
    }catch(err){
      console.error(err)
      setError('Network error during login')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border" role="alert" aria-live="assertive" aria-atomic="true">{error}</div>}
      <form onSubmit={submit} aria-label="Sign in form">
        <div className="mb-3">
          <label htmlFor="login-email" className="form-label fw-600 text-gray-800">Email</label>
          <input id="login-email" type="email" className="form-control border-gray-200" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? 'login-error' : undefined} />
        </div>
        <div className="mb-3">
          <label htmlFor="login-password" className="form-label fw-600 text-gray-800">Password</label>
          <input id="login-password" type="password" className="form-control border-gray-200" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? 'login-error' : undefined} />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-outline-mint" disabled={loading} aria-label="Cancel sign in">Cancel</button>
          <button type="submit" className="btn btn-gradient" disabled={loading} aria-busy={loading}>{loading? 'Signing in...':'Sign in'}</button>
        </div>
      </form>
    </div>
  )
}
