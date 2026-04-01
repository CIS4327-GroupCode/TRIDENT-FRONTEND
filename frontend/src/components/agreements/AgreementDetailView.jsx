import React from 'react';
import AgreementStatusBadge from './AgreementStatusBadge';
import SignatureBlock from './SignatureBlock';
import AgreementPreview from './AgreementPreview';
import TerminateModal from './TerminateModal';

export default function AgreementDetailView({
  agreement,
  preview,
  loading,
  error,
  isNonprofitOwner,
  working,
  onSign,
  onActivate,
  onTerminate,
  onDownload
}) {
  if (loading) return <p style={{ color: '#6b7280' }}>Loading agreement...</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (!agreement) return <p style={{ color: '#6b7280' }}>Agreement not found.</p>;

  return (
    <section style={{ display: 'grid', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{agreement.title}</h2>
        <AgreementStatusBadge status={agreement.status} />
      </div>

      <p style={{ margin: 0, color: '#374151' }}>Template: {agreement.template_type}</p>
      <p style={{ margin: 0, color: '#6b7280' }}>Project: {agreement.project?.title || agreement.project_id}</p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button type="button" onClick={onSign} disabled={working || ['terminated', 'expired'].includes(agreement.status)}>
          Sign
        </button>
        {isNonprofitOwner ? (
          <button type="button" onClick={onActivate} disabled={working || agreement.status !== 'signed'}>
            Activate
          </button>
        ) : null}
        <button type="button" onClick={onDownload} disabled={working || !['signed', 'active'].includes(agreement.status)}>
          Download PDF
        </button>
      </div>

      <SignatureBlock agreement={agreement} />
      <AgreementPreview preview={preview} />

      <TerminateModal onConfirm={onTerminate} disabled={working || agreement.status === 'terminated'} />
    </section>
  );
}
