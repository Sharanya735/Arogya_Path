"use client"

import { useGPSTracking } from "@/hooks/use-gps-tracking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Satellite, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface GPSTrackerProps {
  ambulanceId?: string
  autoStart?: boolean
  showControls?: boolean
}

export function GPSTracker({ ambulanceId, autoStart = false, showControls = true }: GPSTrackerProps) {
  const { position, error, isTracking, isSupported, startTracking, stopTracking, updateAmbulanceLocation } =
    useGPSTracking({
      trackingInterval: 10000, // Update every 10 seconds
      enableHighAccuracy: true,
    })

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  // Auto-start tracking if requested
  useEffect(() => {
    if (autoStart && isSupported) {
      const cleanup = startTracking()
      return cleanup
    }
  }, [autoStart, isSupported, startTracking])

  // Auto-update ambulance location when position changes
  useEffect(() => {
    if (position && ambulanceId && isTracking) {
      updateAmbulanceLocation(ambulanceId)
        .then(() => {
          setLastUpdate(new Date())
          setUpdateError(null)
        })
        .catch((err) => {
          setUpdateError(err instanceof Error ? err.message : "Update failed")
        })
    }
  }, [position, ambulanceId, isTracking, updateAmbulanceLocation])

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            GPS Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Your device or browser does not support GPS tracking.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Satellite className="h-5 w-5" />
          GPS Tracking
          {isTracking && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}

        {updateError && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-600">Location update failed: {updateError}</p>
          </div>
        )}

        {position && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Latitude</div>
                <div className="font-mono">{position.lat.toFixed(6)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Longitude</div>
                <div className="font-mono">{position.lng.toFixed(6)}</div>
              </div>
            </div>

            {position.accuracy && (
              <div className="text-sm">
                <div className="text-muted-foreground">Accuracy</div>
                <div className="flex items-center gap-1">
                  <Navigation className="h-3 w-3" />±{Math.round(position.accuracy)}m
                </div>
              </div>
            )}

            {position.speed && (
              <div className="text-sm">
                <div className="text-muted-foreground">Speed</div>
                <div>{Math.round(position.speed * 3.6)} km/h</div>
              </div>
            )}

            {lastUpdate && (
              <div className="text-xs text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</div>
            )}
          </div>
        )}

        {showControls && (
          <div className="flex gap-2">
            {!isTracking ? (
              <Button onClick={startTracking} className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Start Tracking
              </Button>
            ) : (
              <Button onClick={stopTracking} variant="outline" className="flex items-center gap-2 bg-transparent">
                <MapPin className="h-4 w-4" />
                Stop Tracking
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
