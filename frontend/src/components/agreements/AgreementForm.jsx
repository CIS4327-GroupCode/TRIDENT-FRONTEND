import React, { useEffect, useMemo, useState } from 'react';
import {
  listProjectAttachments,
  listProjectResearcherAccess,
  uploadProjectAttachment
} from '../../config/api';

export default function AgreementForm({ templates, onSubmit, submitting, projectId, token }) {
  const [sourceKind, setSourceKind] = useState('template');
  const [templateType, setTemplateType] = useState('');
  const [title, setTitle] = useState('');
  const [variables, setVariables] = useState({});
  const [containsSensitiveData, setContainsSensitiveData] = useState(false);
  const [dataClassification, setDataClassification] = useState('internal');
  const [retentionPeriodDays, setRetentionPeriodDays] = useState('');
  const [destructionRequired, setDestructionRequired] = useState(false);
  const [reviewRequired, setReviewRequired] = useState(false);
  const [freeTextContent, setFreeTextContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState('');
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsError, setAttachmentsError] = useState('');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [referenceOptions, setReferenceOptions] = useState([]);
  const [selectedReferenceKeys, setSelectedReferenceKeys] = useState([]);

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

  useEffect(() => {
    if (sourceKind !== 'attachment' || !projectId || !token) {
      return undefined;
    }

    let cancelled = false;

    const fetchAttachments = async () => {
      setAttachmentsLoading(true);
      setAttachmentsError('');
      try {
        const response = await listProjectAttachments(projectId, token);
        if (cancelled) return;

        const nextAttachments = (response.attachments || []).filter((attachment) => attachment.status === 'active');
        setAttachments(nextAttachments);
        setSelectedAttachmentId((current) => {
          if (current && nextAttachments.some((attachment) => String(attachment.id) === String(current))) {
            return current;
          }
          return nextAttachments[0] ? String(nextAttachments[0].id) : '';
        });
      } catch (error) {
        if (!cancelled) {
          setAttachmentsError(error?.message || 'Could not load project attachments.');
        }
      } finally {
        if (!cancelled) {
          setAttachmentsLoading(false);
        }
      }
    };

    fetchAttachments();

    return () => {
      cancelled = true;
    };
  }, [projectId, sourceKind, token]);

  useEffect(() => {
    if (!projectId || !token) {
      setReferenceOptions([]);
      setSelectedReferenceKeys([]);
      return undefined;
    }

    let cancelled = false;

    const loadReferenceOptions = async () => {
      try {
        const response = await listProjectResearcherAccess(projectId, token);
        if (cancelled) {
          return;
        }

        const milestones = response.milestones || [];
        const milestoneById = new Map(milestones.map((milestone) => [milestone.id, milestone]));
        const options = [];
        const seen = new Set();

        for (const entry of response.researchers || []) {
          const researcher = entry.researcher;
          const scopedMilestoneIds = entry.whole_project
            ? milestones.map((milestone) => milestone.id)
            : (entry.milestone_ids || []);

          for (const milestoneId of scopedMilestoneIds) {
            const milestone = milestoneById.get(milestoneId);
            if (!milestone) {
              continue;
            }

            const key = `${milestoneId}:${researcher.id}`;
            if (seen.has(key)) {
              continue;
            }
            seen.add(key);

            options.push({
              key,
              milestone_id: milestoneId,
              researcher_id: researcher.id,
              milestone_name: milestone.name,
              researcher_name: researcher.name
            });
          }
        }

        setReferenceOptions(options);
        setSelectedReferenceKeys((current) => current.filter((key) => options.some((option) => option.key === key)));
      } catch (_error) {
        if (!cancelled) {
          setReferenceOptions([]);
          setSelectedReferenceKeys([]);
        }
      }
    };

    loadReferenceOptions();

    return () => {
      cancelled = true;
    };
  }, [projectId, token]);

  const handleAttachmentUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !projectId || !token) {
      return;
    }

    setUploadingAttachment(true);
    setAttachmentsError('');

    try {
      const response = await uploadProjectAttachment(projectId, file, token);
      const uploadedAttachment = response.attachment;
      if (uploadedAttachment) {
        setAttachments((current) => [uploadedAttachment, ...current.filter((attachment) => attachment.id !== uploadedAttachment.id)]);
        setSelectedAttachmentId(String(uploadedAttachment.id));
      }
    } catch (error) {
      setAttachmentsError(error?.message || 'Could not upload the source attachment.');
    } finally {
      setUploadingAttachment(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    const enforcedReviewRequired = reviewRequired || containsSensitiveData || sourceKind === 'attachment' || sourceKind === 'free_text';

    const payload = {
      template_type: templateType,
      title,
      source_kind: sourceKind,
      contains_sensitive_data: containsSensitiveData,
      data_classification: dataClassification,
      retention_period_days: retentionPeriodDays ? Number(retentionPeriodDays) : undefined,
      destruction_required: destructionRequired,
      review_required: enforcedReviewRequired
    };

    if (sourceKind === 'template') {
      payload.variables = variables;
    }

    if (sourceKind === 'free_text') {
      payload.free_text_content = freeTextContent;
    }

    if (sourceKind === 'attachment') {
      payload.uploaded_attachment_id = selectedAttachmentId;
    }

    if (selectedReferenceKeys.length > 0) {
      payload.milestone_references = selectedReferenceKeys
        .map((key) => referenceOptions.find((option) => option.key === key))
        .filter(Boolean)
        .map((option) => ({
          milestone_id: option.milestone_id,
          researcher_id: option.researcher_id
        }));
    }

    try {
      await Promise.resolve(onSubmit(payload));
    } catch (error) {
      setSubmitError(error?.message || 'Could not submit agreement. Please try again.');
    }
  };

  const isAttachmentSourceReady = sourceKind !== 'attachment' || Boolean(selectedAttachmentId);
  const isFreeTextReady = sourceKind !== 'free_text' || Boolean(freeTextContent.trim());
  const isTemplateReady = sourceKind !== 'template' || Boolean(templateType);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
      {submitError ? (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: 0 }}>
          {submitError}
        </div>
      ) : null}

      <label>
        <span style={{ fontWeight: 600 }}>Source Mode</span>
        <select
          value={sourceKind}
          onChange={(event) => setSourceKind(event.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }}
        >
          <option value="template">Platform template</option>
          <option value="attachment">Uploaded project file</option>
          <option value="free_text">Free text</option>
        </select>
      </label>

      <label>
        <span style={{ fontWeight: 600 }}>Agreement Type</span>
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

      <div style={{ display: 'grid', gap: '10px', padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
        <div>
          <strong style={{ display: 'block', marginBottom: '4px' }}>Compliance Settings</strong>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Free-text and uploaded-file agreements trigger stronger review automatically. Use these fields to capture the sensitive-data controls required before effectiveness.
          </p>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={containsSensitiveData}
            onChange={(event) => setContainsSensitiveData(event.target.checked)}
          />
          <span>Contains sensitive data</span>
        </label>

        <label>
          <span style={{ fontWeight: 600 }}>Data Classification</span>
          <select
            value={dataClassification}
            onChange={(event) => setDataClassification(event.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }}
          >
            <option value="public">Public</option>
            <option value="internal">Internal</option>
            <option value="confidential">Confidential</option>
            <option value="restricted">Restricted</option>
          </select>
        </label>

        <label>
          <span style={{ fontWeight: 600 }}>Retention Period (days)</span>
          <input
            type="number"
            min="1"
            value={retentionPeriodDays}
            onChange={(event) => setRetentionPeriodDays(event.target.value)}
            placeholder="Required before sensitive-data agreements become effective"
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={destructionRequired}
            onChange={(event) => setDestructionRequired(event.target.checked)}
          />
          <span>Destruction confirmation required at end of retention period</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={reviewRequired || containsSensitiveData || sourceKind === 'attachment' || sourceKind === 'free_text'}
            onChange={(event) => setReviewRequired(event.target.checked)}
            disabled={containsSensitiveData || sourceKind === 'attachment' || sourceKind === 'free_text'}
          />
          <span>Internal compliance review required before counterparty review</span>
        </label>
      </div>

      {sourceKind === 'template'
        ? selectedTemplate?.requiredVariables?.map((field) => (
          <label key={field}>
            <span style={{ fontWeight: 600 }}>{field}</span>
            <input
              value={variables[field] || ''}
              onChange={(event) => setVariables((previous) => ({ ...previous, [field]: event.target.value }))}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </label>
        ))
        : null}

      {sourceKind === 'free_text' ? (
        <label>
          <span style={{ fontWeight: 600 }}>Agreement Text</span>
          <textarea
            value={freeTextContent}
            onChange={(event) => setFreeTextContent(event.target.value)}
            required
            rows={10}
            placeholder="Use free text only when no approved template or uploaded source document is suitable."
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }}
          />
        </label>
      ) : null}

      {sourceKind === 'attachment' ? (
        <div style={{ display: 'grid', gap: '10px' }}>
          {!projectId ? (
            <div className="alert alert-warning" role="alert" style={{ marginBottom: 0 }}>
              Open this agreement flow from a specific project to use an uploaded file as the source document.
            </div>
          ) : null}

          {attachmentsError ? (
            <div className="alert alert-danger" role="alert" style={{ marginBottom: 0 }}>
              {attachmentsError}
            </div>
          ) : null}

          <label>
            <span style={{ fontWeight: 600 }}>Select Existing Uploaded File</span>
            <select
              value={selectedAttachmentId}
              onChange={(event) => setSelectedAttachmentId(event.target.value)}
              disabled={!projectId || attachmentsLoading || !attachments.length}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            >
              <option value="">{attachmentsLoading ? 'Loading files...' : 'Select a file'}</option>
              {attachments.map((attachment) => (
                <option key={attachment.id} value={attachment.id}>
                  {attachment.filename}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span style={{ fontWeight: 600 }}>Upload a New Source File</span>
            <input
              type="file"
              onChange={handleAttachmentUpload}
              disabled={!projectId || uploadingAttachment}
              style={{ width: '100%' }}
            />
          </label>
        </div>
      ) : null}

      {projectId && referenceOptions.length > 0 ? (
        <div style={{ display: 'grid', gap: '8px', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
          <strong>Milestone References</strong>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Link this agreement to specific researcher milestone assignments.
          </p>
          <div style={{ display: 'grid', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {referenceOptions.map((option) => (
              <label key={option.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={selectedReferenceKeys.includes(option.key)}
                  onChange={(event) => {
                    setSelectedReferenceKeys((current) => {
                      if (event.target.checked) {
                        return [...current, option.key];
                      }
                      return current.filter((key) => key !== option.key);
                    });
                  }}
                />
                <span>
                  {option.milestone_name} - {option.researcher_name}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting || uploadingAttachment || !templateType || !title.trim() || !isAttachmentSourceReady || !isFreeTextReady || !isTemplateReady}
        style={{ padding: '9px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700 }}
      >
        {submitting ? 'Creating...' : 'Create Agreement'}
      </button>
    </form>
  );
}
