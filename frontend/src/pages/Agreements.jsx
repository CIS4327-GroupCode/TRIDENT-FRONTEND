import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

export default function Agreements() {
  const { token, user } = useAuth();
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

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [agreementsResponse, templatesResponse] = await Promise.all([
        listAgreements({}, token),
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
  }, [token]);

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

  const canCreate = user?.role === 'nonprofit';

  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content container-center py-5">
        <h1 className="page-heading">Agreements</h1>
        <p className="page-subheading">
          Create, review, sign and manage collaboration agreements.
        </p>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {success ? <div className="alert alert-success">{success}</div> : null}

        {canCreate ? (
          <section style={{ marginBottom: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px' }}>
            <h2 style={{ marginTop: 0, fontSize: '20px' }}>Create Agreement</h2>
            <AgreementForm templates={templates} onSubmit={handleCreate} submitting={submitting} />
          </section>
        ) : null}

        <section style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px' }}>
          <h2 style={{ marginTop: 0, fontSize: '20px' }}>My Agreements</h2>
          <AgreementList agreements={agreements} loading={loading} error={error} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
