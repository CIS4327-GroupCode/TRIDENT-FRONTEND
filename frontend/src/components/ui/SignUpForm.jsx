import React, { useState, useContext } from 'react'
import { getApiUrl } from '../../config/api'
import { AuthContext } from '../../auth/AuthContext'

export default function SignUpForm({ role = 'nonprofit', onClose = () => {}, onSuccess = () => {} }){
  const { loginAndRedirect } = useContext(AuthContext)
  const [formRole, setFormRole] = useState(role)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState(null)
  
  // Nonprofit-specific fields
  const [orgName, setOrgName] = useState('')
  const [ein, setEin] = useState('')
  const [mission, setMission] = useState('')
  const [focusTags, setFocusTags] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  
  // Researcher-specific fields
  const [affiliation, setAffiliation] = useState('')
  const [domains, setDomains] = useState('')
  const [methods, setMethods] = useState('')
  const [tools, setTools] = useState('')
  const [rateMin, setRateMin] = useState('')
  const [rateMax, setRateMax] = useState('')
  const [availability, setAvailability] = useState('')
  
  // UI state
  const [showProfileFields, setShowProfileFields] = useState(false)

  async function submit(e){
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setRequiresVerification(false)
    setResendMessage(null)

    // basic client-side validation
    if(!email || !password || !name) {
      setError('Name, email and password are required.')
      return
    }
    
    // Role-specific validation
    if(formRole === 'nonprofit' && showProfileFields && !orgName && !mission) {
      setError('Please provide at least organization name or mission.')
      return
    }
    
    // Validate rate range for researchers
    if(formRole === 'researcher' && showProfileFields && rateMin && rateMax) {
      const min = parseFloat(rateMin)
      const max = parseFloat(rateMax)
      if(min > max) {
        setError('Minimum rate must be less than maximum rate.')
        return
      }
    }

    setLoading(true)
    try{
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password, // server should hash into password_hash
        role: formRole,
        mfa_enabled: !!mfaEnabled
      }
      
      // Add nonprofit profile data if provided
      if(formRole === 'nonprofit' && showProfileFields) {
        payload.organizationData = {
          name: orgName.trim() || undefined,
          EIN: ein.trim() || undefined,
          mission: mission.trim() || undefined,
          focus_tags: focusTags ? focusTags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
          contacts: {
            phone: phone.trim() || undefined,
            website: website.trim() || undefined
          }
        }
      }
      
      // Add researcher profile data if provided
      if(formRole === 'researcher' && showProfileFields) {
        payload.researcherData = {
          affiliation: affiliation.trim() || undefined,
          domains: domains ? domains.split(',').map(d => d.trim()).filter(Boolean) : undefined,
          methods: methods ? methods.split(',').map(m => m.trim()).filter(Boolean) : undefined,
          tools: tools ? tools.split(',').map(t => t.trim()).filter(Boolean) : undefined,
          rate_min: rateMin ? parseFloat(rateMin) : undefined,
          rate_max: rateMax ? parseFloat(rateMax) : undefined,
          availability: availability.trim() || undefined
        }
      }

      const res = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      // Handle successful registration response
      if (res.ok) {
        // Check if backend returned a token (auto-login scenario - currently not used)
        if (data && data.token) {
          // User is already verified, log them in immediately
          loginAndRedirect({user:data.user, token:data.token})
          setSuccess('Account created successfully! Redirecting...')
          setTimeout(() => onClose(), 900)
        } else {
          // Email verification required (default flow)
          // Trigger success modal via callback
          const message = data?.message || 'Account created successfully! Please check your email to verify your account.'
          onSuccess(message)
        }
      } else {
        // Handle registration errors (email exists, validation failed, etc.)
        const msg = data && data.error ? data.error : `Registration failed (${res.status})`
        setError(msg)
      }
      setLoading(false)
    }catch(err){
      console.error(err)
      setError('Network error while registering. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0 fw-700">Create your account</h5>
        <small className="text-muted">Join as:</small>
      </div>

      <div className="btn-group mb-3 w-100" role="group" aria-label="Select user role">
        <button type="button" onClick={() => setFormRole('nonprofit')} className={`btn ${formRole==='nonprofit'?'btn-gradient':'btn-outline-mint'}`} style={{flex:1}} aria-pressed={formRole==='nonprofit'}>Nonprofit</button>
        <button type="button" onClick={() => setFormRole('researcher')} className={`btn ${formRole==='researcher'?'btn-gradient':'btn-outline-mint'}`} style={{flex:1}} aria-pressed={formRole==='researcher'}>Researcher</button>
      </div>

      {error && <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border" role="alert" aria-live="assertive" aria-atomic="true">{error}</div>}
      {success && <div className="alert alert-success bg-success bg-opacity-10 border-success border" role="status" aria-live="polite" aria-atomic="true">{success}</div>}
      {requiresVerification && (
        <div className="d-flex align-items-center gap-2 mb-3">
          <button
            type="button"
            className="btn btn-outline-mint"
            disabled={resendLoading}
            onClick={async () => {
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
            }}
            aria-busy={resendLoading}
          >
            {resendLoading ? 'Sending...' : 'Resend verification email'}
          </button>
          {resendMessage && <small className="text-muted">{resendMessage}</small>}
        </div>
      )}

      <form onSubmit={submit} aria-label="Sign up form">
        <div className="mb-3">
          <label htmlFor="signup-name" className="form-label fw-600 text-gray-800">Full Name <span aria-label="required">*</span></label>
          <input id="signup-name" className="form-control border-gray-200" value={name} onChange={e=>setName(e.target.value)} placeholder="Jane Smith" required aria-required="true" />
        </div>
        <div className="mb-3">
          <label htmlFor="signup-email" className="form-label fw-600 text-gray-800">Email <span aria-label="required">*</span></label>
          <input id="signup-email" className="form-control border-gray-200" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="jane@example.com" required aria-required="true" />
        </div>
        <div className="mb-3">
          <label htmlFor="signup-password" className="form-label fw-600 text-gray-800">Password <span aria-label="required">*</span></label>
          <div className="position-relative">
            <input 
              id="signup-password" 
              className="form-control border-gray-200" 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              aria-required="true" 
              minLength={8} 
              aria-describedby="password-hint"
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
          <div id="password-hint" className="form-text text-muted small">At least 8 characters</div>
        </div>

        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" id="mfaEnabled" checked={mfaEnabled} onChange={e=>setMfaEnabled(e.target.checked)} />
          <label className="form-check-label text-gray-700" htmlFor="mfaEnabled">Enable two-factor authentication (recommended)</label>
        </div>

        {/* Profile fields toggle */}
        <div className="mb-3">
          <button 
            type="button" 
            className="btn btn-link p-0 text-decoration-none fw-600 text-mint-700"
            onClick={() => setShowProfileFields(!showProfileFields)}
            aria-expanded={showProfileFields}
            aria-controls={`profile-fields-${formRole}`}
          >
            {showProfileFields ? '▼' : '▶'} {formRole === 'nonprofit' ? 'Organization' : 'Professional'} Details (Optional)
          </button>
          <div className="form-text text-muted">
            Complete your profile later if you prefer
          </div>
        </div>

        {/* Nonprofit profile fields */}
        {showProfileFields && formRole === 'nonprofit' && (
          <div className="card-soft p-3 mb-3 border-mint-100">
            <h6 className="fw-700 text-gray-900 mb-3">Organization Details</h6>
            
            <div className="mb-3">
              <label className="form-label fw-600 text-gray-800">Organization Name</label>
              <input 
                className="form-control border-gray-200" 
                value={orgName} 
                onChange={e=>setOrgName(e.target.value)}
                placeholder="My Nonprofit Foundation"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-600 text-gray-800">Tax ID (EIN)</label>
              <input 
                className="form-control border-gray-200" 
                value={ein} 
                onChange={e=>setEin(e.target.value)}
                placeholder="12-3456789"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-600 text-gray-800">Mission Statement</label>
              <textarea 
                className="form-control border-gray-200" 
                rows="2"
                value={mission} 
                onChange={e=>setMission(e.target.value)}
                placeholder="Brief description of your mission..."
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-600 text-gray-800">Focus Areas</label>
              <input 
                className="form-control border-gray-200" 
                value={focusTags} 
                onChange={e=>setFocusTags(e.target.value)}
                placeholder="education, health, environment"
              />
              <div className="form-text text-muted small">Comma-separated</div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-600 text-gray-800">Phone</label>
                <input 
                  className="form-control border-gray-200" 
                  type="tel"
                  value={phone} 
                  onChange={e=>setPhone(e.target.value)}
                  placeholder="(555) 012-3456"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-600 text-gray-800">Website</label>
                <input 
                  className="form-control border-gray-200" 
                  type="url"
                  value={website} 
                  onChange={e=>setWebsite(e.target.value)}
                  placeholder="https://example.org"
                />
              </div>
            </div>
          </div>
        )}

        {/* Researcher profile fields */}
        {showProfileFields && formRole === 'researcher' && (
          <div className="card-soft p-3 mb-3 border-mint-100">
            <h6 className="fw-700 text-gray-900 mb-3">Professional Profile</h6>
            
            <div className="mb-3">
              <label className="form-label fw-600 text-gray-800">Affiliation</label>
              <input 
                className="form-control border-gray-200" 
                value={affiliation} 
                onChange={e=>setAffiliation(e.target.value)}
                placeholder="University or research institution"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-600 text-gray-800">Expertise Areas</label>
              <input 
                className="form-control border-gray-200" 
                value={domains} 
                onChange={e=>setDomains(e.target.value)}
                placeholder="education, econometrics, causal inference"
              />
              <div className="form-text text-muted small">Comma-separated</div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-600 text-gray-800">Research Methods</label>
              <input 
                className="form-control border-gray-200" 
                value={methods} 
                onChange={e=>setMethods(e.target.value)}
                placeholder="RCT, survey, quasi-experimental design"
              />
              <div className="form-text text-muted small">Comma-separated</div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-600 text-gray-800">Tools & Platforms</label>
              <input 
                className="form-control border-gray-200" 
                value={tools} 
                onChange={e=>setTools(e.target.value)}
                placeholder="R, Python, Stata, SPSS"
              />
              <div className="form-text text-muted small">Comma-separated</div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-600 text-gray-800">Min Rate ($/hr)</label>
                <input 
                  className="form-control border-gray-200" 
                  type="number"
                  min="0"
                  step="5"
                  value={rateMin} 
                  onChange={e=>setRateMin(e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-600 text-gray-800">Max Rate ($/hr)</label>
                <input 
                  className="form-control border-gray-200" 
                  type="number"
                  min="0"
                  step="5"
                  value={rateMax} 
                  onChange={e=>setRateMax(e.target.value)}
                  placeholder="250"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-600 text-gray-800">Availability</label>
              <input 
                className="form-control border-gray-200" 
                value={availability} 
                onChange={e=>setAvailability(e.target.value)}
                placeholder="Part-time, 10-20 hours/week"
              />
            </div>
          </div>
        )}

        <div className="d-flex justify-content-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-outline-mint" disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-gradient" disabled={loading}>{loading? 'Creating account...' : 'Create account'}</button>
        </div>
      </form>
    </div>
  )
}

