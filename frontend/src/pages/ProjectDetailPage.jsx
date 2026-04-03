import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchApiWithAuth, getApiUrl } from '../config/api';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { useAuth } from '../auth/AuthContext';
import { usePermissions } from '../auth/usePermissions';

const REDIRECT_SECONDS = 3;
const NOT_FOUND_ERROR = 'not_found';

function parseList(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(input)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatBudget(minBudget, maxBudget) {
  const parsedMin = Number.parseFloat(minBudget);
  const parsedMax = Number.parseFloat(maxBudget);
  const hasMin = Number.isFinite(parsedMin);
  const hasMax = Number.isFinite(parsedMax);

  if (!hasMin && !hasMax) {
    return 'Not specified';
  }

  if (hasMin && hasMax) {
    if (parsedMin === parsedMax) {
      return `$${parsedMin.toLocaleString()}`;
    }
    return `$${parsedMin.toLocaleString()} - $${parsedMax.toLocaleString()}`;
  }

  const value = hasMin ? parsedMin : parsedMax;
  return `$${value.toLocaleString()}`;
}

function getStatusVariant(status) {
  const variants = {
    open: 'success',
    in_progress: 'primary',
    completed: 'dark',
    draft: 'secondary',
    pending_review: 'warning',
    needs_revision: 'warning',
    cancelled: 'danger',
    rejected: 'danger'
  };

  return variants[status] || 'secondary';
}

function getSensitivityVariant(sensitivity) {
  const variants = {
    Low: 'success',
    Medium: 'warning',
    High: 'danger'
  };

  return variants[sensitivity] || 'secondary';
}

function toTitleCase(value) {
  if (!value) return 'Not specified';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{title}</h2>
      {children}
    </div>
  );
}

function Card({ children }) {
  return (
    <section
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}
    >
      {children}
    </section>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { can } = usePermissions();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadProject = async () => {
      setLoading(true);
      setError(null);
      setProject(null);

      if (!id || !/^\d+$/.test(id)) {
        if (isMounted) {
          setError(NOT_FOUND_ERROR);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(getApiUrl(`/api/projects/browse/${id}`), {
          signal: controller.signal
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload.project) {
          // Nonprofits may receive notifications for non-public project states.
          // Try scoped authenticated project endpoint as fallback.
          if (token && can('canManageProjects')) {
            const privatePayload = await fetchApiWithAuth(`/projects/${id}`, { method: 'GET' }, token);
            if (privatePayload?.project && isMounted) {
              setProject(privatePayload.project);
              return;
            }
          }

          throw new Error(NOT_FOUND_ERROR);
        }

        if (isMounted) {
          setProject(payload.project);
        }
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        if (isMounted) {
          setError(NOT_FOUND_ERROR);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, token, can]);

  useEffect(() => {
    setCountdown(REDIRECT_SECONDS);

    if (error !== NOT_FOUND_ERROR) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      navigate('/', { replace: true });
    }, REDIRECT_SECONDS * 1000);

    const intervalId = setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [error, navigate]);

  const focusAreas = useMemo(
    () => parseList(project?.organization?.focus_areas || project?.organization?.focus_tags),
    [project]
  );
  const methods = useMemo(() => parseList(project?.methods_required), [project]);

  if (loading) {
    return (
      <div className="page-root">
        <TopBar />
        <main id="main-content" className="page-content container-center py-5">
          <div className="d-flex justify-content-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <p className="text-center text-muted">Loading project details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error === NOT_FOUND_ERROR) {
    return (
      <div className="page-root">
        <TopBar />
        <main id="main-content" className="page-content container-center py-5">
          <section className="card p-4 text-center" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h1 className="page-heading mb-2">Project Not Found</h1>
            <p className="page-subheading mb-3">
              We couldn't find a project with this ID, or it is no longer publicly available.
            </p>
            <p className="text-muted mb-4">
              Redirecting to Home in {countdown} second{countdown === 1 ? '' : 's'}.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <Link className="btn btn-primary" to="/">Return to Home</Link>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                Go Back
              </button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const ratingSummary = project?.rating_summary;
  const overallRating = ratingSummary?.averages?.overall;

  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content container-center py-5" style={{ maxWidth: '980px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm mb-3">
          &larr; Back
        </button>

        <Card>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h1 className="page-heading mb-2">{project.title || 'Untitled Project'}</h1>
              <p className="text-muted mb-2">{project.organization?.name || 'Organization not specified'}</p>
              {project.organization?.location && <p className="text-muted mb-0">{project.organization.location}</p>}
            </div>
            <div className="d-flex gap-2 flex-wrap justify-content-end">
              <span className={`badge bg-${getStatusVariant(project.status)} px-3 py-2`}>
                {toTitleCase(project.status)}
              </span>
              {project.data_sensitivity && (
                <span className={`badge bg-${getSensitivityVariant(project.data_sensitivity)} px-3 py-2`}>
                  Sensitivity: {project.data_sensitivity}
                </span>
              )}
            </div>
          </div>

          <div className="row g-3 mt-2">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <p className="text-muted small mb-1">Budget</p>
                  <p className="mb-0 fw-semibold">{formatBudget(project.budget_min, project.budget_max)}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <p className="text-muted small mb-1">Timeline</p>
                  <p className="mb-0 fw-semibold">{project.timeline || 'Not specified'}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <p className="text-muted small mb-1">Estimated Hours</p>
                  <p className="mb-0 fw-semibold">{project.estimated_hours || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <Section title="Project Description">
            <div className="mb-3">
              <h3 className="h6">Problem Statement</h3>
              <p className="mb-0">{project.problem || 'No problem statement provided yet.'}</p>
            </div>
            <div>
              <h3 className="h6">Expected Outcomes</h3>
              <p className="mb-0">{project.outcomes || 'No expected outcomes provided yet.'}</p>
            </div>
          </Section>
        </Card>

        <Card>
          <Section title="Methods & Requirements">
            {methods.length > 0 ? (
              <div className="d-flex flex-wrap gap-2 mb-3">
                {methods.map((method) => (
                  <span key={method} className="pill pill-mint">{method}</span>
                ))}
              </div>
            ) : (
              <p className="mb-3">No methods or expertise requirements specified.</p>
            )}

            {project.start_date && (
              <p className="mb-0 text-muted">
                Preferred start date: {new Date(project.start_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            )}
          </Section>
        </Card>

        <Card>
          <Section title="Organization">
            <p className="mb-3">{project.organization?.mission || 'Mission not provided.'}</p>

            {focusAreas.length > 0 && (
              <div className="mb-3">
                <p className="text-muted small mb-2">Focus Areas</p>
                <div className="d-flex flex-wrap gap-2">
                  {focusAreas.map((area) => (
                    <span key={area} className="pill pill-gray">{area}</span>
                  ))}
                </div>
              </div>
            )}

            {project.organization?.website && (
              <a href={project.organization.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm">
                Visit Organization Website
              </a>
            )}
          </Section>
        </Card>

        {ratingSummary && (
          <Card>
            <Section title="Ratings Snapshot">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <p className="text-muted small mb-1">Overall Rating</p>
                      <p className="mb-0 fw-semibold">{overallRating ? Number(overallRating).toFixed(1) : 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <p className="text-muted small mb-1">Total Ratings</p>
                      <p className="mb-0 fw-semibold">{ratingSummary.count || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <p className="text-muted small mb-1">Communication</p>
                      <p className="mb-0 fw-semibold">
                        {ratingSummary?.averages?.communication
                          ? Number(ratingSummary.averages.communication).toFixed(1)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
