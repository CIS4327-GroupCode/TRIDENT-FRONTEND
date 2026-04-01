import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import './toast.css'

const ICONS = {
    success: 'bi-check-circle-fill',
    error: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill',
}

const BG_CLASSES = {
    success: 'text-bg-success',
    error: 'text-bg-danger',
    warning: 'text-bg-warning',
    info: 'text-bg-info',
}

function SingleToast({ toast, onDismiss }) {
    const [exiting, setExiting] = useState(false)

    useEffect(() => {
        if (toast.duration > 0) {
            const fadeTime = Math.max(toast.duration - 300, 0)
            const timer = setTimeout(() => setExiting(true), fadeTime)
            return () => clearTimeout(timer)
        }
    }, [toast.duration])

    function handleDismiss() {
        setExiting(true)
        setTimeout(() => onDismiss(toast.id), 300)
    }

    return (
        <div
            className={`toast-item toast show ${BG_CLASSES[toast.type] || 'text-bg-info'} ${exiting ? 'toast-exit' : 'toast-enter'}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <div className="d-flex align-items-center">
                <i className={`bi ${ICONS[toast.type] || 'bi-info-circle-fill'} me-2 toast-icon`}></i>
                <div className="toast-body flex-grow-1">{toast.message}</div>
                <button
                    type="button"
                    className="btn-close btn-close-white ms-2 me-2"
                    aria-label="Close"
                    onClick={handleDismiss}
                />
            </div>
        </div>
    )
}

export default function ToastContainer() {
    const { toasts, removeToast } = useToast()

    if (toasts.length === 0) return null

    return (
        <div className="toast-container-fixed position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1090 }}>
            {toasts.map((t) => (
                <SingleToast key={t.id} toast={t} onDismiss={removeToast} />
            ))}
        </div>
    )
}
