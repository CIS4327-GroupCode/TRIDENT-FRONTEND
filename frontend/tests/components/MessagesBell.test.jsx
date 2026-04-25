import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MessagesBell from '../../src/components/notifications/MessagesBell';
import { useAuth } from '../../src/auth/AuthContext';
import { getThreads, markThreadRead } from '../../src/utils/messages';

const mockNavigate = jest.fn();

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/utils/messages', () => ({
  getThreads: jest.fn(),
  markThreadRead: jest.fn(),
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('MessagesBell', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAuth.mockReturnValue({
      user: { id: 1, role: 'researcher' },
    });

    getThreads.mockResolvedValue({
      threads: [
        {
          id: 22,
          display_name: 'Read Thread',
          unread_count: 0,
          last_message_at: '2026-04-02T10:00:00.000Z',
          last_message: { body: 'Already read' },
        },
        {
          id: 11,
          display_name: 'Unread Thread',
          unread_count: 3,
          last_message_at: '2026-04-01T10:00:00.000Z',
          last_message: { body: 'Needs your attention' },
        },
      ],
    });

    markThreadRead.mockResolvedValue({ success: true });
  });

  it('renders unread count badge on envelope icon', () => {
    render(
      <MemoryRouter>
        <MessagesBell unreadCount={5} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('5 unread messages')).toBeInTheDocument();
  });

  it('shows unread threads first and navigates to thread on click while marking as read', async () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

    render(
      <MemoryRouter>
        <MessagesBell unreadCount={5} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /messages, 5 unread/i }));

    await waitFor(() => {
      expect(getThreads).toHaveBeenCalledTimes(1);
    });

    const orderedNames = Array.from(document.querySelectorAll('.messages-thread-name')).map(
      (node) => node.textContent
    );

    expect(orderedNames[0]).toBe('Unread Thread');
    expect(orderedNames[1]).toBe('Read Thread');

    fireEvent.click(screen.getByText('Unread Thread').closest('button'));

    await waitFor(() => {
      expect(markThreadRead).toHaveBeenCalledWith(11);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/messages?thread=11');

    const unreadEventCall = dispatchSpy.mock.calls.find(
      ([event]) => event?.type === 'messages-unread-updated'
    );

    expect(unreadEventCall).toBeDefined();
    expect(unreadEventCall[0].detail).toEqual({ unreadTotal: 2 });

    dispatchSpy.mockRestore();
  });
});
