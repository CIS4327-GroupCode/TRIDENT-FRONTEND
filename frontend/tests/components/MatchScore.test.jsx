import React from 'react';
import { render, screen } from '@testing-library/react';
import MatchScore from '../../src/components/matching/MatchScore';

describe('MatchScore', () => {
  it('renders score and excellent label for >=80', () => {
    render(<MatchScore score={86} size="small" showLabel={true} />);

    expect(screen.getByText('86')).toBeInTheDocument();
    expect(screen.getByText('Excellent Match')).toBeInTheDocument();
  });

  it('renders good label for 60-79', () => {
    render(<MatchScore score={70} showLabel={true} />);

    expect(screen.getByText('Good Match')).toBeInTheDocument();
  });

  it('renders weak label and hides label when requested', () => {
    const { rerender } = render(<MatchScore score={40} showLabel={true} />);
    expect(screen.getByText('Weak Match')).toBeInTheDocument();

    rerender(<MatchScore score={40} showLabel={false} />);
    expect(screen.queryByText('Weak Match')).not.toBeInTheDocument();
  });
});
