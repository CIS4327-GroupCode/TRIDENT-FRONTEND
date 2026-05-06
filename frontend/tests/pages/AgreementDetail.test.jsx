import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AgreementDetail from '../../src/pages/AgreementDetail';
import { AuthContext } from '../../src/auth/AuthContext';

jest.mock('../../src/components/TopBar', () => () => <div>TopBar</div>);
jest.mock('../../src/components/Footer', () => () => <div>Footer</div>);

const mockApi = {
  getAgreement: jest.fn(),
  listAgreementReviews: jest.fn(),
  listAgreementHistory: jest.fn(),
  getAgreementPreview: jest.fn(),
  submitAgreementForReview: jest.fn(),
  reviewAgreementInternal: jest.fn(),
  reviewAgreementCounterparty: jest.fn(),
  signAgreement: jest.fn(),
  makeAgreementEffective: jest.fn(),
  activateAgreement: jest.fn(),
  completeAgreement: jest.fn(),
  archiveAgreement: jest.fn(),
  createAgreementAmendment: jest.fn(),
  terminateAgreement: jest.fn(),
  downloadAgreement: jest.fn()
};

jest.mock('../../src/config/api', () => ({
  getAgreement: (...args) => mockApi.getAgreement(...args),
  listAgreementReviews: (...args) => mockApi.listAgreementReviews(...args),
  listAgreementHistory: (...args) => mockApi.listAgreementHistory(...args),
  getAgreementPreview: (...args) => mockApi.getAgreementPreview(...args),
  submitAgreementForReview: (...args) => mockApi.submitAgreementForReview(...args),
  reviewAgreementInternal: (...args) => mockApi.reviewAgreementInternal(...args),
  reviewAgreementCounterparty: (...args) => mockApi.reviewAgreementCounterparty(...args),
  signAgreement: (...args) => mockApi.signAgreement(...args),
  makeAgreementEffective: (...args) => mockApi.makeAgreementEffective(...args),
  activateAgreement: (...args) => mockApi.activateAgreement(...args),
  completeAgreement: (...args) => mockApi.completeAgreement(...args),
  archiveAgreement: (...args) => mockApi.archiveAgreement(...args),
  createAgreementAmendment: (...args) => mockApi.createAgreementAmendment(...args),
  terminateAgreement: (...args) => mockApi.terminateAgreement(...args),
  downloadAgreement: (...args) => mockApi.downloadAgreement(...args)
}));

function makeAgreement(overrides = {}) {
  return {
    id: 11,
    title: 'Agreement 11',
    status: 'approved_for_signature',
    template_type: 'NDA',
    source_kind: 'template',
    nonprofit_user_id: 1,
    researcher_user_id: 9,
    project_id: 4,
    project: { title: 'Project 4' },
    review_required: false,
    data_classification: 'internal',
    contains_sensitive_data: false,
    version_number: 1,
    is_current_version: true,
    ...overrides
  };
}

describe('AgreementDetail page', () => {
  let createElementSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    createElementSpy = jest.spyOn(document, 'createElement');
    mockApi.getAgreement.mockResolvedValue({
      agreement: makeAgreement()
    });
    mockApi.getAgreementPreview.mockResolvedValue({ preview: 'Template preview' });
    mockApi.listAgreementReviews.mockResolvedValue({ reviews: [] });
    mockApi.listAgreementHistory.mockResolvedValue({ history: [] });
    mockApi.signAgreement.mockResolvedValue({});
    mockApi.activateAgreement.mockResolvedValue({});
    mockApi.terminateAgreement.mockResolvedValue({});
    mockApi.downloadAgreement.mockResolvedValue({ blob: new Blob(['pdf']) });

    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();

    createElementSpy.mockImplementation((tagName, options) => {
      const element = document.createElementNS('http://www.w3.org/1999/xhtml', tagName, options);
      if (String(tagName).toLowerCase() === 'a') {
        element.click = jest.fn();
      }
      return element;
    });
  });

  afterEach(() => {
    createElementSpy?.mockRestore();
  });

  it('loads agreement detail and performs sign action', async () => {
    render(
      <MemoryRouter initialEntries={['/agreements/11']}>
        <AuthContext.Provider value={{ token: 'token', user: { id: 1, role: 'nonprofit' } }}>
          <Routes>
            <Route path="/agreements/:id" element={<AgreementDetail />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockApi.getAgreement).toHaveBeenCalledWith('11', 'token');
      expect(mockApi.getAgreementPreview).toHaveBeenCalledWith('11', 'token');
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading agreement...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign' }));

    await waitFor(() => {
      expect(mockApi.signAgreement).toHaveBeenCalledWith('11', 'token');
    });
  });

  it('submits agreement for review through modal flow', async () => {
    mockApi.getAgreement.mockResolvedValueOnce({
      agreement: makeAgreement({ status: 'draft', review_required: true })
    });
    mockApi.submitAgreementForReview.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={['/agreements/11']}>
        <AuthContext.Provider value={{ token: 'token', user: { id: 1, role: 'nonprofit' } }}>
          <Routes>
            <Route path="/agreements/:id" element={<AgreementDetail />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading agreement...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit For Review' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Ready for review'), {
      target: { value: 'Please review this draft.' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(mockApi.submitAgreementForReview).toHaveBeenCalledWith('11', 'Please review this draft.', 'token');
    });
  });

  it('downloads agreement document from detail page', async () => {
    mockApi.getAgreement.mockResolvedValueOnce({
      agreement: makeAgreement({ status: 'executed', executed_filename: 'agreement-11.pdf' })
    });

    render(
      <MemoryRouter initialEntries={['/agreements/11']}>
        <AuthContext.Provider value={{ token: 'token', user: { id: 1, role: 'nonprofit' } }}>
          <Routes>
            <Route path="/agreements/:id" element={<AgreementDetail />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockApi.getAgreement).toHaveBeenCalled();
      expect(screen.queryByText('Loading agreement...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Download Executed File' }));

    await waitFor(() => {
      expect(mockApi.downloadAgreement).toHaveBeenCalledWith('11', 'token');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  it('shows conflict recovery action when lifecycle call returns 409', async () => {
    const conflictError = new Error('Conflict');
    conflictError.status = 409;
    conflictError.kind = 'conflict';
    mockApi.signAgreement.mockRejectedValueOnce(conflictError);

    render(
      <MemoryRouter initialEntries={['/agreements/11']}>
        <AuthContext.Provider value={{ token: 'token', user: { id: 1, role: 'nonprofit' } }}>
          <Routes>
            <Route path="/agreements/:id" element={<AgreementDetail />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading agreement...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign' }));

    await waitFor(() => {
      expect(screen.getAllByText(/agreement changed due to another action/i).length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: 'Reload Agreement State' })).toBeInTheDocument();
    });
  });
});
