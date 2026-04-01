import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import MatchFilters from '../../src/components/matching/MatchFilters';

describe('MatchFilters', () => {
  const baseFilters = {
    minScore: 10,
    sortBy: 'score',
    methods: [],
    requireCompliance: false,
    complianceFilter: ''
  };

  it('updates min score, sort, and methods', () => {
    const onFilterChange = jest.fn();

    render(
      <MatchFilters
        filters={baseFilters}
        onFilterChange={onFilterChange}
        availableMethods={['survey', 'interview']}
      />
    );

    fireEvent.change(screen.getByRole('slider'), { target: { value: '35' } });
    expect(onFilterChange).toHaveBeenCalledWith({ ...baseFilters, minScore: 35 });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'experience' } });
    expect(onFilterChange).toHaveBeenCalledWith({ ...baseFilters, sortBy: 'experience' });

    fireEvent.click(screen.getByText('survey'));
    expect(onFilterChange).toHaveBeenCalledWith({ ...baseFilters, methods: ['survey'] });

    onFilterChange.mockClear();
    render(
      <MatchFilters
        filters={{ ...baseFilters, methods: ['survey'] }}
        onFilterChange={onFilterChange}
        availableMethods={['survey', 'interview']}
      />
    );
    fireEvent.click(screen.getAllByText('survey')[1]);
    expect(onFilterChange).toHaveBeenCalledWith({ ...baseFilters, methods: [] });
  });

  it('resets filters to defaults', () => {
    const onFilterChange = jest.fn();

    render(
      <MatchFilters
        filters={{
          minScore: 85,
          sortBy: 'rate',
          methods: ['survey'],
          requireCompliance: true,
          complianceFilter: 'IRB'
        }}
        onFilterChange={onFilterChange}
        availableMethods={['survey']}
      />
    );

    fireEvent.click(screen.getByText('Reset'));
    expect(onFilterChange).toHaveBeenCalledWith({
      minScore: 50,
      sortBy: 'score',
      methods: [],
      requireCompliance: false,
      complianceFilter: ''
    });
  });

  it('updates compliance filters', () => {
    const onFilterChange = jest.fn();

    render(
      <MatchFilters
        filters={baseFilters}
        onFilterChange={onFilterChange}
        availableMethods={[]}
      />
    );

    fireEvent.click(screen.getByLabelText('Require certifications'));
    expect(onFilterChange).toHaveBeenCalledWith({ ...baseFilters, requireCompliance: true });

    fireEvent.change(screen.getByPlaceholderText('Filter certifications (e.g., IRB, FERPA)'), {
      target: { value: 'IRB, FERPA' }
    });
    expect(onFilterChange).toHaveBeenCalledWith({ ...baseFilters, complianceFilter: 'IRB, FERPA' });
  });
});
