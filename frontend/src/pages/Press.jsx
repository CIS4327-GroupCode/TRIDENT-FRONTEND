import React from 'react'
import InfoPageLayout from '../components/InfoPageLayout'

const sections = [
  {
    heading: 'About TRIDENT',
    paragraphs: [
      'TRIDENT helps nonprofits and researchers find each other, coordinate research collaborations, and manage project communication in one workspace.',
      'The platform is built around discoverability, trust, and lightweight workflows that reduce friction between mission-driven organizations and research partners.'
    ]
  },
  {
    heading: 'Brand Assets',
    paragraphs: [
      'The following static files are available for product previews, browser assets, and simple brand references. Use them without modifying attribution or implying endorsement.'
    ]
  }
]

const aside = {
  title: 'Media Contact',
  paragraphs: [
    'For product updates, interview requests, or launch notes, contact the TRIDENT communications team.'
  ],
  items: [
    { label: 'Press Email', value: 'press@trident.org' },
    { label: 'Topics', value: 'Research collaboration, product updates, platform milestones' },
    { label: 'Turnaround', value: '1 to 2 business days' }
  ]
}

const assets = [
  { href: '/favicon.ico', label: 'Favicon (.ico)', description: 'Default browser icon' },
  { href: '/favicon-32x32.png', label: '32x32 Icon (.png)', description: 'Compact icon asset' },
  { href: '/apple-touch-icon.png', label: 'Apple Touch Icon (.png)', description: 'Home screen icon for Apple devices' },
  { href: '/android-chrome-512x512.png', label: '512x512 App Icon (.png)', description: 'High resolution app icon' },
  { href: '/site.webmanifest', label: 'Site Manifest', description: 'Web app metadata and icon mapping' }
]

export default function Press() {
  return (
    <InfoPageLayout
      eyebrow="Media & Assets"
      title="Press"
      lead="Product summary, contact details, and direct access to the currently shipped public brand assets."
      sections={sections}
      aside={aside}
      quickLinks={[
        { to: '/contact', label: 'Contact' },
        { to: '/privacy', label: 'Privacy' },
        { to: '/faq', label: 'FAQ' }
      ]}
    >
      <div className="row g-3 mt-1">
        {assets.map((asset) => (
          <div key={asset.href} className="col-md-6">
            <a
              href={asset.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none d-block h-100"
            >
              <div
                className="p-3 rounded-3 h-100"
                style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}
              >
                <div className="fw-semibold mb-1" style={{ color: 'var(--gray-900)' }}>{asset.label}</div>
                <div className="text-muted small">{asset.description}</div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </InfoPageLayout>
  )
}