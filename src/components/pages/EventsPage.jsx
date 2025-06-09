"use client"

import { useState } from "react"
import { Plus, Calendar, MapPin, Users, Clock, Filter } from "lucide-react"
import EventForm from "./EventForm"

const events = [
  {
    id: 1,
    title: "Annual Company Conference 2024",
    date: "2024-03-15",
    time: "09:00 AM",
    location: "Grand Convention Center",
    attendees: 250,
    status: "Upcoming",
    type: "Conference",
    description: "Join us for our biggest event of the year featuring keynote speakers and networking opportunities.",
  },
  {
    id: 2,
    title: "Product Launch Webinar",
    date: "2024-02-28",
    time: "02:00 PM",
    location: "Online",
    attendees: 150,
    status: "Upcoming",
    type: "Webinar",
    description: "Exclusive preview of our latest product features and roadmap.",
  },
  {
    id: 3,
    title: "Team Building Workshop",
    date: "2024-01-20",
    time: "10:00 AM",
    location: "Office Building A",
    attendees: 45,
    status: "Completed",
    type: "Workshop",
    description: "Interactive workshop focused on team collaboration and communication skills.",
  },
]

function EventsPage() {
  const [selectedType, setSelectedType] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [showEventForm, setShowEventForm] = useState(false)

  const filteredEvents = events.filter((event) => {
    const matchesType = selectedType === "All" || event.type === selectedType
    const matchesStatus = selectedStatus === "All" || event.status === selectedStatus
    return matchesType && matchesStatus
  })

  const handleEventSubmit = (formData) => {
    // Handle form submission
    console.log(formData)
    setShowEventForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-1">Organize and manage company events</p>
        </div>
        <button
          onClick={() => setShowEventForm(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
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
            <option value="Conference">Conference</option>
            <option value="Webinar">Webinar</option>
            <option value="Workshop">Workshop</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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
              <p className="text-gray-600 text-sm mb-4">{event.description}</p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
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
                <button className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                  Edit Event
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          onClose={() => setShowEventForm(false)}
          onSubmit={handleEventSubmit}
        />
      )}
    </div>
  )
}

export default EventsPage
