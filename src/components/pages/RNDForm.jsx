"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import axios from "axios"

const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL

function RNDForm({ rnd, onClose, onSubmit }) {
  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    coverimage: null,
    logo: null,
    images: [],
    author: "",
    tags: "",
    type: "",
    category: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/categories/`)
        setCategories(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error("Error fetching categories:", err)
        setCategories([])
      } finally {
        setCatLoading(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (rnd) {
      setFormData({
        title: rnd.title || "",
        description: rnd.description || "",
        link: rnd.link || "",
        coverimage: rnd.coverimage || null,
        logo: rnd.logo || null,
        images: rnd.images ? rnd.images : [],
        author: rnd.author || "",
        tags: rnd.tags || "",
        type: rnd.type || "",
        category: rnd.category || ""
      })
    }
  }, [rnd])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(formData)
    } catch (err) {
      setError("Something went wrong, please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (key, e) => {
    const files = e.target.files
    if (files) {
      if (key === "images") {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...Array.from(files)]
        }))
      } else {
        setFormData(prev => ({ ...prev, [key]: files[0] }))
      }
    }
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {rnd ? "Edit R&D" : "Create New R&D"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" encType="multipart/form-data">
          {[
            { key: "title", label: "Title", type: "text" },
            { key: "description", label: "Description", type: "textarea" },
            { key: "link", label: "Link", type: "text" },
            { key: "author", label: "Author", type: "text" },
            { key: "tags", label: "Tags (comma-separated)", type: "text" },
            { key: "type", label: "Type (e.g., development, research)", type: "text" }
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              {type === "textarea" ? (
                <textarea
                  value={formData[key]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                />
              ) : (
                <input
                  type={type}
                  value={formData[key]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                />
              )}
            </div>
          ))}

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            {catLoading ? (
              <p>Loading categories...</p>
            ) : (
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* File Uploads */}
          {[
            { key: "coverimage", label: "Cover Image" },
            { key: "logo", label: "Logo" }
          ].map(({ key, label }) => (
            <div key={key} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(key, e)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary/80"
                {...(!rnd && key !== "images" ? { required: true } : {})}
              />
              {formData[key] && typeof formData[key] === "string" && (
                <div className="relative inline-block mt-2">
                  <img
                    src={formData[key]}
                    alt={label}
                    className="h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, [key]: null }))}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}


          {error && <p className="text-red-600 text-center">{error}</p>}

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : (rnd ? "Update R&D" : "Create R&D")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RNDForm
