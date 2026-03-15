import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { fetchApiWithAuth } from '../config/api';
import { getUserReviewSummary, getUserReviews } from '../config/api';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import InviteModal from '../components/matching/InviteModal';
import ReviewSummary from '../components/reviews/ReviewSummary';
import ReviewList from '../components/reviews/ReviewList';

function parseCommaSeparated(str) {
  if (!str || typeof str !== 'string') return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

function TagList({ items, color = '#3b82f6', bg = '#eff6ff' }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {items.map((item, i) => (
        <span key={i} style={{
          padding: '4px 12px', backgroundColor: bg, color,
          borderRadius: '16px', fontSize: '12px', fontWeight: '500'
        }}>
          {item}
        </span>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ResearcherProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [researcher, setResearcher] = useState(null);
  const [academics, setAcademics] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchApiWithAuth(`/researchers/${id}`, { method: 'GET' }, token);
        setProfile(data.profile);
        setResearcher(data.user);
        setAcademics(data.academics || []);
        setCertifications(data.certifications || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, token]);

  useEffect(() => {
    const researcherId = Number.parseInt(id, 10);
    if (!Number.isInteger(researcherId)) {
      return;
    }

    let cancelled = false;
    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const [summaryResponse, reviewsResponse] = await Promise.all([
          getUserReviewSummary(researcherId),
          getUserReviews(researcherId, { page: 1, limit: 20 })
        ]);

        if (!cancelled) {
          setReviewSummary(summaryResponse?.summary || null);
          setReviews(Array.isArray(reviewsResponse?.reviews) ? reviewsResponse.reviews : []);
        }
      } catch (reviewError) {
        if (!cancelled) {
          setReviewSummary(null);
          setReviews([]);
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!token) {
    return (
      <div className="page-root">
        <TopBar />
        <main className="page-content container-center py-5">
          <div className="alert alert-warning">You must be logged in to view researcher profiles.</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-root">
        <TopBar />
        <main className="page-content container-center py-5">
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-root">
        <TopBar />
        <main className="page-content container-center py-5">
          <div style={{ padding: '20px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>Error</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
          </div>
          <button onClick={() => navigate(-1)} className="btn btn-secondary mt-3">Go Back</button>
        </main>
        <Footer />
      </div>
    );
  }

  const expertise = parseCommaSeparated(profile.expertise);
  const domains = parseCommaSeparated(profile.domains);
  const methods = parseCommaSeparated(profile.methods);
  const tools = parseCommaSeparated(profile.tools);
  const rateMin = profile.hourly_rate_min || profile.rate_min;
  const rateMax = profile.hourly_rate_max || profile.rate_max;
  const currentProjects = profile.current_projects_count || 0;
  const maxProjects = profile.max_concurrent_projects || 3;
  const hasCapacity = currentProjects < maxProjects;

  return (
    <div className="page-root">
      <TopBar />
      <main className="page-content container-center py-5" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm mb-3">
          &larr; Back
        </button>

        {/* Header card */}
        <div style={{
          border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px',
          backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                {researcher.name}
              </h1>
              {profile.title && (
                <p style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#6b7280' }}>{profile.title}</p>
              )}
              {profile.institution && (
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>{profile.institution}</p>
              )}
              {profile.affiliation && profile.affiliation !== profile.institution && (
                <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>{profile.affiliation}</p>
              )}
            </div>

            {/* Action buttons for nonprofits */}
            {user && user.role === 'nonprofit' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowInviteModal(true)}
                >
                  Invite to Project
                </button>
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px', fontSize: '14px', color: '#6b7280', flexWrap: 'wrap' }}>
            {profile.projects_completed > 0 && (
              <span>&#10003; {profile.projects_completed} projects completed</span>
            )}
            {(rateMin || rateMax) && (
              <span>
                &#128176; {rateMin && rateMax && rateMin !== rateMax
                  ? `$${rateMin}-$${rateMax}/hr`
                  : `$${rateMin || rateMax}/hr`}
              </span>
            )}
            {profile.availability && (
              <span>&#128336; {profile.availability}</span>
            )}
          </div>
        </div>

        {/* Expertise & Skills */}
        {(expertise.length > 0 || domains.length > 0 || methods.length > 0 || tools.length > 0) && (
          <div style={{
            border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px',
            backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px'
          }}>
            {expertise.length > 0 && (
              <Section title="Expertise">
                <TagList items={expertise} color="#1d4ed8" bg="#dbeafe" />
              </Section>
            )}
            {domains.length > 0 && (
              <Section title="Research Domains">
                <TagList items={domains} color="#059669" bg="#d1fae5" />
              </Section>
            )}
            {methods.length > 0 && (
              <Section title="Research Methods">
                <TagList items={methods} color="#7c3aed" bg="#ede9fe" />
              </Section>
            )}
            {tools.length > 0 && (
              <Section title="Tools & Technologies">
                <TagList items={tools} color="#d97706" bg="#fef3c7" />
              </Section>
            )}
          </div>
        )}

        {/* Research Interests */}
        {profile.research_interests && (
          <div style={{
            border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px',
            backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px'
          }}>
            <Section title="Research Interests">
              <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                {profile.research_interests}
              </p>
            </Section>
          </div>
        )}

        {/* Availability & Rates */}
        <div style={{
          border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px',
          backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px'
        }}>
          <Section title="Availability & Rates">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Hourly Rate */}
              {(rateMin || rateMax) && (
                <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Hourly Rate</p>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                    {rateMin && rateMax && rateMin !== rateMax
                      ? `$${rateMin} - $${rateMax}`
                      : `$${rateMin || rateMax}`}
                  </p>
                </div>
              )}

              {/* Availability */}
              {profile.availability && (
                <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Availability</p>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>{profile.availability}</p>
                </div>
              )}

              {/* Capacity */}
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Project Capacity</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700', color: hasCapacity ? '#059669' : '#f59e0b' }}>
                  {currentProjects} / {maxProjects}
                </p>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px' }}>
                  <div style={{
                    width: `${Math.min((currentProjects / maxProjects) * 100, 100)}%`,
                    height: '100%', borderRadius: '3px',
                    backgroundColor: hasCapacity ? '#059669' : '#f59e0b'
                  }} />
                </div>
              </div>

              {/* Start Date */}
              {profile.available_start_date && (
                <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Available From</p>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                    {new Date(profile.available_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Academic History */}
        {academics.length > 0 && (
          <div style={{
            border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px',
            backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px'
          }}>
            <Section title="Academic History">
              {academics.map((a, i) => (
                <div key={a.id || i} style={{
                  padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px',
                  marginBottom: i < academics.length - 1 ? '8px' : 0
                }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    {a.degree}{a.field ? ` in ${a.field}` : ''}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    {a.institution}{a.year ? ` (${a.year})` : ''}
                  </p>
                </div>
              ))}
            </Section>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div style={{
            border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px',
            backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px'
          }}>
            <Section title="Certifications">
              {certifications.map((c, i) => (
                <div key={c.id || i} style={{
                  padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px',
                  marginBottom: i < certifications.length - 1 ? '8px' : 0
                }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{c.name}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    {c.issuer}{c.year ? ` (${c.year})` : ''}
                    {c.credential_id ? ` — ID: ${c.credential_id}` : ''}
                  </p>
                </div>
              ))}
            </Section>
          </div>
        )}

        <div style={{
          border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px',
          backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px'
        }}>
          <Section title="Reviews & Reputation">
            <div className="mb-3">
              <ReviewSummary summary={reviewSummary} loading={reviewsLoading} />
            </div>
            <ReviewList
              reviews={reviews}
              loading={reviewsLoading}
              emptyMessage="No public reviews available yet."
            />
          </Section>
        </div>

        {/* Compliance */}
        {profile.compliance_certifications && (
          <div style={{
            border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px',
            backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px'
          }}>
            <Section title="Compliance & Ethics Training">
              <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>{profile.compliance_certifications}</p>
            </Section>
          </div>
        )}
      </main>
      <Footer />

      {/* Invite Modal */}
      {showInviteModal && researcher && (
        <InviteModal
          researcherName={researcher.name}
          researcherId={researcher.id || parseInt(id)}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
