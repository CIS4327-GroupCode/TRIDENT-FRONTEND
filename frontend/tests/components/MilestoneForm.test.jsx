import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MilestoneForm from '../../src/components/milestones/MilestoneForm';

jest.mock('../../src/config/api', () => ({
  getApiUrl: (path) => `http://localhost:5000${path}`
}));

describe('MilestoneForm', () => {
  const onSuccess = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ milestone: { id: 1, name: 'New Milestone' } })
    });
  });

  test('renders create mode fields', () => {
    render(
      <MilestoneForm
        projectId={7}
        token="token-123"
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    );

    expect(screen.getByLabelText(/milestone name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/depends on/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create milestone/i })).toBeInTheDocument();
  });

  test('renders edit mode with prefilled values', () => {
    render(
      <MilestoneForm
        projectId={7}
        token="token-123"
        milestone={{ id: 2, name: 'Edit Me', status: 'in_progress', depends_on: 1 }}
        availableMilestones={[{ id: 1, name: 'Parent Milestone' }, { id: 2, name: 'Edit Me' }]}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    );

    expect(screen.getByDisplayValue('Edit Me')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Parent Milestone')).toBeInTheDocument();
  });

  test('submits create request with token header', async () => {
    render(
      <MilestoneForm
        projectId={7}
        token="token-123"
        availableMilestones={[{ id: 9, name: 'Dependency A' }]}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    );

    fireEvent.change(screen.getByLabelText(/milestone name/i), { target: { value: 'MS1' } });
    fireEvent.change(screen.getByLabelText(/depends on/i), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: /create milestone/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/projects/7/milestones',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer token-123' })
        })
      );
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  test('maps empty dependency to null in payload', async () => {
    render(
      <MilestoneForm
        projectId={7}
        token="token-123"
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    );

    fireEvent.change(screen.getByLabelText(/milestone name/i), { target: { value: 'MS2' } });
    fireEvent.click(screen.getByRole('button', { name: /create milestone/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const [, requestInit] = fetch.mock.calls[0];
    const payload = JSON.parse(requestInit.body);
    expect(payload.depends_on).toBeNull();
  });

  test('shows backend error message', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to save milestone' })
    });

    render(
      <MilestoneForm
        projectId={7}
        token="token-123"
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    );

    fireEvent.change(screen.getByLabelText(/milestone name/i), { target: { value: 'MS3' } });
    fireEvent.click(screen.getByRole('button', { name: /create milestone/i }));

    expect(await screen.findByText('Failed to save milestone')).toBeInTheDocument();
  });

  test('invokes cancel callback', () => {
    render(
      <MilestoneForm
        projectId={7}
        token="token-123"
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
