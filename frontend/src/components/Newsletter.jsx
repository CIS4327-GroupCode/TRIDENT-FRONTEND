import React from 'react'

export default function Newsletter() {
  return (
    <section className="py-3">
      <div className="container-center card p-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
        <div>
          <h5 className="mb-1">Stay updated</h5>
          <p className="mb-0 text-muted">Get updates, invites to pilot programs, and scholarships for student RAs.</p>
        </div>
        <form className="d-flex" onSubmit={e => e.preventDefault()}>
          <input placeholder="Your email" type="email" className="form-control me-2" />
          <button className="btn btn-primary">Subscribe</button>
        </form>
      </div>
    </section>
  )
}
