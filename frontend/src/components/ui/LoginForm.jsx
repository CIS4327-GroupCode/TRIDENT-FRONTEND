import React, { useState, useContext } from 'react'
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
      const res = await fetch('/api/auth/login', {
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
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <div className="d-flex justify-content-end">
          <button type="button" onClick={onClose} className="btn btn-secondary me-2" disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading? 'Signing in...':'Sign in'}</button>
        </div>
      </form>
    </div>
  )
}
