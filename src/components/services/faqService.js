

// services/faqService.js
import axiosInstance from "../../api"

export const faqService = {
  getAll: async () => {
    const res = await axiosInstance.get("/faq/")
    return res.data
  },
  create: async (data) => {
    const res = await axiosInstance.post("/faq/", data)
    return res.data
  },
  update: async (id, data) => {
    const res = await axiosInstance.patch(`/faq/${id}/`, data)
    return res.data
  },
  delete: async (id) => {
    const res = await axiosInstance.delete(`/faq/${id}/`)
    return res.data
  },
}
