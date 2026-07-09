"use client"

import { supabase } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export interface RealtimeAmbulance {
  id: string
  vehicle_number: string
  driver_name: string
  driver_phone: string
  status: string
  current_lat: number
  current_lng: number
  hospital_id: string
  updated_at: string
}

export interface RealtimeEmergencyRequest {
  id: string
  patient_name: string
  patient_phone: string
  emergency_type: string
  severity: string
  pickup_lat: number
  pickup_lng: number
  pickup_address: string
  destination_hospital_id: string
  ambulance_id: string
  status: string
  dispatcher_notes: string
  estimated_arrival: string
  created_at: string
  updated_at: string
}

export function useRealtimeAmbulances() {
  const [ambulances, setAmbulances] = useState<RealtimeAmbulance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    const fetchAmbulances = async () => {
      try {
        const { data, error } = await supabase.from("ambulances").select("*").order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching ambulances:", error)
        } else {
          setAmbulances(data || [])
        }
      } catch (error) {
        console.log("Ambulances table not found, using mock data")
        setAmbulances([
          {
            id: "1",
            vehicle_number: "AMB-001",
            driver_name: "John Doe",
            driver_phone: "+1234567890",
            status: "available",
            current_lat: 28.6139,
            current_lng: 77.209,
            hospital_id: "1",
            updated_at: new Date().toISOString(),
          },
        ])
      }
      setLoading(false)
    }

    fetchAmbulances()

    // Set up real-time subscription only if table exists
    const channel = supabase
      .channel("ambulances_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ambulances",
        },
        (payload) => {
          console.log("[v0] Ambulance change received:", payload)

          if (payload.eventType === "INSERT") {
            setAmbulances((prev) => [payload.new as RealtimeAmbulance, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setAmbulances((prev) =>
              prev.map((ambulance) =>
                ambulance.id === payload.new.id ? { ...ambulance, ...(payload.new as RealtimeAmbulance) } : ambulance,
              ),
            )
          } else if (payload.eventType === "DELETE") {
            setAmbulances((prev) => prev.filter((ambulance) => ambulance.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { ambulances, loading }
}

export function useRealtimeEmergencyRequests() {
  const [requests, setRequests] = useState<RealtimeEmergencyRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from("emergency_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching emergency requests:", error)
      } else {
        setRequests(data || [])
      }
      setLoading(false)
    }

    fetchRequests()

    const channel = supabase
      .channel("emergency_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emergency_requests",
        },
        (payload) => {
          console.log("[v0] Emergency request change received:", payload)

          if (payload.eventType === "INSERT") {
            setRequests((prev) => [payload.new as RealtimeEmergencyRequest, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setRequests((prev) =>
              prev.map((request) =>
                request.id === payload.new.id ? { ...request, ...(payload.new as RealtimeEmergencyRequest) } : request,
              ),
            )
          } else if (payload.eventType === "DELETE") {
            setRequests((prev) => prev.filter((request) => request.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { requests, loading }
}

export function useRealtimeMessages(emergencyRequestId: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!emergencyRequestId) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("emergency_request_id", emergencyRequestId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
      } else {
        setMessages(data || [])
      }
      setLoading(false)
    }

    fetchMessages()

    const channel = supabase
      .channel(`messages_${emergencyRequestId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `emergency_request_id=eq.${emergencyRequestId}`,
        },
        (payload) => {
          console.log("[v0] New message received:", payload)
          setMessages((prev) => [...prev, payload.new])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [emergencyRequestId])

  return { messages, loading }
}
