"use client"

import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  priority: "low" | "medium" | "high" | "critical"
  read: boolean
  read_at: string | null
  emergency_request_id: string | null
  created_at: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()

  useEffect(() => {
    if (!user || !profile) {
      setLoading(false)
      return
    }

    // Initial fetch
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .or(`recipient_id.eq.${user.id},recipient_role.eq.${profile.role}`)
          .order("created_at", { ascending: false })
          .limit(50)

        if (error) {
          console.error("Error fetching notifications:", error)
        } else {
          setNotifications(data || [])
          setUnreadCount(data?.filter((n) => !n.read).length || 0)
        }
      } catch (error) {
        console.log("Notifications table not found, using empty state")
        setNotifications([])
        setUnreadCount(0)
      }
      setLoading(false)
    }

    fetchNotifications()

    // Set up real-time subscription
    const channel = supabase
      .channel("notifications_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_role=eq.${profile.role}`,
        },
        (payload) => {
          console.log("[v0] New notification received:", payload)
          const newNotification = payload.new as Notification

          setNotifications((prev) => [newNotification, ...prev])
          if (!newNotification.read) {
            setUnreadCount((prev) => prev + 1)
          }

          // Show browser notification if supported
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: "/favicon.ico",
              tag: newNotification.id,
            })
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `recipient_id.eq.${user.id}`,
        },
        (payload) => {
          console.log("[v0] Notification updated:", payload)
          const updatedNotification = payload.new as Notification

          setNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)))

          if (updatedNotification.read && payload.old && !payload.old.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, profile])

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read)

    try {
      await Promise.all(unreadNotifications.map((n) => markAsRead(n.id)))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const requestPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }
    return Notification.permission === "granted"
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    requestPermission,
  }
}
