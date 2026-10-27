// src/components/ui/Toast.jsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Copy,
  Check,
} from "lucide-react"
import { extractErrorDetails } from "../../utils/errorParser"

// Simple event-driven toast store for global access without react context limitations
const listeners = new Set()
let toasts = []
const recentToasts = new Map() // For deduplication

const notify = () => {
  listeners.forEach((listener) => listener([...toasts]))
}

const addToast = (toastItem) => {
  // Deduplicate identical toasts dispatched within 1500ms
  const dedupKey = `${toastItem.type}-${toastItem.title}-${(toastItem.messages || []).join("|")}`
  const now = Date.now()
  const lastTime = recentToasts.get(dedupKey)
  if (lastTime && now - lastTime < 1500) {
    return toastItem.id
  }
  recentToasts.set(dedupKey, now)

  // Clean old deduplication entries
  if (recentToasts.size > 50) {
    for (const [key, timestamp] of recentToasts.entries()) {
      if (now - timestamp > 5000) recentToasts.delete(key)
    }
  }

  toasts = [toastItem, ...toasts.slice(0, 4)] // keep max 5 toasts visible
  notify()
  return toastItem.id
}

const removeToast = (id) => {
  toasts = toasts.filter((t) => t.id !== id)
  notify()
}

/**
 * Global toast interface callable anywhere in the codebase.
 */
export const toast = {
  /**
   * Show error toast. Accepts Error, Axios error, string, or object with field validation messages.
   */
  error(errorOrMessage, options = {}) {
    if (errorOrMessage && typeof errorOrMessage === "object") {
      errorOrMessage.__toasted = true
    }
    const fallbackTitle = typeof options === "string" ? options : options.title || "Operation Failed"
    const parsed = extractErrorDetails(errorOrMessage, fallbackTitle)
    const duration = options.duration || (parsed.messages.length > 2 ? 10000 : 7000)

    return addToast({
      id: Math.random().toString(36).substring(2, 9),
      type: "error",
      title: options.title || parsed.title,
      messages: parsed.messages,
      fullText: parsed.fullText,
      status: parsed.status,
      duration,
      createdAt: Date.now(),
    })
  },

  /**
   * Show success toast.
   */
  success(message, options = {}) {
    const title = typeof options === "string" ? options : options.title || "Success"
    const text = typeof message === "string" ? message : "Operation completed successfully."
    const duration = options.duration || 4000

    return addToast({
      id: Math.random().toString(36).substring(2, 9),
      type: "success",
      title,
      messages: [text],
      fullText: text,
      duration,
      createdAt: Date.now(),
    })
  },

  /**
   * Show warning toast.
   */
  warning(message, options = {}) {
    const title = typeof options === "string" ? options : options.title || "Warning"
    const text = typeof message === "string" ? message : ""
    const duration = options.duration || 6000

    return addToast({
      id: Math.random().toString(36).substring(2, 9),
      type: "warning",
      title,
      messages: [text],
      fullText: text,
      duration,
      createdAt: Date.now(),
    })
  },

  /**
   * Show info toast.
   */
  info(message, options = {}) {
    const title = typeof options === "string" ? options : options.title || "Information"
    const text = typeof message === "string" ? message : ""
    const duration = options.duration || 4500

    return addToast({
      id: Math.random().toString(36).substring(2, 9),
      type: "info",
      title,
      messages: [text],
      fullText: text,
      duration,
      createdAt: Date.now(),
    })
  },

  /**
   * Dismiss a specific toast by id.
   */
  dismiss(id) {
    if (id) removeToast(id)
    else {
      toasts = []
      notify()
    }
  },
}

/**
 * Optional hook version for components that prefer useToast()
 */
export function useToast() {
  return { toast }
}

/**
 * Individual Toast Item Component
 */
function ToastItem({ item, onDismiss }) {
  const [isPaused, setIsPaused] = useState(false)
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(100)
  const startTimeRef = useRef(Date.now())
  const remainingTimeRef = useRef(item.duration)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    startTimeRef.current = Date.now()
    const interval = 50
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const newRemaining = remainingTimeRef.current - elapsed

      if (newRemaining <= 0) {
        clearInterval(timerRef.current)
        onDismiss(item.id)
      } else {
        const pct = Math.max(0, (newRemaining / item.duration) * 100)
        setProgress(pct)
      }
    }, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      const elapsed = Date.now() - startTimeRef.current
      remainingTimeRef.current -= elapsed
    }
  }, [isPaused, item.duration, item.id, onDismiss])

  const handleCopy = async () => {
    try {
      const copyText = `${item.title}\n${item.fullText || (item.messages || []).join("\n")}`
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore clipboard error
    }
  }

  // Type-specific colors and icons
  const typeConfig = {
    error: {
      border: "border-l-rose-500",
      accentBg: "bg-rose-50",
      iconBg: "bg-rose-100 text-rose-600",
      titleColor: "text-rose-950",
      progressBar: "bg-rose-500",
      icon: AlertCircle,
    },
    success: {
      border: "border-l-emerald-500",
      accentBg: "bg-emerald-50",
      iconBg: "bg-emerald-100 text-emerald-600",
      titleColor: "text-emerald-950",
      progressBar: "bg-emerald-500",
      icon: CheckCircle2,
    },
    warning: {
      border: "border-l-amber-500",
      accentBg: "bg-amber-50",
      iconBg: "bg-amber-100 text-amber-600",
      titleColor: "text-amber-950",
      progressBar: "bg-amber-500",
      icon: AlertTriangle,
    },
    info: {
      border: "border-l-blue-500",
      accentBg: "bg-blue-50",
      iconBg: "bg-blue-100 text-blue-600",
      titleColor: "text-blue-950",
      progressBar: "bg-blue-500",
      icon: Info,
    },
  }[item.type] || {
    border: "border-l-gray-500",
    accentBg: "bg-gray-50",
    iconBg: "bg-gray-100 text-gray-600",
    titleColor: "text-gray-900",
    progressBar: "bg-gray-500",
    icon: Info,
  }

  const Icon = typeConfig.icon
  const isMultiple = (item.messages || []).length > 1

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-xl bg-white shadow-2xl border border-gray-200/80 border-l-4 ${typeConfig.border} transition-all duration-300 animate-in fade-in slide-in-from-top-3`}
      role="alert"
    >
      <div className="p-4 flex items-start gap-3">
        {/* Type Icon */}
        <div className={`flex-shrink-0 p-2 rounded-lg ${typeConfig.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className={`text-sm font-semibold tracking-tight ${typeConfig.titleColor}`}>
              {item.title}
            </h4>
            {item.type === "error" && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 transition-colors px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200"
                title="Copy error details"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-gray-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Messages display */}
          {isMultiple ? (
            <div className="mt-1.5 max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs text-gray-700">
              {item.messages.map((msg, idx) => {
                const parts = msg.split(": ")
                const hasField = parts.length > 1 && parts[0].length < 35
                return (
                  <div key={idx} className="flex items-start gap-1.5 bg-gray-50/80 p-1.5 rounded border border-gray-100">
                    <span className="text-rose-500 font-bold select-none">•</span>
                    <span className="leading-snug break-words">
                      {hasField ? (
                        <>
                          <strong className="text-gray-900 font-semibold">{parts[0]}: </strong>
                          <span>{parts.slice(1).join(": ")}</span>
                        </>
                      ) : (
                        msg
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
              {item.messages?.[0] || ""}
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-dismiss countdown bar */}
      <div className="h-1 w-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ease-linear ${typeConfig.progressBar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Root ToastContainer that renders all active toasts.
 */
export function ToastContainer() {
  const [activeToasts, setActiveToasts] = useState([])

  useEffect(() => {
    listeners.add(setActiveToasts)
    return () => listeners.delete(setActiveToasts)
  }, [])

  if (activeToasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-lg w-[calc(100vw-2.5rem)] sm:w-[28rem] pointer-events-none"
    >
      {activeToasts.map((toastItem) => (
        <ToastItem key={toastItem.id} item={toastItem} onDismiss={removeToast} />
      ))}
    </div>
  )
}

export default toast
