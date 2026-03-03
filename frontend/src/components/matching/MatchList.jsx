import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MatchCard from './MatchCard';
import MatchFilters from './MatchFilters';

/**
 * Main match list component with pagination and filtering
 * Fetches and displays matching researchers for a project
 */
const MatchList = ({ projectId, apiBaseUrl, userRole }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });
  
  const [filters, setFilters] = useState({
    minScore: 10,
    sortBy: 'score',
    methods: []
  });

  // Extract unique methods from matches for filter options
  const availableMethods = React.useMemo(() => {
    const methodsSet = new Set();
    matches.forEach(match => {
      if (match.researcher.methods) {
        match.researcher.methods.forEach(method => methodsSet.add(method));
      }
    });
    return Array.from(methodsSet).sort();
  }, [matches]);

  /**
   * Fetch matches from API
   */
  const fetchMatches = async (offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: offset,
        minScore: filters.minScore
      });

      // Get auth token from localStorage
      const token = localStorage.getItem('trident_token');
      
      const response = await fetch(
        `${apiBaseUrl}/api/matches/project/${projectId}?${params}`,
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
      
      // Apply client-side filtering and sorting
      let filteredMatches = data.matches || [];
      
      // Filter by methods if selected
      if (filters.methods.length > 0) {
        filteredMatches = filteredMatches.filter(match =>
          match.researcher.methods &&
          match.researcher.methods.some(m => filters.methods.includes(m))
        );
      }
      
      // Sort matches
      filteredMatches = sortMatches(filteredMatches, filters.sortBy);
      
      setMatches(offset === 0 ? filteredMatches : [...matches, ...filteredMatches]);
      setPagination(data.pagination || { total: 0, limit: 20, offset: 0, hasMore: false });
      
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sort matches based on selected criteria
   */
  const sortMatches = (matchList, sortBy) => {
    const sorted = [...matchList];
    
    switch (sortBy) {
      case 'score':
        return sorted.sort((a, b) => b.matchScore - a.matchScore);
      
      case 'experience':
        return sorted.sort((a, b) => 
          (b.researcher.projects_completed || 0) - (a.researcher.projects_completed || 0)
        );
      
      case 'rate':
        return sorted.sort((a, b) => {
          const aRate = a.researcher.rate_min || Infinity;
          const bRate = b.researcher.rate_min || Infinity;
          return aRate - bRate;
        });
      
      case 'availability':
        return sorted.sort((a, b) => {
          const aDate = a.researcher.available_start_date ? new Date(a.researcher.available_start_date) : new Date('2099-01-01');
          const bDate = b.researcher.available_start_date ? new Date(b.researcher.available_start_date) : new Date('2099-01-01');
          return aDate - bDate;
        });
      
      default:
        return sorted;
    }
  };

  /**
   * Handle filter changes (triggers refetch)
   */
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  /**
   * Handle dismiss match
   */
  const handleDismissMatch = async (researcherId) => {
    try {
      const token = localStorage.getItem('trident_token');
      
      const response = await fetch(
        `${apiBaseUrl}/api/matches/project/${projectId}/researcher/${researcherId}/dismiss`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to dismiss match');
      }

      // Remove from local state
      setMatches(matches.filter(m => m.researcher.user_id !== researcherId));
      
    } catch (err) {
      console.error('Error dismissing match:', err);
      alert('Failed to dismiss match. Please try again.');
    }
  };

  /**
   * Load more matches (pagination)
   */
  const handleLoadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchMatches(pagination.offset + pagination.limit);
    }
  };

  // Fetch matches on mount and when filters change
  useEffect(() => {
    fetchMatches(0);
  }, [projectId, filters.minScore]); // Only refetch on critical filter changes

  // Re-sort matches when sort option changes (client-side)
  useEffect(() => {
    if (matches.length > 0) {
      const sorted = sortMatches(matches, filters.sortBy);
      setMatches(sorted);
    }
  }, [filters.sortBy]);

  // Filter matches when method filters change (client-side)
  useEffect(() => {
    if (matches.length > 0) {
      fetchMatches(0); // Refetch to apply method filters
    }
  }, [filters.methods]);

  // Render loading state
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
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Finding matches...</p>
      </div>
    );
  }

  // Render error state
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

  // Render empty state
  if (matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
          No Matches Found
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Try adjusting your filters to see more results.
        </p>
        {filters.minScore > 50 && (
          <button
            onClick={() => setFilters({ ...filters, minScore: 50 })}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: 'var(--primary-blue, #3b82f6)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Lower Minimum Score
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="match-list">
      {/* Filter controls */}
      <MatchFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        availableMethods={availableMethods}
      />

      {/* Results summary */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
          {pagination.total} Matching Researcher{pagination.total !== 1 ? 's' : ''}
        </h2>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          Showing {matches.length} of {pagination.total}
        </span>
      </div>

      {/* Match cards */}
      <div className="match-cards">
        {matches.map((match) => (
          <MatchCard
            key={match.researcher.user_id}
            match={match}
            onDismiss={handleDismissMatch}
            userRole={userRole}
          />
        ))}
      </div>

      {/* Load more button */}
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

MatchList.propTypes = {
  projectId: PropTypes.number.isRequired,
  apiBaseUrl: PropTypes.string.isRequired,
  userRole: PropTypes.string
};

export default MatchList;
