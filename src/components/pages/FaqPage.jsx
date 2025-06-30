// FaqPage.jsx
"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, AlertTriangle, X } from "lucide-react"
import { faqService } from "@/components/services/faqService"
import FaqForm from "./FaqForm"

const FaqPage = () => {
  const [faqs, setFaqs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [faqToDelete, setFaqToDelete] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadFaqs()
  }, [])

  const loadFaqs = async () => {
    try {
      const data = await faqService.getAll()
      setFaqs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error loading FAQs", err)
      setError("Failed to load FAQs")
    }
  }

  const handleSubmit = async (formData) => {
    try {
      if (selectedFaq) {
        await faqService.update(selectedFaq.id, formData)
      } else {
        await faqService.create(formData)
      }
      await loadFaqs()
      setShowForm(false)
      setSelectedFaq(null)
    } catch (err) {
      console.error("Error saving FAQ", err)
      setError("Failed to save FAQ")
    }
  }

  const handleDelete = (faq) => {
    setFaqToDelete(faq)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await faqService.delete(faqToDelete.id)
      setFaqs((prev) => prev.filter((item) => item.id !== faqToDelete.id))
      setShowDeleteModal(false)
    } catch (err) {
      console.error("Error deleting FAQ", err)
      setError("Failed to delete FAQ")
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">FAQs</h1>
          <p className="text-gray-600 text-sm">Frequently Asked Questions</p>
        </div>
        <button
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          onClick={() => {
            setSelectedFaq(null)
            setShowForm(true)
          }}
        >
          <Plus className="w-5 h-5 mr-2" /> Add FAQ
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {faqs.map((faq) => (
          <div key={faq.id} className="p-4 border rounded-md shadow-sm bg-white">
            <h3 className="font-semibold text-gray-800">{faq.question}</h3>
            <p className="text-sm text-gray-600 mb-2">{faq.answer}</p>
            <div className="text-xs text-gray-500 italic">Amharic: {faq.question_am} / {faq.answer_am}</div>
            <div className="flex justify-end mt-3 gap-2">
              <button
                onClick={() => {
                  setSelectedFaq(faq)
                  setShowForm(true)
                }}
                className="text-sm text-primary hover:text-orange-500 flex items-center"
              >
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </button>
              <button
                onClick={() => handleDelete(faq)}
                className="text-sm text-red-600 hover:text-red-800 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <FaqForm
          initialData={selectedFaq}
          onClose={() => {
            setShowForm(false)
            setSelectedFaq(null)
          }}
          onSubmit={handleSubmit}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Confirm Delete</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center text-yellow-600 mb-3">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <p>This action cannot be undone.</p>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowDeleteModal(false)} className="px-3 py-1">Cancel</button>
                <button onClick={confirmDelete} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FaqPage


