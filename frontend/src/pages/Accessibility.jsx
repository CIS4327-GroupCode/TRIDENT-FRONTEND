import React from 'react'
import InfoPageLayout from '../components/InfoPageLayout'

const sections = [
  {
    heading: 'Accessibility Commitment',
    paragraphs: [
      'TRIDENT is designed to support keyboard navigation, readable color contrast, meaningful labels, and responsive layouts across informational and application pages.',
      'We continue to improve usability for screen reader users, low-vision users, and users navigating the platform without a mouse.'
    ]
  },
  {
    heading: 'What We Review',
    paragraphs: [
      'Accessibility work is part of component-level QA for route navigation, forms, notifications, and informational content.'
    ],
    items: [
      'Semantic headings and landmark regions.',
      'Descriptive links and button labels.',
      'Visible focus states and keyboard reachability.',
      'Responsive content that remains readable on mobile and desktop.'
    ]
  },
  {
    heading: 'Reporting Barriers',
    paragraphs: [
      'If you encounter an accessibility barrier, send the page URL, assistive technology used, and a brief description of the issue so the team can reproduce it quickly.',
      'We prioritize barriers that block account access, messaging, project workflows, or policy information.'
    ]
  }
]

const aside = {
  title: 'Need Help Fast?',
  paragraphs: [
    'The fastest way to report an issue is by email so the team can triage the exact route and workflow involved.'
  ],
  items: [
    { label: 'Accessibility Inbox', value: 'accessibility@trident.org' },
    { label: 'Recommended Detail', value: 'URL, browser, device, assistive tech, expected result' },
    { label: 'Priority', value: 'Blocking navigation and form barriers' }
  ]
}

export default function Accessibility() {
  return (
    <InfoPageLayout
      eyebrow="Inclusive Access"
      title="Accessibility"
      lead="How TRIDENT supports accessible navigation, readable content, and issue reporting for usability barriers."
      sections={sections}
      aside={aside}
      quickLinks={[
        { to: '/faq', label: 'FAQ' },
        { to: '/privacy', label: 'Privacy' },
        { to: '/contact', label: 'Contact' }
      ]}
    />
  )
}