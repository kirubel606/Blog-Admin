"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import axios from "axios"
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL

function EventForm({ event, onClose, onSubmit }) {
  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    category: "",   // id or slug from API
    venue: "",
    video_link: "",
    image: null,
    is_live: false,
    start_date: "",  // user must select
    end_date: "",    // user must select
    type: "",
    status: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Load categories on mount
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

  // If event prop exists (edit mode), pre-fill formData
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        location: event.location || "",
        description: event.description || "",
        category: event.category || "",  // assuming category has id
        venue: event.venue || "",
        video_link: event.video_link || "",
        image: event.image || null, // don't preload image file, only new upload
        is_live: event.is_live || false,
        start_date: event.start_date ? event.start_date.slice(0,16) : "", // datetime-local format
        end_date: event.end_date ? event.end_date.slice(0,16) : "",
        type: event.type || "",
        status: event.status || "",
      })
    }
  }, [event])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // You may want to validate formData here before submitting

    try {
      await onSubmit(formData)
    } catch (err) {
      setError("Something went wrong, please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {event ? "Edit Event" : "Create New Event"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6" encType="multipart/form-data">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Enter event location"
              required
            />
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Enter event venue"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            {catLoading ? (
              <p>Loading categories...</p>
            ) : (
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              required
            >
              <option value="">Select event type</option>
              <option value="conference">Conference</option>
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              required
            >
              <option value="">Select event status</option>
              <option value="upcoming">Upcoming</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Enter event description"
              rows="4"
              required
            />
          </div>

          {/* Video Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Link (Optional)
            </label>
            <input
              type="url"
              value={formData.video_link}
              onChange={(e) => setFormData(prev => ({ ...prev, video_link: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Enter video URL"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* Event Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Image
            </label>
            <div className="mt-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-secondary/80"
                {...(!event && { required: true })} 
              />
              {formData.image && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={
                      typeof formData.image === "string"
                        ? formData.image // For existing image URL (edit mode)
                        : URL.createObjectURL(formData.image) // For new uploads
                    }
                    alt="Event preview"
                    className="h-32 w-auto object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Is Live */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_live"
              checked={formData.is_live}
              onChange={(e) => setFormData(prev => ({ ...prev, is_live: e.target.checked }))}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="is_live" className="ml-2 block text-sm font-medium text-gray-700">
              Mark as Live Event
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-600 text-center">{error}</p>
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
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : (event ? "Update Event" : "Create Event")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventForm
