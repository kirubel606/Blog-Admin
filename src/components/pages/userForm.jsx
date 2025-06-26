// components/UserFormModal.jsx
import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import axiosInstance from "../../api"; // adjust path if needed

export default function UserFormModal({ isOpen, onClose, onSubmit, editingUser }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profile_image: null,
    permissions: [], // array of permission IDs
    is_admin: false,
    is_staff: false,
    is_active: true,  // default active true
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [allPermissions, setAllPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Load all permissions when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingPermissions(true);
      axiosInstance
        .get("api/users/permissions/") // your endpoint to get all permissions
        .then((res) => {
          setAllPermissions(res.data.permissions || []);
        })
        .catch(() => setAllPermissions([]))
        .finally(() => setLoadingPermissions(false));
    }
  }, [isOpen]);

  // Populate formData when editingUser changes
  useEffect(() => {
    if (editingUser) {
      setFormData({
        username: editingUser.username || "",
        email: editingUser.email || "",
        password: "", // blank for reset
        profile_image: null,
        permissions: editingUser.permission_details
          ? editingUser.permission_details.map((p) => p.id)
          : [],
        is_admin: editingUser.is_admin || false,
        is_staff: editingUser.is_staff || false,
        is_active: editingUser.is_active !== undefined ? editingUser.is_active : true,
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        profile_image: null,
        permissions: [],
        is_admin: false,
        is_staff: false,
        is_active: true,
      });
    }
  }, [editingUser]);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const togglePermission = (permId) => {
    setFormData((prev) => {
      if (prev.permissions.includes(permId)) {
        return {
          ...prev,
          permissions: prev.permissions.filter((id) => id !== permId),
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permId],
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingUser && formData.password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
  
    setPasswordError("");
    // Prepare FormData for file upload + other fields
    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    if (formData.password) data.append("password", formData.password);
    if (formData.profile_image) data.append("profile_image", formData.profile_image);

    // Append permissions as JSON string or separate entries depending on backend
    data.append("permissions", JSON.stringify(formData.permissions));
    // Append the new fields:
    data.append("is_admin", formData.is_admin);
    data.append("is_staff", formData.is_staff);
    data.append("is_active", formData.is_active);
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold">
            {editingUser ? "Edit User" : "Add User"}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
              required
            />
            {!editingUser && (
              <>
              <input
                    type="password"
                    name="password"
                    placeholder="Password (6-12 chars)"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded"
                    required
                  />

                  <input
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border px-4 py-2 rounded"
                    required
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm">{passwordError}</p>
                  )}

              </>
            )}
            <input
              type="file"
              name="profile_image"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
            />
            {/* Add these checkboxes for is_admin, is_staff, is_active */}
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_admin"
                  checked={formData.is_admin}
                  onChange={handleChange}
                />
                <span>Is Admin</span>
              </label>

              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_staff"
                  checked={formData.is_staff}
                  onChange={handleChange}
                />
                <span>Is Staff</span>
              </label>

              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                <span>Is Active</span>
              </label>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Permissions</h3>
              <div className="max-h-40 overflow-y-auto border p-2 rounded space-y-1 bg-gray-50">
                {loadingPermissions ? (
                  <p>Loading permissions...</p>
                ) : allPermissions.length === 0 ? (
                  <p className="text-gray-500">No permissions available.</p>
                ) : (
                  allPermissions.map((perm) => (
                    <label key={perm.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                      />
                      <span>{perm.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
                {editingUser ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
