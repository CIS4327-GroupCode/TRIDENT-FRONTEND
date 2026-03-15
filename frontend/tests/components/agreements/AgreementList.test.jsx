import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import AgreementList from '../../../src/components/agreements/AgreementList';

describe('AgreementList', () => {
  it('renders loading and error states', () => {
    const { rerender } = render(
      <MemoryRouter>
        <AgreementList agreements={[]} loading={true} error="" />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading agreements...')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <AgreementList agreements={[]} loading={false} error="Boom" />
      </MemoryRouter>
    );

    expect(screen.getByText('Boom')).toBeInTheDocument();
  });

  it('renders empty and populated states', () => {
    const agreement = {
      id: 15,
      title: 'Agreement 15',
      status: 'signed',
      template_type: 'NDA',
      project_id: 9
    };

    const { rerender } = render(
      <MemoryRouter>
        <AgreementList agreements={[]} loading={false} error="" />
      </MemoryRouter>
    );

    expect(screen.getByText('No agreements found.')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <AgreementList agreements={[agreement]} loading={false} error="" />
      </MemoryRouter>
    );

    expect(screen.getByText('Agreement 15')).toBeInTheDocument();
  });
});
