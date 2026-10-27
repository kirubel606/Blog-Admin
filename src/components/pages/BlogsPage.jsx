import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, Calendar, User, Loader2, AlertCircle } from "lucide-react"
import ArticleForm from "./ArticleForm"
import { blogService } from "../services/blogService"
import { toast } from "../ui/Toast"

const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"

function BlogsPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isSearching, setIsSearching] = useState(false)

  // Load blogs on component mount & filter change
  useEffect(() => {
    loadBlogs()
  }, [selectedStatus])

  // Handle search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch()
      } else {
        loadBlogs()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const loadBlogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await blogService.getUserBlogs(selectedStatus)
      setBlogs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load blogs:", err)
      setError(err?.response?.data?.detail || err?.response?.data?.message || "Failed to load blogs. Please try again.")
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    try {
      setIsSearching(true)
      setError(null)
      const data = await blogService.searchBlogs(searchTerm)
      setBlogs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to search blogs:", err)
      setError(err?.response?.data?.detail || err?.response?.data?.message || "Failed to search blogs. Please try again.")
      setBlogs([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleBlogSubmit = async (formData) => {
    try {
      setError(null)

      if (editingBlog) {
        await blogService.updateBlog(editingBlog.id, formData)
        toast.success("Blog updated successfully!")
      } else {
        await blogService.createBlog(formData)
        toast.success("Blog created successfully!")
      }

      await loadBlogs()
      setShowBlogForm(false)
      setEditingBlog(null)
    } catch (err) {
      console.error("Failed to save blog:", err)
      toast.error(err, { title: editingBlog ? "Failed to update blog" : "Failed to create blog" })
      setError(err?.response?.data?.detail || err?.response?.data?.message || "Failed to save blog. Please try again.")
      throw err
    }
  }

  const handleEditBlog = async (blog) => {
    try {
      setError(null)
      const fullBlog = await blogService.getBlogDetail(blog.id)
      setEditingBlog(fullBlog)
      setShowBlogForm(true)
    } catch (err) {
      console.error("Failed to load blog details:", err)
      toast.error(err, { title: "Failed to load blog details" })
      setError(err?.response?.data?.detail || err?.response?.data?.message || "Failed to load blog details. Please try again.")
    }
  }

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return
    }

    try {
      setError(null)
      await blogService.deleteBlog(blogId)
      setBlogs((prev) => prev.filter((blog) => blog.id !== blogId))
      toast.success("Blog post deleted successfully!")
    } catch (err) {
      console.error("Failed to delete blog:", err)
      toast.error(err, { title: "Failed to delete blog" })
      setError(err?.response?.data?.detail || err?.response?.data?.message || "Failed to delete blog. Please try again.")
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=150&h=100&fit=crop"
    }
    if (imagePath.startsWith("http")) {
      return imagePath
    }
    const base = BACKEND_BASE_URL.replace(/\/api\/?$/, "")
    return `${base}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-1">Create and manage blog posts</p>
        </div>
        <button
          onClick={() => {
            setEditingBlog(null)
            setShowBlogForm(true)
          }}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          disabled={loading}
        >
          <Plus className="w-5 h-5" />
          <span>Add Blog Post</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={loadBlogs}
              className="text-sm text-red-800 underline hover:text-red-900 mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
            <input
              type="text"
              placeholder="Search blogs by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={loading}
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="all">All Status</option>
            <option value="publish">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Blogs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && !blogs.length ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading blogs...</span>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? "No blogs found matching your search." : "No blogs available."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Blog</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Category</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Author</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Views</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={getImageUrl(blog.cover_image)}
                          alt={blog.title || "Blog"}
                          className="w-16 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src =
                              "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=150&h=100&fit=crop"
                          }}
                        />
                        <div className="max-w-md">
                          <h3 className="font-semibold text-gray-900">{blog.title || "Untitled"}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {blog.content
                              ? blog.content.replace(/<[^>]*>/g, "").substring(0, 80) + "..."
                              : blog.subtitle || "No content available"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {blog.category || "General"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {blog.author_username || blog.author || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {blog.created_at
                            ? new Date(blog.created_at).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          blog.status?.toLowerCase() === "published" || blog.status === "publish"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {blog.status === "publish" ? "Published" : blog.status || "Draft"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{blog.view_count || 0}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditBlog(blog)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Blog"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Blog"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blog Form Modal (reusing ArticleForm) */}
      {showBlogForm && (
        <ArticleForm
          article={editingBlog}
          entityName="Blog"
          onClose={() => {
            setShowBlogForm(false)
            setEditingBlog(null)
          }}
          onSubmit={handleBlogSubmit}
        />
      )}
    </div>
  )
}

export default BlogsPage
