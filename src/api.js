// src/api.js
import axios from 'axios'
import { toast } from './components/ui/Toast'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
})

// Attach the token before every request
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global fallback error handler for mutation requests (POST, PUT, PATCH, DELETE)
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const method = error?.config?.method?.toLowerCase()
    const isMutation = ["post", "put", "patch", "delete"].includes(method)

    if (isMutation && error?.config?.silent !== true) {
      // If the caller doesn't explicitly catch and call toast.error, automatically toast it
      setTimeout(() => {
        if (!error.__toasted) {
          toast.error(error)
        }
      }, 0)
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
