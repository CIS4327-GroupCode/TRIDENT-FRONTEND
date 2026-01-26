import React from 'react'

const filters = [
  'Education · K-12',
  'Public health · Maternal',
  'Housing · Rapid rehousing',
  'Climate · Community cooling',
  'Methods · RCT',
  'Methods · Quasi-experimental'
]

export default function SearchPreview() {
  return (
    <section className="py-4" aria-label="Search and browse filters">
      <div className="container-center">
        <div className="search-panel">
          <div className="d-flex flex-column gap-1">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="section-label">Browse the network</div>
              <div className="small text-muted">Filter by topic, method, geography, or compensation.</div>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-2" role="list">
              {filters.map((f, idx) => (
                <span key={idx} className="search-pill" role="listitem">{f}</span>
              ))}
            </div>
          </div>
          <div className="input-group mt-3">
            <input readOnly className="form-control" placeholder="Try: randomized trial · maternal health · Midwest" aria-label="Search researchers by topic, method, and location" />
            <button className="btn btn-gradient" aria-label="Search and preview available researchers">Preview talent</button>
          </div>
        </div>
      </div>
    </section>
  )
}
