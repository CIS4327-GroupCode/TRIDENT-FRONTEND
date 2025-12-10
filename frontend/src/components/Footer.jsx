import React from 'react'

export default function Footer(){
  return (
    <footer className="bg-dark text-white py-5 mt-4">
      <div className="container-center d-flex flex-column flex-md-row justify-content-between gap-3 align-items-start">
        <div>
          <a href="#contact" className="text-white me-3">Contact</a>
          <a href="#privacy" className="text-white me-3">Privacy</a>
          <a href="#terms" className="text-white me-3">Terms</a>
          <a href="#accessibility" className="text-white me-3">Accessibility</a>
          <a href="#press" className="text-white">Press</a>
        </div>
        <div className="text-muted" style={{maxWidth: '360px'}}>
          <strong>Compliance & ethics</strong>
          <p>We provide IRB/FERPA guidance and data governance resources for projects involving human subjects. See our resources page for details.</p>
        </div>
        <div>@trident</div>
      </div>
    </footer>
  )
}
