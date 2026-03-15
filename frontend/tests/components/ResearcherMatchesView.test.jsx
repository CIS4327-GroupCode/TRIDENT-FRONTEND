import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
jest.mock('../../src/components/matching/ApplyModal', () => ({ onClose, onSuccess }) => (
  <div>
    <span>Apply Modal</span>
    <button onClick={onClose}>Close Apply</button>
    <button onClick={onSuccess}>Success Apply</button>
  </div>
));
import ResearcherMatchesView from '../../src/components/matching/ResearcherMatchesView';

describe('ResearcherMatchesView', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    Storage.prototype.getItem = jest.fn(() => 'test-token');
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders project matches and dismisses with Not Interested', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          matches: [
            {
              project: {
                project_id: 55,
                title: 'Community Health Study',
                problem: 'Need survey analysis',
                budget_min: 1000,
                budget_max: 2000,
                organization: { name: 'Health Org' }
              },
              matchScore: 80
            }
          ],
          pagination: { total: 1, limit: 20, offset: 0, hasMore: false }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

    render(<ResearcherMatchesView apiBaseUrl="http://localhost:4000" userId={101} />);

    expect(await screen.findByText('Community Health Study')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Not Interested'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/matches/project/55/researcher/101/dismiss',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('renders empty state when no matches are returned', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        matches: [],
        pagination: { total: 0, limit: 20, offset: 0, hasMore: false }
      })
    });

    render(<ResearcherMatchesView apiBaseUrl="http://localhost:4000" userId={101} />);

    expect(await screen.findByText('No Matching Projects Found')).toBeInTheDocument();
  });

  it('renders error state and retries successfully', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: false, statusText: 'Bad Request' })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          matches: [
            {
              project: { project_id: 1, title: 'Recovered Project', problem: 'Recovered', organization: { name: 'Org' } },
              matchScore: 70
            }
          ],
          pagination: { total: 1, limit: 20, offset: 0, hasMore: false }
        })
      });

    render(<ResearcherMatchesView apiBaseUrl="http://localhost:4000" userId={101} />);

    expect(await screen.findByText('Error Loading Matches')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Retry'));

    expect(await screen.findByText('Recovered Project')).toBeInTheDocument();
  });

  it('supports load more, budget sorting and apply modal actions', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          matches: [
            {
              project: { project_id: 2, title: 'Low Budget', budget_max: 1000, problem: 'A', organization: { name: 'Org' } },
              matchScore: 60
            },
            {
              project: { project_id: 3, title: 'High Budget', budget_max: 9000, problem: 'B', organization: { name: 'Org' } },
              matchScore: 62
            }
          ],
          pagination: { total: 3, limit: 20, offset: 0, hasMore: true }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          matches: [
            {
              project: { project_id: 2, title: 'Low Budget', budget_max: 1000, problem: 'A', organization: { name: 'Org' } },
              matchScore: 60
            },
            {
              project: { project_id: 3, title: 'High Budget', budget_max: 9000, problem: 'B', organization: { name: 'Org' } },
              matchScore: 62
            }
          ],
          pagination: { total: 3, limit: 20, offset: 0, hasMore: true }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          matches: [
            {
              project: { project_id: 4, title: 'Loaded More', budget_max: 3000, problem: 'C', organization: { name: 'Org' } },
              matchScore: 64
            }
          ],
          pagination: { total: 3, limit: 20, offset: 20, hasMore: false }
        })
      });

    render(<ResearcherMatchesView apiBaseUrl="http://localhost:4000" userId={101} />);

    expect(await screen.findByText('Low Budget')).toBeInTheDocument();
    expect(screen.getByText('High Budget')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('Match Score'), { target: { value: 'budget' } });

    fireEvent.click(screen.getAllByText('Apply to Project')[0]);
    expect(screen.getByText('Apply Modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Success Apply'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    const loadMoreButton = await screen.findByText('Load More');
    fireEvent.click(loadMoreButton);
    expect(await screen.findByText('Loaded More')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('alerts when dismiss fails', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          matches: [
            {
              project: { project_id: 55, title: 'Dismiss Fail', problem: 'Need survey analysis', organization: { name: 'Org' } },
              matchScore: 80
            }
          ],
          pagination: { total: 1, limit: 20, offset: 0, hasMore: false }
        })
      })
      .mockResolvedValueOnce({ ok: false, statusText: 'Forbidden' });

    render(<ResearcherMatchesView apiBaseUrl="http://localhost:4000" userId={101} />);

    expect(await screen.findByText('Dismiss Fail')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Not Interested'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to dismiss match. Please try again.');
    });
  });
});
