"use client"
import { useState, useEffect } from "react"
import { Plus, Trash2, X, Pencil, AlertTriangle, Sparkles, Layers, Search, FolderTree, Image as ImageIcon } from "lucide-react"
import CategoryForm from "./CategoryForm"
import { categoryService } from "@/components/services/categoryService"

function CategoryPage() {
  const [category, setCategory] = useState([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState("all") // 'all' | 'core' | 'non-core'
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadCategory()
  }, [])

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

  const handleDelete = (cat) => {
    setCategoryToDelete(cat)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setError(null)
      setShowDeleteModal(false)
      setCategoryToDelete(null)
      await categoryService.deleteCategory(categoryToDelete.id)
      setCategory((prev) => prev.filter((c) => c.id !== categoryToDelete.id))
      alert("Successfully deleted!")
    } catch (error) {
      console.error("Failed to delete category:", error)
      setError(error?.response?.data?.detail || "Failed to delete category.")
    }
  }

  // Filter categories by search term
  const searchedCategories = category.filter((c) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.name_am && c.name_am.toLowerCase().includes(term)) ||
      (c.description && c.description.toLowerCase().includes(term))
    )
  })

  // Separate core and non-core categories
  const coreCategories = searchedCategories.filter((c) => Boolean(c.is_core))
  const nonCoreCategories = searchedCategories.filter((c) => !Boolean(c.is_core))

  const totalCoreCount = category.filter((c) => Boolean(c.is_core)).length
  const totalNonCoreCount = category.filter((c) => !Boolean(c.is_core)).length

  // Render individual category card
  const renderCategoryCard = (cat) => {
    const isCore = Boolean(cat.is_core)
    return (
      <div
        key={cat.id}
        className={`bg-white rounded-xl shadow-sm overflow-hidden border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
          isCore ? "border-amber-200/80 hover:border-amber-300" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {/* Top Content */}
        <div>
          {/* Image with fallback */}
          <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
            {cat.image ? (
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "flex"
                }}
              />
            ) : null}
            <div
              className={`w-full h-full ${cat.image ? "hidden" : "flex"} items-center justify-center bg-gray-100 text-gray-400`}
            >
              <ImageIcon className="w-10 h-10 stroke-1" />
            </div>

            {/* Badge overlay on top corner */}
            <div className="absolute top-3 left-3">
              {isCore ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Core Category
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 text-gray-700 backdrop-blur-sm shadow-sm">
                  <Layers className="w-3.5 h-3.5 text-gray-500" />
                  Non-Core
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-2">
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{cat.name}</h3>
              {cat.name_am && (
                <span className="text-xs font-medium text-gray-500 mt-0.5">{cat.name_am}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {cat.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="px-4 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500 font-medium">
            {isCore ? "Primary System" : "General Topic"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory(cat)
                setShowCategoryForm(true)
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors flex items-center shadow-2xs"
            >
              <Pencil className="w-3.5 h-3.5 mr-1" />
              Edit
            </button>
            <button
              onClick={() => handleDelete(cat)}
              className="text-xs font-medium text-red-600 hover:text-red-800 bg-white hover:bg-red-50 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors flex items-center shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">
            Organize platform content with dedicated core and non-core categories
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null)
            setShowCategoryForm(true)
          }}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm w-fit"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          Add Category
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls & Segment Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center whitespace-nowrap ${
              filterType === "all"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Categories
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${
                filterType === "all" ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {category.length}
            </span>
          </button>

          <button
            onClick={() => setFilterType("core")}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center whitespace-nowrap ${
              filterType === "core"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Core Categories
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${
                filterType === "core" ? "bg-amber-700 text-white" : "bg-amber-200 text-amber-900"
              }`}
            >
              {totalCoreCount}
            </span>
          </button>

          <button
            onClick={() => setFilterType("non-core")}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center whitespace-nowrap ${
              filterType === "non-core"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Non-Core Categories
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${
                filterType === "non-core" ? "bg-blue-700 text-white" : "bg-blue-200 text-blue-900"
              }`}
            >
              {totalNonCoreCount}
            </span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Loading categories...
        </div>
      ) : (
        <div className="space-y-10">
          {/* SECTION 1: CORE CATEGORIES */}
          {(filterType === "all" || filterType === "core") && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">Core Categories</h2>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {coreCategories.length}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Main foundational topics featured prominently across the platform
                    </p>
                  </div>
                </div>
              </div>

              {coreCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coreCategories.map((c) => renderCategoryCard(c))}
                </div>
              ) : (
                <div className="bg-amber-50/50 border border-dashed border-amber-200 rounded-xl p-8 text-center">
                  <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No core categories found</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    {searchTerm
                      ? "No core categories match your current search criteria."
                      : "Mark categories as core in the category form to display them in this featured section."}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* SECTION 2: NON-CORE CATEGORIES */}
          {(filterType === "all" || filterType === "non-core") && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">Non-Core Categories</h2>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {nonCoreCategories.length}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Standard subcategories and secondary topics
                    </p>
                  </div>
                </div>
              </div>

              {nonCoreCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nonCoreCategories.map((c) => renderCategoryCard(c))}
                </div>
              ) : (
                <div className="bg-blue-50/50 border border-dashed border-blue-200 rounded-xl p-8 text-center">
                  <Layers className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No non-core categories found</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    {searchTerm
                      ? "No non-core categories match your current search criteria."
                      : "Any category not marked as core will be organized in this section."}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      )}

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setCategoryToDelete(null)
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-3 text-amber-600 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">This action cannot be undone.</p>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete category{" "}
                <span className="font-semibold text-gray-900">
                  &ldquo;{categoryToDelete?.name}&rdquo;
                </span>
                ?
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setCategoryToDelete(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete Category
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
