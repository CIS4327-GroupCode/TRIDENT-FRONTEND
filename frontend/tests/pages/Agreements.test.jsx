import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Agreements from '../../src/pages/Agreements';
import { AuthContext } from '../../src/auth/AuthContext';

jest.mock('../../src/components/TopBar', () => () => <div>TopBar</div>);
jest.mock('../../src/components/Footer', () => () => <div>Footer</div>);

const mockApi = {
  listAgreements: jest.fn(),
  getAgreementTemplates: jest.fn(),
  createAgreement: jest.fn()
};

jest.mock('../../src/config/api', () => ({
  listAgreements: (...args) => mockApi.listAgreements(...args),
  getAgreementTemplates: (...args) => mockApi.getAgreementTemplates(...args),
  createAgreement: (...args) => mockApi.createAgreement(...args)
}));

describe('Agreements page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.listAgreements.mockResolvedValue({ agreements: [] });
    mockApi.getAgreementTemplates.mockResolvedValue({
      templates: [{ type: 'NDA', requiredVariables: ['project_name'] }]
    });
    mockApi.createAgreement.mockResolvedValue({
      agreement: { id: 99, title: 'New Agreement' }
    });
  });

  it('loads agreements and templates', async () => {
    render(
      <MemoryRouter initialEntries={['/agreements?applicationId=3']}>
        <AuthContext.Provider value={{ token: 'token', user: { role: 'nonprofit' } }}>
          <Agreements />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockApi.listAgreements).toHaveBeenCalled();
      expect(mockApi.getAgreementTemplates).toHaveBeenCalled();
    });

    expect(screen.getByRole('heading', { name: 'Create Agreement' })).toBeInTheDocument();
  });

  it('creates agreement for nonprofit user', async () => {
    render(
      <MemoryRouter initialEntries={['/agreements?applicationId=8']}>
        <AuthContext.Provider value={{ token: 'token', user: { role: 'nonprofit' } }}>
          <Agreements />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockApi.getAgreementTemplates).toHaveBeenCalled();
      expect(screen.getByLabelText('project_name')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Agreement Title'), {
      target: { value: 'UC11 Test Agreement' }
    });
    fireEvent.change(screen.getByLabelText('project_name'), {
      target: { value: 'Project Alpha' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Agreement' }));

    await waitFor(() => {
      expect(mockApi.createAgreement).toHaveBeenCalledWith(
        expect.objectContaining({ application_id: 8, title: 'UC11 Test Agreement' }),
        'token'
      );
    });
  });

  it('hides create form for researcher role', async () => {
    render(
      <MemoryRouter initialEntries={['/agreements']}>
        <AuthContext.Provider value={{ token: 'token', user: { role: 'researcher' } }}>
          <Agreements />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockApi.listAgreements).toHaveBeenCalled();
    });

    expect(screen.queryByRole('heading', { name: 'Create Agreement' })).not.toBeInTheDocument();
  });

  it('shows error when create is attempted without applicationId query param', async () => {
    render(
      <MemoryRouter initialEntries={['/agreements']}>
        <AuthContext.Provider value={{ token: 'token', user: { role: 'nonprofit' } }}>
          <Agreements />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockApi.getAgreementTemplates).toHaveBeenCalled();
      expect(screen.getByLabelText('project_name')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Agreement Title'), {
      target: { value: 'Needs app id' }
    });
    fireEvent.change(screen.getByLabelText('project_name'), {
      target: { value: 'Project Beta' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Agreement' }));

    expect(screen.getAllByText('applicationId query parameter is required to create agreement.').length).toBeGreaterThan(0);
    expect(mockApi.createAgreement).not.toHaveBeenCalled();
  });
});
