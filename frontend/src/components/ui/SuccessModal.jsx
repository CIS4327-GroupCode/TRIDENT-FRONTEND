import React, { useEffect } from 'react'

/**
 * Success Modal Component
 * Shows a success message and auto-redirects after a specified duration
 * 
 * @param {boolean} open - Controls modal visibility
 * @param {string} message - Success message to display
 * @param {number} duration - Time in milliseconds before redirect (default: 5000)
 * @param {Function} onRedirect - Callback function called after duration expires
 */
export default function SuccessModal({ 
  open = false, 
  message = 'Success!', 
  duration = 5000,
  onRedirect = () => {} 
}) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onRedirect()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [open, duration, onRedirect])

  if (!open) return null

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-body text-center p-5">
            {/* Success Icon */}
            <div className="mb-4">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10"
                style={{ width: '80px', height: '80px' }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  fill="currentColor" 
                  className="text-success" 
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
              </div>
            </div>

            {/* Success Title */}
            <h3 id="success-modal-title" className="fw-700 text-gray-900 mb-3">
              Account Created!
            </h3>

            {/* Success Message */}
            <p className="text-gray-700 mb-4" style={{ fontSize: '1.1rem' }}>
              {message}
            </p>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="progress" style={{ height: '4px' }}>
                <div 
                  className="progress-bar bg-mint-600" 
                  role="progressbar"
                  style={{
                    animation: `progressBar ${duration}ms linear forwards`,
                    width: '0%'
                  }}
                  aria-valuenow="0" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
            </div>

            {/* Redirect Message */}
            <p className="text-muted small mb-0">
              Redirecting to login in {duration / 1000} seconds...
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
