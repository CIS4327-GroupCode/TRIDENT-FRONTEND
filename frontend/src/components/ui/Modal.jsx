import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ open, onClose, children }){
  useEffect(() => {
    function onKey(e){ if(e.key === 'Escape') onClose() }
    if(open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if(!open) return null
  const modalRoot = document.getElementById('modal-root') || document.body

  return createPortal(
    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-backdrop-custom" onClick={onClose} />
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  )
}
