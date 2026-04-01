import React, { useEffect, useState } from 'react';
import {
  listProjectAttachments,
  uploadProjectAttachment,
  deleteProjectAttachment,
  downloadProjectAttachment
} from '../../config/api';
import FileUploadZone from './FileUploadZone';

function formatSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function triggerDownload(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export default function AttachmentManager({ projectId, canUpload = false }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const token = localStorage.getItem('trident_token');

  const fetchAttachments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listProjectAttachments(projectId, token);
      setAttachments(data.attachments || []);
    } catch (err) {
      setError(err.message || 'Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [projectId]);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await uploadProjectAttachment(projectId, selectedFile, token);
      setSelectedFile(null);
      await fetchAttachments();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Delete this attachment?')) {
      return;
    }

    try {
      await deleteProjectAttachment(projectId, attachmentId, token);
      await fetchAttachments();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const { blob } = await downloadProjectAttachment(projectId, attachment.id, token);
      triggerDownload(blob, attachment.filename);
    } catch (err) {
      setError(err.message || 'Download failed');
    }
  };

  return (
    <div>
      {canUpload && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">Upload Attachment</h6>
            <FileUploadZone
              selectedFile={selectedFile}
              onFileSelected={setSelectedFile}
              disabled={uploading}
            />
            <div className="mt-3 d-flex gap-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-upload me-1"></i>
                    Upload
                  </>
                )}
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setSelectedFile(null)}
                disabled={uploading || !selectedFile}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2">{error}</div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="card-title mb-0">Attachments</h6>
            <button className="btn btn-outline-primary btn-sm" onClick={fetchAttachments}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : attachments.length === 0 ? (
            <div className="alert alert-info mb-0">No attachments uploaded yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Version</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attachments.map((attachment) => (
                    <tr key={attachment.id}>
                      <td>{attachment.filename}</td>
                      <td>v{attachment.version || 1}</td>
                      <td>{formatSize(attachment.size)}</td>
                      <td>{new Date(attachment.created_at).toLocaleString()}</td>
                      <td>
                        <span className={`badge bg-${attachment.scan_status === 'clean' ? 'success' : 'warning'}`}>
                          {attachment.scan_status || 'pending'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleDownload(attachment)}
                          >
                            <i className="bi bi-download"></i>
                          </button>
                          {canUpload && (
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(attachment.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
