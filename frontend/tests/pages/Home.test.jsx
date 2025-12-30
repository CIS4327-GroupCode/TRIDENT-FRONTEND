/**
 * Unit Tests for Home Page
 * Tests main homepage rendering and component integration
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../src/pages/Home';

// Mock layout components that require auth context
jest.mock('../../src/components/TopBar', () => {
  return function MockTopBar() {
    return <div data-testid="topbar">TopBar Component</div>;
  };
});

jest.mock('../../src/components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer Component</div>;
  };
});

// Mock child components
jest.mock('../../src/components/Hero', () => {
  return function MockHero() {
    return <div data-testid="hero">Hero Component</div>;
  };
});

jest.mock('../../src/components/HowItWorks', () => {
  return function MockHowItWorks() {
    return <div data-testid="how-it-works">How It Works Component</div>;
  };
});

jest.mock('../../src/components/SearchPreview', () => {
  return function MockSearchPreview() {
    return <div data-testid="search-preview">Search Preview Component</div>;
  };
});

jest.mock('../../src/components/FeaturedProjects', () => {
  return function MockFeaturedProjects() {
    return <div data-testid="featured-projects">Featured Projects Component</div>;
  };
});

jest.mock('../../src/components/Trust', () => {
  return function MockTrust() {
    return <div data-testid="trust">Trust Component</div>;
  };
});

jest.mock('../../src/components/Metrics', () => {
  return function MockMetrics() {
    return <div data-testid="metrics">Metrics Component</div>;
  };
});

jest.mock('../../src/components/Newsletter', () => {
  return function MockNewsletter() {
    return <div data-testid="newsletter">Newsletter Component</div>;
  };
});

describe('Home Page', () => {
  it('should render all main sections', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument();
    expect(screen.getByTestId('search-preview')).toBeInTheDocument();
    expect(screen.getByTestId('featured-projects')).toBeInTheDocument();
    expect(screen.getByTestId('trust')).toBeInTheDocument();
    expect(screen.getByTestId('metrics')).toBeInTheDocument();
    expect(screen.getByTestId('newsletter')).toBeInTheDocument();
  });

  it('should render sections in correct order', () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const sections = Array.from(container.querySelectorAll('[data-testid]'));
    const sectionIds = sections.map(section => section.getAttribute('data-testid'));

    expect(sectionIds[0]).toBe('topbar');
    // Other sections follow in logical order
    expect(sectionIds).toContain('how-it-works');
    expect(sectionIds).toContain('search-preview');
  });
});
