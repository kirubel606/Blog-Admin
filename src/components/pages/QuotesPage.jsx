"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, X, Pencil, AlertTriangle, ExternalLink } from "lucide-react"
import { quoteService } from "@/components/services/quoteService" // You need to implement this
import QuoteForm from "./QuoteForm" // You need to implement this

function QuotesPage() {
  const [quotes, setQuotes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [quoteToDelete, setQuoteToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await quoteService.getAll()
      setQuotes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load quotes:", err)
      setError(err?.response?.data?.detail || "Failed to load quotes.")
      setQuotes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    try {
      setError(null)
      if (selectedQuote) {
        await quoteService.update(selectedQuote.id, formData)
        alert("Successfully updated!")
      } else {
        await quoteService.create(formData)
        alert("Successfully created!")
      }
      await loadQuotes()
      setShowForm(false)
      setSelectedQuote(null)
    } catch (err) {
      console.error("Failed to save quote:", err)
      setError(err?.response?.data?.detail || "Failed to save quote.")
    }
  }

  const handleDelete = (item) => {
    setQuoteToDelete(item)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setError(null)
      setShowDeleteModal(false)
      await quoteService.delete(quoteToDelete.id)
      setQuotes(prev => prev.filter(q => q.id !== quoteToDelete.id))
      alert("Successfully deleted!")
    } catch (err) {
      console.error("Failed to delete quote:", err)
      setError(err?.response?.data?.detail || "Failed to delete quote.")
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600 mt-1">Manage quotes and testimonies for your platform</p>
        </div>
        <button
          onClick={() => {
            setSelectedQuote(null)
            setShowForm(true)
          }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Quote
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotes.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition"
          >
            <img src={item.image} alt={item.name} className="w-full h-40 object-cover bg-gray-100" />

            <div className="p-4 space-y-2">
              <blockquote className="text-gray-700 text-sm italic line-clamp-4">“{item.quote}”</blockquote>
              <div>
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-600">{item.position}</p>
              </div>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline"
                >
                  Profile <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <div className="text-xs text-gray-500">
                {item.is_testimony ? "Testimony" : "Quote"}
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedQuote(item)
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
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <QuoteForm
          initialData={selectedQuote}
          onClose={() => {
            setShowForm(false)
            setSelectedQuote(null)
          }}
          onSubmit={handleSubmit}
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
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this quote? This action cannot be undone.
              </p>
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

export default QuotesPage
