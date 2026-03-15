import React from 'react';
import AgreementCard from './AgreementCard';

export default function AgreementList({ agreements, loading, error }) {
  if (loading) {
    return <p style={{ color: '#6b7280' }}>Loading agreements...</p>;
  }

  if (error) {
    return <p style={{ color: '#b91c1c' }}>{error}</p>;
  }

  if (!agreements.length) {
    return <p style={{ color: '#6b7280' }}>No agreements found.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {agreements.map((agreement) => (
        <AgreementCard key={agreement.id} agreement={agreement} />
      ))}
    </div>
  );
}
