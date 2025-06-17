"use client"

import { useState,useEffect } from "react"
import { Plus, Calendar, MapPin, Users, Clock, Filter,AlertCircle ,Search,Edit,Trash2,Eye,Loader2,User} from "lucide-react"
import RNDForm from "./RNDForm"
import { rndService } from "../services/rndService"
import {formatDate,formatTime} from "../services/formatdate"
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL


function RND() {
  const [rnd, setRnd] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingRnd, setEditingRnd] = useState(null)
  const [selectedType, setSelectedType] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [showRndForm, setShowRndForm] = useState(false)

  const filteredRnd = rnd.filter((rnd) => {
    const matchesType = selectedType === "All" || rnd.type === selectedType
    const matchesStatus = selectedStatus === "All" || rnd.status === selectedStatus
    return matchesType && matchesStatus
  })
  // Load articles on component mount
  useEffect(() => {
    loadRnd()
  }, [])
  
  
    const loadRnd = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await rndService.getAllRnd()
        // Ensure we always have an array
        setRnd(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load:', error)
        setError('Failed to load. Please try again.')
        setRnd([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }


    const handleRndSubmit = async (formData) => {
      try {
        setError(null)
        
        if (editingRnd) {
          // Update existing article
          await rndService.updateRnd(editingRnd.id, formData)
        } else {
          // Create new article
          await rndService.createRnd(formData)
        }
        
        // Reload articles and close form
        await loadRnd()
        setShowRndForm(false)
        setEditingRnd(null)
      } catch (error) {
        console.error('Failed to save:', error)
        setError('Failed to save. Please try again.')
      }
    }
  
    const handleEditRnd = async (event) => {
      try {
        setError(null)
        // Get full article details
        const fullEvent = await rndService.getrndDetail(event.id)
        setEditingRnd(fullEvent)
        setShowRndForm(true)
      } catch (error) {
        console.error('Failed to load details:', error)
        setError('Failed to load details. Please try again.')
      }
    }
  
    const handleDeleteRnd = async (eventId) => {
      if (!window.confirm('Are you sure you want to delete this ?')) {
        return
      }
  
      try {
        setError(null)
        await rndService.deleteRnd(eventId)
        // Remove article from state
        setRnd(prev => prev.filter(event => event.id !== eventId))
      } catch (error) {
        console.error('Failed to delete:', error)
        setError('Failed to delete. Please try again.')
      }
    }


  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={loadEvents}
              className="text-sm text-red-800 underline hover:text-red-900 mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">R&D Management</h1>
        </div>
        <button
          onClick={() => setShowRndForm(true)}
          className="mt-4 sm:mt-0 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add R&D</span>
        </button>
      </div>

      {/* Filters */}


      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRnd.map((rnd) => (
          <div
            key={rnd.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">

                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  {rnd.category}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">{rnd.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{rnd.description.length > 90? `${rnd.description.slice(0, 90)}...`: rnd.description}</p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(rnd.timestamp)}</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <button onClick={() => handleEditRnd(rnd)} className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                  Edit Rnd
                </button>
                <button onClick={() => handleDeleteRnd(rnd.id)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* rnd Form Modal */}
      {showRndForm && (
        <RNDForm
          rnd={editingRnd}
          onClose={() => {
            setShowRndForm(false)
            setEditingRnd(null)
          }}
          onSubmit={handleRndSubmit}
        />
      )}
    </div>
  )
}

export default RND
