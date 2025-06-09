"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import GalleryForm from "./GalleryForm"

// Mock data - replace with actual API calls
const mockGalleries = [
  {
    id: 1,
    title: "Company Event 2024",
    created_at: "2024-03-15T10:00:00Z",
    images: [
      { id: 1, image: "/path/to/image1.jpg", caption: "Team building activity" },
      { id: 2, image: "/path/to/image2.jpg", caption: "Group photo" }
    ]
  },
  {
    id: 2,
    title: "Product Launch",
    created_at: "2024-03-10T14:30:00Z",
    images: [
      { id: 3, image: "/path/to/image3.jpg", caption: "New product showcase" },
      { id: 4, image: "/path/to/image4.jpg", caption: "Customer feedback" }
    ]
  }
]

function GalleryPage() {
  const [showGalleryForm, setShowGalleryForm] = useState(false)
  const [selectedGallery, setSelectedGallery] = useState(null)

  const handleGallerySubmit = (formData) => {
    // Handle form submission
    console.log(formData)
    setShowGalleryForm(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-600 mt-1">Manage your image galleries</p>
        </div>
        <button
          onClick={() => setShowGalleryForm(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Gallery
        </button>
      </div>

      {/* Galleries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockGalleries.map((gallery) => (
          <div
            key={gallery.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            {/* Gallery Header */}
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{gallery.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Created on {formatDate(gallery.created_at)}
              </p>
            </div>

            {/* Gallery Images */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {gallery.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                      <img
                        src={image.image}
                        alt={image.caption || "Gallery image"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.caption && (
                      <p className="mt-1 text-sm text-gray-600 truncate">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t">
              <button
                onClick={() => setSelectedGallery(gallery)}
                className="text-sm text-primary font-medium"
              >
                View All Images
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gallery Form Modal */}
      {showGalleryForm && (
        <GalleryForm
          onClose={() => setShowGalleryForm(false)}
          onSubmit={handleGallerySubmit}
        />
      )}

      {/* Gallery Detail Modal */}
      {selectedGallery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{selectedGallery.title}</h2>
              <button
                onClick={() => setSelectedGallery(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedGallery.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                      <img
                        src={image.image}
                        alt={image.caption || "Gallery image"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.caption && (
                      <p className="mt-2 text-sm text-gray-600">{image.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryPage
