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
    
    const heading = screen.getByText(/Match nonprofits with expert researchers in days, not months\./i);
    expect(heading).toBeInTheDocument();
  });

  it('should render description text', () => {
    render(<Hero />);
    
    const description = screen.getByText(/Design, run, and evaluate social impact projects/i);
    expect(description).toBeInTheDocument();
  });

  it('should render nonprofit button', () => {
    render(<Hero />);
    
    const nonprofitButton = screen.getByText("Post a nonprofit brief");
    expect(nonprofitButton).toBeInTheDocument();
    expect(nonprofitButton).toHaveClass('btn-soft');
  });

  it('should render browse button', () => {
    render(<Hero />);
    
    const browseButton = screen.getByText("Browse active briefs");
    expect(browseButton).toBeInTheDocument();
    expect(browseButton).toHaveClass('btn-gradient');
  });

  it('should render video placeholder', () => {
    render(<Hero />);
    
    const videoPlaceholder = screen.getByText(/Intro walkthrough \(1:10\)/i);
    expect(videoPlaceholder).toBeInTheDocument();
  });

  it('should have correct layout structure', () => {
    const { container } = render(<Hero />);
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('hero');
    
    const card = container.querySelector('.hero-card');
    expect(card).toBeInTheDocument();
  });
});
