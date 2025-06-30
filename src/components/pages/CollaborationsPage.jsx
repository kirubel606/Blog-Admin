"use client"
import { useState, useEffect } from "react"
import { Plus, Trash2, X, Pencil, AlertTriangle, ExternalLink } from "lucide-react"
import { collaborationService } from "@/components/services/collaborationService" // You need to create this
import CollaborationForm from "./CollaborationForm" // You need to create this
import axios from 'axios'
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL

function CollaborationsPage() {
  const [collaborations, setCollaborations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedCollab, setSelectedCollab] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [collabToDelete, setCollabToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories,setCategories] = useState([])
  useEffect(() => {
    loadCollaborations()
  }, [])
  useEffect(() => {
    const fetchCategories = async () => {
      const apiUrl = `${BACKEND_BASE_URL}/categories/`
      try {
        const res = await axios.get(apiUrl)
        setCategories(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error("Error fetching categories:", err)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])
  const loadCollaborations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await collaborationService.getAll()
      setCollaborations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load collaborations:", err)
      setError(err?.response?.data?.detail || "Failed to load collaborations.")
      setCollaborations([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    try {
      setError(null)
      if (selectedCollab) {
        await collaborationService.update(selectedCollab.id, formData)
        alert("Successfully updated!")
      } else {
        await collaborationService.create(formData)
        alert("Successfully created!")
      }
      await loadCollaborations()
      setShowForm(false)
      setSelectedCollab(null)
    } catch (err) {
      console.error("Failed to save collaboration:", err)
      setError(err?.response?.data?.detail || "Failed to save collaboration.")
    }
  }

  const handleDelete = (item) => {
    setCollabToDelete(item)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setError(null)
      setShowDeleteModal(false)
      await collaborationService.delete(collabToDelete.id)
      setCollaborations(prev => prev.filter(c => c.id !== collabToDelete.id))
      alert("Successfully deleted!")
    } catch (err) {
      console.error("Failed to delete collaboration:", err)
      setError(err?.response?.data?.detail || "Failed to delete collaboration.")
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collaborations</h1>
          <p className="text-gray-600 mt-1">Manage collaborating partners and links</p>
        </div>
        <button
          onClick={() => {
            setSelectedCollab(null)
            setShowForm(true)
          }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Collaboration
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collaborations.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition"
          >
            <img src={item.logo} alt="Collaboration Logo" className="w-full h-40 object-contain bg-gray-100" />

            <div className="p-4 space-y-2">
              <div className="text-sm text-gray-600">
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    Visit <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-gray-400">No Link Provided</span>
                )}
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">
                Category: {
                    item.category
                    ? (categories.find(cat => cat.id === item.category)?.name || "Unknown")
                    : "N/A"
                }
                </span>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedCollab(item)
                    setShowForm(true)
                  }}
                  className="text-sm text-primary hover:text-[#FF8533] font-medium flex items-center"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <CollaborationForm
          initialData={selectedCollab}
          onClose={() => {
            setShowForm(false)
            setSelectedCollab(null)
          }}
          onSubmit={handleSubmit}
          categoryOptions={categories}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
              <button onClick={() => setShowDeleteModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-4 text-yellow-600 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <p className="font-medium">Warning</p>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this collaboration? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollaborationsPage
