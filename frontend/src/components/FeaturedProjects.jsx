import React, { useEffect, useState } from 'react'
import { getApiUrl } from '../config/api'

export default function FeaturedProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProjects()
  }, [])

  const fetchFeaturedProjects = async () => {
    try {
      const response = await fetch(getApiUrl('/api/projects/browse/featured?limit=3'))
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch featured projects')
      }

      setProjects(data.featuredProjects || [])
    } catch (error) {
      console.error('Failed to load featured projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const formatBudget = (budget) => {
    if (!budget) return 'Budget not specified'
    return `$${Number(budget).toLocaleString()}`
  }

  return (
    <section className="py-4" aria-label="Featured research projects">
      <div className="container-center">
        <div className="d-flex flex-column gap-2 mb-3">
          <div className="section-label">Fresh briefs</div>
          <h2 className="section-title">A few projects looking for collaborators now.</h2>
        </div>
        <div className="grid grid-3" role="region" aria-label="Featured project listings">
          {!loading && projects.length === 0 && (
            <div className="alert alert-light border" role="status">
              Featured projects are being updated. Browse all open opportunities in the Browse section.
            </div>
          )}

          {loading && (
            <div className="text-muted small">Loading featured projects...</div>
          )}

          {!loading && projects.map((p) => (
            <article className="featured-card" key={p.project_id} role="article">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <h3 className="mb-0 h6">{p.title}</h3>
                <span className="badge bg-light text-dark" aria-label={`Organization: ${p.organization?.name || 'Unknown'}`}>
                  {p.organization?.name || 'Unknown organization'}
                </span>
              </div>

              <div className="d-flex flex-wrap gap-2" role="list">
                {p.methods_required && <span className="tag" role="listitem">{p.methods_required}</span>}
                {p.data_sensitivity && <span className="tag" role="listitem">{p.data_sensitivity}</span>}
                {p.timeline && <span className="tag" role="listitem">{p.timeline}</span>}
              </div>

              <div className="d-flex justify-content-between align-items-center mt-auto">
                <span className="fw-semibold" aria-label={`Budget: ${formatBudget(p.budget_min)}`}>
                  {formatBudget(p.budget_min)}
                </span>
                <span className="text-muted small">Open opportunity</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
