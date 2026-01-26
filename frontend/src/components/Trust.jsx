import React from 'react'

const orgs = [
  { name: 'Harbor Relief', tag: 'Nonprofit', tone: 'mint' },
  { name: 'Riverside University', tag: 'Evaluation Lab', tone: 'sky' },
  { name: 'Acacia Impact Fund', tag: 'Foundation', tone: 'peach' },
  { name: 'Atlas Policy Institute', tag: 'Think Tank', tone: 'lavender' }
]

const quotes = [
  {
    quote: 'We landed a rigorously scoped RCT partner in under two weeks.',
    author: 'Maya Chen',
    role: 'Programs Director, Harbor Relief'
  },
  {
    quote: 'The briefs are clear, timelines are visible, and milestones are easy to track.',
    author: 'Dr. Rafael Ortiz',
    role: 'Lead Researcher, Riverside University Evaluation Lab'
  }
]

export default function Trust() {
  return (
    <section className="py-4" aria-label="Trust and partnerships">
      <div className="container-center">
        <div className="d-flex flex-column gap-2 mb-3">
          <div className="section-label">Trusted delivery partners</div>
          <h2 className="section-title">Built with teams who need rigor and speed.</h2>
          <p className="section-lead">Nonprofits, universities, and funders use Trident to scope briefs, pair with qualified researchers, and keep governance tight.</p>
        </div>

        <div className="logo-cloud mb-4" role="list">
          {orgs.map((o, idx) => (
            <div className="logo-tile" key={idx} role="listitem">
              <span className="logo-dot" aria-hidden="true"></span>
              <span>{o.name}</span>
              <span className="badge bg-light text-dark ms-auto">{o.tag}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-2" role="region" aria-label="User testimonials">
          {quotes.map((q, idx) => (
            <figure className="card-soft p-3" key={idx}>
              <blockquote className="mb-2">
                <p>"{q.quote}"</p>
              </blockquote>
              <figcaption className="small text-muted">{q.author} · {q.role}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
