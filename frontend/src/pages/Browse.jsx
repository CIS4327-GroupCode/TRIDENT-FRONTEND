import React, { useState, useEffect } from "react";
import { getApiUrl } from "../config/api";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import SearchBar from "../components/browse/SearchBar";
import ProjectCard from "../components/browse/ProjectCard";
import ProjectDetailModal from "../components/browse/ProjectDetailModal";

export default function Browse() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: "",
    methods: "",
    budget_min: "",
    budget_max: "",
    data_sensitivity: "",
    timeline: ""
  });

  useEffect(() => {
    fetchProjects();
  }, [filters, pagination.page]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query string
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      // Add filters if present
      if (filters.search) params.append("search", filters.search);
      if (filters.methods) params.append("methods", filters.methods);
      if (filters.budget_min) params.append("budget_min", filters.budget_min);
      if (filters.budget_max) params.append("budget_max", filters.budget_max);
      if (filters.data_sensitivity) params.append("data_sensitivity", filters.data_sensitivity);
      if (filters.timeline) params.append("timeline", filters.timeline);

      const response = await fetch(getApiUrl(`/api/projects/browse?${params.toString()}`));
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch projects");
      }

      setProjects(data.projects);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewDetails = (projectId) => {
    setSelectedProjectId(projectId);
  };

  const handleCloseModal = () => {
    setSelectedProjectId(null);
  };

  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content container-center py-5">
        <div className="mb-4">
          <h1 className="page-heading">Browse Research Opportunities</h1>
          <p className="page-subheading">
            Discover and connect with qualified researchers ready to collaborate on your nonprofit's evaluation projects.
          </p>
        </div>

        {/* Search and Filters */}
        <SearchBar
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          filters={filters}
        />

        {/* Loading State */}
        {loading && (
          <div className="d-flex justify-content-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <strong>Error:</strong> {error}
            <button className="btn btn-sm btn-outline-mint ms-3" onClick={fetchProjects}>
              Retry
            </button>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="text-muted mb-0">
              {pagination.total} {pagination.total === 1 ? "opportunity" : "opportunities"} available
              {filters.search && (
                <span> for "<strong>{filters.search}</strong>"</span>
              )}
            </p>
            <div className="text-muted small">
              Page {pagination.page} of {pagination.totalPages || 1}
            </div>
          </div>
        )}

        {/* Project Cards Grid */}
        {!loading && !error && (
          <>
            {projects.length === 0 ? (
              <div className="alert alert-info text-center p-5">
                <div className="display-6 mb-3">🔍</div>
                <h5>No opportunities found</h5>
                <p className="mb-0">
                  Try adjusting your search or clearing filters to see available projects.
                </p>
              </div>
            ) : (
              <div className="grid grid-3 mb-4">
                {projects.map((project) => (
                  <div key={project.project_id}>
                    <ProjectCard
                      project={project}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </button>
                  </li>

                  {/* Page Numbers */}
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((pageNum) => {
                      return (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        Math.abs(pageNum - pagination.page) <= 1
                      );
                    })
                    .map((pageNum, index, array) => {
                      const prevPageNum = array[index - 1];
                      const showEllipsis = prevPageNum && pageNum - prevPageNum > 1;

                      return (
                        <React.Fragment key={pageNum}>
                          {showEllipsis && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}
                          <li className={`page-item ${pagination.page === pageNum ? "active" : ""}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        </React.Fragment>
                      );
                    })}

                  <li
                    className={`page-item ${
                      pagination.page === pagination.totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Project Detail Modal */}
      {selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
