import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('../../src/components/matching/MatchList', () => ({ projectId, userRole }) => (
  <div data-testid="match-list-mock">
    MatchList Mock - projectId: {projectId} - role: {userRole}
  </div>
));

import ProjectMatchesView from '../../src/components/matching/ProjectMatchesView';

describe('ProjectMatchesView', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads open projects and auto-selects the first one', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        projects: [
          { project_id: 11, title: 'Open Project A', status: 'open' },
          { project_id: 99, title: 'Closed Project', status: 'closed' }
        ]
      })
    });

    render(<ProjectMatchesView apiBaseUrl="http://localhost:4000" />);

    expect(await screen.findByText('Matches for: Open Project A')).toBeInTheDocument();
    expect(screen.getByTestId('match-list-mock')).toHaveTextContent('projectId: 11');
    expect(screen.queryByText('Select Project')).not.toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/api/projects', expect.any(Object));
  });

  it('shows selector when multiple open projects and switches selected project', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        projects: [
          { project_id: 21, title: 'Open One', status: 'open' },
          { project_id: 22, title: 'Open Two', status: 'open' }
        ]
      })
    });

    render(<ProjectMatchesView apiBaseUrl="http://localhost:4000" />);

    expect(await screen.findByText('Select Project')).toBeInTheDocument();
    expect(screen.getByText('Matches for: Open One')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('Open One'), { target: { value: '22' } });

    expect(screen.getByText('Matches for: Open Two')).toBeInTheDocument();
    expect(screen.getByTestId('match-list-mock')).toHaveTextContent('projectId: 22');
    expect(screen.getByTestId('match-list-mock')).toHaveTextContent('role: nonprofit');
  });

  it('renders empty state when no open projects exist', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        projects: [{ project_id: 1, title: 'Closed', status: 'closed' }]
      })
    });

    render(<ProjectMatchesView apiBaseUrl="http://localhost:4000" />);

    expect(await screen.findByText('No Open Projects')).toBeInTheDocument();
    expect(screen.queryByTestId('match-list-mock')).not.toBeInTheDocument();
  });

  it('renders error state when request fails and hides loading', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request'
    });

    render(<ProjectMatchesView apiBaseUrl="http://localhost:4000" />);

    expect(await screen.findByText('Error Loading Projects')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch projects')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });
  });
});
