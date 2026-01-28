import React, { useState, useMemo } from 'react'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [activeCategory, setActiveCategory] = useState('general')

  const faqData = {
    general: {
      icon: '🎯',
      title: 'Getting Started',
      color: 'var(--mint-100)',
      questions: [
        {
          id: 'gen-1',
          question: 'What is TRIDENT?',
          answer: 'TRIDENT is a collaborative research platform that connects nonprofits seeking research partnerships with experienced researchers. We bridge the gap between organizations that need rigorous evidence and researchers who want to make real-world impact.'
        },
        {
          id: 'gen-2',
          question: 'Who can use TRIDENT?',
          answer: 'TRIDENT is designed for nonprofits and researchers. Nonprofits can post research collaborations, and researchers can discover opportunities and showcase their expertise. Organizations can also browse and connect with researchers directly.'
        },
        {
          id: 'gen-3',
          question: 'Is TRIDENT free to use?',
          answer: 'Yes! TRIDENT is free for both nonprofits and researchers to create accounts and browse opportunities. We believe research partnerships should focus on impact, not cost.'
        },
        {
          id: 'gen-4',
          question: 'How do I get started?',
          answer: 'Simply sign up as either a nonprofit or researcher, complete your profile, and you\'re ready to go. Nonprofits can post research needs, and researchers can browse and apply to projects that match their expertise.'
        }
      ]
    },
    nonprofit: {
      icon: '🏢',
      title: 'For Nonprofits',
      color: 'var(--pastel-sky)',
      questions: [
        {
          id: 'np-1',
          question: 'How do I post a research collaboration?',
          answer: 'Go to your Nonprofit Dashboard, click "Create New Project", and fill out the project details including your research needs, timeline, budget range, and desired outcomes. Once published, researchers can discover and apply to your project.'
        },
        {
          id: 'np-2',
          question: 'How can I browse researchers?',
          answer: 'Navigate to the "Browse Researchers" tab in your nonprofit dashboard. You can search by expertise, research methods, affiliation, or keywords. Click on any researcher to view their full profile and contact them directly.'
        },
        {
          id: 'np-3',
          question: 'Can I request specific researchers?',
          answer: 'Absolutely! Browse researchers, view their profiles, and use the "Contact Researcher" button to reach out. You can also mention preferred researchers when posting your project details.'
        },
        {
          id: 'np-4',
          question: 'What information should I include in my project post?',
          answer: 'Include a clear project title, detailed description of your research needs, preferred methodologies, timeline, budget range, desired outcomes, and any specific requirements or preferences for the research partner.'
        },
        {
          id: 'np-5',
          question: 'How are applications reviewed?',
          answer: 'When researchers apply to your project, you\'ll receive notifications and can review their profiles, experience, and application messages. You can then decide to move forward with discussions or interviews.'
        }
      ]
    },
    researcher: {
      icon: '🔬',
      title: 'For Researchers',
      color: 'var(--pastel-lavender)',
      questions: [
        {
          id: 'res-1',
          question: 'How do I make my profile discoverable?',
          answer: 'Complete your researcher profile with your affiliation, areas of expertise, research methods, tools/technologies, availability, hourly rate, and any relevant certifications. The more detailed your profile, the easier it is for nonprofits to find you.'
        },
        {
          id: 'res-2',
          question: 'What should I include in my expertise section?',
          answer: 'List your primary research domains (e.g., Public Health, Climate Change, Education), specific methodologies you use (e.g., Quantitative Analysis, RCTs), and tools/technologies (e.g., R, Python, SPSS). Be specific - this helps nonprofits find the right match.'
        },
        {
          id: 'res-3',
          question: 'How do I apply to projects?',
          answer: 'Browse available projects in the "Browse" section. Click on any project that matches your expertise, review the details, and submit your application with a message explaining why you\'re a good fit for the work.'
        },
        {
          id: 'res-4',
          question: 'Can I set my own rates?',
          answer: 'Yes! In your researcher profile, you can set your hourly rate range (minimum and maximum). You also specify your availability in hours per week. These help nonprofits understand your capacity and budget requirements.'
        },
        {
          id: 'res-5',
          question: 'How do I communicate with nonprofits?',
          answer: 'Once you apply to a project or a nonprofit contacts you directly, you can use the TRIDENT messaging system to discuss project details, negotiate terms, and clarify expectations before committing.'
        }
      ]
    },
    technical: {
      icon: '⚙️',
      title: 'Technical Questions',
      color: 'var(--pastel-peach)',
      questions: [
        {
          id: 'tech-1',
          question: 'What data do you collect and how is it protected?',
          answer: 'We collect profile information necessary to facilitate connections (name, email, expertise, etc.). Your data is encrypted and never shared with third parties without consent. We comply with GDPR and standard data protection practices.'
        },
        {
          id: 'tech-2',
          question: 'Is my personal information private?',
          answer: 'Yes. Your profile is visible to other TRIDENT users, but your personal contact information (phone, address) is kept private until you choose to share it with a specific contact.'
        },
        {
          id: 'tech-3',
          question: 'What email notifications will I receive?',
          answer: 'You\'ll receive notifications for project applications, messages, and project updates. You can customize your notification preferences in your account settings to control what, when, and how often you receive emails.'
        },
        {
          id: 'tech-4',
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your email, and you\'ll receive a password reset link. Click the link to create a new password. The link expires in 24 hours for security.'
        },
        {
          id: 'tech-5',
          question: 'Can I delete my account?',
          answer: 'Yes, you can soft-delete your account from your account settings. This removes your profile from search and makes your projects invisible. You can restore it within 30 days, or request permanent deletion.'
        }
      ]
    },
    safety: {
      icon: '🛡️',
      title: 'Safety & Trust',
      color: 'var(--pastel-lemon)',
      questions: [
        {
          id: 'safe-1',
          question: 'How do you verify user identities?',
          answer: 'We require email verification for all accounts. Researchers and nonprofits should provide verifiable information about their affiliation and experience. We\'re implementing additional verification features for institutional accounts.'
        },
        {
          id: 'safe-2',
          question: 'What if I encounter inappropriate behavior?',
          answer: 'We have a reporting system for inappropriate messages or conduct. Click the "Report" button on any message or profile, and our team will investigate within 24 hours. Violations of our community guidelines result in account suspension.'
        },
        {
          id: 'safe-3',
          question: 'Are there guidelines for research ethics?',
          answer: 'Yes! All research should comply with IRB requirements, ethical research standards, and applicable regulations (HIPAA, FERPA, etc.). Nonprofits and researchers should discuss and document these requirements before starting.'
        },
        {
          id: 'safe-4',
          question: 'How do contracts and agreements work?',
          answer: 'TRIDENT facilitates the connection, but agreements are between you and your collaborator. We recommend using formal contracts or MOUs, especially for funded research. Discuss payment, deliverables, and timelines clearly upfront.'
        }
      ]
    }
  }

  // Filter FAQs based on search query
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqData[activeCategory].questions
    }

    const query = searchQuery.toLowerCase()
    const currentCategoryQuestions = faqData[activeCategory].questions
    
    return currentCategoryQuestions.filter(q =>
      q.question.toLowerCase().includes(query) ||
      q.answer.toLowerCase().includes(query)
    )
  }, [searchQuery, activeCategory])

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const currentCategory = faqData[activeCategory]

  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content container-center py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="section-label mx-auto mb-3">Questions? We Have Answers</div>
          <h1 className="section-title mb-3">Frequently Asked Questions</h1>
          <p className="section-lead mx-auto mb-4">
            Find answers to common questions about TRIDENT, how to use our platform, and how to get the most out of your research partnerships.
          </p>

          {/* Search Box */}
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search frequently asked questions"
              />
              <button className="btn btn-gradient" type="button">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="d-flex flex-wrap gap-2 justify-content-center mb-5">
          {Object.entries(faqData).map(([key, category]) => (
            <button
              key={key}
              className={`btn ${activeCategory === key ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => {
                setActiveCategory(key)
                setSearchQuery('')
                setExpandedId(null)
              }}
              style={{
                background: activeCategory === key ? `linear-gradient(135deg, var(--mint-300), var(--mint-500))` : 'transparent',
                borderColor: activeCategory === key ? 'transparent' : 'var(--mint-200)',
                color: activeCategory === key ? 'white' : 'var(--mint-700)',
                fontWeight: '500'
              }}
            >
              <span className="me-2">{category.icon}</span>
              {category.title}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-4">
              <h4 style={{ color: 'var(--mint-700)', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                {currentCategory.icon} {currentCategory.title}
              </h4>
              {filteredFAQs.length === 0 && (
                <span className="badge bg-warning">No results</span>
              )}
            </div>

            {filteredFAQs.length > 0 ? (
              <div className="accordion" id={`accordion-${activeCategory}`}>
                {filteredFAQs.map((item, index) => (
                  <div key={item.id} className="accordion-item" style={{ border: 'none', marginBottom: '12px' }}>
                    <div
                      style={{
                        background: expandedId === item.id 
                          ? 'var(--mint-50)' 
                          : 'var(--primary-white)',
                        border: `2px solid ${expandedId === item.id ? 'var(--mint-200)' : 'var(--gray-200)'}`,
                        borderRadius: '12px',
                        padding: '0',
                        transition: 'all var(--transition-base)',
                        cursor: 'pointer'
                      }}
                    >
                      <h2 className="accordion-header" style={{ margin: 0 }}>
                        <button
                          className="accordion-button"
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          aria-expanded={expandedId === item.id}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--gray-900)',
                            fontWeight: '600',
                            padding: '1rem',
                            boxShadow: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>{item.question}</span>
                          <i 
                            className={`bi bi-chevron-right`}
                            style={{
                              transform: expandedId === item.id ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform var(--transition-base)',
                              color: 'var(--mint-600)',
                              minWidth: '24px'
                            }}
                          ></i>
                        </button>
                      </h2>
                      {expandedId === item.id && (
                        <div
                          style={{
                            padding: '0 1rem 1rem 1rem',
                            borderTop: '1px solid var(--mint-100)',
                            animation: 'fadeIn 0.2s ease-in'
                          }}
                        >
                          <p style={{ color: 'var(--gray-700)', lineHeight: '1.6', margin: 0 }}>
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  background: 'var(--gray-50)',
                  borderRadius: '12px',
                  border: '1px dashed var(--gray-200)'
                }}
              >
                <p className="text-muted mb-3">
                  <i className="bi bi-search" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}></i>
                  No results found for "{searchQuery}"
                </p>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setSearchQuery('')
                  }}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-5 p-4 text-center" style={{
          background: 'linear-gradient(135deg, rgba(240,253,249,0.5), rgba(204,251,241,0.3))',
          borderRadius: '14px',
          border: '1px solid var(--mint-100)'
        }}>
          <h5 className="fw-bold mb-2" style={{ color: 'var(--mint-700)' }}>
            Still have questions?
          </h5>
          <p className="text-muted mb-3">
            Can't find what you're looking for? We're here to help!
          </p>
          <a href="/contact" className="btn btn-gradient">
            <i className="bi bi-envelope-fill me-2"></i>
            Contact Us
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
