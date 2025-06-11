import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, Calendar, User, Loader2, AlertCircle } from "lucide-react"
import ArticleForm from "./ArticleForm"
import { newsService } from "../services/newsService"

function NewsPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showArticleForm, setShowArticleForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [isSearching, setIsSearching] = useState(false)

  // Load articles on component mount
  useEffect(() => {
    loadArticles()
  }, [])

  // Handle search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch()
      } else {
        loadArticles()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const loadArticles = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await newsService.getAllNews()
      // Ensure we always have an array
      setArticles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load articles:', error)
      setError('Failed to load articles. Please try again.')
      setArticles([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    try {
      setIsSearching(true)
      setError(null)
      const data = await newsService.searchNews(searchTerm)
      // Ensure we always have an array
      setArticles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to search articles:', error)
      setError('Failed to search articles. Please try again.')
      setArticles([]) // Set empty array on error
    } finally {
      setIsSearching(false)
    }
  }

  const handleArticleSubmit = async (formData) => {
    try {
      setError(null)
      
      if (editingArticle) {
        // Update existing article
        await newsService.updateNews(editingArticle.id, formData)
      } else {
        // Create new article
        await newsService.createNews(formData)
      }
      
      // Reload articles and close form
      await loadArticles()
      setShowArticleForm(false)
      setEditingArticle(null)
    } catch (error) {
      console.error('Failed to save article:', error)
      setError('Failed to save article. Please try again.')
    }
  }

  const handleEditArticle = async (article) => {
    try {
      setError(null)
      // Get full article details
      const fullArticle = await newsService.getNewsDetail(article.id)
      setEditingArticle(fullArticle)
      setShowArticleForm(true)
    } catch (error) {
      console.error('Failed to load article details:', error)
      setError('Failed to load article details. Please try again.')
    }
  }

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return
    }

    try {
      setError(null)
      await newsService.deleteNews(articleId)
      // Remove article from state
      setArticles(prev => prev.filter(article => article.id !== articleId))
    } catch (error) {
      console.error('Failed to delete article:', error)
      setError('Failed to delete article. Please try again.')
    }
  }

  // Safe filtering with proper null checks
  const filteredArticles = articles.filter((article) => {
    if (!article) return false
    
    const matchesStatus = selectedStatus === "All" || 
      (article.status && article.status.toLowerCase() === selectedStatus.toLowerCase()) ||
      (article.status === "publish" && selectedStatus.toLowerCase() === "published")
    
    return matchesStatus
  })

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=150&h=100&fit=crop"
    
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    // Assuming your Django server serves media files
    return `http://localhost:8000${imagePath}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
          <p className="text-gray-600 mt-1">Create and manage news articles</p>
        </div>
        <button
          onClick={() => {
            setEditingArticle(null)
            setShowArticleForm(true)
          }}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          disabled={loading}
        >
          <Plus className="w-5 h-5" />
          <span>Add Article</span>
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
              onClick={loadArticles}
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
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="All">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && !articles.length ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading articles...</span>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'No articles found matching your search.' : 'No articles available.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Article</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Author</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Views</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={getImageUrl(article.cover_image)}
                          alt={article.title || 'Article'}
                          className="w-16 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=150&h=100&fit=crop"
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{article.title || 'Untitled'}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {article.content 
                              ? article.content.replace(/<[^>]*>/g, '').substring(0, 80) + '...'
                              : article.subtitle || 'No content available'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {article.author_username || article.author || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {article.created_at 
                            ? new Date(article.created_at).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          (article.status?.toLowerCase() === "published" || article.status === "publish")
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {article.status === "publish" ? "Published" : (article.status || 'Draft')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{article.view_count || 0}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditArticle(article)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteArticle(article.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Article Form Modal */}
      {showArticleForm && (
        <ArticleForm
          article={editingArticle}
          onClose={() => {
            setShowArticleForm(false)
            setEditingArticle(null)
          }}
          onSubmit={handleArticleSubmit}
        />
      )}
    </div>
  )
}

export default NewsPage