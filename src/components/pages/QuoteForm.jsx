"use client"
import { useState } from "react"
import { X } from "lucide-react"

const QuoteForm = ({ initialData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    image: null,
    quote: initialData?.quote || "",
    name: initialData?.name || "",
    position: initialData?.position || "",
    link: initialData?.link || "",
    is_testimony: initialData?.is_testimony || false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData()
    for (let key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key])
      }
    }
    onSubmit(data)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? "Edit Quote" : "Add Quote"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input type="file" name="image" onChange={handleFileChange} className="mt-1 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quote</label>
            <textarea
              name="quote"
              value={formData.quote}
              onChange={handleChange}
              rows="3"
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Link</label>
            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_testimony"
              checked={formData.is_testimony}
              onChange={handleChange}
            />
            <label className="text-sm text-gray-700">Is Testimony?</label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            >
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuoteForm
