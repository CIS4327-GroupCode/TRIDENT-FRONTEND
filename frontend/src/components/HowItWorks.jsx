import React from 'react'

const steps = [
  { title: 'Set up in minutes', desc: 'Create a nonprofit or researcher profile with focus areas, methods, and data needs.', badge: 'Step 1' },
  { title: 'Post or discover briefs', desc: 'Nonprofits post scoped briefs; researchers filter by topic, methods, and location.', badge: 'Step 2' },
  { title: 'Curated matches', desc: 'We surface the best-fit talent; message and align on milestones directly in Trident.', badge: 'Step 3' },
  { title: 'Deliver with guardrails', desc: 'Track deliverables, timelines, and IRB/FERPA guidance while you collaborate.', badge: 'Step 4' }
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-4" aria-label="How Trident works">
      <div className="container-center">
        <div className="d-flex flex-column gap-2 mb-3">
          <div className="section-label">Workflow built for impact teams</div>
          <h2 className="section-title">How Trident gets you from idea to evidence.</h2>
          <p className="section-lead">A guided, transparent process so nonprofits and researchers can co-create faster without sacrificing rigor.</p>
        </div>
        <div className="grid grid-4 grid-2" role="region" aria-label="Four-step process">
          {steps.map((s, i) => (
            <article className="step-card" key={i} role="article">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="step-number" aria-label={`Step ${i + 1}`}>{i + 1}</span>
                <span className="pill pill-gray">{s.badge}</span>
              </div>
              <h3 className="h6 mb-1">{s.title}</h3>
              <p className="small text-muted mb-0">{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
