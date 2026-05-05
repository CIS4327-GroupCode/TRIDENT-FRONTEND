import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AgreementDetailView from '../../../src/components/agreements/AgreementDetailView';

const agreement = {
  id: 11,
  title: 'UC11 Agreement',
  status: 'effective',
  template_type: 'NDA',
  source_kind: 'template',
  review_required: true,
  contains_sensitive_data: true,
  data_classification: 'restricted',
  retention_period_days: 90,
  destruction_required: true,
  version_number: 1,
  is_current_version: true,
  project_id: 7,
  project: { title: 'Project Test' },
  nonprofit_signed_at: null,
  researcher_signed_at: null,
  reviews: [],
  history: []
};

function renderView(overrides = {}) {
  const props = {
    agreement,
    preview: 'Preview',
    reviews: [],
    history: [],
    loading: false,
    error: '',
    isNonprofitOwner: false,
    isCounterpartyResearcher: false,
    isAdminReviewer: false,
    working: false,
    onSubmitForReview: jest.fn(),
    onAdminApprove: jest.fn(),
    onAdminRequestChanges: jest.fn(),
    onCounterpartyApprove: jest.fn(),
    onCounterpartyRequestChanges: jest.fn(),
    onSign: jest.fn(),
    onMarkEffective: jest.fn(),
    onActivate: jest.fn(),
    onComplete: jest.fn(),
    onArchive: jest.fn(),
    onAmend: jest.fn(),
    onTerminate: jest.fn(),
    onDownload: jest.fn(),
    ...overrides
  };

  return {
    ...render(<AgreementDetailView {...props} />),
    props
  };
}

describe('AgreementDetailView', () => {
  it('renders loading and error states', () => {
    const { rerender } = render(
      <AgreementDetailView
        agreement={null}
        preview=""
        reviews={[]}
        history={[]}
        loading={true}
        error=""
        isNonprofitOwner={false}
        isCounterpartyResearcher={false}
        isAdminReviewer={false}
        working={false}
        onSubmitForReview={jest.fn()}
        onAdminApprove={jest.fn()}
        onAdminRequestChanges={jest.fn()}
        onCounterpartyApprove={jest.fn()}
        onCounterpartyRequestChanges={jest.fn()}
        onSign={jest.fn()}
        onMarkEffective={jest.fn()}
        onActivate={jest.fn()}
        onComplete={jest.fn()}
        onArchive={jest.fn()}
        onAmend={jest.fn()}
        onTerminate={jest.fn()}
        onDownload={jest.fn()}
      />
    );

    expect(screen.getByText('Loading agreement...')).toBeInTheDocument();

    rerender(
      <AgreementDetailView
        agreement={null}
        preview=""
        reviews={[]}
        history={[]}
        loading={false}
        error="Failed"
        isNonprofitOwner={false}
        isCounterpartyResearcher={false}
        isAdminReviewer={false}
        working={false}
        onSubmitForReview={jest.fn()}
        onAdminApprove={jest.fn()}
        onAdminRequestChanges={jest.fn()}
        onCounterpartyApprove={jest.fn()}
        onCounterpartyRequestChanges={jest.fn()}
        onSign={jest.fn()}
        onMarkEffective={jest.fn()}
        onActivate={jest.fn()}
        onComplete={jest.fn()}
        onArchive={jest.fn()}
        onAmend={jest.fn()}
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
        reviews={[]}
        history={[]}
        loading={false}
        error=""
        isNonprofitOwner={false}
        isCounterpartyResearcher={false}
        isAdminReviewer={false}
        working={false}
        onSubmitForReview={jest.fn()}
        onAdminApprove={jest.fn()}
        onAdminRequestChanges={jest.fn()}
        onCounterpartyApprove={jest.fn()}
        onCounterpartyRequestChanges={jest.fn()}
        onSign={jest.fn()}
        onMarkEffective={jest.fn()}
        onActivate={jest.fn()}
        onComplete={jest.fn()}
        onArchive={jest.fn()}
        onAmend={jest.fn()}
        onTerminate={jest.fn()}
        onDownload={jest.fn()}
      />
    );

    expect(screen.getByText('Agreement not found.')).toBeInTheDocument();
  });

  it('calls post-execution actions from buttons', () => {
    const { props } = renderView({
      isNonprofitOwner: true,
      agreement: {
        ...agreement,
        status: 'effective'
      }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Activate' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark Completed' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create Amendment Draft' }));
    fireEvent.click(screen.getByRole('button', { name: 'Download Executed File' }));

    fireEvent.change(screen.getByPlaceholderText('Reason for termination'), {
      target: { value: 'Breach of terms' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Termination' }));

    expect(props.onActivate).toHaveBeenCalled();
    expect(props.onComplete).toHaveBeenCalled();
    expect(props.onAmend).toHaveBeenCalled();
    expect(props.onDownload).toHaveBeenCalled();
    expect(props.onTerminate).toHaveBeenCalledWith('Breach of terms');
  });

  it('renders admin review actions for internal review', () => {
    const { props } = renderView({
      isAdminReviewer: true,
      agreement: {
        ...agreement,
        status: 'internal_review'
      }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Approve Internal Review' }));
    fireEvent.click(screen.getByRole('button', { name: 'Request Changes' }));

    expect(props.onAdminApprove).toHaveBeenCalled();
    expect(props.onAdminRequestChanges).toHaveBeenCalled();
  });
});
