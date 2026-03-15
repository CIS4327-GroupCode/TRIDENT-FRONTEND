import React, { useRef } from 'react';

const MAX_MB = 5;
const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg'
];

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FileUploadZone({ selectedFile, onFileSelected, disabled = false }) {
  const inputRef = useRef(null);

  const validateAndSelect = (file) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Unsupported file type');
    }

    if (file.size > MAX_MB * 1024 * 1024) {
      throw new Error(`File exceeds ${MAX_MB} MB limit`);
    }

    onFileSelected(file);
  };

  const onDrop = (event) => {
    event.preventDefault();
    if (disabled) return;

    const file = event.dataTransfer.files?.[0];
    try {
      validateAndSelect(file);
    } catch (error) {
      alert(error.message);
    }
  };

  const onChooseFile = (event) => {
    const file = event.target.files?.[0];
    try {
      validateAndSelect(file);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <div
        className={`border rounded p-3 text-center ${disabled ? 'bg-light' : 'bg-white'}`}
        style={{ borderStyle: 'dashed', cursor: disabled ? 'not-allowed' : 'pointer' }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <i className="bi bi-cloud-arrow-up fs-3 text-primary"></i>
        <p className="mb-1 mt-2">Drag and drop a file here, or click to browse</p>
        <small className="text-muted">Allowed: PDF, TXT, CSV, DOC/DOCX, XLS/XLSX, PNG, JPG (max {MAX_MB} MB)</small>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="d-none"
        onChange={onChooseFile}
        disabled={disabled}
      />

      {selectedFile && (
        <div className="mt-2 alert alert-info py-2 mb-0">
          <i className="bi bi-paperclip me-2"></i>
          <strong>{selectedFile.name}</strong>
          <span className="ms-2 text-muted">({formatBytes(selectedFile.size)})</span>
        </div>
      )}
    </div>
  );
}
