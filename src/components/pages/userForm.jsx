// components/UserFormModal.jsx
import { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"

export default function UserFormModal({ isOpen, onClose, onSubmit, editingUser }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profile_image: null,
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        username: editingUser.username || "",
        email: editingUser.email || "",
        password: "", // blank unless being reset
        profile_image: null,
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        profile_image: null,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg space-y-4">
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
              <input
                type="password"
                name="password"
                placeholder="Password (6-12 chars)"
                value={formData.password}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            )}
            <input
              type="file"
              name="profile_image"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
            />
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
