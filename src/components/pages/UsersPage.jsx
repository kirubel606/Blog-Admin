"use client"
import UserFormModal from "./userForm" // adjust path as needed
import { useState,useEffect } from "react"
import { Plus, Search } from "lucide-react"
import axiosInstance from "../../api"  // adjust path if needed
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL




function UsersPage() {
  const [users,setUsers] = useState([])
  const [error,setError] = useState("");
  console.log("error:",error);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const roles = ["All", "Administrator", "Editor", "Author"];
  const statuses = ["All", "Active", "Inactive"];
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState(null);
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
  
    // Map roles to conditions
    const roleConditions = {
      All: true,
      Admin: user.is_admin,
      Staff: user.is_staff,
      Active: user.is_active,
      Inactive: !user.is_active,
    };
  
    const matchesRole = roleConditions[selectedRole] ?? true;
  
    const matchesStatus =
      selectedStatus === "All" || user.status === selectedStatus;
  
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("api/users/all/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(res.data.users);
      setError(null);
    } catch (err) {
      setError(err.response.data.detail);
      console.error("Error fetching users", err);
    }
  };
  const handleCreateOrUpdateUser = async (values) => {
    // Build FormData exactly once
    const data = new FormData();
    data.append("username", values.username);
    data.append("email", values.email);
    if (values.password) data.append("password", values.password);
    if (values.profile_image) data.append("profile_image", values.profile_image);
  
    // Append each permission ID separately so DRF picks them up as a list
    values.permissions.forEach((permId) => data.append("permissions", permId));
  
    const url = editingUser
      ? `api/users/user/update/${editingUser.id}/`
      : `api/users/user/signup/`;
    const method = editingUser ? "put" : "post";
  
    try {
      await axiosInstance({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // **no** Content-Type here—let the browser set it
        },
      });
      setIsModalOpen(false);
      setEditingUser(null);
      setError(null);
      fetchUsers();
    } catch (err) {
      setError(err.response.data.detail);
      console.error("Error saving user", err);
    }
  };
  
  
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`api/users/user/delete/${confirmDeleteUserId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchUsers();
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.detail || "Delete failed");
      console.error("Delete failed", err);
    } finally {
      setConfirmDeleteUserId(null); // Close modal
    }
  };
  
  const handleDeleteUser = async (userId) => {
    setConfirmDeleteUserId(userId); // Show modal
  };
  
  
  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000); // show for 3 seconds
  
      return () => clearTimeout(timer); // cleanup if component unmounts or error changes
    }
  }, [error]);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Administrator":
        return "bg-red-100 text-red-800";
      case "Editor":
        return "bg-blue-100 text-blue-800";
      case "Author":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="mt-4 sm:mt-0 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="All">All</option>
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
            <option value="Active">Active Users</option>
            <option value="Inactive">Inactive Users</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {error ? (<>
      <div className="bg-gray-200 p-7 rounded-lg shadow-xl text-center">
      <h1 className="text-red-500 font-bold text-2xl">{error}</h1>
      </div>
      </>):(
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th> */}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.profile_image ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={BACKEND_BASE_URL+user.profile_image}
                            alt={user.username}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {getInitials(user.username)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td> */}
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {user.status}
                    </span>
                  </td> */}
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setIsModalOpen(true);
                      }}
                      className="text-primary hover:text-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
      <UserFormModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleCreateOrUpdateUser}
      editingUser={editingUser}
    />
    {error && (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
    {error}
  </div>
)}

{confirmDeleteUserId && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-4 text-center">Confirm Deletion</h2>
      <p className="text-sm text-gray-700 text-center mb-6">
        Are you sure you want to delete this user? This action is irreversible.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setConfirmDeleteUserId(null)}
          className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          onClick={confirmDelete}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  )
}

export default UsersPage
