// src/utils/errorParser.js

/**
 * Formats a field name from snake_case or nested dot notation to clean Title Case.
 * e.g., "cover_image" -> "Cover Image", "user.profile_image" -> "User > Profile Image"
 */
export function formatFieldName(fieldName) {
  if (!fieldName) return ""
  return fieldName
    .replace(/_/g, " ")
    .replace(/\./g, " > ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Extracts exact, readable error messages from any error object,
 * including Axios errors (DRF, FastAPI, Express), JS Error, strings, or plain objects.
 */
export function extractErrorDetails(error, fallbackTitle = "An error occurred") {
  if (!error) {
    return {
      title: fallbackTitle,
      messages: ["An unexpected error occurred. Please try again."],
      fullText: "An unexpected error occurred. Please try again.",
    }
  }

  // If already a plain string
  if (typeof error === "string") {
    return {
      title: fallbackTitle,
      messages: [error],
      fullText: error,
    }
  }

  // Network / Connection Error
  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    const msg = "Unable to connect to backend server. Please check your network connection and verify the server is running."
    return {
      title: "Network Connection Error",
      messages: [msg],
      fullText: msg,
    }
  }

  // Timeout Error
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    const msg = "Request timed out. The server took too long to respond."
    return {
      title: "Request Timeout",
      messages: [msg],
      fullText: msg,
    }
  }

  const status = error?.response?.status
  const data = error?.response?.data

  // Determine an intelligent title based on status or fallback
  let derivedTitle = fallbackTitle
  if (status === 400) derivedTitle = fallbackTitle || "Validation Error"
  else if (status === 401) derivedTitle = "Authentication Required"
  else if (status === 403) derivedTitle = "Permission Denied"
  else if (status === 404) derivedTitle = "Resource Not Found"
  else if (status === 409) derivedTitle = "Conflict / Duplicate"
  else if (status === 413) derivedTitle = "File Too Large"
  else if (status === 422) derivedTitle = fallbackTitle || "Validation Error"
  else if (status >= 500) derivedTitle = `Server Error (${status})`

  const messages = []

  function parseData(val, fieldPrefix = "") {
    if (val === null || val === undefined) return

    // String value
    if (typeof val === "string") {
      const trimmed = val.trim()
      // Detect if backend returned raw HTML (e.g. Django debug 500 page)
      if (trimmed.startsWith("<") && (trimmed.includes("<!DOCTYPE") || trimmed.includes("<html") || trimmed.includes("<body"))) {
        const titleMatch = trimmed.match(/<title>([^<]+)<\/title>/i)
        const h1Match = trimmed.match(/<h1>([^<]+)<\/h1>/i)
        const htmlMsg = titleMatch ? titleMatch[1].trim() : (h1Match ? h1Match[1].trim() : "Internal server error (HTML response)")
        messages.push(fieldPrefix ? `${formatFieldName(fieldPrefix)}: ${htmlMsg}` : htmlMsg)
        return
      }
      messages.push(fieldPrefix ? `${formatFieldName(fieldPrefix)}: ${trimmed}` : trimmed)
      return
    }

    // Number or boolean
    if (typeof val === "number" || typeof val === "boolean") {
      messages.push(fieldPrefix ? `${formatFieldName(fieldPrefix)}: ${val}` : String(val))
      return
    }

    // Array of errors
    if (Array.isArray(val)) {
      val.forEach((item) => {
        if (typeof item === "string" || typeof item === "number") {
          messages.push(fieldPrefix ? `${formatFieldName(fieldPrefix)}: ${item}` : String(item))
        } else if (item && typeof item === "object") {
          // FastAPI / Pydantic validation error: { loc: ["body", "title"], msg: "field required" }
          if (item.loc && item.msg) {
            const locField = Array.isArray(item.loc)
              ? item.loc.filter((l) => l !== "body" && l !== "formData").join(".")
              : item.loc
            messages.push(`${formatFieldName(locField)}: ${item.msg}`)
          } else {
            parseData(item, fieldPrefix)
          }
        }
      })
      return
    }

    // Object
    if (typeof val === "object") {
      // DRF commonly uses "detail", "non_field_errors", "message", "error", "errors"
      for (const [key, subVal] of Object.entries(val)) {
        if (key === "detail" || key === "message" || key === "error") {
          if (typeof subVal === "string") {
            messages.push(subVal)
          } else {
            parseData(subVal, fieldPrefix)
          }
        } else if (key === "non_field_errors") {
          parseData(subVal, "")
        } else if (key === "errors") {
          parseData(subVal, fieldPrefix)
        } else {
          const nextPrefix = fieldPrefix ? `${fieldPrefix}.${key}` : key
          parseData(subVal, nextPrefix)
        }
      }
    }
  }

  if (data) {
    parseData(data)
  } else if (error.message) {
    messages.push(error.message)
  }

  // Fallbacks if nothing extracted
  if (messages.length === 0) {
    if (status >= 500) {
      messages.push(`Server encountered an internal error (${status}). Please check backend logs or try again later.`)
    } else if (status === 403) {
      messages.push("You do not have permission to perform this action.")
    } else if (status === 401) {
      messages.push("Your session has expired. Please log in again.")
    } else if (status === 404) {
      messages.push("The requested resource was not found on the server.")
    } else {
      messages.push("Operation failed. Please review your input and try again.")
    }
  }

  // Remove duplicate messages while preserving order
  const uniqueMessages = Array.from(new Set(messages.filter(Boolean)))

  return {
    title: derivedTitle,
    messages: uniqueMessages,
    fullText: uniqueMessages.join("\n"),
    status,
  }
}
