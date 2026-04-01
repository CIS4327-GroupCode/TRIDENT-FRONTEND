import React from 'react';

function formatDate(value) {
  if (!value) return 'Pending';
  return new Date(value).toLocaleString();
}

function SignatureRow({ title, signedAt, signIp }) {
  const signed = Boolean(signedAt);
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
      <p style={{ margin: 0, fontWeight: 600 }}>{title}</p>
      <p style={{ margin: '4px 0 0 0', color: signed ? '#166534' : '#6b7280', fontSize: '14px' }}>
        {signed ? 'Signed' : 'Pending Signature'}
      </p>
      <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#4b5563' }}>{formatDate(signedAt)}</p>
      {signIp ? <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>IP: {signIp}</p> : null}
    </div>
  );
}

export default function SignatureBlock({ agreement }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
      <SignatureRow
        title="Nonprofit"
        signedAt={agreement.nonprofit_signed_at}
        signIp={agreement.nonprofit_sign_ip}
      />
      <SignatureRow
        title="Researcher"
        signedAt={agreement.researcher_signed_at}
        signIp={agreement.researcher_sign_ip}
      />
    </div>
  );
}
