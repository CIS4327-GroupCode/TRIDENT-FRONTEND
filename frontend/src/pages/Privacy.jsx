import React from 'react'
import InfoPageLayout from '../components/InfoPageLayout'

const sections = [
  {
    heading: 'What We Collect',
    paragraphs: [
      'TRIDENT collects the account, profile, collaboration, and communication details needed to connect nonprofits and researchers on the platform.',
      'This includes identity data such as your name and email address, profile details like expertise or organizational focus, and activity records tied to applications, agreements, notifications, and messages.'
    ]
  },
  {
    heading: 'How We Use Data',
    paragraphs: [
      'We use your information to operate the platform, secure accounts, deliver notifications, and help users discover relevant collaborators.',
      'Operational analytics and moderation reviews are limited to improving product reliability, trust, and support response.'
    ],
    items: [
      'Match nonprofits with relevant researchers and projects.',
      'Send transactional emails such as verification, password reset, and project updates.',
      'Investigate abuse reports, fraud signals, and service misuse.'
    ]
  },
  {
    heading: 'Data Handling Principles',
    paragraphs: [
      'We apply role-based access, audit logging, and least-privilege access patterns to reduce exposure of sensitive records.',
      'Users remain responsible for handling regulated research data according to their own IRB, FERPA, HIPAA, grant, or institutional requirements.'
    ]
  }
]

const aside = {
  title: 'Privacy At A Glance',
  paragraphs: [
    'Platform profile data is visible only within the collaboration context needed for discovery and coordination.',
    'If you need deletion, export, or correction support, contact the TRIDENT team directly.'
  ],
  items: [
    { label: 'Support Email', value: 'privacy@trident.org' },
    { label: 'Response Window', value: 'Within 5 business days' },
    { label: 'Scope', value: 'Account, profile, message, and notification records' }
  ]
}

export default function Privacy() {
  return (
    <InfoPageLayout
      eyebrow="Transparency & Trust"
      title="Privacy Notice"
      lead="How TRIDENT collects, uses, and safeguards account and collaboration information across the platform."
      sections={sections}
      aside={aside}
      quickLinks={[
        { to: '/terms', label: 'Terms' },
        { to: '/accessibility', label: 'Accessibility' },
        { to: '/contact', label: 'Contact' }
      ]}
    />
  )
}