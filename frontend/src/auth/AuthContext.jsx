import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
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
        // for researcher and nonprofit check some basic fields 
        const profile = u.profile || {}
        return Boolean(profile.name && profile.bio && profile.contact)
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
