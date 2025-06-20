"use client"

import { useState,useEffect } from "react"
import { Plus, X, Trash2 } from "lucide-react"
import GalleryForm from "./GalleryForm"
import { galleryService } from "../services/galleryService"
import {formatDate,formatTime} from "../services/formatdate"


function GalleryPage() {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showGalleryForm, setShowGalleryForm] = useState(false)
  const [editingGallery, setEditingGallery] = useState(null)
  const [selectedGallery, setSelectedGallery] = useState(null)
  // Load articles on component mount
  useEffect(() => {
    loadGallery()
  }, [])
  
  
    const loadGallery = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await galleryService.getAllgallery()
        // Ensure we always have an array
        setGalleries(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load events:', error)
        setError('Failed to load events. Please try again.')
        setGalleries([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }
    const handleGallerySubmit = async (formData) => {
      try {
        let savedGallery
    
        if (editingGallery) {
          // Call backend and get updated gallery
          savedGallery = await galleryService.updateGallery(editingGallery.id, formData)
    
          // Update locally with backend response
          setGalleries(prev =>
            prev.map(g => g.id === editingGallery.id ? savedGallery : g)
          )
        } else {
          // Call backend and get created gallery
          savedGallery = await galleryService.createGallery(formData)
    
          // Add the fully created gallery to state
          setGalleries(prev => [...prev, savedGallery])
        }
    
        setShowGalleryForm(false)
        setEditingGallery(null)
      } catch (error) {
        console.error("Failed to save gallery:", error)
        setError("Failed to save gallery. Please try again.")
      }
    }
    
 


    const handleDeleteGallery = async (id) => {
      const confirmDelete = confirm("Are you sure you want to delete this gallery?")
      if (!confirmDelete) return
    
      try {
        setError(null)
    
        // Await deletion from backend
        await galleryService.deleteGallery(id)
    
        // Update UI after successful delete
        setGalleries(prev => prev.filter(g => g.id !== id))
        setSelectedGallery(null)
        setEditingGallery(null)
      } catch (error) {
        console.error("Failed to delete gallery:", error)
        setError("Failed to delete gallery. Please try again.")
      }
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
          onClick={() => {
            setEditingGallery(null)
            setShowGalleryForm(true)
          }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Gallery
        </button>
      </div>

      {/* Galleries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{gallery.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Created on {formatDate(gallery.created_at)}
              </p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {gallery.images.slice(0, 4).map((image) => (
                  <div key={image.id} className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                    <img
                      src={image.image}
                      alt={image.caption || "Gallery image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
              <button
                onClick={() => setSelectedGallery(gallery)}
                className="text-sm text-primary font-medium"
              >
                View Gallery
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setEditingGallery(gallery)
                    setShowGalleryForm(true)
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteGallery(gallery.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gallery Form Modal */}
      {showGalleryForm && (
        <GalleryForm
          onClose={() => {
            setShowGalleryForm(false)
            setEditingGallery(null)
          }}
          onSubmit={handleGallerySubmit}
          initialData={
            editingGallery
              ? {
                  title: editingGallery.title,
                  caption: editingGallery.caption,
                  images: editingGallery.images.map((img) => img.image)
                }
              : null
          }
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
              <p className="mb-4 text-gray-700">{selectedGallery.caption}</p>
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
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleDeleteGallery(selectedGallery.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryPage
