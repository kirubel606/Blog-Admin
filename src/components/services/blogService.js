// src/components/services/blogService.js
import axiosInstance from "../../api"

export const blogService = {
  // 1. List / Filter published blogs
  async getAllBlogs(params = {}) {
    const { data } = await axiosInstance.get("/blogs/all/", { params })
    if (data.results?.result) return data.results.result
    if (Array.isArray(data)) return data
    return data.results || []
  },

  // 6. User's own blogs (?status=all, draft, publish)
  async getUserBlogs(status = "all") {
    const { data } = await axiosInstance.get("/blogs/userblogs/", {
      params: { status: status || "all" },
    })
    if (data.results?.result) return data.results.result
    if (Array.isArray(data)) return data
    return data.results || []
  },

  // 7. Search blogs by title (?title=<query>)
  async searchBlogs(query) {
    const { data } = await axiosInstance.get("/blogs/search/", {
      params: { title: query },
    })
    if (data.results?.result) return data.results.result
    if (Array.isArray(data)) return data
    return data.results || []
  },

  // 3. Single blog detail
  async getBlogDetail(blogId) {
    const { data } = await axiosInstance.get(`/blogs/blog/${blogId}/`)
    return data
  },

  // 8. Related blogs
  async getRelatedBlogs(blogId) {
    const { data } = await axiosInstance.get(`/blogs/related/${blogId}/`)
    if (data.results?.result) return data.results.result
    if (Array.isArray(data)) return data
    return data.results || []
  },

  // 9. Sidebar blogs
  async getSidebarBlogs() {
    const { data } = await axiosInstance.get("/blogs/sidebar/")
    if (data.results?.result) return data.results.result
    if (Array.isArray(data)) return data
    return data.results || []
  },

  // 2. Create blog post
  async createBlog(formData) {
    const payload = new FormData()
    payload.append("type", "blog")
    payload.append("title", formData.title || "")
    if (formData.title_am) payload.append("title_am", formData.title_am)
    if (formData.subtitle) payload.append("subtitle", formData.subtitle)
    if (formData.subtitle_am) payload.append("subtitle_am", formData.subtitle_am)
    if (formData.category) payload.append("category", formData.category)
    if (formData.content) payload.append("content", formData.content)
    if (formData.content_am) payload.append("content_am", formData.content_am)
    if (formData.tags) payload.append("tags", formData.tags)
    payload.append("status", formData.status || "draft")

    if (formData.hasVideo && formData.iframe) {
      payload.append("iframe", formData.iframe)
    }
    if (formData.cover_image instanceof File) {
      payload.append("cover_image", formData.cover_image)
    }
    if (formData.pdf_file instanceof File) {
      payload.append("pdf_file", formData.pdf_file)
    }
    formData.images?.forEach((img) => {
      if (img instanceof File) payload.append("images", img)
    })

    const { data } = await axiosInstance.post("/blogs/blogpost/", payload)
    return data
  },

  // 4. Update blog
  async updateBlog(blogId, formData) {
    const payload = new FormData()
    payload.append("type", "blog")
    payload.append("title", formData.title || "")
    if (formData.title_am !== undefined) payload.append("title_am", formData.title_am)
    if (formData.subtitle !== undefined) payload.append("subtitle", formData.subtitle)
    if (formData.subtitle_am !== undefined) payload.append("subtitle_am", formData.subtitle_am)
    if (formData.category) payload.append("category", formData.category)
    if (formData.content !== undefined) payload.append("content", formData.content)
    if (formData.content_am !== undefined) payload.append("content_am", formData.content_am)
    if (formData.tags !== undefined) payload.append("tags", formData.tags)
    payload.append("status", formData.status || "draft")

    if (formData.hasVideo && formData.iframe) {
      payload.append("iframe", formData.iframe)
    }
    if (formData.cover_image instanceof File) {
      payload.append("cover_image", formData.cover_image)
    }
    if (formData.pdf_file instanceof File) {
      payload.append("pdf_file", formData.pdf_file)
    }

    formData.images
      ?.filter((img) => img instanceof File)
      .forEach((img) => payload.append("images", img))

    const { data } = await axiosInstance.put(`/blogs/blog/${blogId}/`, payload)
    return data
  },

  // 5. Delete blog
  async deleteBlog(blogId) {
    await axiosInstance.delete(`/blogs/blog/${blogId}/`)
    return
  },
}
