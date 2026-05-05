import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import AgreementDetailView from '../components/agreements/AgreementDetailView';
import {
  activateAgreement,
  archiveAgreement,
  completeAgreement,
  createAgreementAmendment,
  downloadAgreement,
  getAgreement,
  listAgreementHistory,
  listAgreementReviews,
  getAgreementPreview,
  makeAgreementEffective,
  reviewAgreementCounterparty,
  reviewAgreementInternal,
  signAgreement,
  submitAgreementForReview,
  terminateAgreement
} from '../config/api';
import { useAuth } from '../auth/AuthContext';

export default function AgreementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [agreement, setAgreement] = useState(null);
  const [preview, setPreview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAgreementData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const [agreementResponse, previewResponse, reviewsResponse, historyResponse] = await Promise.all([
        getAgreement(id, token),
        getAgreementPreview(id, token),
        listAgreementReviews(id, token),
        listAgreementHistory(id, token)
      ]);
      setAgreement(agreementResponse.agreement);
      setPreview(previewResponse.preview || '');
      setReviews(reviewsResponse.reviews || []);
      setHistory(historyResponse.history || []);
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
      anchor.download = agreement?.executed_filename || `agreement-${id}.pdf`;
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

  const handleAmend = async () => {
    const reason = window.prompt('Why are you creating an amendment draft?', 'Document changes required');
    if (reason === null) {
      return;
    }

    setWorking(true);
    setError('');
    setSuccess('');

    try {
      const response = await createAgreementAmendment(id, reason, token);
      const amendmentId = response?.agreement?.id;

      if (!amendmentId) {
        throw new Error('Amendment was created but no agreement id was returned');
      }

      navigate(`/agreements/${amendmentId}`);
    } catch (requestError) {
      setError(requestError.message || 'Failed to create amendment');
    } finally {
      setWorking(false);
    }
  };

  const handleSubmitForReview = () => {
    const feedback = window.prompt('Optional note for reviewers', 'Ready for review');
    if (feedback === null) return;
    return runAction(() => submitAgreementForReview(id, feedback, token), 'Agreement submitted for review.');
  };

  const handleAdminReview = (action) => {
    const isChangeRequest = action === 'changes_requested';
    const message = isChangeRequest
      ? window.prompt('Describe the changes required', 'Please revise the agreement terms.')
      : window.prompt('Optional approval note', 'Internal review approved.');
    if (message === null) return;
    return runAction(
      () => reviewAgreementInternal(
        id,
        isChangeRequest
          ? { action, changes_requested: message }
          : { action, feedback: message },
        token
      ),
      isChangeRequest ? 'Changes requested.' : 'Agreement approved for counterparty review.'
    );
  };

  const handleCounterpartyReview = (action) => {
    const isChangeRequest = action === 'changes_requested';
    const message = isChangeRequest
      ? window.prompt('Describe the changes required', 'Please revise the agreement before signature.')
      : window.prompt('Optional approval note', 'Approved for signature.');
    if (message === null) return;
    return runAction(
      () => reviewAgreementCounterparty(
        id,
        isChangeRequest
          ? { action, changes_requested: message }
          : { action, feedback: message },
        token
      ),
      isChangeRequest ? 'Changes requested.' : 'Agreement approved for signature.'
    );
  };

  const isNonprofitOwner = agreement && user && agreement.nonprofit_user_id === user.id;
  const isCounterpartyResearcher = agreement && user && agreement.researcher_user_id === user.id;
  const isAdminReviewer = user && ['admin', 'super_admin'].includes(user.role);

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
          reviews={reviews}
          history={history}
          loading={loading}
          error={error}
          isNonprofitOwner={Boolean(isNonprofitOwner)}
          isCounterpartyResearcher={Boolean(isCounterpartyResearcher)}
          isAdminReviewer={Boolean(isAdminReviewer)}
          working={working}
          onSubmitForReview={handleSubmitForReview}
          onAdminApprove={() => handleAdminReview('approve')}
          onAdminRequestChanges={() => handleAdminReview('changes_requested')}
          onCounterpartyApprove={() => handleCounterpartyReview('approve')}
          onCounterpartyRequestChanges={() => handleCounterpartyReview('changes_requested')}
          onSign={() => runAction(() => signAgreement(id, token), 'Agreement signed successfully.')}
          onMarkEffective={() => runAction(() => makeAgreementEffective(id, token), 'Agreement marked effective successfully.')}
          onActivate={() => runAction(() => activateAgreement(id, token), 'Agreement activated successfully.')}
          onComplete={() => runAction(() => completeAgreement(id, token), 'Agreement completed successfully.')}
          onArchive={() => runAction(() => archiveAgreement(id, token), 'Agreement archived successfully.')}
          onAmend={handleAmend}
          onTerminate={(reason) => runAction(() => terminateAgreement(id, reason, token), 'Agreement terminated successfully.')}
          onDownload={handleDownload}
        />
      </main>
      <Footer />
    </div>
  );
}
