import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import MatchExplanation from '../../src/components/matching/MatchExplanation';

describe('MatchExplanation', () => {
  const scoreBreakdown = {
    expertise: 24,
    methods: 18,
    budget: 10,
    availability: 8,
    experience: 7,
    domain: 6
  };

  it('toggles expanded breakdown and renders strengths/concerns', () => {
    render(
      <MatchExplanation
        scoreBreakdown={scoreBreakdown}
        strengths={['Strong methods overlap']}
        concerns={['Rate may not fit budget']}
      />
    );

    expect(screen.getByText('Show Score Breakdown')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Show Score Breakdown'));

    expect(screen.getByText('Hide Score Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Expertise Match')).toBeInTheDocument();
    expect(screen.getByText('Research Methods')).toBeInTheDocument();
    expect(screen.getByText('Strong methods overlap')).toBeInTheDocument();
    expect(screen.getByText('Rate may not fit budget')).toBeInTheDocument();
  });
});
