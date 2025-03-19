"use client"

import type React from "react"

import { useState, useCallback } from "react"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

let count = 0

function generateId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(({ title, description, action, variant }: Omit<ToastProps, "id">) => {
    setToasts((toasts) => {
      const id = generateId()

      // Remove toast if limit is reached
      const newToasts = [...toasts]
      if (newToasts.length >= TOAST_LIMIT) {
        newToasts.shift()
      }

      // Add new toast
      newToasts.push({ id, title, description, action, variant })

      // Auto-remove toast after delay
      setTimeout(() => {
        setToasts((toasts) => toasts.filter((t) => t.id !== id))
      }, 5000)

      return newToasts
    })
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((t) => t.id !== id))
  }, [])

  return { toasts, toast, dismiss }
}

export { useToast as toast }

