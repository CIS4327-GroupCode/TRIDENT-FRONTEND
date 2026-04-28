import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from '../../src/components/Footer'

describe('Footer', () => {
  it('exposes route-backed informational links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/faq')
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'Accessibility' })).toHaveAttribute('href', '/accessibility')
    expect(screen.getByRole('link', { name: 'Press' })).toHaveAttribute('href', '/press')
  })
})