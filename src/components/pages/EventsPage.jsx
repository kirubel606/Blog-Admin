"use client"

import { useState,useEffect } from "react"
import { Plus, Calendar, MapPin, Users, Clock, Filter,AlertCircle ,Search,Edit,Trash2,Eye,Loader2,User} from "lucide-react"
import EventForm from "./EventForm"
import { eventService } from "../services/eventService"
import {formatDate,formatTime} from "../services/formatdate"
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL


function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [selectedType, setSelectedType] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [showEventForm, setShowEventForm] = useState(false)

  const filteredEvents = events.filter((event) => {
    const matchesType = selectedType === "All" || event.type === selectedType
    const matchesStatus = selectedStatus === "All" || event.status === selectedStatus
    return matchesType && matchesStatus
  })
  // Load articles on component mount
  useEffect(() => {
    loadEvents()
  }, [])
  
  
    const loadEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await eventService.getAllevent()
        // Ensure we always have an array
        setEvents(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load events:', error)
        setError('Failed to load events. Please try again.')
        setEvents([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }


    const handleEventSubmit = async (formData) => {
      try {
        setError(null)
        
        if (editingEvent) {
          // Update existing article
          await eventService.updateEvent(editingEvent.id, formData)
        } else {
          // Create new article
          await eventService.createEvent(formData)
        }
        
        // Reload articles and close form
        await loadEvents()
        setShowEventForm(false)
        setEditingEvent(null)
      } catch (error) {
        console.error('Failed to save event:', error)
        setError('Failed to save event. Please try again.')
      }
    }
  
    const handleEditEvent = async (event) => {
      try {
        setError(null)
        // Get full article details
        const fullEvent = await eventService.geteventDetail(event.id)
        setEditingEvent(fullEvent)
        setShowEventForm(true)
      } catch (error) {
        console.error('Failed to load article details:', error)
        setError('Failed to load article details. Please try again.')
      }
    }
  
    const handleDeleteEvent = async (eventId) => {
      if (!window.confirm('Are you sure you want to delete this event?')) {
        return
      }
  
      try {
        setError(null)
        await eventService.deleteEvent(eventId)
        // Remove article from state
        setEvents(prev => prev.filter(event => event.id !== eventId))
      } catch (error) {
        console.error('Failed to delete article:', error)
        setError('Failed to delete article. Please try again.')
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
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-1">Organize and manage company events</p>
        </div>
        <button
          onClick={() => setShowEventForm(true)}
          className="mt-4 sm:mt-0 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="All">All Types</option>
            <option value="conference">Conference</option>
            <option value="webinar">Webinar</option>
            <option value="workshop">Workshop</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.status === "Upcoming"
                      ? "bg-blue-100 text-blue-800"
                      : event.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {event.status}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  {event.type}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{event.description.length > 90? `${event.description.slice(0, 90)}...`: event.description}</p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.timestamp)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(event.timestamp)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees} attendees</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <button onClick={() => handleEditEvent(event)} className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                  Edit Event
                </button>
                <button onClick={() => handleDeleteEvent(event.id)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          event={editingEvent}
          onClose={() => {
            setShowEventForm(false)
            setEditingEvent(null)
          }}
          onSubmit={handleEventSubmit}
        />
      )}
    </div>
  )
}

export default EventsPage
