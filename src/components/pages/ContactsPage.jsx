// src/pages/ContactsPage.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api"; // adjust path if needed

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    axiosInstance
      .get("/contacts/")
      .then((res) => {
        setContacts(res.data);
      })
      .catch((err) => {
        console.error("Error fetching contacts:", err);
      });
  }, []);

  // Filter & Sort
  const filteredContacts = contacts
    .filter((c) =>
      [c.name, c.email, c.message]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Contact Submissions</h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // reset to first page on search
            }}
            className="w-full sm:w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Message</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContacts.length > 0 ? (
                paginatedContacts.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className="border-b hover:bg-blue-50 transition cursor-pointer"
                  >
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2">{c.email}</td>
                    <td className="px-4 py-2">{c.phone}</td>
                    <td className="px-4 py-2 max-w-xs truncate">{c.message}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {new Date(c.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Contact Details</h2>
            <p><span className="font-semibold">Name:</span> {selectedContact.name}</p>
            <p><span className="font-semibold">Email:</span> {selectedContact.email}</p>
            <p><span className="font-semibold">Phone:</span> {selectedContact.phone}</p>
            <p><span className="font-semibold">Message:</span></p>
            <p className="whitespace-pre-line border p-2 rounded bg-gray-50">{selectedContact.message}</p>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">Date:</span>{" "}
              {new Date(selectedContact.timestamp).toLocaleString()}
            </p>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
