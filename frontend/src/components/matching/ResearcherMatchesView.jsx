import React, { useState, useEffect } from 'react';
import MatchCard from './MatchCard';
import MatchFilters from './MatchFilters';
import ApplyModal from './ApplyModal';

/**
 * Researcher view of matching projects
 * Shows projects that match the researcher's skills and availability
 */
const ResearcherMatchesView = ({ apiBaseUrl, userId }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyingTo, setApplyingTo] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });
  
  const [filters, setFilters] = useState({
    minScore: 50,
    sortBy: 'score',
    methods: []
  });

  /**
   * Fetch matching projects from API
   */
  const fetchMatches = async (offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: offset,
        minScore: filters.minScore
      });

      const token = localStorage.getItem('trident_token');
      
      const response = await fetch(
        `${apiBaseUrl}/api/matches/researcher/me?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Sort matches
      let sortedMatches = sortMatches(data.matches || [], filters.sortBy);
      
      setMatches(offset === 0 ? sortedMatches : [...matches, ...sortedMatches]);
      setPagination(data.pagination || { total: 0, limit: 20, offset: 0, hasMore: false });
      
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sort matches
   */
  const sortMatches = (matchList, sortBy) => {
    const sorted = [...matchList];
    
    switch (sortBy) {
      case 'score':
        return sorted.sort((a, b) => b.matchScore - a.matchScore);
      case 'budget':
        return sorted.sort((a, b) => {
          const aBudget = b.project.budget_max || 0;
          const bBudget = a.project.budget_max || 0;
          return aBudget - bBudget;
        });
      default:
        return sorted;
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  /**
   * Load more matches
   */
  const handleLoadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchMatches(pagination.offset + pagination.limit);
    }
  };

  // Fetch on mount and filter changes
  useEffect(() => {
    fetchMatches(0);
  }, [userId, filters.minScore]);

  // Re-sort when sort option changes
  useEffect(() => {
    if (matches.length > 0) {
      const sorted = sortMatches(matches, filters.sortBy);
      setMatches(sorted);
    }
  }, [filters.sortBy]);

  // Loading state
  if (loading && matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner" style={{ 
          border: '4px solid #f3f4f6',
          borderTop: '4px solid var(--primary-blue, #3b82f6)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Finding matching projects...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        padding: '20px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#991b1b'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
          Error Loading Matches
        </h3>
        <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
        <button
          onClick={() => fetchMatches(0)}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
          No Matching Projects Found
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
          We couldn't find any open projects that match your expertise and availability. 
          Try updating your profile or check back later for new opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="researcher-matches-view">
      {/* Filter controls - simplified for researcher view */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Minimum Match Score: {filters.minScore}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.minScore}
              onChange={(e) => handleFilterChange({ ...filters, minScore: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--primary-blue, #3b82f6)' }}
            />
          </div>
          <div style={{ width: '200px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="score">Match Score</option>
              <option value="budget">Budget (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
          {pagination.total} Matching Project{pagination.total !== 1 ? 's' : ''}
        </h2>
      </div>

      {/* Project cards */}
      <div className="project-cards">
        {matches.map((match) => (
          <div
            key={match.project.project_id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '16px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', gap: '20px' }}>
              {/* Match score */}
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: `4px solid ${match.matchScore >= 80 ? '#22c55e' : match.matchScore >= 60 ? '#f59e0b' : '#ef4444'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: match.matchScore >= 80 ? '#22c55e' : match.matchScore >= 60 ? '#f59e0b' : '#ef4444'
                  }}
                >
                  {Math.round(match.matchScore)}
                </div>
              </div>

              {/* Project info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                  {match.project.title}
                </h3>
                {match.project.organization && (
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                    {match.project.organization.name}
                  </p>
                )}
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151' }}>
                  {match.project.problem?.substring(0, 200)}{match.project.problem?.length > 200 ? '...' : ''}
                </p>

                {/* Budget info */}
                {(match.project.budget_min || match.project.budget_max) && (
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                    💰 Budget: ${match.project.budget_min?.toLocaleString()}{match.project.budget_max && ` - $${match.project.budget_max.toLocaleString()}`}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setApplyingTo(match.project)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'var(--primary-blue, #3b82f6)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-blue, #3b82f6)'; }}
                  >
                    Apply to Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      {applyingTo && (
        <ApplyModal
          projectTitle={applyingTo.title}
          projectId={applyingTo.project_id}
          onClose={() => setApplyingTo(null)}
          onSuccess={() => {
            setApplyingTo(null);
            fetchMatches(0);
          }}
        />
      )}

      {/* Load more */}
      {pagination.hasMore && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#e5e7eb' : '#ffffff',
              color: loading ? '#9ca3af' : 'var(--primary-blue, #3b82f6)',
              border: `1px solid ${loading ? '#e5e7eb' : 'var(--primary-blue, #3b82f6)'}`,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResearcherMatchesView;
