import React from 'react';

const STATUS_STYLE = {
  draft: { bg: '#f3f4f6', color: '#374151', label: 'Draft' },
  internal_review: { bg: '#e0f2fe', color: '#075985', label: 'Internal Review' },
  counterparty_review: { bg: '#fef3c7', color: '#92400e', label: 'Counterparty Review' },
  changes_requested: { bg: '#fee2e2', color: '#991b1b', label: 'Changes Requested' },
  approved_for_signature: { bg: '#ede9fe', color: '#5b21b6', label: 'Approved For Signature' },
  pending_signature: { bg: '#fef3c7', color: '#92400e', label: 'Pending Signature' },
  executed: { bg: '#dbeafe', color: '#1d4ed8', label: 'Executed' },
  effective: { bg: '#dcfce7', color: '#166534', label: 'Effective' },
  active: { bg: '#dcfce7', color: '#166534', label: 'Active' },
  completed: { bg: '#ecfccb', color: '#3f6212', label: 'Completed' },
  terminated: { bg: '#fee2e2', color: '#991b1b', label: 'Terminated' },
  expired: { bg: '#e5e7eb', color: '#4b5563', label: 'Expired' },
  archived: { bg: '#f3f4f6', color: '#4b5563', label: 'Archived' }
};

export default function AgreementStatusBadge({ status }) {
  const style = STATUS_STYLE[status] || STATUS_STYLE.draft;

  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.color,
        fontSize: '12px',
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: '999px',
        textTransform: 'uppercase',
        letterSpacing: '0.02em'
      }}
    >
      {style.label}
    </span>
  );
}
