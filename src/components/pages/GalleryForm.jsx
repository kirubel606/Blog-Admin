"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

function GalleryForm({ onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: "",
    title_am:"",
    discription:"",
    discription_am:"",
    caption: "",
    caption_am: "",
    images: [],           // new uploads
    existingImages: [],   // old images (URLs or objects)
    removedImages: [],    // 🆕 track removed existing ones
  })
  
  useEffect(() => {
    if (initialData) {
      console.log("This is initial Data:",initialData);
      setFormData({
        title: initialData.title || "",
        title_am: initialData.title_am || "",
        discription: initialData.discription || "",
        discription_am: initialData.discription_am || "",
        caption: initialData.caption || "",
        caption_am: initialData.caption_am || "",
        images: [], // new uploads
        existingImages: initialData.images || [], // array of URLs or image data
        removedImages: [],  // <<< Initialize it here too!
      })
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
    }))
  }

  const removeImage = (fileName) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(file => file.name !== fileName),
    }))
  }

  const removeExistingImage = (url) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter(img => img !== url),
      removedImages: [...prev.removedImages, url],  // ✅ track removed
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? "Edit Gallery" : "Create New Gallery"}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Enter gallery title"
              
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amharic Title
            </label>
            <input
              type="text"
              value={formData.title_am}
              onChange={(e) => setFormData(prev => ({ ...prev, title_am: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Enter Amharic title"
         
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Caption
            </label>
            <input
              type="text"
              value={formData.caption}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Enter Amharic title"
         
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amharic Caption
            </label>
            <input
              type="text"
              value={formData.caption_am}
              onChange={(e) => setFormData(prev => ({ ...prev, caption_am: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Enter Amharic title"
         
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Description
            </label>
            <textarea
              value={formData.discription}
              onChange={(e) => setFormData(prev => ({ ...prev, discription: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Add a description for this gallery"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amharic Description
            </label>
            <textarea
              value={formData.discription_am}
              onChange={(e) => setFormData(prev => ({ ...prev, discription_am: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Add an Amharic description for this gallery"
              rows={3}
            />
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary/80"
            />
          </div>

          {/* Existing Images */}
          {formData.existingImages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Existing Images</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {formData.existingImages.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Existing Image ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Uploaded Images */}
          {formData.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">New Images</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                  </div>
                ))}
              </div>
            </div>
          )}

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
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {initialData ? "Update Gallery" : "Create Gallery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GalleryForm
