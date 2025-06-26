"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import axios from "axios"

const CLASSIFICATION_OPTIONS = [
  { value: "publication", label: "Publication" },
  { value: "resource", label: "Resource" },
  { value: "case_study", label: "Case Study" },
  { value: "development", label: "Development" },
]
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL

function ResourceForm({ Resource = null, onClose, onSubmit }) {


  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    title_am:"",
    author: "",
    author_am: "",
    published_at: "",
    publisher: "",
    publisher_am: "",
    link: "",
    category: "",
    tags: "",
    classification: "publication"
  })
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
  console.log("categories passed are:",categories)


  useEffect(() => {
    if (Resource) {
      setFormData({
        title: Resource.title || "",
        title_am: Resource.title_am || "",
        author: Resource.author || "",
        author_am: Resource.author_am || "",
        published_at: Resource.published_at || "",
        publisher: Resource.publisher || Resource.plublisher || "",
        publisher_am: Resource.publisher_am || Resource.plublisher_am || "",
        link: Resource.link || "",
        category: Resource.category || "",
        tags: Resource.tags || "",
        classification: Resource.classification || "publication"
      })
    }
  }, [Resource])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {Resource ? "Edit Resource" : "Add New Resource"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-gray-900"
              placeholder="Enter resource title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amharic Title</label>
            <input
              type="text"
              value={formData.title_am}
              onChange={(e) => setFormData(prev => ({ ...prev, title_am: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-gray-900"
              placeholder="Enter Amharic title"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-gray-900"
              placeholder="Enter author name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author in Amharic</label>
            <input
              type="text"
              value={formData.author_am}
              onChange={(e) => setFormData(prev => ({ ...prev, author_am: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-gray-900"
              placeholder="Enter author name in Amharic"
            />
          </div>

          {/* Publisher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publisher</label>
            <input
              type="text"
              value={formData.publisher}
              onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-gray-900"
              placeholder="Enter publisher name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publisher in Amharic</label>
            <input
              type="text"
              value={formData.publisher_am}
              onChange={(e) => setFormData(prev => ({ ...prev, publisher_am: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-gray-900"
              placeholder="Enter publisher name in Amharic"
            />
          </div>

          {/* Published Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Published Date</label>
            <input
              type="date"
              value={formData.published_at}
              onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resource Link</label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-gray-900"
              placeholder="Enter resource URL"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-gray-900"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Classification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Classification</label>
            <select
              value={formData.classification}
              onChange={(e) => setFormData(prev => ({ ...prev, classification: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-gray-900"
              required
            >
              {CLASSIFICATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-gray-900"
              placeholder="Enter tags (comma-separated)"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              {Resource ? "Update Resource" : "Add Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResourceForm
