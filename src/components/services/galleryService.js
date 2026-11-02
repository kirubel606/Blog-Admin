// src/services/galleryService.js
import axiosInstance from "../../api"

// Base URLs - Primary: aii.et, Fallback: 196.188.240.102
export const PRIMARY_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes("196.188.240.102")
    ? import.meta.env.VITE_API_BASE_URL
    : "https://aii.et/api"

export const FALLBACK_API_BASE_URL = "http://196.188.240.102:8000/api"

export const PRIMARY_MEDIA_BASE = PRIMARY_API_BASE_URL.replace(/\/api\/?$/, "") || "https://aii.et"
export const FALLBACK_MEDIA_BASE = FALLBACK_API_BASE_URL.replace(/\/api\/?$/, "") || "http://196.188.240.102:8000"

/**
 * Executes an Axios request with primary base URL (aii.et) and falls back to IP on failure.
 */
const requestWithFallback = async (requestFn) => {
  try {
    return await requestFn(PRIMARY_API_BASE_URL, false)
  } catch (primaryError) {
    console.warn(
      `[galleryService] Primary request to ${PRIMARY_API_BASE_URL} failed, attempting fallback to ${FALLBACK_API_BASE_URL}...`,
      primaryError?.message || primaryError
    )
    try {
      return await requestFn(FALLBACK_API_BASE_URL, true)
    } catch (fallbackError) {
      console.error(
        `[galleryService] Fallback request to ${FALLBACK_API_BASE_URL} also failed:`,
        fallbackError?.message || fallbackError
      )
      throw fallbackError || primaryError
    }
  }
}

/**
 * Resolves gallery image URL prioritizing the aii.et base URL.
 * Automatically rewrites IP-based URLs to aii.et.
 */
export const getGalleryImageUrl = (image) => {
  if (!image) return ""
  if (typeof window !== "undefined" && image instanceof File) {
    return URL.createObjectURL(image)
  }
  const imageSrc = typeof image === "object" && image !== null && "image" in image ? image.image : image
  if (!imageSrc || typeof imageSrc !== "string") return ""
  if (imageSrc.startsWith("blob:") || imageSrc.startsWith("data:")) return imageSrc

  // If URL contains the fallback IP (with or without port, http or https), rewrite to primary
  if (/^https?:\/\/196\.188\.240\.102(:8000)?/i.test(imageSrc)) {
    return imageSrc.replace(/^https?:\/\/196\.188\.240\.102(:8000)?/i, PRIMARY_MEDIA_BASE)
  }

  // If already on aii.et, ensure https
  if (/^https?:\/\/aii\.et/i.test(imageSrc)) {
    return imageSrc.replace(/^http:\/\/aii\.et/i, PRIMARY_MEDIA_BASE)
  }

  // Other external absolute URLs (e.g. pexels, etc.)
  if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
    return imageSrc
  }

  // Relative path: prepend primary base URL
  const cleanPath = imageSrc.startsWith("/") ? imageSrc : `/${imageSrc}`
  return `${PRIMARY_MEDIA_BASE}${cleanPath}`
}

/**
 * Resolves fallback gallery image URL pointing to the IP base URL.
 */
export const getFallbackGalleryImageUrl = (image) => {
  if (!image) return ""
  if (typeof window !== "undefined" && image instanceof File) {
    return URL.createObjectURL(image)
  }
  const imageSrc = typeof image === "object" && image !== null && "image" in image ? image.image : image
  if (!imageSrc || typeof imageSrc !== "string") return ""
  if (imageSrc.startsWith("blob:") || imageSrc.startsWith("data:")) return imageSrc

  // If pointing to aii.et, rewrite to IP fallback
  if (/^https?:\/\/aii\.et/i.test(imageSrc)) {
    return imageSrc.replace(/^https?:\/\/aii\.et/i, FALLBACK_MEDIA_BASE)
  }

  // If already pointing to IP, ensure correct fallback host (http)
  if (/^https?:\/\/196\.188\.240\.102(:8000)?/i.test(imageSrc)) {
    return imageSrc.replace(/^https?:\/\/196\.188\.240\.102(:8000)?/i, FALLBACK_MEDIA_BASE)
  }

  // Other absolute URLs
  if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
    return imageSrc
  }

  // Relative path: prepend fallback base URL
  const cleanPath = imageSrc.startsWith("/") ? imageSrc : `/${imageSrc}`
  return `${FALLBACK_MEDIA_BASE}${cleanPath}`
}

/**
 * onError handler for gallery images: switches to fallback IP url when primary fails.
 */
export const handleGalleryImageError = (e, originalImage) => {
  const fallbackUrl = getFallbackGalleryImageUrl(originalImage)
  if (fallbackUrl && e.target.src !== fallbackUrl && !e.target.dataset.fallbackTried) {
    e.target.dataset.fallbackTried = "true"
    e.target.src = fallbackUrl
  } else {
    e.target.onerror = null
  }
}

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
  // Get all gallery articles (primary: aii.et, fallback: IP)
  async getAllgallery() {
    const { data } = await requestWithFallback((baseURL) =>
      axiosInstance.get("/gallery/", { baseURL })
    )
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

    const { data } = await requestWithFallback((baseURL, isFallback) =>
      axiosInstance.post("/gallery/", payload, {
        baseURL,
        headers: { "Content-Type": "multipart/form-data" },
        silent: !isFallback,
      })
    )
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

    const { data } = await requestWithFallback((baseURL, isFallback) =>
      axiosInstance.put(`/gallery/${galleryId}/`, payload, {
        baseURL,
        headers: { "Content-Type": "multipart/form-data" },
        silent: !isFallback,
      })
    )
    return data
  },

  // ✅ Delete gallery
  async deleteGallery(galleryId) {
    await requestWithFallback((baseURL, isFallback) =>
      axiosInstance.delete(`/gallery/${galleryId}/`, {
        baseURL,
        silent: !isFallback,
      })
    )
    return
  },
}
