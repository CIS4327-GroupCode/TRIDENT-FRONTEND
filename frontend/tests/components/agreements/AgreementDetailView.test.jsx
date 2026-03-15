import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AgreementDetailView from '../../../src/components/agreements/AgreementDetailView';

const agreement = {
  id: 11,
  title: 'UC11 Agreement',
  status: 'signed',
  template_type: 'NDA',
  project_id: 7,
  project: { title: 'Project Test' },
  nonprofit_signed_at: null,
  researcher_signed_at: null
};

describe('AgreementDetailView', () => {
  it('renders loading and error states', () => {
    const { rerender } = render(
      <AgreementDetailView
        agreement={null}
        preview=""
        loading={true}
        error=""
        isNonprofitOwner={false}
        working={false}
        onSign={jest.fn()}
        onActivate={jest.fn()}
        onTerminate={jest.fn()}
        onDownload={jest.fn()}
      />
    );

    expect(screen.getByText('Loading agreement...')).toBeInTheDocument();

    rerender(
      <AgreementDetailView
        agreement={null}
        preview=""
        loading={false}
        error="Failed"
        isNonprofitOwner={false}
        working={false}
        onSign={jest.fn()}
        onActivate={jest.fn()}
        onTerminate={jest.fn()}
        onDownload={jest.fn()}
      />
    );

    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders not found when agreement is missing', () => {
    render(
      <AgreementDetailView
        agreement={null}
        preview=""
        loading={false}
        error=""
        isNonprofitOwner={false}
        working={false}
        onSign={jest.fn()}
        onActivate={jest.fn()}
        onTerminate={jest.fn()}
        onDownload={jest.fn()}
      />
    );

    expect(screen.getByText('Agreement not found.')).toBeInTheDocument();
  });

  it('calls actions from buttons', () => {
    const onSign = jest.fn();
    const onActivate = jest.fn();
    const onTerminate = jest.fn();
    const onDownload = jest.fn();

    render(
      <AgreementDetailView
        agreement={agreement}
        preview="Preview"
        loading={false}
        error=""
        isNonprofitOwner={true}
        working={false}
        onSign={onSign}
        onActivate={onActivate}
        onTerminate={onTerminate}
        onDownload={onDownload}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign' }));
    fireEvent.click(screen.getByRole('button', { name: 'Activate' }));
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));

    fireEvent.change(screen.getByPlaceholderText('Reason for termination'), {
      target: { value: 'Breach of terms' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Termination' }));

    expect(onSign).toHaveBeenCalled();
    expect(onActivate).toHaveBeenCalled();
    expect(onDownload).toHaveBeenCalled();
    expect(onTerminate).toHaveBeenCalledWith('Breach of terms');
  });
});
