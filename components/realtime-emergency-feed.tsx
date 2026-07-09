"use client"

import { useRealtimeEmergencyRequests } from "@/hooks/use-realtime-data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, MapPin } from "lucide-react"

export function RealtimeEmergencyFeed() {
  const { requests, loading } = useRealtimeEmergencyRequests()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Live Emergency Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading emergency requests...</div>
        </CardContent>
      </Card>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-black"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-red-800"
      case "assigned":
        return "bg-yellow-100 text-yellow-800"
      case "en_route":
        return "bg-blue-100 text-blue-800"
      case "picked_up":
        return "bg-purple-100 text-purple-800"
      case "at_hospital":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Live Emergency Feed ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {requests.map((request) => (
            <div key={request.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(request.severity)}>{request.severity.toUpperCase()}</Badge>
                  <span className="font-medium">{request.emergency_type}</span>
                </div>
                <Badge variant="outline" className={getStatusColor(request.status)}>
                  {request.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>

              <div className="text-sm space-y-1">
                <div>
                  <strong>Patient:</strong> {request.patient_name}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {request.pickup_address}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(request.created_at).toLocaleTimeString()}
                </div>
              </div>

              {request.dispatcher_notes && (
                <div className="text-xs bg-gray-50 p-2 rounded">
                  <strong>Notes:</strong> {request.dispatcher_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
