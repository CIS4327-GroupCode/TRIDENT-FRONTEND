import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockList = jest.fn();
const mockUpload = jest.fn();
const mockDelete = jest.fn();
const mockDownload = jest.fn();

jest.mock('../../src/config/api', () => ({
  listProjectAttachments: (...args) => mockList(...args),
  uploadProjectAttachment: (...args) => mockUpload(...args),
  deleteProjectAttachment: (...args) => mockDelete(...args),
  downloadProjectAttachment: (...args) => mockDownload(...args)
}));

import AttachmentManager from '../../src/components/projects/AttachmentManager';

describe('AttachmentManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.getItem.mockReturnValue('token');
    mockList.mockResolvedValue({
      attachments: [
        {
          id: 1,
          filename: 'report.pdf',
          version: 2,
          size: 2048,
          created_at: '2026-03-14T00:00:00.000Z',
          scan_status: 'clean'
        }
      ]
    });
    mockDownload.mockResolvedValue({ blob: new Blob(['data']) });
  });

  it('loads and displays attachment rows', async () => {
    render(<AttachmentManager projectId={10} canUpload={true} />);

    await waitFor(() => {
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
      expect(screen.getByText('v2')).toBeInTheDocument();
    });
  });

  it('uploads selected file', async () => {
    mockUpload.mockResolvedValue({ attachment: { id: 2 } });

    render(<AttachmentManager projectId={10} canUpload={true} />);

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['abc'], 'sample.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByText('Upload'));

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith(10, expect.any(File), 'token');
    });
  });

  it('deletes attachment when confirmed', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    mockDelete.mockResolvedValue({ message: 'ok' });

    render(<AttachmentManager projectId={10} canUpload={true} />);

    await waitFor(() => {
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
    });

    const deleteButtons = document.querySelectorAll('.btn-outline-danger');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(10, 1, 'token');
    });
  });
});
