import React from 'react';
import { Link } from 'react-router-dom';
import AgreementStatusBadge from './AgreementStatusBadge';

export default function AgreementCard({ agreement }) {
  const counterpartyName = agreement.nonprofitUser?.name || agreement.researcherUser?.name || 'Counterparty';
  const sourceLabel = agreement.source_kind === 'attachment'
    ? 'Uploaded file'
    : agreement.source_kind === 'free_text'
      ? 'Free text'
      : 'Template';

  return (
    <article style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>{agreement.title}</h3>
        <AgreementStatusBadge status={agreement.status} />
      </div>
      <p style={{ margin: '8px 0 4px 0', color: '#374151' }}>
        Type: <strong>{agreement.template_type}</strong>
      </p>
      <p style={{ margin: '0 0 4px 0', color: '#374151' }}>
        Source: <strong>{sourceLabel}</strong>
        {agreement.version_number ? ` | Version ${agreement.version_number}` : ''}
        {agreement.is_current_version === false ? ' | Historical version' : ''}
      </p>
      <p style={{ margin: '0 0 4px 0', color: '#374151' }}>
        Classification: <strong>{agreement.data_classification || 'internal'}</strong>
        {agreement.contains_sensitive_data ? ' | Sensitive data' : ' | Standard data'}
      </p>
      <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
        Project: {agreement.project?.title || agreement.project_id} | Counterparty: {counterpartyName}
      </p>
      {agreement.sourceAttachment ? (
        <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
          File: {agreement.sourceAttachment.filename}
        </p>
      ) : null}
      <Link to={`/agreements/${agreement.id}`} style={{ fontSize: '14px', fontWeight: 600 }}>
        Open agreement
      </Link>
    </article>
  );
}
