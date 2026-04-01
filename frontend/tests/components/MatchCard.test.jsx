import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../../src/components/matching/InviteModal', () => () => <div>Invite Modal</div>);

import MatchCard from '../../src/components/matching/MatchCard';

describe('MatchCard', () => {
  const match = {
    researcher: {
      user_id: 100,
      name: 'Dr Researcher',
      title: 'Professor',
      institution: 'Uni',
      expertise: ['survey', 'analysis', 'stats', 'ethics', 'python', 'r'],
      methods: ['survey'],
      rate_min: 40,
      rate_max: 60,
      availability: '10h/week',
      projects_completed: 3,
      current_projects_count: 1,
      max_concurrent_projects: 3,
      available_start_date: '2026-04-10',
      compliance_certifications: 'IRB, FERPA'
    },
    matchScore: 88,
    scoreBreakdown: { expertise: 20, methods: 20, budget: 10, availability: 10, experience: 8, domain: 10 },
    strengths: ['Great fit'],
    concerns: [],
    hasApplied: false
  };

  it('renders researcher and supports profile, compare, dismiss and invite actions', () => {
    const onDismiss = jest.fn();
    const onToggleSelect = jest.fn();

    render(
      <MatchCard
        match={match}
        onDismiss={onDismiss}
        userRole="nonprofit"
        selectable={true}
        selected={false}
        onToggleSelect={onToggleSelect}
      />
    );

    expect(screen.getByText('Dr Researcher')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Compare/i));
    expect(onToggleSelect).toHaveBeenCalledWith(100);

    fireEvent.click(screen.getByText('View Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/researcher/100');

    fireEvent.click(screen.getByText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledWith(100);

    fireEvent.click(screen.getByText('Invite to Project'));
    expect(screen.getByText('Invite Modal')).toBeInTheDocument();
  });

  it('uses onInvite callback when provided', () => {
    const onInvite = jest.fn();

    render(
      <MatchCard
        match={match}
        userRole="nonprofit"
        onInvite={onInvite}
      />
    );

    fireEvent.click(screen.getByText('Invite to Project'));
    expect(onInvite).toHaveBeenCalledWith(100);
  });

  it('hides actions when showActions is false', () => {
    render(
      <MatchCard
        match={match}
        showActions={false}
        userRole="nonprofit"
      />
    );

    expect(screen.queryByText('View Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Invite to Project')).not.toBeInTheDocument();
    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
  });

  it('hides dismiss when already applied and hides invite for researcher role', () => {
    render(
      <MatchCard
        match={{ ...match, hasApplied: true }}
        userRole="researcher"
        onDismiss={jest.fn()}
      />
    );

    expect(screen.getByText('✓ Already Applied')).toBeInTheDocument();
    expect(screen.queryByText('Invite to Project')).not.toBeInTheDocument();
    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
  });

  it('renders compliance certifications as badges', () => {
    render(
      <MatchCard
        match={match}
        userRole="nonprofit"
      />
    );

    expect(screen.getByText('IRB ✓')).toBeInTheDocument();
    expect(screen.getByText('FERPA ✓')).toBeInTheDocument();
  });
});
