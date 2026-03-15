import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('../../src/components/matching/MatchCard', () => ({ match, onDismiss, onToggleSelect }) => (
  <div>
    <span>{match.researcher.name}</span>
    <button onClick={() => onDismiss(match.researcher.user_id)}>Dismiss Row</button>
    <button onClick={() => onToggleSelect && onToggleSelect(match.researcher.user_id)}>Compare Row</button>
  </div>
));

import MatchList from '../../src/components/matching/MatchList';

describe('MatchList', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    Storage.prototype.getItem = jest.fn(() => 'token-123');
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads matches, supports load more and dismiss', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          matches: [
            {
              researcher: {
                user_id: 1,
                name: 'R1',
                methods: ['survey'],
                projects_completed: 3,
                rate_min: 40,
                available_start_date: '2026-03-20'
              },
              matchScore: 80,
              scoreBreakdown: { expertise: 20, methods: 20, budget: 10, availability: 10, experience: 10, domain: 10 },
              strengths: [],
              concerns: []
            }
          ],
          pagination: { total: 2, limit: 20, offset: 0, hasMore: true }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          matches: [
            {
              researcher: {
                user_id: 2,
                name: 'R2',
                methods: ['interview'],
                projects_completed: 6,
                rate_min: 60,
                available_start_date: '2026-04-01'
              },
              matchScore: 75,
              scoreBreakdown: { expertise: 20, methods: 20, budget: 10, availability: 8, experience: 7, domain: 10 },
              strengths: [],
              concerns: []
            }
          ],
          pagination: { total: 2, limit: 20, offset: 20, hasMore: false }
        })
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    render(<MatchList projectId={77} apiBaseUrl="http://localhost:4000" userRole="nonprofit" />);

    expect(await screen.findByText('R1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Load More'));
    expect(await screen.findByText('R2')).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('Dismiss Row')[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/matches/project/77/researcher/1/dismiss',
        expect.objectContaining({ method: 'POST' })
      );
    });

    fireEvent.click(screen.getByText('Compare Row'));
    expect(screen.getByText('1/3 selected')).toBeInTheDocument();
    expect(screen.getByText('Compare Researchers')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Clear Selection'));
    expect(screen.queryByText('Compare Researchers')).not.toBeInTheDocument();
  });

  it('shows retry on fetch error', async () => {
    global.fetch.mockResolvedValue({ ok: false, statusText: 'Bad Request' });

    render(<MatchList projectId={77} apiBaseUrl="http://localhost:4000" userRole="nonprofit" />);

    expect(await screen.findByText('Error Loading Matches')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Retry'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('shows empty state and supports lower minimum score action', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          matches: [
            {
              researcher: { user_id: 10, name: 'Initial', methods: ['survey'] },
              matchScore: 80,
              scoreBreakdown: { expertise: 20, methods: 20, budget: 10, availability: 10, experience: 10, domain: 10 },
              strengths: [],
              concerns: []
            }
          ],
          pagination: { total: 1, limit: 20, offset: 0, hasMore: false }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matches: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matches: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } })
      });

    render(<MatchList projectId={77} apiBaseUrl="http://localhost:4000" userRole="nonprofit" />);

    expect(await screen.findByText('Initial')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider'), { target: { value: '85' } });

    expect(await screen.findByText('No Matches Found')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Lower Minimum Score'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  it('alerts when dismiss fails', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          matches: [
            {
              researcher: { user_id: 1, name: 'R1', methods: ['survey'] },
              matchScore: 80,
              scoreBreakdown: { expertise: 20, methods: 20, budget: 10, availability: 10, experience: 10, domain: 10 },
              strengths: [],
              concerns: []
            }
          ],
          pagination: { total: 1, limit: 20, offset: 0, hasMore: false }
        })
      })
      .mockResolvedValueOnce({ ok: false, statusText: 'Forbidden' });

    render(<MatchList projectId={77} apiBaseUrl="http://localhost:4000" userRole="nonprofit" />);

    expect(await screen.findByText('R1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dismiss Row'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to dismiss match. Please try again.');
    });
  });
});
