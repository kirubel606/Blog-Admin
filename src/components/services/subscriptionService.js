import axiosInstance from "../../api"

export const subscriptionService = {
  // Fetch all subscribers with optional search query
  async getSubscribers(search = "") {
    const params = {}
    if (search && search.trim()) {
      params.search = search.trim()
    }
    const { data } = await axiosInstance.get("/contacts/subscriptions/", { params })
    return data
  },

  // Download all subscriber emails as CSV (subscribers.csv)
  async downloadSubscribersCSV() {
    const response = await axiosInstance.get("/contacts/subscriptions/csv/", {
      responseType: "blob",
    })
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "subscribers.csv")
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // Delete subscriber by ID (Admin action)
  async deleteSubscriber(id) {
    const response = await axiosInstance.delete(`/contacts/subscriptions/${id}/`)
    return response.data
  },

  // Subscribe a new email
  async subscribe(email) {
    const { data } = await axiosInstance.post("/contacts/subscribe/", { email })
    return data
  },

  // Unsubscribe by email address
  async unsubscribe(email) {
    const { data } = await axiosInstance.post("/contacts/unsubscribe/", { email })
    return data
  },
}

export default subscriptionService
