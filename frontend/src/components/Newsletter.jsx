import React from 'react'

export default function Newsletter() {
  return (
    <section className="py-4" aria-label="Newsletter signup">
      <div className="container-center">
        <div className="newsletter d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div>
            <div className="section-label">Stay in the loop</div>
            <h2 className="mt-2 mb-1">Monthly drops on new briefs, pilots, and RA scholarships.</h2>
            <p className="mb-0 text-muted">Curated updates only — no spam.</p>
          </div>
          <form className="d-flex w-100" style={{maxWidth:'420px'}} onSubmit={e => e.preventDefault()} aria-label="Newsletter subscription form">
            <label htmlFor="newsletter-email" className="visually-hidden">Email address</label>
            <input id="newsletter-email" placeholder="your@email.com" type="email" className="form-control me-2" aria-label="Enter your email address" required />
            <button className="btn btn-gradient" onClick={()=>{alert('this adds you to the newsletter')}} aria-label="Subscribe to newsletter">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  )
}
