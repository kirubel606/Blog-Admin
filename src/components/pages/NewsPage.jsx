"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, Eye, Calendar, User } from "lucide-react"
import ArticleForm from "./ArticleForm"

const newsArticles = [
  {
    id: 1,
    title: "Company Announces New Product Launch",
    excerpt: "We're excited to announce the launch of our revolutionary new product that will change the industry...",
    author: "John Smith",
    date: "2024-01-15",
    status: "Published",
    views: 1250,
    image: "https://via.placeholder.com/150x100",
  },
  {
    id: 2,
    title: "Q4 Financial Results Exceed Expectations",
    excerpt: "Our Q4 results show unprecedented growth across all sectors, with revenue up 45% year over year...",
    author: "Sarah Johnson",
    date: "2024-01-12",
    status: "Published",
    views: 890,
    image: "https://via.placeholder.com/150x100",
  },
  {
    id: 3,
    title: "New Partnership with Tech Giant",
    excerpt: "We're thrilled to announce our strategic partnership with a leading technology company...",
    author: "Mike Davis",
    date: "2024-01-10",
    status: "Draft",
    views: 0,
    image: "https://via.placeholder.com/150x100",
  },
]

function NewsPage() {
  const [showArticleForm, setShowArticleForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")

  const filteredArticles = newsArticles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "All" || article.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleArticleSubmit = (formData) => {
    console.log("Article submitted:", formData)
    setShowArticleForm(false)
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
          onClick={() => setShowArticleForm(true)}
          className="mt-4 sm:mt-0 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Article</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-16 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{article.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{article.excerpt.substring(0, 80)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{article.author}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{article.date}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        article.status === "Published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{article.views}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Article Form Modal */}
      {showArticleForm && (
        <ArticleForm
          onClose={() => setShowArticleForm(false)}
          onSubmit={handleArticleSubmit}
        />
      )}
    </div>
  )
}

export default NewsPage
