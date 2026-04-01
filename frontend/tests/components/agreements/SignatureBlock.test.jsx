import React from 'react';
import { render, screen } from '@testing-library/react';
import SignatureBlock from '../../../src/components/agreements/SignatureBlock';

describe('SignatureBlock', () => {
  it('renders pending and signed signatures with timestamps and IP', () => {
    render(
      <SignatureBlock
        agreement={{
          nonprofit_signed_at: null,
          nonprofit_sign_ip: null,
          researcher_signed_at: '2026-03-15T12:00:00.000Z',
          researcher_sign_ip: '127.0.0.1'
        }}
      />
    );

    expect(screen.getByText('Pending Signature')).toBeInTheDocument();
    expect(screen.getByText('Signed')).toBeInTheDocument();
    expect(screen.getByText('IP: 127.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});
