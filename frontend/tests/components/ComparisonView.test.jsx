import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ComparisonView from '../../src/components/matching/ComparisonView';

const sampleMatches = [
  {
    researcher: {
      user_id: 1,
      name: 'Researcher One',
      title: 'Dr',
      institution: 'Uni A',
      rate_min: 50,
      rate_max: 80,
      projects_completed: 4,
      availability: '20h/week'
    },
    matchScore: 87,
    strengths: ['Strong methods overlap']
  },
  {
    researcher: {
      user_id: 2,
      name: 'Researcher Two',
      title: 'Prof',
      institution: 'Uni B',
      rate_min: 70,
      rate_max: 100,
      projects_completed: 10,
      availability: '10h/week'
    },
    matchScore: 72,
    strengths: ['Good domain fit']
  }
];

describe('ComparisonView', () => {
  it('renders selected researchers and allows clear action', () => {
    const onClear = jest.fn();

    render(
      <ComparisonView selectedMatches={sampleMatches} onInvite={jest.fn()} onClear={onClear} />
    );

    expect(screen.getByText('Compare Researchers')).toBeInTheDocument();
    expect(screen.getByText('Researcher One')).toBeInTheDocument();
    expect(screen.getByText('Researcher Two')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear Selection'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('calls onInvite when invite button is clicked', () => {
    const onInvite = jest.fn();

    render(
      <ComparisonView selectedMatches={sampleMatches} onInvite={onInvite} onClear={jest.fn()} />
    );

    fireEvent.click(screen.getAllByText('Invite')[0]);
    expect(onInvite).toHaveBeenCalledWith(1);
  });

  it('renders N/A/fallback ranges when researcher values are missing', () => {
    render(
      <ComparisonView
        selectedMatches={[
          {
            researcher: { user_id: 3, name: 'R3' },
            matchScore: 50,
            strengths: []
          }
        ]}
        onInvite={jest.fn()}
        onClear={jest.fn()}
      />
    );

    expect(screen.getByText('$N/A/hr')).toBeInTheDocument();
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
  });
});
