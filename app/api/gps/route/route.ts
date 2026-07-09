import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Calculate route between two points (simplified version)
function calculateRoute(startLat: number, startLng: number, endLat: number, endLng: number) {
  // This is a simplified route calculation
  // In production, you would use a routing service like Google Maps, Mapbox, or OpenRouteService

  const distance = calculateDistance(startLat, startLng, endLat, endLng)
  const estimatedTime = Math.round((distance / 50) * 60) // Assuming 50 km/h average speed

  // Generate simple waypoints (straight line for demo)
  const waypoints = []
  const steps = 5
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps
    const lat = startLat + (endLat - startLat) * ratio
    const lng = startLng + (endLng - startLng) * ratio
    waypoints.push({ lat, lng })
  }

  return {
    distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
    estimatedTime,
    waypoints,
    instructions: ["Head towards destination", "Continue straight", "Arrive at destination"],
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function POST(request: Request) {
  try {
    const { start_lat, start_lng, end_lat, end_lng, ambulance_id } = await request.json()

    // Validate required fields
    if (!start_lat || !start_lng || !end_lat || !end_lng) {
      return NextResponse.json({ error: "Missing required coordinates" }, { status: 400 })
    }

    const route = calculateRoute(start_lat, start_lng, end_lat, end_lng)

    // If ambulance_id is provided, update the estimated arrival time
    if (ambulance_id) {
      const supabase = await createClient()
      const estimatedArrival = new Date(Date.now() + route.estimatedTime * 60000) // Convert minutes to milliseconds

      const { error } = await supabase
        .from("emergency_requests")
        .update({
          estimated_arrival: estimatedArrival.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("ambulance_id", ambulance_id)
        .eq("status", "en_route")

      if (error) {
        console.error("Error updating estimated arrival:", error)
      }
    }

    return NextResponse.json({
      success: true,
      route: {
        ...route,
        start: { lat: start_lat, lng: start_lng },
        end: { lat: end_lat, lng: end_lng },
      },
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
