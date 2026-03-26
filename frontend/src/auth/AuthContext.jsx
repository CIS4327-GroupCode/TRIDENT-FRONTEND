import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        try{
            const rawUser = localStorage.getItem('trident_user')
            const rawToken = localStorage.getItem('trident_token')
            if(rawUser && rawToken){
                setUser(JSON.parse(rawUser))
                setToken(rawToken)
            }
        }catch(e){
            console.warn('failed to read auth from storage', e)
        } finally {
            setLoading(false)
        }
    }, [])

    function login({ user: u, token: t }){
        setUser(u)
        setToken(t)
        try{
            localStorage.setItem('trident_user', JSON.stringify(u))
            localStorage.setItem('trident_token', t)
        }catch(e){ console.warn('failed to persist auth', e) }
    }

    function logout(){
        setUser(null)
        setToken(null)
        try{
            localStorage.removeItem('trident_user')
            localStorage.removeItem('trident_token')
        }catch(e){ /* ignore */ }
        // optional: redirect to home
        try{ window.location.href = '/' }catch(e){}
    }

    function isProfileComplete(u) {
        if (!u) return false
        if (u.role === 'admin') return true
        if (u.role === 'nonprofit') {
            const org = u.organization || {}
            return Boolean(org.name && org.mission)
        }
        if (u.role === 'researcher') {
            const profile = u.researcherProfile || {}
            const hasIdentity = Boolean(profile.affiliation || profile.institution || profile.title)
            const hasExpertise = Boolean(profile.expertise || profile.domains || profile.research_interests)
            return hasIdentity && hasExpertise
        }
        return false
    }

    // helper to set user and optionally redirect
    function loginAndRedirect({ user: u, token: t }) {
        setUser(u)
        setToken(t)
        try{
            localStorage.setItem('trident_user', JSON.stringify(u))
            localStorage.setItem('trident_token', t)
        }catch(e){ console.warn('failed to persist auth', e) }
        // Redirect based on role
        const role = u?.role || 'researcher'
        if (role === 'admin') {
            navigate('/admin', { replace: true })
        } else {
            navigate(`/dashboard/${role}`, { replace: true })
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
