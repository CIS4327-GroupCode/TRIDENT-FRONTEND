import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FileUploadZone from '../../src/components/projects/FileUploadZone';

describe('FileUploadZone', () => {
  it('renders instructions and file metadata when selected', () => {
    const onFileSelected = jest.fn();

    render(
      <FileUploadZone
        selectedFile={new File(['abc'], 'doc.txt', { type: 'text/plain' })}
        onFileSelected={onFileSelected}
      />
    );

    expect(screen.getByText(/Drag and drop a file here/i)).toBeInTheDocument();
    expect(screen.getByText('doc.txt')).toBeInTheDocument();
  });

  it('calls onFileSelected when valid file chosen', () => {
    const onFileSelected = jest.fn();

    render(<FileUploadZone selectedFile={null} onFileSelected={onFileSelected} />);

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['abc'], 'doc.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFileSelected).toHaveBeenCalledWith(file);
  });
});
