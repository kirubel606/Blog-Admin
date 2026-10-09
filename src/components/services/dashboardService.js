// src/components/services/dashboardService.js
import axiosInstance from "../../api"

export const dashboardService = {
  // 1. Master overview
  async getOverview(params = {}) {
    const { data } = await axiosInstance.get("/dashboard/", { params })
    return data
  },

  // 2. Top-news leaderboard with pagination & filters
  async getTopNews(params = {}) {
    const { data } = await axiosInstance.get("/dashboard/top-news/", { params })
    return data
  },

  // 3. Views & publication timeline time-series
  async getTimeline(params = {}) {
    const { data } = await axiosInstance.get("/dashboard/timeline/", { params })
    return data
  },

  // 4. Category analytics
  async getCategoryAnalytics(params = {}) {
    const { data } = await axiosInstance.get("/dashboard/categories/", { params })
    return data
  },

  // 5. Cross-app ecosystem KPI cards
  async getCrossAppStats() {
    const { data } = await axiosInstance.get("/dashboard/cross-app/")
    return data
  },
}
