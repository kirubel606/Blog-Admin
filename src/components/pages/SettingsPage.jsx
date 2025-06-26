"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import axiosInstance from "../../api"

const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    line1: "",
    line2: "",
    email: "",
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
    linkdin: "",
    location: "",
    location_am: "",
    map_link: "",
    emergency_contact: "",
    preferred_language: "",
  })

  const isValidMapIframe = (html) => {
    const pattern = /<iframe[^>]*src="https:\/\/www\.google\.com\/maps\/embed\?[^"]+"[^>]*width="400"[^>]*height="300"[^>]*><\/iframe>/i
    return pattern.test(html)
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axiosInstance.get(`${BACKEND_BASE_URL}/settings/`)
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
    if (!isValidMapIframe(settings.map_link)) {
      alert("Please paste a valid Google Maps iframe with width 400 and height 300 (medium size).")
      return
    }
    try {
      await axiosInstance.put(`${BACKEND_BASE_URL}/settings/${settings.id}/`, settings)
      alert("Settings updated successfully!")
    } catch (err) {
      console.error("Failed to save settings:", err)
      alert("Failed to update settings.")
    }
  }

  const handleChangepassword = async () => {
    try {
      const updateData = {
        password: settings.password,
      };
      // send PUT request to update user (password only)
      await axiosInstance.put("api/users/user/", updateData);
  
      alert("Password updated successfully!");
      // Clear password fields after success
      setSettings((prev) => ({ ...prev, password: "", confirm_password: "" }));
    } catch (err) {
      console.error("Failed to update password:", err);
      alert("Failed to update password. Try again.");
    }
  };
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          {activeTab === "general" && (
          <p className="text-gray-600 mt-1">Manage organization contact and location</p>
          )}
          {activeTab === "personal" && (
          <p className="text-gray-600 mt-1">Change personal Setting Here</p>
          )}
        </div>
        {activeTab === "general" && (
        <button
          onClick={handleSave}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-[#F7941D] to-[#181B5E] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>Save All Changes</span>
        </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-4">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 font-medium ${
            activeTab === "general"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2 font-medium ${
            activeTab === "personal"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Personal
        </button>
      </div>

      {/* Conditional Form */}
      {!loading && (
        <>
          {activeTab === "general" && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Phone 1" name="line1" value={settings.line1} onChange={handleChange} />
                <Input label="Phone 2" name="line2" value={settings.line2} onChange={handleChange} />
                <Input label="Email" name="email" value={settings.email} onChange={handleChange} />
                <Input label="Facebook" name="facebook" value={settings.facebook} onChange={handleChange} />
                <Input label="Twitter" name="twitter" value={settings.twitter} onChange={handleChange} />
                <Input label="Instagram" name="instagram" value={settings.instagram} onChange={handleChange} />
                <Input label="Youtube" name="youtube" value={settings.youtube} onChange={handleChange} />
                <Input label="Linkdin" name="linkdin" value={settings.linkdin} onChange={handleChange} />
                <Input label="Location" name="location" value={settings.location} onChange={handleChange} />
                <Input label="Location in Amharic" name="location_am" value={settings.location_am} onChange={handleChange} />
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

{activeTab === "personal" && (
  <form
    onSubmit={(e) => {
      e.preventDefault();

      const password = settings.password || "";
      const confirmPassword = settings.confirm_password || "";

      // Password regex: min 6 chars, max 20, at least one uppercase, one lowercase, one digit, one special char
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$/;

      if (!passwordRegex.test(password)) {
        alert("Password must be 6-20 characters and include uppercase, lowercase, number, and special character.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      // Call your password save handler
      handleChangepassword();
    }}
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6 max-w-lg mx-auto"
  >
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
    
    <div className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={settings.password || ""}
          onChange={handleChange}
          placeholder="Enter new password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
          minLength={6}
          maxLength={20}
          autoComplete="new-password"
        />
      </div>

      <div>
        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          id="confirm_password"
          type="password"
          name="confirm_password"
          value={settings.confirm_password || ""}
          onChange={handleChange}
          placeholder="Confirm new password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
          minLength={6}
          maxLength={20}
          autoComplete="new-password"
        />
      </div>

      {settings.password && settings.confirm_password && settings.password !== settings.confirm_password && (
        <p className="text-red-600 text-sm">Passwords do not match.</p>
      )}
    </div>

    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={() => {
          // Clear password fields on cancel
          setSettings((prev) => ({ ...prev, password: "", confirm_password: "" }));
        }}
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={
          !settings.password ||
          !settings.confirm_password ||
          settings.password !== settings.confirm_password
        }
        className={`px-4 py-2 rounded-lg text-white font-semibold transition
          ${
            !settings.password ||
            !settings.confirm_password ||
            settings.password !== settings.confirm_password
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
      >
        Save Password
      </button>
    </div>
  </form>
)}

        </>
      )}
    </div>
  )
}

// Reusable input component
const Input = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
    />
  </div>
)
