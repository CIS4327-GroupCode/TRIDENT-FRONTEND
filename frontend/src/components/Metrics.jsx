import React, { useEffect, useMemo, useState } from 'react'
import { getApiUrl } from '../config/api'

export default function Metrics() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch(getApiUrl('/api/projects/browse/metrics'))
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch metrics')
      }

      setMetrics(data.metrics || null)
    } catch (error) {
      console.error('Failed to load metrics:', error)
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    if (!metrics) {
      return []
    }

    return [
      {
        label: 'Active briefs',
        value: Number(metrics.activeBriefs || 0).toLocaleString(),
        detail: 'Open for researcher collaboration',
      },
      {
        label: 'Total projects',
        value: Number(metrics.totalProjects || 0).toLocaleString(),
        detail: 'Across all project lifecycle stages',
      },
      {
        label: 'Projects delivered',
        value: Number(metrics.projectsDelivered || 0).toLocaleString(),
        detail: 'Completed end-to-end',
      },
      {
        label: 'Researchers onboarded',
        value: Number(metrics.researchersOnboarded || 0).toLocaleString(),
        detail: 'Active researcher accounts',
      },
      {
        label: 'Nonprofit partners',
        value: Number(metrics.nonprofitPartners || 0).toLocaleString(),
        detail: 'Active nonprofits on platform',
      },
    ]
  }, [metrics])

  return (
    <section className="py-4">
      <div className="container-center">
        <div className="d-flex flex-column gap-2 mb-3">
          <div className="section-label">Impact snapshot</div>
          <h2 className="section-title">Proof that matching faster leads to better delivery.</h2>
        </div>
        {loading && <div className="text-muted small mb-3">Loading metrics...</div>}

        {!loading && stats.length === 0 && (
          <div className="alert alert-light border" role="status">
            Platform metrics are currently unavailable.
          </div>
        )}

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
