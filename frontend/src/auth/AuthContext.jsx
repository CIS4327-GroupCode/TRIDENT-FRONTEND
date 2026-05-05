import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES, getDefaultRouteForRole, hasPermission } from './permissions'
import ToastContext from '../context/ToastContext'

const AUTH_USER_STORAGE_KEY = 'trident_user'
const AUTH_TOKEN_STORAGE_KEY = 'trident_token'
const AUTO_LOGOUT_MESSAGE = 'Your session token expired and you were logged out automatically.'
const STARTUP_PROFILE_ENDPOINT = '/api/users/me'

function normalizeBaseUrl(url) {
    if (!url || typeof url !== 'string') return ''
    const trimmed = url.trim()
    if (!trimmed) return ''

    const shouldUseHttp = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(trimmed)
    const withProtocol = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : shouldUseHttp
            ? `http://${trimmed}`
            : `https://${trimmed}`

    return withProtocol.replace(/\/+$/, '')
}

function resolveStartupApiBaseUrl() {
    const env = globalThis?.__TRIDENT_ENV__ || globalThis?.import?.meta?.env || {}
    const envBaseUrl = normalizeBaseUrl(env.VITE_API_URL)
    if (envBaseUrl) return envBaseUrl

    if (typeof window !== 'undefined') {
        const host = String(window.location?.hostname || '').trim().toLowerCase()
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://localhost:4000'
        }
    }

    return ''
}

function buildStartupProfileUrl() {
    return `${resolveStartupApiBaseUrl()}${STARTUP_PROFILE_ENDPOINT}`
}

async function verifyStoredSession(token) {
    const response = await fetch(buildStartupProfileUrl(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    })

    const responseData = await response.json().catch(() => ({}))

    if (!response.ok) {
        const error = new Error(responseData.error || `API Error: ${response.status}`)
        error.status = response.status
        error.data = responseData
        throw error
    }

    return responseData
}

function clearStoredAuth() {
    try {
        localStorage.removeItem(AUTH_USER_STORAGE_KEY)
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    } catch (e) {
        // Ignore storage cleanup errors.
    }
}

function persistAuth(user, token) {
    try {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    } catch (e) {
        console.warn('failed to persist auth', e)
    }
}

function readStoredAuth() {
    try {
        const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY)
        const rawToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

        if (!rawUser && !rawToken) return null

        if (!rawUser || !rawToken) {
            clearStoredAuth()
            return null
        }

        const parsedUser = JSON.parse(rawUser)
        if (!parsedUser || typeof rawToken !== 'string' || !rawToken.trim()) {
            clearStoredAuth()
            return null
        }

        return { user: parsedUser, token: rawToken }
    } catch (e) {
        console.warn('failed to read auth from storage', e)
        clearStoredAuth()
        return null
    }
}

function decodeBase64Url(value) {
    if (typeof value !== 'string' || !value.length) return null

    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padLength = (4 - (normalized.length % 4)) % 4
    const padded = `${normalized}${'='.repeat(padLength)}`

    if (typeof atob === 'function') {
        return atob(padded)
    }

    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
        return window.atob(padded)
    }

    return null
}

function parseJwtPayload(token) {
    if (typeof token !== 'string') return null

    const segments = token.split('.')
    if (segments.length !== 3) return null

    try {
        const decodedPayload = decodeBase64Url(segments[1])
        if (!decodedPayload) return null
        return JSON.parse(decodedPayload)
    } catch (e) {
        return null
    }
}

function isTokenLocallyValid(token) {
    const payload = parseJwtPayload(token)
    if (!payload) return false

    const expSeconds = Number(payload.exp)
    if (!Number.isFinite(expSeconds) || expSeconds <= 0) return false

    return expSeconds * 1000 > Date.now()
}

function isAuthFailure(error) {
    if (error?.status === 401) return true

    const message = String(error?.message || '').toLowerCase()
    return (
        message.includes('token expired') ||
        message.includes('invalid token') ||
        message.includes('authentication required') ||
        message.includes('user not found') ||
        message.includes('account has been suspended') ||
        message.includes('account pending approval') ||
        message.includes('2fa verification required')
    )
}

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const toast = useContext(ToastContext)

    function showAutoLogoutToast(message = AUTO_LOGOUT_MESSAGE) {
        try {
            if (typeof toast?.warning === 'function') {
                toast.warning(message)
                return
            }
            if (typeof toast?.error === 'function') {
                toast.error(message)
            }
        } catch (e) {
            console.warn('failed to show auto-logout toast', e)
        }
    }

    function applySession({ user: nextUser, token: nextToken }) {
        setUser(nextUser)
        setToken(nextToken)
        persistAuth(nextUser, nextToken)
    }

    useEffect(() => {
        let isCancelled = false

        const bootstrapAuth = async () => {
            const storedAuth = readStoredAuth()
            if (!storedAuth) {
                if (!isCancelled) {
                    setLoading(false)
                }
                return
            }

            if (!isTokenLocallyValid(storedAuth.token)) {
                clearStoredAuth()
                if (!isCancelled) {
                    setUser(null)
                    setToken(null)
                    showAutoLogoutToast()
                    navigate('/', { replace: true })
                    setLoading(false)
                }
                return
            }

            try {
                const profileResponse = await verifyStoredSession(storedAuth.token)
                const profileUser = profileResponse?.user

                if (!profileUser) {
                    throw new Error('User profile response is missing user data')
                }

                if (!isCancelled) {
                    applySession({ user: profileUser, token: storedAuth.token })
                }
            } catch (error) {
                if (isCancelled) return

                if (isAuthFailure(error)) {
                    setUser(null)
                    setToken(null)
                    clearStoredAuth()
                    showAutoLogoutToast()
                    navigate('/', { replace: true })
                } else {
                    console.warn('session verification unavailable; continuing with cached session', error)
                    applySession(storedAuth)
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false)
                }
            }
        }

        bootstrapAuth()

        return () => {
            isCancelled = true
        }
    }, [])

    function login({ user: u, token: t }){
        applySession({ user: u, token: t })
    }

    function logout({ redirect = true, notify = false, message = AUTO_LOGOUT_MESSAGE } = {}){
        setUser(null)
        setToken(null)
        clearStoredAuth()
        if (notify) {
            showAutoLogoutToast(message)
        }
        if (redirect) {
            try {
                navigate('/', { replace: true })
            } catch (e) {
                console.warn('failed to redirect after logout', e)
            }
        }
    }

    function isProfileComplete(u) {
        if (!u) return false
        if (u.role === ROLES.ADMIN || u.role === ROLES.SUPER_ADMIN) return true
        if (u.role === ROLES.NONPROFIT) {
            const org = u.organization || {}
            return Boolean(org.name && org.mission)
        }
        if (u.role === ROLES.RESEARCHER) {
            const profile = u.researcherProfile || {}
            const hasIdentity = Boolean(profile.affiliation || profile.institution || profile.title)
            const hasExpertise = Boolean(profile.expertise || profile.domains || profile.research_interests)
            return hasIdentity && hasExpertise
        }
        return false
    }

    // helper to set user and optionally redirect
    function loginAndRedirect({ user: u, token: t }) {
        applySession({ user: u, token: t })
        // Redirect based on role
        const role = u?.role || ROLES.RESEARCHER
        if (hasPermission(role, 'canViewAdminPanel')) {
            navigate('/admin', { replace: true })
        } else {
            navigate(getDefaultRouteForRole(role), { replace: true })
        }
    }

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
        setUser,
        isProfileComplete,
        loginAndRedirect
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
    return useContext(AuthContext)
}

export default AuthContext
