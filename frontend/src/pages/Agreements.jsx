import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import AgreementList from '../components/agreements/AgreementList';
import AgreementForm from '../components/agreements/AgreementForm';
import {
  createAgreement,
  getAgreementTemplates,
  listAgreements
} from '../config/api';
import { useAuth } from '../auth/AuthContext';
import { usePermissions } from '../auth/usePermissions';

export default function Agreements() {
  const { token } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [agreements, setAgreements] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const applicationId = useMemo(() => {
    const raw = searchParams.get('applicationId');
    const parsed = Number.parseInt(raw || '', 10);
    return Number.isInteger(parsed) ? parsed : null;
  }, [searchParams]);

  const projectId = useMemo(() => {
    const raw = searchParams.get('projectId');
    const parsed = Number.parseInt(raw || '', 10);
    return Number.isInteger(parsed) ? parsed : null;
  }, [searchParams]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [agreementsResponse, templatesResponse] = await Promise.all([
        listAgreements(projectId ? { project_id: projectId } : {}, token),
        getAgreementTemplates(token)
      ]);
      setAgreements(agreementsResponse.agreements || []);
      setTemplates(templatesResponse.templates || []);
    } catch (requestError) {
      setError(requestError.message || 'Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, projectId]);

  const handleCreate = async (payload) => {
    if (!applicationId) {
      setError('applicationId query parameter is required to create agreement.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createAgreement(
        {
          ...payload,
          application_id: applicationId
        },
        token
      );
      setSuccess('Agreement created successfully.');
      await fetchData();
    } catch (requestError) {
      setError(requestError.message || 'Failed to create agreement');
    } finally {
      setSubmitting(false);
    }
  };

  const canCreate = can('canCreateAgreements');
  const canCreateInCurrentContext = canCreate && Boolean(applicationId);

  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content container-center py-5">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm mb-3"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>
        <h1 className="page-heading">Agreements</h1>
        <p className="page-subheading">
          {projectId
            ? 'Review, sign and manage agreements for this collaboration.'
            : 'Create, review, sign and manage collaboration agreements.'}
        </p>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {success ? <div className="alert alert-success">{success}</div> : null}

        {canCreateInCurrentContext ? (
          <section style={{ marginBottom: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px' }}>
            <h2 style={{ marginTop: 0, fontSize: '20px' }}>Create Agreement</h2>
            <AgreementForm
              templates={templates}
              onSubmit={handleCreate}
              submitting={submitting}
              projectId={projectId}
              token={token}
            />
          </section>
        ) : null}

        {canCreate && projectId && !applicationId ? (
          <div className="alert alert-info">
            To create a new agreement, open this page from an accepted application.
          </div>
        ) : null}

        <section style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px' }}>
          <h2 style={{ marginTop: 0, fontSize: '20px' }}>
            {projectId ? 'Project Agreements' : 'My Agreements'}
          </h2>
          <AgreementList agreements={agreements} loading={loading} error={error} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
