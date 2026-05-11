import React from 'react';
import AgreementStatusBadge from './AgreementStatusBadge';
import SignatureBlock from './SignatureBlock';
import AgreementPreview from './AgreementPreview';
import TerminateModal from './TerminateModal';
import AgreementLifecycleTimeline from './AgreementLifecycleTimeline';

export default function AgreementDetailView({
  agreement,
  preview,
  reviews,
  history,
  loading,
  error,
  isNonprofitOwner,
  isCounterpartyResearcher,
  isAdminReviewer,
  working,
  onSubmitForReview,
  onAdminApprove,
  onAdminRequestChanges,
  onCounterpartyApprove,
  onCounterpartyRequestChanges,
  onSign,
  onMarkEffective,
  onActivate,
  onComplete,
  onArchive,
  onAmend,
  onTerminate,
  onDownload,
  removalRequests,
  onRequestRemoval,
  onApproveRemovalRequest,
  onRejectRemovalRequest
}) {
  if (loading) return <p style={{ color: '#6b7280' }}>Loading agreement...</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (!agreement) return <p style={{ color: '#6b7280' }}>Agreement not found.</p>;

  const sourceLabel = agreement.source_kind === 'attachment'
    ? 'Uploaded file'
    : agreement.source_kind === 'free_text'
      ? 'Free text'
      : 'Template';
  const milestoneReferences = agreement?.metadata?.milestone_references || [];
  const pendingRemovalRequests = (removalRequests || []).filter((request) => request.status === 'pending');

  return (
    <section style={{ display: 'grid', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{agreement.title}</h2>
        <AgreementStatusBadge status={agreement.status} />
      </div>

      <p style={{ margin: 0, color: '#374151' }}>Agreement Type: {agreement.template_type}</p>
      <p style={{ margin: 0, color: '#374151' }}>Source: {sourceLabel}</p>
      <p style={{ margin: 0, color: '#374151' }}>
        Classification: {agreement.data_classification || 'internal'}
        {agreement.contains_sensitive_data ? ' | Sensitive data' : ' | Standard data'}
      </p>
      <p style={{ margin: 0, color: '#374151' }}>
        Review required: {agreement.review_required ? 'Yes' : 'No'}
        {agreement.retention_period_days ? ` | Retention: ${agreement.retention_period_days} days` : ''}
        {agreement.destruction_required ? ' | Destruction required' : ''}
      </p>
      <p style={{ margin: 0, color: '#374151' }}>
        Version: {agreement.version_number || 1}
        {agreement.is_current_version === false ? ' (historical draft/version)' : ' (current version)'}
      </p>
      <p style={{ margin: 0, color: '#6b7280' }}>Project: {agreement.project?.title || agreement.project_id}</p>
      {agreement.sourceAttachment ? (
        <p style={{ margin: 0, color: '#6b7280' }}>Source file: {agreement.sourceAttachment.filename}</p>
      ) : null}
      {agreement.supersedes_contract_id ? (
        <p style={{ margin: 0, color: '#6b7280' }}>Amends agreement #{agreement.supersedes_contract_id}</p>
      ) : null}
      {milestoneReferences.length > 0 ? (
        <div style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
          <p style={{ margin: '0 0 6px 0', color: '#374151', fontWeight: 600 }}>Milestone References</p>
          <ul style={{ margin: 0, paddingLeft: '18px' }}>
            {milestoneReferences.map((reference, index) => (
              <li key={`${reference.milestone_id}:${reference.researcher_id}:${index}`}>
                Milestone #{reference.milestone_id} - Researcher #{reference.researcher_id}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {isNonprofitOwner && ['draft', 'changes_requested'].includes(agreement.status) ? (
          <button type="button" onClick={onSubmitForReview} disabled={working}>
            Submit For Review
          </button>
        ) : null}

        {isAdminReviewer && agreement.status === 'internal_review' ? (
          <>
            <button type="button" onClick={onAdminApprove} disabled={working}>
              Approve Internal Review
            </button>
            <button type="button" onClick={onAdminRequestChanges} disabled={working}>
              Request Changes
            </button>
          </>
        ) : null}

        {isCounterpartyResearcher && agreement.status === 'counterparty_review' ? (
          <>
            <button type="button" onClick={onCounterpartyApprove} disabled={working}>
              Approve For Signature
            </button>
            <button type="button" onClick={onCounterpartyRequestChanges} disabled={working}>
              Request Changes
            </button>
          </>
        ) : null}

        <button type="button" onClick={onSign} disabled={working || !['approved_for_signature', 'pending_signature'].includes(agreement.status)}>
          Sign
        </button>
        {isNonprofitOwner ? (
          <button type="button" onClick={onMarkEffective} disabled={working || agreement.status !== 'executed'}>
            Mark Effective
          </button>
        ) : null}
        {isNonprofitOwner ? (
          <button type="button" onClick={onActivate} disabled={working || agreement.status !== 'effective'}>
            Activate
          </button>
        ) : null}
        {isNonprofitOwner ? (
          <button type="button" onClick={onComplete} disabled={working || !['effective', 'active'].includes(agreement.status)}>
            Mark Completed
          </button>
        ) : null}
        <button
          type="button"
          onClick={onAmend}
          disabled={working || !['executed', 'effective', 'active', 'completed'].includes(agreement.status) || agreement.is_current_version === false}
        >
          Create Amendment Draft
        </button>
        <button type="button" onClick={onDownload} disabled={working || !['executed', 'effective', 'active', 'completed', 'terminated', 'expired', 'archived'].includes(agreement.status)}>
          Download Executed File
        </button>
        {(isNonprofitOwner || isAdminReviewer) ? (
          <button type="button" onClick={onArchive} disabled={working || !['completed', 'terminated', 'expired'].includes(agreement.status)}>
            Archive
          </button>
        ) : null}
        {(isNonprofitOwner || isCounterpartyResearcher) && agreement.status !== 'archived' ? (
          <button
            type="button"
            onClick={onRequestRemoval}
            disabled={working || pendingRemovalRequests.length > 0}
          >
            {pendingRemovalRequests.length > 0 ? 'Removal Pending Review' : 'Request Removal'}
          </button>
        ) : null}
      </div>

      {isAdminReviewer && removalRequests?.length ? (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px' }}>
          <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px' }}>Removal Requests</h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {removalRequests.map((request) => (
              <div key={request.id} style={{ border: '1px solid #f3f4f6', borderRadius: '6px', padding: '8px' }}>
                <p style={{ margin: '0 0 4px 0' }}><strong>Status:</strong> {request.status}</p>
                <p style={{ margin: '0 0 4px 0' }}><strong>Reason:</strong> {request.reason}</p>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  Requested by user #{request.requested_by}
                </p>
                {request.status === 'pending' ? (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => onApproveRemovalRequest(request.id)} disabled={working}>
                      Approve
                    </button>
                    <button type="button" onClick={() => onRejectRemovalRequest(request.id)} disabled={working}>
                      Reject
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <SignatureBlock agreement={agreement} />
      <AgreementPreview preview={preview} />
      <AgreementLifecycleTimeline agreement={agreement} reviews={reviews} history={history} />

      <TerminateModal onConfirm={onTerminate} disabled={working || !['executed', 'effective', 'active'].includes(agreement.status)} />
    </section>
  );
}
