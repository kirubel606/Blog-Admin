"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Save, User } from "lucide-react"
import axiosInstance from "../../api"  // adjust path if needed

const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL // Make sure this is set

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    line1: "",
    line2: "",
    email: "",
    location: "",
    map_link: ""
  })
  const isValidMapIframe = (html) => {
    const pattern = /<iframe[^>]*src="https:\/\/www\.google\.com\/maps\/embed\?[^"]+"[^>]*width="400"[^>]*height="300"[^>]*><\/iframe>/i
    return pattern.test(html)
  }
  

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axiosInstance.get(`${BACKEND_BASE_URL}/settings/`) // adjust if different
        const data = Array.isArray(res.data) ? res.data[0] : res.data
        setSettings(data)
      } catch (err) {
        console.error("Failed to fetch settings:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    try {
      await axiosInstance.put(`${BACKEND_BASE_URL}/settings/${settings.id}/`, settings)
      alert("Settings updated successfully!")
    } catch (err) {
      console.error("Failed to save settings:", err)
      alert("Failed to update settings.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage organization contact and location</p>
        </div>
        <button
          onClick={handleSave}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-[#F7941D] to-[#181B5E] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>Save All Changes</span>
        </button>
      </div>

      {/* Settings Form */}
      {!loading && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone 1</label>
              <input
                type="text"
                name="line1"
                value={settings.line1}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone 2</label>
              <input
                type="text"
                name="line2"
                value={settings.line2}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={settings.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Embed Link</label>
            <textarea
              name="map_link"
              value={settings.map_link}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows="4"
            />
          </div>
        </div>
      )}
    </div>
  )
}
