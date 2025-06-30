"use client"
import { useState, useEffect } from "react"
import { Plus, Trash2, X, Pencil, AlertTriangle } from "lucide-react"
import CategoryForm from "./CategoryForm"
import { categoryService } from "@/components/services/categoryService"

function CategoryPage() {
  const [category, setCategory] = useState([])
  const [filteredCategory, setFilteredCategory] = useState([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState("all") // 'all' | 'core' | 'non-core'

  useEffect(() => {
    loadCategory()
  }, [])

  useEffect(() => {
    filterCategoryList()
  }, [category, filterType])

  const loadCategory = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await categoryService.getAllcategories()
      setCategory(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load categories:", error)
      setError(error?.response?.data?.detail || "Failed to load categories.")
      setCategory([])
    } finally {
      setLoading(false)
    }
  }

  const filterCategoryList = () => {
    if (filterType === "core") {
      setFilteredCategory(category.filter(c => c.is_core))
    } else if (filterType === "non-core") {
      setFilteredCategory(category.filter(c => !c.is_core))
    } else {
      setFilteredCategory(category)
    }
  }

  const handleCategorySubmit = async (formData) => {
    try {
      setError(null)

      if (selectedCategory) {
        await categoryService.updateCategory(selectedCategory.id, formData)
        alert("Successfully Updated!")
      } else {
        await categoryService.createCategory(formData)
        alert("Successfully Created!")
      }

      await loadCategory()
      setShowCategoryForm(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error("Failed to save category:", error)
      setError(error?.response?.data?.detail || "Failed to save category.")
    }
  }

  const handleDelete = (category) => {
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setError(null)
      setShowDeleteModal(false)
      setCategoryToDelete(null)
      await categoryService.deleteCategory(categoryToDelete.id)
      setCategory(prev => prev.filter(c => c.id !== categoryToDelete.id))
      alert("Successfully deleted!")
    } catch (error) {
      console.error("Failed to delete category:", error)
      setError(error?.response?.data?.detail || "Failed to delete category.")
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage categories for your platform</p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null)
            setShowCategoryForm(true)
          }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-md text-sm text-gray-700"
        >
          <option value="all">All Categories</option>
          <option value="core">Core Categories</option>
          <option value="non-core">Non-Core Categories</option>
        </select>
      </div>

      {/* Category List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategory.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition"
          >
            {/* Image */}
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-40 object-cover"
            />

            {/* Details */}
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {category.description}
              </p>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${category.is_core ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {category.is_core ? "Core Category" : "Non Core"}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedCategory(category)
                    setShowCategoryForm(true)
                  }}
                  className="text-sm text-primary hover:text-[#FF8533] font-medium flex items-center"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category)}
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
      {showCategoryForm && (
        <CategoryForm
          initialData={selectedCategory}
          onClose={() => {
            setShowCategoryForm(false)
            setSelectedCategory(null)
          }}
          onSubmit={handleCategorySubmit}
        />
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
                  setCategoryToDelete(null)
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
                Are you sure you want to delete this Category? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setCategoryToDelete(null)
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

export default CategoryPage
