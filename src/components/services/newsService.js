// src/services/newsService.js
import axiosInstance from "../../api"  // adjust path if needed

export const newsService = {
  // Get all news articles
  async getAllNews() {
    // GET {API_BASE_URL}/news/all/
    const { data } = await axiosInstance.get("/news/all/")
    // if data.results.result exists, return that
    if (data.results?.result) return data.results.result
    // otherwise if array, return it
    if (Array.isArray(data)) return data
    // otherwise return data.results or empty
    return data.results || []
  },

  // Get user's news articles
  async getUserNews(query=null) {
    // GET {API_BASE_URL}/news/usernews/
    const { data } = await axiosInstance.get("/news/usernews/", {
      params: { status: query },
    });
    if (data.results?.result) return data.results.result
    if (Array.isArray(data)) return data
    return data.results || []
  },

  // Search news articles
  async searchNews(query) {
    // GET {API_BASE_URL}/news/search/?title=<query>
    const { data } = await axiosInstance.get("/news/search/", {
      params: { title: query },
    })
    if (data.results?.result) return data.results.result
    if (Array.isArray(data)) return data
    return data.results || []
  },

  // Get single news article detail
  async getNewsDetail(newsId) {
    // GET {API_BASE_URL}/news/news/:id/
    const { data } = await axiosInstance.get(`/news/news/${newsId}/`)
    return data
  },

  // Get related news articles
  async getRelatedNews(newsId) {
    // GET {API_BASE_URL}/news/related/:id/
    const { data } = await axiosInstance.get(`/news/related/${newsId}/`)
    if (data.results?.result) return data.results.result
    if (Array.isArray(data)) return data
    return data.results || []
  },

  // Create new news article
  async createNews(formData) {
    // POST {API_BASE_URL}/news/newspost/ with FormData
    const payload = new FormData()
    payload.append("title", formData.title)
    payload.append("title_am", formData.title_am)
    payload.append("subtitle", formData.subtitle)
    payload.append("subtitle_am", formData.subtitle_am)
    payload.append("category", formData.category)
    payload.append("content", formData.content)
    payload.append("content_am", formData.content_am)
    payload.append("tags", formData.tags)
    payload.append("status", formData.status)

    if (formData.hasVideo && formData.iframe) {
      payload.append("iframe", formData.iframe)
    }
    if (formData.cover_image) {
      payload.append("cover_image", formData.cover_image)
    }
    // append each image file under the same key "images"
    formData.images?.forEach((img) => payload.append("images", img))

    const { data } = await axiosInstance.post("/news/newspost/", payload)
    return data
  },

  // Update existing news article
  async updateNews(newsId, formData) {
    // PUT {API_BASE_URL}/news/news/:id/ with FormData
    const payload = new FormData()
    payload.append("title", formData.title)
    payload.append("title_am", formData.title_am)
    payload.append("subtitle", formData.subtitle)
    payload.append("subtitle_am", formData.subtitle_am)
    payload.append("category", formData.category)
    payload.append("content", formData.content)
    payload.append("content_am", formData.content_am)
    payload.append("tags", formData.tags)
    payload.append("status", formData.status)

    if (formData.hasVideo && formData.iframe) {
      payload.append("iframe", formData.iframe)
    }
    // only append cover_image if it's a new File
    if (formData.cover_image instanceof File) {
      payload.append("cover_image", formData.cover_image)
    }
    // only append image files that are new
    formData.images
      ?.filter((img) => img instanceof File)
      .forEach((img) => payload.append("images", img))

    const { data } = await axiosInstance.put(
      `/news/news/${newsId}/`,
      payload
    )
    return data
  },

  // Delete a news article
  async deleteNews(newsId) {
    // DELETE {API_BASE_URL}/news/news/:id/
    await axiosInstance.delete(`/news/news/${newsId}/`)
    // original returned null on 204 or parsed JSON; here we just return
    return
  },
}
