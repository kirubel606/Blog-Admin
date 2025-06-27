import { createContext, useContext, useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"

const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [refreshTimer, setRefreshTimer] = useState(null)

  // Restore tokens from localStorage on mount
  useEffect(() => {
    const storedAccess = localStorage.getItem("accessToken")
    const storedRefresh = localStorage.getItem("refreshToken")

    if (storedAccess && storedRefresh) {
      try {
        const decoded = jwtDecode(storedAccess)
        if (decoded.exp * 1000 > Date.now()) {
          setAccessToken(storedAccess)
          setRefreshToken(storedRefresh)
          setUser({ email: decoded.email, name: decoded.username, role: decoded.role ,profile_image: decoded.profile_image ,id:decoded.id,is_admin:decoded.is_admin})
          scheduleTokenRefresh(storedAccess)
        } else {
          // Access token expired, try refresh
          setRefreshToken(storedRefresh)
          refreshAccessToken(storedRefresh)
        }
      } catch {
        logout()
      }
    }
  }, [])

  const refreshAccessToken = async (refreshOverride) => {
    const refresh = refreshOverride || refreshToken
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/users/user/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      })
      const data = await res.json()
      if (data.access) {
        setAccessToken(data.access)
        localStorage.setItem("accessToken", data.access)
        const decoded = jwtDecode(data.access)
        setUser({ email: decoded.email, name: decoded.username, role: decoded.role,profile_image: decoded.profile_image,id:decoded.id,is_admin:decoded.is_admin })
        scheduleTokenRefresh(data.access)
      } else {
        logout()
      }
    } catch {
      logout()
    }
  }

  const scheduleTokenRefresh = (token) => {
    const decoded = jwtDecode(token)
    const expTime = decoded.exp * 1000
    const currentTime = Date.now()
    const delay = expTime - currentTime - 60000

    if (refreshTimer) clearTimeout(refreshTimer)
    const timer = setTimeout(() => refreshAccessToken(), delay)
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

    localStorage.setItem("accessToken", data.access)
    localStorage.setItem("refreshToken", data.refresh)

    const decoded = jwtDecode(data.access)
    setUser({ email: decoded.email, name: decoded.username, role: decoded.role ,profile_image: decoded.profile_image,id:decoded.id,is_admin:decoded.is_admin})

    scheduleTokenRefresh(data.access)
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
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
