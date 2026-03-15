import React from 'react';

export default function AgreementPreview({ preview }) {
  return (
    <section
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        padding: '14px',
        whiteSpace: 'pre-wrap',
        backgroundColor: '#f9fafb',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '13px',
        lineHeight: 1.5
      }}
    >
      {preview || 'Preview unavailable'}
    </section>
  );
}
