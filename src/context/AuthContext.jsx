import { createContext, useContext, useEffect, useState } from "react"
import {jwtDecode} from "jwt-decode"

// Pull backend base URL from env
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)

  // Auto-refresh interval reference
  const [refreshTimer, setRefreshTimer] = useState(null)

  // Helper: refresh the access token
  const refreshAccessToken = async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/users/user/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      })
      const data = await res.json()
      setAccessToken(data.access)
      const decoded = jwtDecode(data.access)
      setUser({ email: decoded.email, role: decoded.role }) // adjust to your payload
      scheduleTokenRefresh(data.access)
    } catch (err) {
      logout()
    }
  }

  // Schedule token refresh before expiry
  const scheduleTokenRefresh = (token) => {
    const decoded = jwtDecode(token)
    const expTime = decoded.exp * 1000
    const currentTime = Date.now()
    const delay = expTime - currentTime - 60000 // refresh 1 min before expiry

    if (refreshTimer) clearTimeout(refreshTimer)
    const timer = setTimeout(refreshAccessToken, delay)
    setRefreshTimer(timer)
  }

  const login = async ({ username, password }) => {
    const res = await fetch(`${BACKEND_BASE_URL}/api/users/user/login/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) throw new Error("Login failed")

    const data = await res.json()
    setAccessToken(data.access)
    setRefreshToken(data.refresh)

    const decoded = jwtDecode(data.access)
    setUser({ email: decoded.email, role: decoded.role })

    scheduleTokenRefresh(data.access)
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    if (refreshTimer) clearTimeout(refreshTimer)
  }

  const value = {
    user,
    accessToken,
    refreshToken,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
