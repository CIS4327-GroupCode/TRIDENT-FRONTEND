import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import AgreementDetailView from '../components/agreements/AgreementDetailView';
import ActionPromptModal from '../components/agreements/ActionPromptModal';
import {
  activateAgreement,
  archiveAgreement,
  completeAgreement,
  createAgreementAmendment,
  downloadAgreement,
  getAgreement,
  listAgreementHistory,
  listAgreementRemovalRequests,
  listAgreementReviews,
  getAgreementPreview,
  makeAgreementEffective,
  approveAgreementRemovalRequest,
  rejectAgreementRemovalRequest,
  requestAgreementRemoval,
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
  const [removalRequests, setRemovalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasConflict, setHasConflict] = useState(false);
  const [activePrompt, setActivePrompt] = useState(null);

  const formatActionError = (requestError) => {
    const status = requestError?.status;
    if (status === 409 || requestError?.kind === 'conflict') {
      return 'This agreement changed due to another action. Reload the latest state and try again.';
    }

    if (status === 403 || requestError?.kind === 'permission') {
      return 'You no longer have permission for this action on the current agreement state.';
    }

    return requestError?.message || 'Action failed';
  };

  const PROMPTS = {
    submit_for_review: {
      title: 'Submit Agreement For Review',
      description: 'Add an optional note for reviewers before submitting.',
      placeholder: 'Ready for review',
      defaultValue: 'Ready for review',
      required: false,
      confirmLabel: 'Submit'
    },
    admin_approve: {
      title: 'Approve Internal Review',
      description: 'Add an optional approval note for the agreement timeline.',
      placeholder: 'Internal review approved.',
      defaultValue: 'Internal review approved.',
      required: false,
      confirmLabel: 'Approve'
    },
    admin_changes_requested: {
      title: 'Request Internal Changes',
      description: 'Describe the required changes before this agreement can proceed.',
      placeholder: 'Please revise the agreement terms.',
      defaultValue: 'Please revise the agreement terms.',
      required: true,
      confirmLabel: 'Request Changes'
    },
    counterparty_approve: {
      title: 'Approve For Signature',
      description: 'Add an optional note for approval before signature.',
      placeholder: 'Approved for signature.',
      defaultValue: 'Approved for signature.',
      required: false,
      confirmLabel: 'Approve'
    },
    counterparty_changes_requested: {
      title: 'Request Counterparty Changes',
      description: 'Describe the changes required before signature.',
      placeholder: 'Please revise the agreement before signature.',
      defaultValue: 'Please revise the agreement before signature.',
      required: true,
      confirmLabel: 'Request Changes'
    },
    amend: {
      title: 'Create Amendment Draft',
      description: 'Explain why a new amendment draft is needed.',
      placeholder: 'Document changes required',
      defaultValue: 'Document changes required',
      required: false,
      confirmLabel: 'Create Draft'
    }
  };

  const closePrompt = () => setActivePrompt(null);

  const fetchAgreementData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const [agreementResponse, previewResponse, reviewsResponse, historyResponse, removalRequestsResponse] = await Promise.all([
        getAgreement(id, token),
        getAgreementPreview(id, token),
        listAgreementReviews(id, token),
        listAgreementHistory(id, token),
        listAgreementRemovalRequests(id, token)
      ]);
      setAgreement(agreementResponse.agreement);
      setPreview(previewResponse.preview || '');
      setReviews(reviewsResponse.reviews || []);
      setHistory(historyResponse.history || []);
      setRemovalRequests(removalRequestsResponse.removal_requests || []);
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
    setHasConflict(false);
    setSuccess('');

    try {
      await action();
      setSuccess(successMessage);
      await fetchAgreementData();
    } catch (requestError) {
      if (requestError?.status === 409 || requestError?.kind === 'conflict') {
        setHasConflict(true);
      }
      setError(formatActionError(requestError));
    } finally {
      setWorking(false);
    }
  };

  const handleDownload = async () => {
    setWorking(true);
    setError('');
    setHasConflict(false);

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
      if (requestError?.status === 409 || requestError?.kind === 'conflict') {
        setHasConflict(true);
      }
      setError(formatActionError(requestError));
    } finally {
      setWorking(false);
    }
  };

  const handleAmend = async (reason = '') => {
    closePrompt();

    setWorking(true);
    setError('');
    setSuccess('');
    setHasConflict(false);

    try {
      const response = await createAgreementAmendment(id, reason, token);
      const amendmentId = response?.agreement?.id;

      if (!amendmentId) {
        throw new Error('Amendment was created but no agreement id was returned');
      }

      navigate(`/agreements/${amendmentId}`);
    } catch (requestError) {
      if (requestError?.status === 409 || requestError?.kind === 'conflict') {
        setHasConflict(true);
      }
      setError(formatActionError(requestError));
    } finally {
      setWorking(false);
    }
  };

  const handleSubmitForReview = (feedback = '') => {
    closePrompt();
    return runAction(() => submitAgreementForReview(id, feedback, token), 'Agreement submitted for review.');
  };

  const handleAdminReview = (action, message = '') => {
    closePrompt();
    const isChangeRequest = action === 'changes_requested';
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

  const handleCounterpartyReview = (action, message = '') => {
    closePrompt();
    const isChangeRequest = action === 'changes_requested';
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

  const handleRequestRemoval = async () => {
    const reason = window.prompt('Provide a reason for the removal request:');
    if (!reason || !reason.trim()) {
      return;
    }

    await runAction(
      () => requestAgreementRemoval(id, reason.trim(), token),
      'Agreement removal request submitted for admin review.'
    );
  };

  const handleApproveRemovalRequest = async (requestId) => {
    const feedback = window.prompt('Optional approval note:') || '';
    await runAction(
      () => approveAgreementRemovalRequest(id, requestId, feedback, token),
      'Agreement removal request approved.'
    );
  };

  const handleRejectRemovalRequest = async (requestId) => {
    const feedback = window.prompt('Optional rejection note:') || '';
    await runAction(
      () => rejectAgreementRemovalRequest(id, requestId, feedback, token),
      'Agreement removal request rejected.'
    );
  };

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
        {hasConflict ? (
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-warning"
              disabled={working}
              onClick={fetchAgreementData}
            >
              Reload Agreement State
            </button>
          </div>
        ) : null}

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
          onSubmitForReview={() => setActivePrompt('submit_for_review')}
          onAdminApprove={() => setActivePrompt('admin_approve')}
          onAdminRequestChanges={() => setActivePrompt('admin_changes_requested')}
          onCounterpartyApprove={() => setActivePrompt('counterparty_approve')}
          onCounterpartyRequestChanges={() => setActivePrompt('counterparty_changes_requested')}
          onSign={() => runAction(() => signAgreement(id, token), 'Agreement signed successfully.')}
          onMarkEffective={() => runAction(() => makeAgreementEffective(id, token), 'Agreement marked effective successfully.')}
          onActivate={() => runAction(() => activateAgreement(id, token), 'Agreement activated successfully.')}
          onComplete={() => runAction(() => completeAgreement(id, token), 'Agreement completed successfully.')}
          onArchive={() => runAction(() => archiveAgreement(id, token), 'Agreement archived successfully.')}
          onAmend={() => setActivePrompt('amend')}
          onTerminate={(reason) => runAction(() => terminateAgreement(id, reason, token), 'Agreement terminated successfully.')}
          onDownload={handleDownload}
          removalRequests={removalRequests}
          onRequestRemoval={handleRequestRemoval}
          onApproveRemovalRequest={handleApproveRemovalRequest}
          onRejectRemovalRequest={handleRejectRemovalRequest}
        />

        <ActionPromptModal
          open={Boolean(activePrompt)}
          title={PROMPTS[activePrompt]?.title}
          description={PROMPTS[activePrompt]?.description}
          placeholder={PROMPTS[activePrompt]?.placeholder}
          defaultValue={PROMPTS[activePrompt]?.defaultValue}
          required={PROMPTS[activePrompt]?.required}
          confirmLabel={PROMPTS[activePrompt]?.confirmLabel}
          cancelLabel="Cancel"
          disabled={working}
          onCancel={closePrompt}
          onConfirm={(value) => {
            if (activePrompt === 'submit_for_review') {
              handleSubmitForReview(value);
              return;
            }

            if (activePrompt === 'admin_approve' || activePrompt === 'admin_changes_requested') {
              handleAdminReview(activePrompt === 'admin_approve' ? 'approve' : 'changes_requested', value);
              return;
            }

            if (activePrompt === 'counterparty_approve' || activePrompt === 'counterparty_changes_requested') {
              handleCounterpartyReview(activePrompt === 'counterparty_approve' ? 'approve' : 'changes_requested', value);
              return;
            }

            if (activePrompt === 'amend') {
              handleAmend(value);
            }
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
