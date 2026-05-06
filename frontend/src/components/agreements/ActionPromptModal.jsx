import React, { useEffect, useState } from 'react';

export default function ActionPromptModal({
  open,
  title,
  description,
  placeholder,
  defaultValue,
  required,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  disabled
}) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) {
      setValue(defaultValue || '');
    }
  }, [open, defaultValue]);

  if (!open) {
    return null;
  }

  const normalized = value.trim();
  const confirmDisabled = disabled || (required && !normalized);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1200
      }}
    >
      <div
        style={{
          width: 'min(560px, 100%)',
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 20px 30px rgba(15, 23, 42, 0.18)',
          padding: '16px',
          display: 'grid',
          gap: '10px'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px' }}>{title}</h3>
        {description ? (
          <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>{description}</p>
        ) : null}
        <textarea
          rows={4}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            padding: '10px',
            fontSize: '14px'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" onClick={onCancel} disabled={disabled}>
            {cancelLabel || 'Cancel'}
          </button>
          <button type="button" onClick={() => onConfirm(normalized)} disabled={confirmDisabled}>
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}