import React from 'react'

export default function SearchPreview() {
  return (
    <section className="py-3">
      <div className="container-center card p-3">
        <h5>Explore available expertise</h5>
        <div className="input-group mt-2" aria-hidden>
          <input readOnly className="form-control" placeholder="e.g. focus area: education · methods: survey, RCT · geography: Midwest" />
          <button className="btn btn-outline-secondary">Search</button>
        </div>
        <div className="mt-2 small text-muted"><strong>Focus areas:</strong> <span className="badge bg-light text-dark">Education</span> <span className="badge bg-light text-dark">Health</span> <span className="badge bg-light text-dark">Housing</span> <span className="badge bg-light text-dark">Environment</span></div>
      </div>
    </section>
  )
}
