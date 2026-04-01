import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

const DURATIONS = {
    success: 5000,
    error: 8000,
    warning: 6000,
    info: 5000,
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const idRef = useRef(0)

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const showToast = useCallback((message, type = 'info', duration) => {
        const id = ++idRef.current
        const ms = duration ?? DURATIONS[type] ?? 5000
        setToasts((prev) => [...prev, { id, message, type, duration: ms }])
        if (ms > 0) {
            setTimeout(() => removeToast(id), ms)
        }
        return id
    }, [removeToast])

    const success = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast])
    const error = useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast])
    const warning = useCallback((msg, duration) => showToast(msg, 'warning', duration), [showToast])
    const info = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast])

    const value = { toasts, showToast, removeToast, success, error, warning, info }

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return ctx
}

export default ToastContext
