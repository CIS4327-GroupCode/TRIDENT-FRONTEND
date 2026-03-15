import React from 'react';

const STATUS_STYLE = {
  draft: { bg: '#f3f4f6', color: '#374151', label: 'Draft' },
  pending_signature: { bg: '#fef3c7', color: '#92400e', label: 'Pending Signature' },
  signed: { bg: '#dbeafe', color: '#1d4ed8', label: 'Signed' },
  active: { bg: '#dcfce7', color: '#166534', label: 'Active' },
  terminated: { bg: '#fee2e2', color: '#991b1b', label: 'Terminated' },
  expired: { bg: '#e5e7eb', color: '#4b5563', label: 'Expired' }
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
