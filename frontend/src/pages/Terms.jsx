import React from 'react'
import InfoPageLayout from '../components/InfoPageLayout'

const sections = [
  {
    heading: 'Using The Platform',
    paragraphs: [
      'TRIDENT is intended to support lawful research collaboration, discovery, and communication between registered users.',
      'By using the platform, you agree to provide accurate account information, maintain the security of your credentials, and use the service in a way that does not harm other users or the system.'
    ]
  },
  {
    heading: 'User Responsibilities',
    paragraphs: [
      'Nonprofits and researchers remain responsible for the content they publish, the proposals they submit, and the agreements they form off-platform or through TRIDENT workflows.'
    ],
    items: [
      'Do not upload unlawful, deceptive, or abusive content.',
      'Do not impersonate other individuals or institutions.',
      'Honor any regulatory, contractual, or funding constraints tied to your research work.'
    ]
  },
  {
    heading: 'Service Boundaries',
    paragraphs: [
      'TRIDENT facilitates discovery and coordination, but it does not replace legal review, institutional approval, or independent due diligence.',
      'We may suspend or remove accounts that create security risks, violate community expectations, or misuse the platform.'
    ]
  }
]

const aside = {
  title: 'Operational Summary',
  paragraphs: [
    'Use these terms as the baseline for acceptable use, account security, and collaboration conduct.',
    'For project-specific work, users should still document their own contracts, data processing terms, and research approvals.'
  ],
  items: [
    { label: 'Support Email', value: 'legal@trident.org' },
    { label: 'Applies To', value: 'All visitors and registered users' },
    { label: 'Review Cycle', value: 'Updated with major product or policy changes' }
  ]
}

export default function Terms() {
  return (
    <InfoPageLayout
      eyebrow="Platform Rules"
      title="Terms Of Use"
      lead="The baseline expectations for using TRIDENT safely, accurately, and in good faith."
      sections={sections}
      aside={aside}
      quickLinks={[
        { to: '/privacy', label: 'Privacy' },
        { to: '/faq', label: 'FAQ' },
        { to: '/contact', label: 'Contact' }
      ]}
    />
  )
}