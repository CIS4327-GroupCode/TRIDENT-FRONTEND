import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import AgreementDetailView from '../components/agreements/AgreementDetailView';
import {
  activateAgreement,
  downloadAgreement,
  getAgreement,
  getAgreementPreview,
  signAgreement,
  terminateAgreement
} from '../config/api';
import { useAuth } from '../auth/AuthContext';

export default function AgreementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [agreement, setAgreement] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAgreementData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const [agreementResponse, previewResponse] = await Promise.all([
        getAgreement(id, token),
        getAgreementPreview(id, token)
      ]);
      setAgreement(agreementResponse.agreement);
      setPreview(previewResponse.preview || '');
    } catch (requestError) {
      setError(requestError.message || 'Failed to load agreement details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreementData();
  }, [id, token]);

  const runAction = async (action, successMessage) => {
    setWorking(true);
    setError('');
    setSuccess('');

    try {
      await action();
      setSuccess(successMessage);
      await fetchAgreementData();
    } catch (requestError) {
      setError(requestError.message || 'Action failed');
    } finally {
      setWorking(false);
    }
  };

  const handleDownload = async () => {
    setWorking(true);
    setError('');

    try {
      const response = await downloadAgreement(id, token);
      const url = window.URL.createObjectURL(response.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `agreement-${id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.message || 'Failed to download agreement');
    } finally {
      setWorking(false);
    }
  };

  const isNonprofitOwner = agreement && user && agreement.nonprofit_user_id === user.id;

  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content container-center py-5">
        <button
          type="button"
          className="btn btn-outline-secondary mb-3"
          onClick={() => navigate('/agreements')}
        >
          Back to Agreements
        </button>

        {success ? <div className="alert alert-success">{success}</div> : null}
        {error ? <div className="alert alert-danger">{error}</div> : null}

        <AgreementDetailView
          agreement={agreement}
          preview={preview}
          loading={loading}
          error={error}
          isNonprofitOwner={Boolean(isNonprofitOwner)}
          working={working}
          onSign={() => runAction(() => signAgreement(id, token), 'Agreement signed successfully.')}
          onActivate={() => runAction(() => activateAgreement(id, token), 'Agreement activated successfully.')}
          onTerminate={(reason) => runAction(() => terminateAgreement(id, reason, token), 'Agreement terminated successfully.')}
          onDownload={handleDownload}
        />
      </main>
      <Footer />
    </div>
  );
}
