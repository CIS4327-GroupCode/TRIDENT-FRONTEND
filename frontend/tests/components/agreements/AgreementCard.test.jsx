import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import AgreementCard from '../../../src/components/agreements/AgreementCard';

describe('AgreementCard', () => {
  it('renders agreement information and detail link', () => {
    const agreement = {
      id: 5,
      title: 'NDA 5',
      status: 'active',
      template_type: 'NDA',
      project_id: 3,
      project: { title: 'Project Three' },
      nonprofitUser: { name: 'Org A' }
    };

    render(
      <MemoryRouter>
        <AgreementCard agreement={agreement} />
      </MemoryRouter>
    );

    expect(screen.getByText('NDA 5')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open agreement' })).toHaveAttribute('href', '/agreements/5');
  });

  it('uses counterparty fallback when users are absent', () => {
    const agreement = {
      id: 6,
      title: 'NDA 6',
      status: 'draft',
      template_type: 'NDA',
      project_id: 2
    };

    render(
      <MemoryRouter>
        <AgreementCard agreement={agreement} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Counterparty: Counterparty/)).toBeInTheDocument();
  });
});
