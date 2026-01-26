import React from 'react'

const projects = [
  { title: 'BrightSteps attendance pilots', org: 'Harbor Relief', tags: ['Education', 'Mixed methods', '6 months'], budget: '$8k in-kind', slots: '2 researcher slots' },
  { title: 'Community cooling study', org: 'Civic Climate Collaborative', tags: ['Environmental health', 'Quasi-experimental', '12 months'], budget: '$15k in-kind', slots: '1 lead, 1 RA' },
  { title: 'Food access rapid survey', org: 'North Star Pantry Network', tags: ['Survey', 'Data viz', '3 months'], budget: '$5k stipend', slots: '3 analyst spots' }
]

export default function FeaturedProjects() {
  return (
    <section className="py-4" aria-label="Featured research projects">
      <div className="container-center">
        <div className="d-flex flex-column gap-2 mb-3">
          <div className="section-label">Fresh briefs</div>
          <h2 className="section-title">A few projects looking for collaborators now.</h2>
        </div>
        <div className="grid grid-3" role="region" aria-label="Featured project listings">
          {projects.map((p, i) => (
            <article className="featured-card" key={i} role="article">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <h3 className="mb-0 h6">{p.title}</h3>
                <span className="badge bg-light text-dark" aria-label={`Organization: ${p.org}`}>{p.org}</span>
              </div>
              <div className="d-flex flex-wrap gap-2" role="list">
                {p.tags.map((tag, idx) => (
                  <span className="tag" key={idx} role="listitem">{tag}</span>
                ))}
              </div>
              <div className="d-flex justify-content-between align-items-center mt-auto">
                <span className="fw-semibold" aria-label={`Budget: ${p.budget}`}>{p.budget}</span>
                <span className="text-muted small" aria-label={`Available positions: ${p.slots}`}>{p.slots}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
