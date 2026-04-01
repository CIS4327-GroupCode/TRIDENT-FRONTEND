import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewList from '../../src/components/reviews/ReviewList';

const buildReview = (id, status = 'active') => ({
  id,
  status,
  reviewer: { name: `Reviewer ${id}` },
  created_at: '2026-03-14T00:00:00.000Z',
  scores: { overall: 4 },
  comments: `Comment ${id}`
});

describe('ReviewList', () => {
  test('renders empty state', () => {
    render(<ReviewList reviews={[]} emptyMessage="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  test('renders moderation status badge when available', () => {
    render(<ReviewList reviews={[buildReview(1, 'flagged')]} />);
    expect(screen.getByText('flagged')).toBeInTheDocument();
  });

  test('supports pagination controls', () => {
    const reviews = [
      buildReview(1),
      buildReview(2),
      buildReview(3),
      buildReview(4),
      buildReview(5),
      buildReview(6)
    ];

    render(<ReviewList reviews={reviews} itemsPerPage={5} enablePagination={true} />);

    expect(screen.getByText('Comment 1')).toBeInTheDocument();
    expect(screen.queryByText('Comment 6')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('Comment 6')).toBeInTheDocument();
    expect(screen.queryByText('Comment 1')).not.toBeInTheDocument();
  });
});
