import React from 'react';
import { render, screen } from '@testing-library/react';
import ReviewSummary from '../../src/components/reviews/ReviewSummary';

describe('ReviewSummary', () => {
  it('shows empty-state when no reviews are available', () => {
    render(<ReviewSummary summary={{ count: 0, averages: { overall: 0, quality: 0, communication: 0, timeliness: 0 } }} />);

    expect(screen.getByText('No reviews yet.')).toBeInTheDocument();
  });

  it('renders average values when summary has data', () => {
    render(
      <ReviewSummary
        summary={{
          count: 4,
          averages: {
            overall: 4.25,
            quality: 4,
            communication: 4.5,
            timeliness: 4.25
          }
        }}
      />
    );

    expect(screen.getByText('4 reviews')).toBeInTheDocument();
    expect(screen.getByText('4.3/5')).toBeInTheDocument();
    expect(screen.getByText('Quality: 4.0/5')).toBeInTheDocument();
  });
});
