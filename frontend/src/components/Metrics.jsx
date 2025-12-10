import React from 'react'

const stats = [
  { label: 'Matches', value: '1,234' },
  { label: 'Avg time to match', value: '10 days' },
  { label: 'Projects completed', value: '498' },
  { label: 'Money saved', value: '$2.3M' },
  { label: 'Sectors served', value: '12' }
]

export default function Metrics() {
  return (
    <section className="py-3">
  <div className="container">
        <h4>Impact</h4>
        <div className="row g-3 mt-2">
          {stats.map((s, i) => (
            <div className="col-6 col-md-2" key={i}>
              <div className="card text-center p-2">
                <div className="h5 mb-0">{s.value}</div>
                <div className="small text-muted">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
