// src/services/eventService.js
import axiosInstance from "../../api"  // adjust path if needed

export const resourceService = {
  // Get all resource articles
  async getAllresource() {
    // GET {API_BASE_URL}/resource/all/
    const { data } = await axiosInstance.get("/resources/")
    // if data.results.result exists, return that
    if (data.results?.result) return data.results.result
    // otherwise if array, return it
    if (Array.isArray(data)) return data
    // otherwise return data.results or empty
    return data.results || []
  },

  // Get single resource article detail
  async getresourceDetail(resourceId) {
    // GET {API_BASE_URL}/resource/resource/:id/
    const { data } = await axiosInstance.get(`/resources/${resourceId}/`)
    return data
  },

// Create new resource
async createResource(formData) {
    const payload = new FormData();
  
    payload.append("title", formData.title);
    payload.append("author", formData.author);
    payload.append("link", formData.link);
    payload.append("tags", formData.tags); // comma-separated
    payload.append("classification", formData.classification); // 'publication' | 'resource'
    payload.append("category", formData.category); // e.g., 1, 2, etc.
  
    if (formData.published_at) {
      payload.append("published_at", formData.published_at); // format: YYYY-MM-DD
    }
  
    if (formData.plublisher) {
      payload.append("plublisher", formData.plublisher);
    }
  
    const { data } = await axiosInstance.post("/resources/", payload);
    return data;
  },  

// Update existing resource
async updateResource(resourceId, formData) {
    const payload = new FormData();
  
    payload.append("title", formData.title);
    payload.append("author", formData.author);
    payload.append("link", formData.link);
    payload.append("tags", formData.tags); // comma-separated string
    payload.append("classification", formData.classification); // 'publication' | 'resource'
    payload.append("category", formData.category); // should be string or convert using .toString()
  
    if (formData.published_at) {
      payload.append("published_at", formData.published_at); // YYYY-MM-DD
    }
  
    if (formData.plublisher) {
      payload.append("plublisher", formData.plublisher);
    }
  
    const { data } = await axiosInstance.put(
      `/resources/${resourceId}/`,
      payload
    );
  
    return data;
  },  

  // Delete a resource article
  async deleteResource(resourceId) {
    // DELETE {API_BASE_URL}/resource/resource/:id/
    await axiosInstance.delete(`/resources/${resourceId}/`)
    // original returned null on 204 or parsed JSON; here we just return
    return
  },
}
