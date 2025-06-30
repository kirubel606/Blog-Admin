// src/services/eventService.js
import axiosInstance from "../../api"  // adjust path if needed

export const categoryService = {
  // Get all categories articles
  async getAllcategories() {
    // GET {API_BASE_URL}/categories/all/
    const { data } = await axiosInstance.get("/categories/")
    // if data.results.result exists, return that
    if (data.results?.result) return data.results.result
    // otherwise if array, return it
    if (Array.isArray(data)) return data
    // otherwise return data.results or empty
    return data.results || []
  },


// Create new category
async createCategory(formData) {
  const payload = new FormData();

  payload.append("name", formData.name);
  payload.append("name_am", formData.name_am);
  payload.append("description", formData.description);
  payload.append("description_am", formData.description_am);
  payload.append("is_core", formData.is_core); // boolean

  if (formData.imageFile) {
    payload.append("image", formData.imageFile);
  }

  const { data } = await axiosInstance.post("/categories/", payload);
  return data;
},

// Update existing category
async updateCategory(categoryId, formData) {
  const payload = new FormData();

  payload.append("name", formData.name);
  payload.append("name_am", formData.name_am);
  payload.append("description", formData.description);
  payload.append("description_am", formData.description_am);
  payload.append("is_core", formData.is_core); // boolean

  if (formData.imageFile) {
    payload.append("image", formData.imageFile);
  }

  const { data } = await axiosInstance.put(`/categories/${categoryId}/`, payload);
  return data;
},


  // Delete a categories article
  async deleteCategory(categoryId) {
    // DELETE {API_BASE_URL}/categories/categories/:id/
    await axiosInstance.delete(`/categories/${categoryId}/`)
    // original returned null on 204 or parsed JSON; here we just return
    return
  },
}
