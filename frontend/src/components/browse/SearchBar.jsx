import React, { useState } from "react";

export default function SearchBar({ onSearch, onFilterChange, filters }) {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const handleFilterChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    onFilterChange({
      search: "",
      methods: "",
      budget_min: "",
      budget_max: "",
      data_sensitivity: "",
      timeline: ""
    });
  };

  const hasActiveFilters = () => {
    return filters.methods || filters.budget_min || filters.budget_max || 
           filters.data_sensitivity || filters.timeline;
  };

  return (
    <div className="mb-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-3">
        <div className="input-group input-group-lg">
          <input
            type="text"
            className="form-control"
            placeholder="Search projects by keywords..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            aria-label="Search projects"
          />
          <button className="btn btn-primary" type="submit">
            <i className="bi bi-search me-2"></i>
            Search
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className={`bi bi-funnel${showFilters ? "-fill" : ""} me-2`}></i>
            Filters {hasActiveFilters() && <span className="badge bg-primary ms-1">Active</span>}
          </button>
        </div>
      </form>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card">
          <div className="card-body">
            <div className="row g-3">
              {/* Methods Filter */}
              <div className="col-md-6">
                <label htmlFor="methodsFilter" className="form-label">
                  Research Methods
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="methodsFilter"
                  placeholder="e.g., statistical analysis, survey"
                  value={filters.methods || ""}
                  onChange={(e) => handleFilterChange("methods", e.target.value)}
                />
                <div className="form-text">Search for specific methods or expertise</div>
              </div>

              {/* Data Sensitivity Filter */}
              <div className="col-md-6">
                <label htmlFor="sensitivityFilter" className="form-label">
                  Data Sensitivity
                </label>
                <select
                  className="form-select"
                  id="sensitivityFilter"
                  value={filters.data_sensitivity || ""}
                  onChange={(e) => handleFilterChange("data_sensitivity", e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <div className="form-text">Filter by data sensitivity level</div>
              </div>

              {/* Budget Range */}
              <div className="col-md-6">
                <label htmlFor="budgetMinFilter" className="form-label">
                  Minimum Budget (USD)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="budgetMinFilter"
                  placeholder="e.g., 5000"
                  min="0"
                  value={filters.budget_min || ""}
                  onChange={(e) => handleFilterChange("budget_min", e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="budgetMaxFilter" className="form-label">
                  Maximum Budget (USD)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="budgetMaxFilter"
                  placeholder="e.g., 50000"
                  min="0"
                  value={filters.budget_max || ""}
                  onChange={(e) => handleFilterChange("budget_max", e.target.value)}
                />
              </div>

              {/* Timeline Filter */}
              <div className="col-md-6">
                <label htmlFor="timelineFilter" className="form-label">
                  Timeline
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="timelineFilter"
                  placeholder="e.g., 6 months, Q1 2025"
                  value={filters.timeline || ""}
                  onChange={(e) => handleFilterChange("timeline", e.target.value)}
                />
                <div className="form-text">Search for specific timeline</div>
              </div>

              {/* Clear Filters Button */}
              <div className="col-12">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleClearFilters}
                  disabled={!localSearch && !hasActiveFilters()}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
