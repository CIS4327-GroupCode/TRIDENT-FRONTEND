import React from 'react'

const projects = [
  { title: 'Summer Learning Evaluation', tags: ['education','RCT','6 months'], budget: '$5k-$10k' },
  { title: 'Food Access Survey', tags: ['survey','mixed-methods','3 months'], budget: '$2k-$5k' },
  { title: 'Housing Intervention Analysis', tags: ['quasi-experimental','12 months'], budget: '$10k+' }
]

export default function FeaturedProjects() {
  return (
    <section className="py-3">
      <div className="container-center">
        <h4>Featured projects</h4>
        <div className="row g-3 mt-2">
          {projects.map((p, i) => (
            <div className="col-12 col-md-4" key={i}>
              <div className="card p-3 h-100">
                <h5>{p.title}</h5>
                <div className="text-muted small">{p.tags.join(' · ')}</div>
                <div className="mt-2"><strong>{p.budget}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
