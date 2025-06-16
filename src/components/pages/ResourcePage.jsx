"use client"

import { useState,useEffect } from "react"
import { Plus, X, ExternalLink, Tag, MoreVertical, Pencil, Trash2 , Calendar, MapPin, Users, Clock, Filter,AlertCircle,AlertTriangle ,Search,Edit,Eye,Loader2,User} from "lucide-react"
import ResourceForm from "./ResourceForm"
import { resourceService } from "../services/resourceService"
import {formatDate,formatTime} from "../services/formatdate"
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Mock data - replace with actual API calls

function ResourcePage() {
  const [resources,setResources] = useState([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailModal, setShowDetaileModal] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const [showMenu, setShowMenu] = useState(null)

  // Load articles on component mount
  useEffect(() => {
    loadResources()
  }, [])



  const handleDelete = (resource) => {
    setResourceToDelete(resource)
    setShowDeleteModal(true)
    setShowMenu(null)
  }
  const Showdetail = (resource) => {
    setSelectedResource(resource)
    setShowDetaileModal(true)
  }
  const Closedetail = (resource) => {
    setSelectedResource(null)
    setShowDetaileModal(false)
  }


    const loadResources = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await resourceService.getAllresource()
        // Ensure we always have an array
        setResources(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load resources:', error)
        setError('Failed to load resources. Please try again.')
        setResources([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }


    const handleResourceSubmit = async (formData) => {
      try {
        setError(null)
        
        if (selectedResource) {
          // Update existing article
          await resourceService.updateResource(selectedResource.id, formData)
        } else {
          // Create new article
          await resourceService.createResource(formData)
        }
        
        // Reload articles and close form
        await loadEvents()
        setShowResourceForm(false)
        setSelectedResource(null)
      } catch (error) {
        console.error('Failed to save event:', error)
        setError('Failed to save event. Please try again.')
      }
    }
  
    const handleEdit = async (resource) => {
      try {
        setError(null)
        // Get full article details
        const fullResource = await resourceService.getresourceDetail(resource.id)
        setSelectedResource(fullResource)
        setShowResourceForm(true)
        setShowMenu(null)
      } catch (error) {
        console.error('Failed to load resource details:', error)
        setError('Failed to load resource details. Please try again.')
      }
    }
  
    const confirmDelete = async () => {
  
      try {
        setError(null)
        setShowDeleteModal(false)
        setResourceToDelete(null)
        await resourceService.deleteResource(resourceToDelete.id)
        // Remove article from state
        setResources(prev => prev.filter(resource => resource.id !== resourceToDelete.id))
      } catch (error) {
        console.error('Failed to delete article:', error)
        setError('Failed to delete article. Please try again.')
      }
    }




  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600 mt-1">Manage publications, case studies, and resources</p>
        </div>
        <button
          onClick={() => setShowResourceForm(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Resource
        </button>
      </div>

      {/* Resources List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            {/* Resource Header */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(showMenu === resource.id ? null : resource.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  {showMenu === resource.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <button
                          onClick={() => handleEdit(resource)}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Resource
                        </button>
                        <button
                          onClick={() => handleDelete(resource)}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Resource
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Added on {formatDate(resource.timestamp)}
              </p>
            </div>

            {/* Resource Details */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Author:</span> {resource.author}
              </p>
              {resource.publisher && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Publisher:</span> {resource.publisher}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <span className="font-medium">Published:</span> {formatDate(resource.published_at)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Category:</span> {resource.category}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {resource.classification.replace('_', ' ').toUpperCase()}
              </p>
              <div className="flex flex-wrap gap-2">
                {resource.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Resource Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
              <button
                onClick={() => Showdetail(resource)}
                className="text-sm text-[#2a2d7a] hover:text-[#3a3d8a] font-medium"
              >
                View Details
              </button>
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#2a2d7a] hover:text-[#3a3d8a] font-medium flex items-center"
              >
                View Resource
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Form Modal */}
      {showResourceForm && (
        <ResourceForm
          onClose={() => {
            setShowResourceForm(false)
            setSelectedResource(null)
          }}
          onSubmit={handleResourceSubmit}
          Resource={selectedResource}
        />
      )}

      {/* Resource Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{selectedResource.title}</h2>
              <button
                onClick={() => Closedetail()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Author</h3>
                  <p className="mt-1 text-gray-900">{selectedResource.author}</p>
                </div>
                {selectedResource.publisher && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Publisher</h3>
                    <p className="mt-1 text-gray-900">{selectedResource.publisher}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Published Date</h3>
                  <p className="mt-1 text-gray-900">{formatDate(selectedResource.published_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Category</h3>
                  <p className="mt-1 text-gray-900">{selectedResource.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Type</h3>
                  <p className="mt-1 text-gray-900">
                    {selectedResource.classification.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedResource.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t">
                <a
                  href={selectedResource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-[#2a2d7a] text-white rounded-lg hover:bg-[#3a3d8a] transition-colors"
                >
                  View Resource
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setResourceToDelete(null)
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-4 text-yellow-600 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <p className="font-medium">Warning</p>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this resource? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setResourceToDelete(null)
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
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

export default ResourcePage 