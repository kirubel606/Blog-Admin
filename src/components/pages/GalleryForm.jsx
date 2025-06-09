"use client"

import { useState } from "react"
import { X } from "lucide-react"

function GalleryForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    images: [],
    captions: {}
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
      captions: {
        ...prev.captions,
        ...Object.fromEntries(files.map(file => [file.name, ""]))
      }
    }))
  }

  const handleCaptionChange = (fileName, caption) => {
    setFormData(prev => ({
      ...prev,
      captions: {
        ...prev.captions,
        [fileName]: caption
      }
    }))
  }

  const removeImage = (fileName) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(file => file.name !== fileName),
      captions: Object.fromEntries(
        Object.entries(prev.captions).filter(([key]) => key !== fileName)
      )
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create New Gallery</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Enter gallery title"
              required
            />
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Images
            </label>
            <div className="mt-1">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-secondary file:text-white
                  hover:file:bg-secondary/80"
              />
            </div>

            {/* Image Previews with Captions */}
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((file) => (
                  <div key={file.name} className="relative group">
                    <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(file.name)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.captions[file.name] || ""}
                      onChange={(e) => handleCaptionChange(file.name, e.target.value)}
                      className="mt-2 w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Add caption (optional)"
                    />
                  </div>
                ))}
              </div>
            )}
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
              className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Create Gallery
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GalleryForm 