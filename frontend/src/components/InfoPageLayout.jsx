import React from 'react'
import { Link } from 'react-router-dom'
import TopBar from './TopBar'
import Footer from './Footer'

export default function InfoPageLayout({
  eyebrow,
  title,
  lead,
  sections,
  aside,
  quickLinks,
  children
}) {
  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content container-center py-5">
        <div className="text-center mb-5">
          <div className="section-label mx-auto mb-3">{eyebrow}</div>
          <h1 className="section-title mb-3">{title}</h1>
          <p className="section-lead mx-auto">{lead}</p>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card-soft p-4 p-lg-5 h-100">
              {sections.map((section) => (
                <section key={section.heading} className="mb-4 last-child-no-margin">
                  <h2 className="h5 fw-bold mb-3" style={{ color: 'var(--mint-700)' }}>
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-muted mb-3" style={{ lineHeight: '1.7' }}>
                      {paragraph}
                    </p>
                  ))}
                  {section.items ? (
                    <ul className="text-muted ps-3 mb-0" style={{ lineHeight: '1.7' }}>
                      {section.items.map((item) => (
                        <li key={item} className="mb-2">{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
              {children}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card-soft p-4 h-100">
              <h2 className="h5 fw-bold mb-3" style={{ color: 'var(--mint-700)' }}>
                {aside.title}
              </h2>
              {aside.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-muted mb-3" style={{ lineHeight: '1.7' }}>
                  {paragraph}
                </p>
              ))}
              {aside.items ? (
                <div className="d-flex flex-column gap-2 mt-4">
                  {aside.items.map((item) => (
                    <div
                      key={item.label}
                      className="p-3 rounded-3"
                      style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}
                    >
                      <div className="fw-semibold" style={{ color: 'var(--gray-900)' }}>{item.label}</div>
                      <div className="text-muted small">{item.value}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {quickLinks?.length ? (
                <div className="mt-4">
                  <h3 className="h6 fw-bold mb-3" style={{ color: 'var(--mint-700)' }}>
                    Related Pages
                  </h3>
                  <div className="d-flex flex-wrap gap-2">
                    {quickLinks.map((link) => (
                      <Link key={link.to} to={link.to} className="btn btn-outline-secondary btn-sm">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}