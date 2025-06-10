"use client"

import { useState } from "react"
import LoginPage from "./components/LoginPage.jsx"
import Dashboard from "./components/Dashboard.jsx"
import { useAuth } from "./context/AuthContext.jsx" // adjust path

function App() {
  const {logout,isAuthenticated,user} = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <Dashboard user={user} onLogout={logout}/>
}

export default App
