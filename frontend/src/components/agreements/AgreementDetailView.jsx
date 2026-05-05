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
  onDownload
}) {
  if (loading) return <p style={{ color: '#6b7280' }}>Loading agreement...</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (!agreement) return <p style={{ color: '#6b7280' }}>Agreement not found.</p>;

  const sourceLabel = agreement.source_kind === 'attachment'
    ? 'Uploaded file'
    : agreement.source_kind === 'free_text'
      ? 'Free text'
      : 'Template';

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
      </div>

      <SignatureBlock agreement={agreement} />
      <AgreementPreview preview={preview} />
      <AgreementLifecycleTimeline agreement={agreement} reviews={reviews} history={history} />

      <TerminateModal onConfirm={onTerminate} disabled={working || !['executed', 'effective', 'active'].includes(agreement.status)} />
    </section>
  );
}
