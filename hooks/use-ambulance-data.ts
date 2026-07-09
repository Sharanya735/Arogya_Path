"use client"

import { useState, useEffect } from "react"
import {
  mockAmbulances,
  mockHospitals,
  mockIncomingAmbulances,
  mockChatMessages,
  mockNotifications,
  mockAmbulanceTracking,
  mockStatusUpdates,
  type Ambulance,
  type Hospital,
  type IncomingAmbulance,
  type ChatMessage,
  type Notification,
  type AmbulanceTracking,
  type StatusUpdate,
} from "@/lib/mock-data"

// Custom hook for managing ambulance data with simulated real-time updates
export function useAmbulanceData() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>(mockAmbulances)
  const [hospitals, setHospitals] = useState<Hospital[]>(mockHospitals)
  const [incomingAmbulances, setIncomingAmbulances] = useState<IncomingAmbulance[]>(mockIncomingAmbulances)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [ambulanceTracking, setAmbulanceTracking] = useState<AmbulanceTracking>(mockAmbulanceTracking)
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>(mockStatusUpdates)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Simulate real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Update ETAs for busy ambulances
      setAmbulances((prev) =>
        prev.map((ambulance) => {
          if (ambulance.status === "busy" && ambulance.eta) {
            const currentEta = Number.parseInt(ambulance.eta.split(" ")[0])
            if (currentEta > 1) {
              return {
                ...ambulance,
                eta: `${currentEta - 1} min`,
                lastUpdate: "Just now",
              }
            } else {
              // Ambulance has arrived, change status to available
              return {
                ...ambulance,
                status: "available",
                eta: null,
                location: "Hospital",
                lastUpdate: "Just now",
              }
            }
          }
          return ambulance
        }),
      )

      // Update incoming ambulances ETAs
      setIncomingAmbulances((prev) =>
        prev.map((ambulance) => {
          const currentEta = Number.parseInt(ambulance.eta.split(" ")[0])
          if (currentEta > 1) {
            return {
              ...ambulance,
              eta: `${currentEta - 1} min`,
            }
          }
          return ambulance
        }),
      )

      // Update family tracking ETA
      setAmbulanceTracking((prev) => {
        if (prev.eta > 1) {
          return {
            ...prev,
            eta: prev.eta - 1,
          }
        }
        return prev
      })

      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Functions to manipulate data
  const assignAmbulance = (ambulanceId: string, hospitalId: string) => {
    setAmbulances((prev) =>
      prev.map((ambulance) =>
        ambulance.id === ambulanceId
          ? {
              ...ambulance,
              status: "busy" as const,
              eta: "25 min",
              location: `En route to ${hospitals.find((h) => h.id === hospitalId)?.name}`,
              lastUpdate: "Just now",
            }
          : ambulance,
      ),
    )

    // Add notification
    const hospital = hospitals.find((h) => h.id === hospitalId)
    if (hospital) {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "assignment",
        title: "Ambulance Assigned",
        message: `${ambulanceId} assigned to ${hospital.name}`,
        timestamp: "Just now",
        priority: "medium",
        read: false,
      }
      setNotifications((prev) => [newNotification, ...prev])
    }
  }

  const addChatMessage = (message: string, sender: string, type: "crew" | "hospital" | "dispatch") => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender,
      message,
      timestamp: "Just now",
      type,
    }
    setChatMessages((prev) => [newMessage, ...prev])
  }

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
  }

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  // Computed values
  const availableAmbulances = ambulances.filter((amb) => amb.status === "available")
  const busyAmbulances = ambulances.filter((amb) => amb.status === "busy")
  const maintenanceAmbulances = ambulances.filter((amb) => amb.status === "maintenance")
  const totalAvailableBeds = hospitals.reduce((sum, hospital) => sum + hospital.availableBeds, 0)
  const unreadNotifications = notifications.filter((notif) => !notif.read)
  const highPriorityNotifications = notifications.filter((notif) => notif.priority === "high")

  return {
    // Data
    ambulances,
    hospitals,
    incomingAmbulances,
    chatMessages,
    notifications,
    ambulanceTracking,
    statusUpdates,
    lastUpdate,

    // Computed values
    availableAmbulances,
    busyAmbulances,
    maintenanceAmbulances,
    totalAvailableBeds,
    unreadNotifications,
    highPriorityNotifications,

    // Actions
    assignAmbulance,
    addChatMessage,
    markNotificationAsRead,
    markAllNotificationsAsRead,

    // Setters for direct manipulation if needed
    setAmbulances,
    setHospitals,
    setIncomingAmbulances,
    setChatMessages,
    setNotifications,
    setAmbulanceTracking,
    setStatusUpdates,
  }
}
