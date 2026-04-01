import React, { useEffect, useMemo, useState } from 'react';

export default function AgreementForm({ templates, onSubmit, submitting }) {
  const [templateType, setTemplateType] = useState('');
  const [title, setTitle] = useState('');
  const [variables, setVariables] = useState({});

  useEffect(() => {
    if (templates.length && !templateType) {
      setTemplateType(templates[0].type);
    }
  }, [templates, templateType]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.type === templateType),
    [templates, templateType]
  );

  useEffect(() => {
    if (!selectedTemplate) return;
    setVariables((previous) => {
      const next = { ...previous };
      selectedTemplate.requiredVariables.forEach((field) => {
        if (next[field] === undefined) {
          next[field] = '';
        }
      });
      return next;
    });
  }, [selectedTemplate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      template_type: templateType,
      title,
      variables
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
      <label>
        <span style={{ fontWeight: 600 }}>Template</span>
        <select
          value={templateType}
          onChange={(event) => setTemplateType(event.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }}
        >
          {templates.map((template) => (
            <option key={template.type} value={template.type}>
              {template.type}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span style={{ fontWeight: 600 }}>Agreement Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }}
        />
      </label>

      {selectedTemplate?.requiredVariables?.map((field) => (
        <label key={field}>
          <span style={{ fontWeight: 600 }}>{field}</span>
          <input
            value={variables[field] || ''}
            onChange={(event) => setVariables((previous) => ({ ...previous, [field]: event.target.value }))}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }}
          />
        </label>
      ))}

      <button
        type="submit"
        disabled={submitting || !templateType || !title.trim()}
        style={{ padding: '9px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700 }}
      >
        {submitting ? 'Creating...' : 'Create Agreement'}
      </button>
    </form>
  );
}
