import React, { useState } from 'react'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setStatus({ type: '', message: '' })

    // Simulate sending - replace with actual API call
    setTimeout(() => {
      setStatus({
        type: 'success',
        message: 'Thank you for reaching out! We\'ll get back to you within 24 hours.'
      })
      setFormData({ name: '', email: '', subject: '', message: '' })
      setSending(false)
    }, 1000)
  }

  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content container-center py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="section-label mx-auto mb-3">Get in Touch</div>
          <h1 className="section-title mb-3">Let's Connect</h1>
          <p className="section-lead mx-auto">
            Have questions about TRIDENT? We're here to help you connect with the right research partners.
          </p>
        </div>

        <div className="row g-4">
          {/* Contact Methods */}
          <div className="col-lg-5">
            <div className="card-soft h-100 p-4">
              <h5 className="mb-4 fw-bold" style={{ color: 'var(--mint-700)' }}>Connect With Us</h5>
              
              {/* Email */}
              <div className="mb-4 d-flex align-items-start gap-3">
                <div 
                  className="step-number" 
                  style={{ 
                    background: 'var(--mint-100)', 
                    color: 'var(--mint-700)',
                    minWidth: '48px',
                    minHeight: '48px'
                  }}
                >
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Email</h6>
                  <a 
                    href="mailto:contact@trident.org" 
                    className="text-decoration-none"
                    style={{ color: 'var(--mint-600)' }}
                  >
                    contact@trident.org
                  </a>
                  <p className="text-muted small mb-0 mt-1">We typically respond within 24 hours</p>
                </div>
              </div>

              {/* Phone */}
              <div className="mb-4 d-flex align-items-start gap-3">
                <div 
                  className="step-number" 
                  style={{ 
                    background: 'var(--pastel-sky)', 
                    color: '#0369a1',
                    minWidth: '48px',
                    minHeight: '48px'
                  }}
                >
                  <i className="bi bi-telephone-fill"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Phone</h6>
                  <a 
                    href="tel:+15551234567" 
                    className="text-decoration-none"
                    style={{ color: 'var(--mint-600)' }}
                  >
                    +1 (555) 123-4567
                  </a>
                  <p className="text-muted small mb-0 mt-1">Mon-Fri, 9am-5pm EST</p>
                </div>
              </div>

              {/* Social Media */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Follow Us</h6>
                <div className="d-flex gap-3">
                  <a 
                    href="https://twitter.com/trident" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                    style={{ 
                      borderRadius: '50%', 
                      width: '48px', 
                      height: '48px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderColor: 'var(--mint-200)',
                      color: 'var(--mint-700)'
                    }}
                    aria-label="Twitter"
                  >
                    <i className="bi bi-twitter" style={{ fontSize: '1.25rem' }}></i>
                  </a>
                  <a 
                    href="https://linkedin.com/company/trident" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                    style={{ 
                      borderRadius: '50%', 
                      width: '48px', 
                      height: '48px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderColor: 'var(--mint-200)',
                      color: 'var(--mint-700)'
                    }}
                    aria-label="LinkedIn"
                  >
                    <i className="bi bi-linkedin" style={{ fontSize: '1.25rem' }}></i>
                  </a>
                  <a 
                    href="https://github.com/trident" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                    style={{ 
                      borderRadius: '50%', 
                      width: '48px', 
                      height: '48px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderColor: 'var(--mint-200)',
                      color: 'var(--mint-700)'
                    }}
                    aria-label="GitHub"
                  >
                    <i className="bi bi-github" style={{ fontSize: '1.25rem' }}></i>
                  </a>
                  <a 
                    href="https://facebook.com/trident" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                    style={{ 
                      borderRadius: '50%', 
                      width: '48px', 
                      height: '48px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderColor: 'var(--mint-200)',
                      color: 'var(--mint-700)'
                    }}
                    aria-label="Facebook"
                  >
                    <i className="bi bi-facebook" style={{ fontSize: '1.25rem' }}></i>
                  </a>
                </div>
              </div>

              {/* Office Location */}
              <div className="d-flex align-items-start gap-3">
                <div 
                  className="step-number" 
                  style={{ 
                    background: 'var(--pastel-lavender)', 
                    color: '#5b21b6',
                    minWidth: '48px',
                    minHeight: '48px'
                  }}
                >
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Office</h6>
                  <p className="text-muted mb-0">
                    123 Research Avenue<br />
                    Innovation District<br />
                    Boston, MA 02115
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-lg-7">
            <div className="card-soft h-100 p-4">
              <h5 className="mb-4 fw-bold" style={{ color: 'var(--mint-700)' }}>Send Us a Message</h5>
              
              {status.message && (
                <div 
                  className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`}
                  role="alert"
                >
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label fw-semibold">
                      Your Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="subject" className="form-label fw-semibold">
                      Subject <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="message" className="form-label fw-semibold">
                      Message <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control p-3"
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>

                  <div className="col-12 text-center">
                    <button
                      type="submit"
                      className="btn btn-gradient"
                      disabled={sending}
                    >
                      {sending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send-fill me-2"></i>
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="mt-5 p-4 text-center" style={{ 
          background: 'linear-gradient(135deg, rgba(240,253,249,0.5), rgba(204,251,241,0.3))',
          borderRadius: '14px',
          border: '1px solid var(--mint-100)'
        }}>
          <h6 className="fw-bold mb-2" style={{ color: 'var(--mint-700)' }}>
            Looking for answers?
          </h6>
          <p className="text-muted mb-3">
            Check out our FAQ section or browse our documentation for quick answers.
          </p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <a href="/#faq" className="btn btn-gradient btn-sm">
              View FAQ
            </a>
            <a href="/#how" className="btn btn-gradient btn-sm">
              How It Works
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
