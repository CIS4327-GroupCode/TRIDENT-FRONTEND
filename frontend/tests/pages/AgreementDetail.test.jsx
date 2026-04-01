import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AgreementDetail from '../../src/pages/AgreementDetail';
import { AuthContext } from '../../src/auth/AuthContext';

jest.mock('../../src/components/TopBar', () => () => <div>TopBar</div>);
jest.mock('../../src/components/Footer', () => () => <div>Footer</div>);

const mockApi = {
  getAgreement: jest.fn(),
  getAgreementPreview: jest.fn(),
  signAgreement: jest.fn(),
  activateAgreement: jest.fn(),
  terminateAgreement: jest.fn(),
  downloadAgreement: jest.fn()
};

jest.mock('../../src/config/api', () => ({
  getAgreement: (...args) => mockApi.getAgreement(...args),
  getAgreementPreview: (...args) => mockApi.getAgreementPreview(...args),
  signAgreement: (...args) => mockApi.signAgreement(...args),
  activateAgreement: (...args) => mockApi.activateAgreement(...args),
  terminateAgreement: (...args) => mockApi.terminateAgreement(...args),
  downloadAgreement: (...args) => mockApi.downloadAgreement(...args)
}));

describe('AgreementDetail page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.getAgreement.mockResolvedValue({
      agreement: {
        id: 11,
        title: 'Agreement 11',
        status: 'signed',
        template_type: 'NDA',
        nonprofit_user_id: 1,
        project_id: 4,
        project: { title: 'Project 4' }
      }
    });
    mockApi.getAgreementPreview.mockResolvedValue({ preview: 'Template preview' });
    mockApi.signAgreement.mockResolvedValue({});
    mockApi.activateAgreement.mockResolvedValue({});
    mockApi.terminateAgreement.mockResolvedValue({});
    mockApi.downloadAgreement.mockResolvedValue({ blob: new Blob(['pdf']) });

    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();
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

  it('downloads agreement document from detail page', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));

    await waitFor(() => {
      expect(mockApi.downloadAgreement).toHaveBeenCalledWith('11', 'token');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});
