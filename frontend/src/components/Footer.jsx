import React from 'react'

export default function Footer(){
  return (
    <footer className="footer-modern" role="contentinfo">
      <div className="container-center d-flex flex-column flex-md-row justify-content-between gap-3 align-items-start">
        <nav aria-label="Footer navigation">
          <a href="#contact" className="footer-link">Contact</a>
          <a href="#privacy" className="footer-link">Privacy</a>
          <a href="#terms" className="footer-link">Terms</a>
          <a href="#accessibility" className="footer-link">Accessibility</a>
          <a href="#press" className="footer-link">Press</a>
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
