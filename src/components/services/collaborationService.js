// @/components/services/collaborationService.js
import axiosInstance from "../../api"

export const collaborationService = {
  async getAll() {
    const { data } = await axiosInstance.get("/collaborations/")
    return Array.isArray(data) ? data : data.results || []
  },
  async create(formData) {
    const payload = new FormData()
    payload.append("logo", formData.logoFile)
    if (formData.link) payload.append("link", formData.link)
    if (formData.category) payload.append("category", formData.category)
    const { data } = await axiosInstance.post("/collaborations/", payload)
    return data
  },
  async update(id, formData) {
    const payload = new FormData()
    if (formData.logoFile) payload.append("logo", formData.logoFile)
    if (formData.link) payload.append("link", formData.link)
    if (formData.category) payload.append("category", formData.category)
    const { data } = await axiosInstance.put(`/collaborations/${id}/`, payload)
    return data
  },
  async delete(id) {
    return await axiosInstance.delete(`/collaborations/${id}/`)
  },
}
