import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MilestoneTracker from '../../src/components/milestones/MilestoneTracker';

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({ token: 'token-abc' })
}));

jest.mock('../../src/config/api', () => ({
  getApiUrl: (path) => `http://localhost:5000${path}`
}));

jest.mock('../../src/components/milestones/MilestoneForm', () => {
  return function MockMilestoneForm(props) {
    return (
      <div>
        <div data-testid="mock-form-token">{props.token}</div>
        <button onClick={() => props.onSuccess({ id: 999, name: 'Created milestone' })}>mock-success</button>
        <button onClick={props.onCancel}>mock-cancel</button>
      </div>
    );
  };
});

describe('MilestoneTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url, options = {}) => {
      if (url.includes('/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            stats: { total: 1, completion_rate: 0, in_progress: 0, overdue: 0 }
          })
        });
      }

      if (options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ milestone: { id: 1, name: 'M1', status: 'completed' } })
        });
      }

      if (options.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({
          milestones: [{
            id: 1,
            name: 'M1',
            status: 'pending',
            due_date: '2026-12-30',
            days_until_due: 3,
            dependency: { id: 5, name: 'Parent', status: 'completed' }
          }]
        })
      });
    });

    window.confirm = jest.fn(() => true);
  });

  test('renders loading and then milestone list', async () => {
    render(<MilestoneTracker projectId={10} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(await screen.findByText('M1')).toBeInTheDocument();
    expect(screen.getByText(/depends on: parent/i)).toBeInTheDocument();
  });

  test('opens and closes modal form', async () => {
    render(<MilestoneTracker projectId={10} />);
    await screen.findByText('M1');

    fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));
    expect(screen.getByTestId('mock-form-token')).toHaveTextContent('token-abc');

    fireEvent.click(screen.getByText('mock-cancel'));
    await waitFor(() => expect(screen.queryByTestId('mock-form-token')).not.toBeInTheDocument());
  });

  test('appends new milestone after form success', async () => {
    render(<MilestoneTracker projectId={10} />);
    await screen.findByText('M1');

    fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));
    fireEvent.click(screen.getByText('mock-success'));

    expect(await screen.findByText('Created milestone')).toBeInTheDocument();
  });

  test('sends filter query when selecting completed filter', async () => {
    render(<MilestoneTracker projectId={10} />);
    await screen.findByText('M1');

    fireEvent.click(screen.getByRole('button', { name: /^completed$/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=completed'),
        expect.anything()
      );
    });
  });

  test('updates milestone status from dropdown', async () => {
    render(<MilestoneTracker projectId={10} />);
    await screen.findByText('M1');

    fireEvent.click(screen.getByText(/mark as completed/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects/10/milestones/1'),
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  test('deletes milestone after confirmation', async () => {
    render(<MilestoneTracker projectId={10} />);
    await screen.findByText('M1');

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects/10/milestones/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  test('shows empty state when no milestones are returned', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: async () => ({ milestones: [] })
    }));

    render(<MilestoneTracker projectId={10} />);

    expect(await screen.findByText(/no milestones found/i)).toBeInTheDocument();
  });
});
