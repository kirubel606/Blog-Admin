// src/services/galleryService.js
import axiosInstance from "../../api"

const buildGalleryPayload = (formData) => {
  const payload = new FormData()

  payload.append("title", formData.title || "")
  payload.append("title_am", formData.title_am || "")
  payload.append("caption", formData.caption || "")
  payload.append("caption_am", formData.caption_am || "")
  payload.append("discription", formData.discription || "")
  payload.append("discription_am", formData.discription_am || "")
  payload.append("classification", "gallery")
  payload.append("category", String(formData.category || ""))

  if (formData.published_at) {
    payload.append("published_at", formData.published_at)
  }

  if (formData.tags) {
    payload.append("tags", Array.isArray(formData.tags) ? formData.tags.join(",") : formData.tags)
  }

  return payload
}

const debugPayload = (label, payload) => {
  if (!import.meta.env.DEV) return
  const entries = Array.from(payload.entries()).map(([key, value]) => [
    key,
    value instanceof File ? value.name : value,
  ])
  console.debug(label, entries)
}

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
    const payload = buildGalleryPayload(formData)

    // Append images (if any)
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((img) => {
        payload.append(`images`, img)
      })
    }

    debugPayload("createGallery payload", payload)

    const { data } = await axiosInstance.post("/gallery/", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },

// ✅ Update existing gallery
async updateGallery(galleryId, formData) {
    const payload = buildGalleryPayload(formData)
  
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

    debugPayload("updateGallery payload", payload)
  
    const { data } = await axiosInstance.put(`/gallery/${galleryId}/`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },

  // ✅ Delete gallery
  async deleteGallery(galleryId) {
    await axiosInstance.delete(`/gallery/${galleryId}/`)
    return
  },
}
