"use client"

import { useState } from "react"
import LoginPage from "./components/LoginPage.jsx"
import Dashboard from "./components/Dashboard.jsx"
import { useAuth } from "./context/AuthContext.jsx"
import { ToastContainer } from "./components/ui/Toast.jsx"

function App() {
  const { logout, isAuthenticated, user } = useAuth()

  return (
    <>
      <ToastContainer />
      {!isAuthenticated ? (
        <LoginPage />
      ) : (
        <Dashboard user={user} onLogout={logout} />
      )}
    </>
  )
}

export default App
