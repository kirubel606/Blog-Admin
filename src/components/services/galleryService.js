// src/services/galleryService.js
import axiosInstance from "../../api"

export const galleryService = {
    // Get all gallery articles
    async getAllgallery() {
      // GET {API_BASE_URL}/gallery/all/
      const { data } = await axiosInstance.get("/gallery/")
      // if data.results.result exists, return that
      if (data.results?.result) return data.results.result
      // otherwise if array, return it
      if (Array.isArray(data)) return data
      // otherwise return data.results or empty
      return data.results || []
    },
  
  // ✅ Create new gallery with images
  async createGallery(formData) {
    const payload = new FormData()

    payload.append("title", formData.title)
    payload.append("title_am", formData.title_am)
    payload.append("caption", formData.caption || "")
    payload.append("caption_am", formData.caption_am || "")
    payload.append("discription", formData.discription || "")
    payload.append("discription_am", formData.discription_am || "")
    payload.append("classification", "gallery")

    if (formData.category)
      payload.append("category", formData.category.toString())

    if (formData.published_at)
      payload.append("published_at", formData.published_at)

    if (formData.tags)
      payload.append("tags", Array.isArray(formData.tags) ? formData.tags.join(",") : formData.tags)

    // Append images (if any)
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((img, i) => {
        payload.append(`images`, img)
      })
    }

    const { data } = await axiosInstance.post("/gallery/", payload)
    return data
  },

// ✅ Update existing gallery
async updateGallery(galleryId, formData) {
    const payload = new FormData()
  
    payload.append("title", formData.title)
    payload.append("title_am", formData.title_am)
    payload.append("caption", formData.caption || "")
    payload.append("caption_am", formData.caption_am || "")
    payload.append("discription", formData.discription || "")
    payload.append("discription_am", formData.discription_am || "")
    payload.append("classification", "gallery")
  
    if (formData.category)
      payload.append("category", formData.category.toString())
  
    if (formData.published_at)
      payload.append("published_at", formData.published_at)
  
    if (formData.tags)
      payload.append(
        "tags",
        Array.isArray(formData.tags) ? formData.tags.join(",") : formData.tags
      )
  
    // ✅ Add new image files only
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((img) => {
        if (img instanceof File) {
          payload.append("images", img)
        }
      })
    }
  
    // ✅ Inform backend of removed existing images (URLs or IDs)
    if (formData.removedImages && formData.removedImages.length > 0) {
      formData.removedImages.forEach((imgUrlOrId) => {
        payload.append("removed_images", imgUrlOrId)
      })
    }
  
    const { data } = await axiosInstance.put(`/gallery/${galleryId}/`, payload)
    return data
  },

  // ✅ Delete gallery
  async deleteGallery(galleryId) {
    await axiosInstance.delete(`/gallery/${galleryId}/`)
    return
  },
}
