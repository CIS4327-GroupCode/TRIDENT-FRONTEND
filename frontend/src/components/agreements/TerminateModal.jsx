import React, { useState } from 'react';

export default function TerminateModal({ onConfirm, disabled }) {
  const [reason, setReason] = useState('');

  return (
    <div style={{ border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', backgroundColor: '#fff1f2' }}>
      <p style={{ margin: 0, fontWeight: 700, color: '#9f1239' }}>Terminate Agreement</p>
      <p style={{ margin: '6px 0', fontSize: '13px', color: '#4b5563' }}>
        This action records termination metadata and notifies the counterparty.
      </p>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Reason for termination"
        rows={3}
        style={{ width: '100%', borderRadius: '8px', border: '1px solid #fca5a5', padding: '8px' }}
      />
      <button
        type="button"
        disabled={disabled || !reason.trim()}
        onClick={() => onConfirm(reason.trim())}
        style={{ marginTop: '8px', padding: '8px 14px', border: 'none', borderRadius: '8px', backgroundColor: '#dc2626', color: '#fff', fontWeight: 600 }}
      >
        Confirm Termination
      </button>
    </div>
  );
}
