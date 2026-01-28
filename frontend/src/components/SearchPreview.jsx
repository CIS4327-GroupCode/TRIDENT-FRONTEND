import React, { useState, useEffect } from 'react'
import { getApiUrl } from '../config/api'

export default function SearchPreview() {
  const [researchers, setResearchers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResearcher, setSelectedResearcher] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Extract unique filter values from researcher data
  const [availableFilters, setAvailableFilters] = useState([])

  useEffect(() => {
    // Load initial researchers to populate filters
    loadResearchers()
  }, [])

  const loadResearchers = async (filterParams = {}) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      
      if (filterParams.expertise) queryParams.append('expertise', filterParams.expertise)
      if (filterParams.methods) queryParams.append('methods', filterParams.methods)
      if (filterParams.domains) queryParams.append('domains', filterParams.domains)
      if (searchQuery) queryParams.append('search', searchQuery)
      
      queryParams.append('limit', '12')
      
      const res = await fetch(getApiUrl(`/api/users/browse/researchers?${queryParams.toString()}`))
      const data = await res.json()
      
      if (res.ok) {
        setResearchers(data.researchers || [])
        
        // Extract unique filters from the data
        if (data.researchers && data.researchers.length > 0) {
          extractFilters(data.researchers)
        }
      }
    } catch (err) {
      console.error('Failed to load researchers:', err)
    } finally {
      setLoading(false)
    }
  }

  const extractFilters = (researcherData) => {
    const filters = new Set()
    
    researcherData.forEach(r => {
      const profile = r.researcherProfile
      if (!profile) return
      
      // Extract from domains
      if (profile.domains) {
        profile.domains.split(',').forEach(d => {
          const cleaned = d.trim()
          if (cleaned) filters.add(cleaned)
        })
      }
      
      // Extract from methods
      if (profile.methods) {
        profile.methods.split(',').forEach(m => {
          const cleaned = m.trim()
          if (cleaned) filters.add(`Methods · ${cleaned}`)
        })
      }
    })
    
    setAvailableFilters(Array.from(filters).slice(0, 8))
  }

  const handleFilterClick = async (filter) => {
    setSelectedFilter(filter)
    
    // Determine filter type
    if (filter.startsWith('Methods · ')) {
      const method = filter.replace('Methods · ', '')
      await loadResearchers({ methods: method })
    } else {
      await loadResearchers({ domains: filter })
    }
  }

  const handleSearch = async () => {
    await loadResearchers({ search: searchQuery })
  }

  const openResearcherModal = (researcher) => {
    setSelectedResearcher(researcher)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedResearcher(null)
  }

  return (
    <>
      <section className="py-4" aria-label="Search and browse filters">
        <div className="container-center">
          <div className="search-panel">
            <div className="d-flex flex-column gap-1">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <div className="section-label">Browse the network</div>
              </div>
              
              <p className="mb-2 mt-3" style={{ color: 'var(--gray-700)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Explore our network of verified researchers. Use the search box to find researchers by expertise, methods, affiliation, or keywords.
              </p>
              
              <div className="d-flex flex-wrap gap-2 mt-2" role="list">
                {loading && availableFilters.length === 0 ? (
                  <span className="text-muted">Loading filters...</span>
                ) : (
                  availableFilters.map((f, idx) => (
                    <span 
                      key={idx} 
                      className={`search-pill ${selectedFilter === f ? 'active' : ''}`}
                      role="listitem"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFilterClick(f)}
                    >
                      {f}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div className="input-group mt-3">
              <input 
                className="form-control" 
                placeholder="Try: randomized trial · maternal health · Midwest" 
                aria-label="Search researchers by topic, method, and location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                className="btn btn-gradient" 
                aria-label="Search and preview available researchers"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Preview talent'}
              </button>
            </div>
          </div>

          {/* Results preview */}
          {researchers.length > 0 && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">
                  {researchers.length} researcher{researchers.length !== 1 ? 's' : ''} found
                </h6>
                {selectedFilter && (
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setSelectedFilter(null)
                      loadResearchers()
                    }}
                  >
                    Clear filter
                  </button>
                )}
              </div>
              <div className="row g-3">
                {researchers.map((researcher) => (
                  <div key={researcher.id} className="col-md-6 col-lg-4">
                    <div 
                      className="card h-100" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => openResearcherModal(researcher)}
                    >
                      <div className="card-body">
                        <h6 className="card-title">{researcher.name}</h6>
                        <p className="text-muted small mb-2">
                          {researcher.researcherProfile?.affiliation || 'Independent Researcher'}
                        </p>
                        {researcher.researcherProfile?.domains && (
                          <div className="mb-2">
                            <small className="text-muted">Domains:</small>
                            <div className="mt-1">
                              {researcher.researcherProfile.domains.split(',').slice(0, 2).map((d, idx) => (
                                <span key={idx} className="badge bg-light text-dark me-1">
                                  {d.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {researcher.researcherProfile?.rate_min && researcher.researcherProfile?.rate_max && (
                          <small className="text-success">
                            ${researcher.researcherProfile.rate_min}-${researcher.researcherProfile.rate_max}/hr
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Researcher Detail Modal */}
      {showModal && selectedResearcher && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedResearcher.name}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <h6 className="text-primary mb-2">Affiliation</h6>
                  <p>{selectedResearcher.researcherProfile?.affiliation || 'Independent Researcher'}</p>
                </div>

                {selectedResearcher.researcherProfile?.domains && (
                  <div className="mb-4">
                    <h6 className="text-primary mb-2">Research Domains</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedResearcher.researcherProfile.domains.split(',').map((d, idx) => (
                        <span key={idx} className="badge bg-primary">
                          {d.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedResearcher.researcherProfile?.methods && (
                  <div className="mb-4">
                    <h6 className="text-primary mb-2">Research Methods</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedResearcher.researcherProfile.methods.split(',').map((m, idx) => (
                        <span key={idx} className="badge bg-secondary">
                          {m.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedResearcher.researcherProfile?.tools && (
                  <div className="mb-4">
                    <h6 className="text-primary mb-2">Tools & Technologies</h6>
                    <p>{selectedResearcher.researcherProfile.tools}</p>
                  </div>
                )}

                {selectedResearcher.researcherProfile?.expertise && (
                  <div className="mb-4">
                    <h6 className="text-primary mb-2">Expertise</h6>
                    <p>{selectedResearcher.researcherProfile.expertise}</p>
                  </div>
                )}

                {selectedResearcher.researcherProfile?.compliance_certifications && (
                  <div className="mb-4">
                    <h6 className="text-primary mb-2">Certifications</h6>
                    <p>{selectedResearcher.researcherProfile.compliance_certifications}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h6 className="text-primary mb-2">Availability & Rates</h6>
                  {selectedResearcher.researcherProfile?.availability && (
                    <p className="mb-1">
                      <strong>Availability:</strong> {selectedResearcher.researcherProfile.availability} hours/week
                    </p>
                  )}
                  {selectedResearcher.researcherProfile?.rate_min && selectedResearcher.researcherProfile?.rate_max && (
                    <p className="mb-0">
                      <strong>Hourly Rate:</strong> ${selectedResearcher.researcherProfile.rate_min} - ${selectedResearcher.researcherProfile.rate_max}
                    </p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  Contact Researcher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
