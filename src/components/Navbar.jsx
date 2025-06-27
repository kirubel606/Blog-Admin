"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Search, LogOut, User, Settings, Menu } from "lucide-react"
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL

function Navbar({ user, onLogout, onToggleSidebar }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef(null)
  console.log("This is the user:",user);
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return ""
  
    // If it's an email, extract the part before "@"
    const cleanName = name.includes("@") ? name.split("@")[0] : name
  
    return cleanName
      .split(" ")
      .filter(Boolean) // remove empty strings
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <img src="/logo.png" alt="Logo" className="h-8 w-auto hidden lg:block" />


        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></span>
          </button>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {user.profile_image ? (
                <img
                  src={BACKEND_BASE_URL+user.profile_image}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{getInitials(user.name)}</span>
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-500">Admin: {user.is_admin ?(<>True</>):(<>False</>)}</p>
                  <p className="text-xs text-gray-500">Staff: {user.is_staff ? (<>True</>):(<>False</>)}</p>
                </div>

                <hr className="my-2" />

                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
