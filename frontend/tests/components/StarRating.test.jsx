import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import StarRating from '../../src/components/reviews/StarRating';

describe('StarRating', () => {
  it('renders filled stars for provided value', () => {
    const { container } = render(<StarRating value={3} readOnly />);

    expect(container.querySelectorAll('.bi-star-fill').length).toBe(3);
    expect(container.querySelectorAll('.bi-star').length).toBe(2);
  });

  it('calls onChange when interactive star is clicked', () => {
    const onChange = jest.fn();
    render(<StarRating value={0} readOnly={false} onChange={onChange} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[3]);

    expect(onChange).toHaveBeenCalledWith(4);
  });
});
