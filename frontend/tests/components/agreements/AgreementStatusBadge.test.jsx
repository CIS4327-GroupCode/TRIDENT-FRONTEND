import React from 'react';
import { render, screen } from '@testing-library/react';
import AgreementStatusBadge from '../../../src/components/agreements/AgreementStatusBadge';

describe('AgreementStatusBadge', () => {
  it('renders readable status label', () => {
    render(<AgreementStatusBadge status="pending_signature" />);

    expect(screen.getByText('Pending Signature')).toBeInTheDocument();
  });

  it('falls back to draft style for unknown status', () => {
    render(<AgreementStatusBadge status="unsupported_status" />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
});
