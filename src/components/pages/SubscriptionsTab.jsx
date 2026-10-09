"use client"

import React, { useState, useEffect } from "react"
import {
  Download,
  Plus,
  Trash2,
  Search,
  Mail,
  Calendar,
  AlertTriangle,
  X,
  Check,
  UserX,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react"
import subscriptionService from "../services/subscriptionService"

const SubscriptionsTab = () => {
  const [subscribers, setSubscribers] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'delete' | 'unsubscribe'
    subscriber: null,
  })
  const [copiedId, setCopiedId] = useState(null)

  const itemsPerPage = 10

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch subscribers from API
  const fetchSubscribers = async (searchQuery = debouncedSearch) => {
    try {
      setLoading(true)
      setError(null)
      const data = await subscriptionService.getSubscribers(searchQuery)
      if (data && Array.isArray(data.subscribers)) {
        setSubscribers(data.subscribers)
        setTotalCount(typeof data.total === "number" ? data.total : data.subscribers.length)
      } else if (Array.isArray(data)) {
        setSubscribers(data)
        setTotalCount(data.length)
      } else {
        setSubscribers([])
        setTotalCount(0)
      }
    } catch (err) {
      console.error("Failed to load subscribers:", err)
      setError(err?.response?.data?.detail || err?.response?.data?.message || "Failed to load subscribers.")
      setSubscribers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers(debouncedSearch)
  }, [debouncedSearch])

  // Clear success notification after 4s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Client-side sort
  const sortedSubscribers = [...subscribers].sort((a, b) => {
    const dateA = new Date(a.created_at || 0)
    const dateB = new Date(b.created_at || 0)
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA
  })

  // Pagination calculation
  const totalPages = Math.ceil(sortedSubscribers.length / itemsPerPage) || 1
  const paginatedSubscribers = sortedSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  // Smart page numbers windowing with ellipsis to avoid endless page buttons
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages]
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
  }

  // Handle CSV Download
  const handleDownloadCSV = async () => {
    try {
      setDownloading(true)
      setError(null)
      await subscriptionService.downloadSubscribersCSV()
      setSuccessMessage("Subscribers CSV downloaded successfully!")
    } catch (err) {
      console.error("Error downloading CSV:", err)
      setError(err?.response?.data?.detail || "Failed to download subscribers CSV. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  // Handle Add Subscriber
  const handleAddSubscriber = async (e) => {
    e.preventDefault()
    if (!newEmail.trim()) return

    try {
      setSubmitting(true)
      setError(null)
      await subscriptionService.subscribe(newEmail.trim())
      setSuccessMessage(`Successfully subscribed ${newEmail.trim()}!`)
      setNewEmail("")
      setShowAddModal(false)
      fetchSubscribers(debouncedSearch)
    } catch (err) {
      console.error("Error subscribing email:", err)
      setError(
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to subscribe email. Please check the address."
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Delete Subscriber
  const confirmDelete = async () => {
    const subscriber = confirmModal.subscriber
    if (!subscriber) return

    try {
      setError(null)
      await subscriptionService.deleteSubscriber(subscriber.id)
      setSuccessMessage(`Subscriber ${subscriber.email} removed successfully.`)
      setConfirmModal({ isOpen: false, type: null, subscriber: null })
      fetchSubscribers(debouncedSearch)
    } catch (err) {
      console.error("Error deleting subscriber:", err)
      setError(err?.response?.data?.detail || "Failed to delete subscriber.")
    }
  }

  // Handle Unsubscribe Subscriber
  const confirmUnsubscribe = async () => {
    const subscriber = confirmModal.subscriber
    if (!subscriber) return

    try {
      setError(null)
      const res = await subscriptionService.unsubscribe(subscriber.email)
      setSuccessMessage(res?.message || `${subscriber.email} unsubscribed successfully.`)
      setConfirmModal({ isOpen: false, type: null, subscriber: null })
      fetchSubscribers(debouncedSearch)
    } catch (err) {
      console.error("Error unsubscribing email:", err)
      setError(err?.response?.data?.detail || "Failed to unsubscribe email.")
    }
  }

  // Copy email to clipboard helper
  const handleCopyEmail = (email, id) => {
    navigator.clipboard.writeText(email)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const startIndex = sortedSubscribers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endIndex = Math.min(currentPage * itemsPerPage, sortedSubscribers.length)

  return (
    <div className="space-y-6">
      {/* Subscriptions Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => fetchSubscribers(debouncedSearch)}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium transition shadow-xs disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleDownloadCSV}
            disabled={downloading || totalCount === 0}
            className="inline-flex items-center px-3.5 py-2 border border-emerald-600 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition shadow-xs disabled:opacity-50"
          >
            <Download className={`w-4 h-4 mr-1.5 ${downloading ? "animate-bounce" : ""}`} />
            {downloading ? "Exporting..." : "Download CSV"}
          </button>

          <button
            onClick={() => {
              setError(null)
              setShowAddModal(true)
            }}
            className="inline-flex items-center px-3.5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls & Search */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by subscriber email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Subscribers Table & Pagination Wrapper */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider w-16">ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Email Address</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Subscribed Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">
                    Loading subscriber records...
                  </td>
                </tr>
              ) : paginatedSubscribers.length > 0 ? (
                paginatedSubscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-500 whitespace-nowrap">
                      #{s.id}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{s.email}</span>
                        <button
                          onClick={() => handleCopyEmail(s.email, s.id)}
                          className="text-gray-400 hover:text-gray-600 transition p-1 rounded"
                          title="Copy email"
                        >
                          {copiedId === s.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                      {s.created_at ? new Date(s.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            type: "unsubscribe",
                            subscriber: s,
                          })
                        }
                        className="inline-flex items-center text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md transition"
                        title="Unsubscribe subscriber"
                      >
                        <UserX className="w-3.5 h-3.5 mr-1" />
                        Unsubscribe
                      </button>
                      <button
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            type: "delete",
                            subscriber: s,
                          })
                        }
                        className="inline-flex items-center text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-md transition"
                        title="Delete from database"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500 italic">
                    {search ? "No subscribers matching your search." : "No newsletter subscribers yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dedicated Pagination Footer - Separated from table */}
        <div className="border-t border-gray-200 bg-gray-50/80 px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-gray-600">
            {sortedSubscribers.length > 0 ? (
              <span>
                Showing <span className="font-semibold text-gray-900">{startIndex}</span> to{" "}
                <span className="font-semibold text-gray-900">{endIndex}</span> of{" "}
                <span className="font-semibold text-gray-900">{sortedSubscribers.length}</span> subscribers
              </span>
            ) : (
              <span>0 subscribers</span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center space-x-1 sm:space-x-1.5 flex-wrap justify-center">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span
                    key={`sub-dots-${idx}`}
                    className="px-2 py-1 text-xs sm:text-sm text-gray-400 select-none"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-medium rounded-lg border transition ${
                      currentPage === page
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 ml-0.5 sm:ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Add New Subscriber</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  A welcome email will be automatically triggered to this subscriber upon creation.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newEmail.trim()}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {submitting ? "Subscribing..." : "Subscribe Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Delete / Unsubscribe) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {confirmModal.type === "delete" ? "Delete Subscriber" : "Unsubscribe Member"}
              </h3>
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: null, subscriber: null })}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div
                className={`flex items-center space-x-3 p-3 rounded-lg border text-sm font-medium ${
                  confirmModal.type === "delete"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>
                  {confirmModal.type === "delete"
                    ? "This will permanently remove the subscriber record from the database."
                    : "This will opt out the email address from receiving newsletter messages."}
                </p>
              </div>

              <p className="text-sm text-gray-600">
                Are you sure you want to {confirmModal.type === "delete" ? "delete" : "unsubscribe"}{" "}
                <span className="font-semibold text-gray-900">{confirmModal.subscriber?.email}</span>?
              </p>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, type: null, subscriber: null })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.type === "delete" ? confirmDelete : confirmUnsubscribe}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition shadow-sm ${
                    confirmModal.type === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {confirmModal.type === "delete" ? "Confirm Delete" : "Confirm Unsubscribe"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionsTab
