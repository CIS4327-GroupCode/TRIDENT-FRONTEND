import React from 'react'

const stats = [
  { label: 'Active briefs', value: '126', detail: 'Education, health, climate' },
  { label: 'Avg time to first match', value: '48 hrs', detail: 'Curated intros' },
  { label: 'Projects delivered', value: '512', detail: 'Tracked milestones' },
  { label: 'Value unlocked', value: '$2.8M', detail: 'In-kind research' },
  { label: 'Researchers onboarded', value: '930+', detail: 'Across 14 countries' }
]

export default function Metrics() {
  return (
    <section className="py-4">
      <div className="container-center">
        <div className="d-flex flex-column gap-2 mb-3">
          <div className="section-label">Impact snapshot</div>
          <h2 className="section-title">Proof that matching faster leads to better delivery.</h2>
        </div>
        <div className="grid grid-3">
          {stats.map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="small text-muted mt-1">{s.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
