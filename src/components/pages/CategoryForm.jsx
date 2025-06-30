"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

function CategoryForm({ onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    name: "",
    name_am: "",
    description: "",
    description_am: "",
    imageFile: null,
    is_core: false,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        name_am: initialData.name_am || "",
        description: initialData.description || "",
        description_am: initialData.description_am || "",
        imageFile: null,
        is_core: initialData.is_core || false,
        image: initialData.image || "",
      })
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        image: URL.createObjectURL(file),
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? "Edit Category" : "Create New Category"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name (EN)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00]"
              
            />
          </div>

          {/* Name (Amharic) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name (AM)</label>
            <input
              type="text"
              value={formData.name_am}
              onChange={(e) => setFormData((prev) => ({ ...prev, name_am: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00]"
              
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (EN)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00]"
              rows="4"
              
            />
          </div>

          {/* Description (Amharic) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (AM)</label>
            <textarea
              value={formData.description_am}
              onChange={(e) => setFormData((prev) => ({ ...prev, description_am: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00]"
              rows="4"
              
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-500"
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                className="mt-3 w-32 h-32 object-cover rounded-lg border"
              />
            )}
          </div>

          {/* Is Core */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.is_core}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_core: e.target.checked }))}
              className="h-4 w-4 text-[#FF6B00] border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Core Category</label>
          </div>

          {/* Actions */}
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
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              {initialData ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryForm
