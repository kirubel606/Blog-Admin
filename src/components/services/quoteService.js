import axiosInstance from "../../api"
export const quoteService = {
  getAll: async () => {
    const res = await axiosInstance.get("/quotes/")
    return res.data
  },

  create: async (data) => {
    const res = await axiosInstance.post("/quotes/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  update: async (id, data) => {
    const res = await axiosInstance.patch(`/quotes/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(`/quotes/${id}/`)
    return res.data
  },
}
