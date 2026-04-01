import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AgreementForm from '../../../src/components/agreements/AgreementForm';

describe('AgreementForm', () => {
  const templates = [
    {
      type: 'NDA',
      requiredVariables: ['project_name', 'effective_date']
    }
  ];

  it('submits selected template, title and variables', () => {
    const onSubmit = jest.fn();

    render(
      <AgreementForm templates={templates} onSubmit={onSubmit} submitting={false} />
    );

    fireEvent.change(screen.getByLabelText('Agreement Title'), {
      target: { value: 'NDA for Project' }
    });
    fireEvent.change(screen.getByLabelText('project_name'), {
      target: { value: 'UC11 Pilot' }
    });
    fireEvent.change(screen.getByLabelText('effective_date'), {
      target: { value: '2026-03-15' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Agreement' }));

    expect(onSubmit).toHaveBeenCalledWith({
      template_type: 'NDA',
      title: 'NDA for Project',
      variables: {
        project_name: 'UC11 Pilot',
        effective_date: '2026-03-15'
      }
    });
  });
});
