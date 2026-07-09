"use client"

import { useRealtimeAmbulances } from "@/hooks/use-realtime-data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Truck } from "lucide-react"

export function RealtimeAmbulanceTracker() {
  const { ambulances, loading } = useRealtimeAmbulances()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Live Ambulance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading ambulances...</div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "dispatched":
        return "bg-yellow-500"
      case "en_route":
        return "bg-blue-500"
      case "at_hospital":
        return "bg-purple-500"
      case "returning":
        return "bg-orange-500"
      case "maintenance":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Live Ambulance Tracking ({ambulances.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ambulances.map((ambulance) => (
            <div key={ambulance.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(ambulance.status)}`} />
                <div>
                  <div className="font-medium">{ambulance.vehicle_number}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {ambulance.driver_name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {ambulance.status.replace("_", " ")}
                </Badge>
                {ambulance.current_lat && ambulance.current_lng && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {ambulance.current_lat.toFixed(4)}, {ambulance.current_lng.toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
