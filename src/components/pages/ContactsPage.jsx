// src/pages/ContactsPage.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Mail,
  Phone,
  Calendar,
  User,
  X,
  MessageSquare,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import SubscriptionsTab from "./SubscriptionsTab";

const ContactsPage = ({ initialTab = "contacts" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 10;

  // Sync active tab if initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const fetchContacts = () => {
    setLoading(true);
    axiosInstance
      .get("/contacts/")
      .then((res) => {
        setContacts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching contacts:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Filter & Sort for contacts
  const filteredContacts = contacts
    .filter((c) =>
      [c.name, c.email, c.message, c.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage) || 1;
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset or adjust page if filtering reduces total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Generate pagination items with ellipsis to prevent long pagination lists (e.g. up to 25)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const startIndex = filteredContacts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredContacts.length);

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {activeTab === "contacts" ? "Contact Management" : "Newsletter Subscriptions"}
          </h1>
          <p className="text-gray-600 mt-1">
            {activeTab === "contacts"
              ? "Review visitor contact inquiries and messages"
              : "Manage newsletter subscriber list, add subscribers, and export CSV"}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit border border-gray-200">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "contacts"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Inquiries
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === "contacts" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
              }`}
            >
              {contacts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "subscriptions"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <MailCheck className="w-4 h-4 mr-2" />
            Subscriptions
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === "subscriptions" ? (
        <SubscriptionsTab />
      ) : (
        <div className="space-y-6">
          {/* Main Contacts Container */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 sm:p-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or message..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchContacts}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium transition shadow-xs disabled:opacity-50"
                  title="Refresh inquiries"
                >
                  <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>

                <div className="flex items-center gap-2">
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
            </div>

            {/* Table & Pagination Wrapper */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Message Preview</th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-gray-500">
                          Loading contact inquiries...
                        </td>
                      </tr>
                    ) : paginatedContacts.length > 0 ? (
                      paginatedContacts.map((c) => (
                        <tr
                          key={c.id || `${c.email}-${c.timestamp}`}
                          onClick={() => setSelectedContact(c)}
                          className="hover:bg-blue-50/60 transition cursor-pointer"
                          title="Click to view details"
                        >
                          <td className="px-5 py-3.5 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {c.name}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                            {c.email}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                            {c.phone || "—"}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs truncate">
                            {c.message}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                            {c.timestamp ? new Date(c.timestamp).toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-10 text-gray-500 italic"
                        >
                          {search ? "No matching contacts found." : "No contact submissions yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dedicated Pagination Footer */}
              <div className="border-t border-gray-200 bg-gray-50/80 px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-gray-600">
                  {filteredContacts.length > 0 ? (
                    <span>
                      Showing <span className="font-semibold text-gray-900">{startIndex}</span> to{" "}
                      <span className="font-semibold text-gray-900">{endIndex}</span> of{" "}
                      <span className="font-semibold text-gray-900">{filteredContacts.length}</span> inquiries
                    </span>
                  ) : (
                    <span>0 inquiries</span>
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
                          key={`dots-${idx}`}
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
          </div>

          {/* Contact Details Modal */}
          {selectedContact && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Inquiry Details</h2>
                  </div>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sender Name</span>
                    <p className="text-base font-semibold text-gray-900 mt-0.5">{selectedContact.name || "N/A"}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</span>
                      <p className="text-sm font-medium text-gray-800 mt-0.5 break-all">
                        {selectedContact.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</span>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">
                        {selectedContact.phone || "—"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Received Date</span>
                    <p className="text-sm text-gray-700 mt-0.5">
                      {selectedContact.timestamp ? new Date(selectedContact.timestamp).toLocaleString() : "—"}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</span>
                    {/* Scrollable message container for long text */}
                    <div className="mt-1.5 max-h-56 sm:max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 leading-relaxed">
                      {selectedContact.message || "No message provided."}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 flex justify-end">
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
