import React, { useState, useContext } from 'react'
import { getApiUrl } from '../../config/api'
import { AuthContext } from '../../auth/AuthContext'

export default function SignUpForm({ role = 'nonprofit', onClose = () => {} }){
  const { loginAndRedirect } = useContext(AuthContext)
  const [formRole, setFormRole] = useState(role)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
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
      if (res.ok) {
        loginAndRedirect({user:data.user, token:data.token});
        setSuccess('Account created successfully! Redirecting...')
        setTimeout(() => onClose(), 900)
      } else {
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
        <h5 className="mb-0">Sign up</h5>
        <small className="text-muted">Role:</small>
      </div>

      <div className="btn-group mb-3" role="group" aria-label="Role">
        <button type="button" onClick={() => setFormRole('nonprofit')} className={`btn ${formRole==='nonprofit'?'btn-primary':'btn-outline-secondary'}`}>Nonprofit</button>
        <button type="button" onClick={() => setFormRole('researcher')} className={`btn ${formRole==='researcher'?'btn-primary':'btn-outline-secondary'}`}>Researcher</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input className="form-control" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input className="form-control" type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} />
          <div className="form-text">Password should be at least 8 characters.</div>
        </div>

        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" id="mfaEnabled" checked={mfaEnabled} onChange={e=>setMfaEnabled(e.target.checked)} />
          <label className="form-check-label" htmlFor="mfaEnabled">Enable multi-factor authentication (MFA)</label>
        </div>

        {/* Profile fields toggle */}
        <div className="mb-3">
          <button 
            type="button" 
            className="btn btn-link p-0 text-decoration-none"
            onClick={() => setShowProfileFields(!showProfileFields)}
          >
            {showProfileFields ? '▼' : '▶'} {formRole === 'nonprofit' ? 'Organization' : 'Professional'} Profile (Optional)
          </button>
          <div className="form-text">
            You can {showProfileFields ? 'skip this now and ' : ''}complete your profile later in account settings
          </div>
        </div>

        {/* Nonprofit profile fields */}
        {showProfileFields && formRole === 'nonprofit' && (
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title mb-3">Organization Details</h6>
              
              <div className="mb-3">
                <label className="form-label">Organization Name</label>
                <input 
                  className="form-control" 
                  value={orgName} 
                  onChange={e=>setOrgName(e.target.value)}
                  placeholder="Save the Forests Foundation"
                />
                <div className="form-text">Leave blank to use your name</div>
              </div>

              <div className="mb-3">
                <label className="form-label">EIN (Tax ID)</label>
                <input 
                  className="form-control" 
                  value={ein} 
                  onChange={e=>setEin(e.target.value)}
                  placeholder="12-3456789"
                  pattern="[0-9]{2}-[0-9]{7}"
                />
                <div className="form-text">Format: XX-XXXXXXX</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Mission Statement</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={mission} 
                  onChange={e=>setMission(e.target.value)}
                  placeholder="Our mission is to..."
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Focus Areas</label>
                <input 
                  className="form-control" 
                  value={focusTags} 
                  onChange={e=>setFocusTags(e.target.value)}
                  placeholder="environment, conservation, climate change"
                />
                <div className="form-text">Comma-separated tags</div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input 
                    className="form-control" 
                    type="tel"
                    value={phone} 
                    onChange={e=>setPhone(e.target.value)}
                    placeholder="555-0123"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Website</label>
                  <input 
                    className="form-control" 
                    type="url"
                    value={website} 
                    onChange={e=>setWebsite(e.target.value)}
                    placeholder="https://example.org"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Researcher profile fields */}
        {showProfileFields && formRole === 'researcher' && (
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title mb-3">Professional Profile</h6>
              
              <div className="mb-3">
                <label className="form-label">Affiliation</label>
                <input 
                  className="form-control" 
                  value={affiliation} 
                  onChange={e=>setAffiliation(e.target.value)}
                  placeholder="Massachusetts Institute of Technology"
                />
                <div className="form-text">University, institution, or organization</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Domains of Expertise</label>
                <input 
                  className="form-control" 
                  value={domains} 
                  onChange={e=>setDomains(e.target.value)}
                  placeholder="machine learning, data science, AI ethics"
                />
                <div className="form-text">Comma-separated areas of expertise</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Research Methods</label>
                <input 
                  className="form-control" 
                  value={methods} 
                  onChange={e=>setMethods(e.target.value)}
                  placeholder="statistical analysis, deep learning, NLP"
                />
                <div className="form-text">Comma-separated methodologies</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Tools & Technologies</label>
                <input 
                  className="form-control" 
                  value={tools} 
                  onChange={e=>setTools(e.target.value)}
                  placeholder="Python, TensorFlow, R, PyTorch"
                />
                <div className="form-text">Comma-separated tools you use</div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Minimum Rate ($/hour)</label>
                  <input 
                    className="form-control" 
                    type="number"
                    min="0"
                    step="5"
                    value={rateMin} 
                    onChange={e=>setRateMin(e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Maximum Rate ($/hour)</label>
                  <input 
                    className="form-control" 
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
                <label className="form-label">Availability</label>
                <input 
                  className="form-control" 
                  value={availability} 
                  onChange={e=>setAvailability(e.target.value)}
                  placeholder="Part-time, 10-20 hours/week"
                />
                <div className="form-text">Describe your availability for projects</div>
              </div>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-end">
          <button type="button" onClick={onClose} className="btn btn-secondary me-2" disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading? 'Creating...' : 'Create account'}</button>
        </div>
      </form>
    </div>
  )
}
