/**
 * Unit Tests for Hero Component
 * Tests rendering of the hero section on homepage
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Hero from '../../src/components/Hero';

describe('Hero Component', () => {
  it('should render hero heading', () => {
    render(<Hero />);
    
    const heading = screen.getByText(/Evidence, on demand/i);
    expect(heading).toBeInTheDocument();
  });

  it('should render description text', () => {
    render(<Hero />);
    
    const description = screen.getByText(/Find research partners/i);
    expect(description).toBeInTheDocument();
  });

  it('should render nonprofit button', () => {
    render(<Hero />);
    
    const nonprofitButton = screen.getByText("I'm a Nonprofit");
    expect(nonprofitButton).toBeInTheDocument();
    expect(nonprofitButton).toHaveClass('btn-primary');
  });

  it('should render researcher button', () => {
    render(<Hero />);
    
    const researcherButton = screen.getByText("I'm a Researcher");
    expect(researcherButton).toBeInTheDocument();
    expect(researcherButton).toHaveClass('btn-outline-primary');
  });

  it('should render video placeholder', () => {
    render(<Hero />);
    
    const videoPlaceholder = screen.getByText(/Optional explainer video/i);
    expect(videoPlaceholder).toBeInTheDocument();
  });

  it('should have correct layout structure', () => {
    const { container } = render(<Hero />);
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-4');
    
    const card = container.querySelector('.card');
    expect(card).toBeInTheDocument();
  });
});
