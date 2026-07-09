"use client"

import { useState, useEffect, useCallback } from "react"

interface GPSPosition {
  lat: number
  lng: number
  accuracy?: number
  heading?: number
  speed?: number
  timestamp: number
}

interface UseGPSTrackingOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  trackingInterval?: number
}

export function useGPSTracking(options: UseGPSTrackingOptions = {}) {
  const [position, setPosition] = useState<GPSPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  const { enableHighAccuracy = true, timeout = 10000, maximumAge = 60000, trackingInterval = 5000 } = options

  useEffect(() => {
    setIsSupported("geolocation" in navigator)
  }, [])

  const getCurrentPosition = useCallback((): Promise<GPSPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gpsPosition: GPSPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          }
          resolve(gpsPosition)
        },
        (error) => {
          let errorMessage = "Unknown error occurred"
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user"
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable"
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out"
              break
          }
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        },
      )
    })
  }, [enableHighAccuracy, timeout, maximumAge])

  const startTracking = useCallback(() => {
    if (!isSupported) {
      setError("Geolocation is not supported")
      return
    }

    setIsTracking(true)
    setError(null)

    const trackingId = setInterval(async () => {
      try {
        const newPosition = await getCurrentPosition()
        setPosition(newPosition)
        console.log("[v0] GPS position updated:", newPosition)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get position")
        console.error("[v0] GPS tracking error:", err)
      }
    }, trackingInterval)

    // Get initial position immediately
    getCurrentPosition()
      .then(setPosition)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to get initial position"))

    return () => {
      clearInterval(trackingId)
      setIsTracking(false)
    }
  }, [isSupported, getCurrentPosition, trackingInterval])

  const stopTracking = useCallback(() => {
    setIsTracking(false)
  }, [])

  const updateAmbulanceLocation = useCallback(
    async (ambulanceId: string) => {
      if (!position) {
        throw new Error("No GPS position available")
      }

      try {
        const response = await fetch("/api/gps/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ambulance_id: ambulanceId,
            lat: position.lat,
            lng: position.lng,
            heading: position.heading,
            speed: position.speed,
            accuracy: position.accuracy,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update ambulance location")
        }

        const result = await response.json()
        console.log("[v0] Ambulance location updated successfully:", result)
        return result
      } catch (error) {
        console.error("[v0] Error updating ambulance location:", error)
        throw error
      }
    },
    [position],
  )

  return {
    position,
    error,
    isTracking,
    isSupported,
    getCurrentPosition,
    startTracking,
    stopTracking,
    updateAmbulanceLocation,
  }
}
