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

  const groupedAgreements = agreements.reduce((groups, agreement) => {
    const key = agreement.template_type || 'Other';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(agreement);
    return groups;
  }, {});

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {Object.entries(groupedAgreements).map(([group, items]) => (
        <section key={group} style={{ display: 'grid', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>{group}</h3>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              Current and historical versions for this agreement type.
            </p>
          </div>
          {items
            .slice()
            .sort((left, right) => {
              if (left.is_current_version === right.is_current_version) {
                return (right.version_number || 0) - (left.version_number || 0);
              }
              return left.is_current_version ? -1 : 1;
            })
            .map((agreement) => (
              <AgreementCard key={agreement.id} agreement={agreement} />
            ))}
        </section>
      ))}
    </div>
  );
}
