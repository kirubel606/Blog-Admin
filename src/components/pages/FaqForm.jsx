// FaqForm.jsx
"use client"
import { useState } from "react"
import { X } from "lucide-react"

const FaqForm = ({ initialData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    question: initialData?.question || "",
    question_am: initialData?.question_am || "",
    answer: initialData?.answer || "",
    answer_am: initialData?.answer_am || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {initialData ? "Edit FAQ" : "Add FAQ"}
          </h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Question</label>
            <input name="question" value={formData.question} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Question (Amharic)</label>
            <input name="question_am" value={formData.question_am} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Answer</label>
            <textarea name="answer" value={formData.answer} onChange={handleChange} className="w-full p-2 border rounded mt-1" rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium">Answer (Amharic)</label>
            <textarea name="answer_am" value={formData.answer_am} onChange={handleChange} className="w-full p-2 border rounded mt-1" rows={3} />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FaqForm
