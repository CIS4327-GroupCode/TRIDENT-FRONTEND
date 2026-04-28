import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer(){
  const links = [
    { to: '/contact', label: 'Contact' },
    { to: '/faq', label: 'FAQ' },
    { to: '/privacy', label: 'Privacy' },
    { to: '/terms', label: 'Terms' },
    { to: '/accessibility', label: 'Accessibility' },
    { to: '/press', label: 'Press' }
  ]

  return (
    <footer className="footer-modern" role="contentinfo">
      <div className="container-center d-flex flex-column flex-md-row justify-content-between gap-3 align-items-start">
        <nav aria-label="Footer navigation">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="footer-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <section className="text-smokewhite" style={{maxWidth: '360px'}}>
          <strong id="compliance-heading">Compliance & ethics</strong>
          <p className="mb-0" aria-describedby="compliance-heading">IRB/FERPA guidance, data governance resources, and ethics checklists for human subjects work.</p>
        </section>
        <div className="text-smokewhite">© 2026 Trident</div>
      </div>
    </footer>
  )
}
