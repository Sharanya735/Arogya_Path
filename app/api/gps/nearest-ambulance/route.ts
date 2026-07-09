import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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
    const supabase = await createClient()
    const { emergency_lat, emergency_lng, max_distance = 50 } = await request.json()

    // Validate required fields
    if (!emergency_lat || !emergency_lng) {
      return NextResponse.json({ error: "Missing emergency coordinates" }, { status: 400 })
    }

    // Get all available ambulances
    const { data: ambulances, error } = await supabase
      .from("ambulances")
      .select(`
        *,
        hospital:hospitals(name, address)
      `)
      .eq("status", "available")

    if (error) {
      console.error("Error fetching ambulances:", error)
      return NextResponse.json({ error: "Failed to fetch ambulances" }, { status: 500 })
    }

    // Calculate distances and find nearest ambulances
    const ambulancesWithDistance = ambulances
      .filter((ambulance) => ambulance.current_lat && ambulance.current_lng)
      .map((ambulance) => {
        const distance = calculateDistance(emergency_lat, emergency_lng, ambulance.current_lat, ambulance.current_lng)

        // Estimate arrival time (assuming 50 km/h average speed in emergency)
        const estimatedArrivalMinutes = Math.round((distance / 50) * 60)

        return {
          ...ambulance,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
          estimatedArrivalMinutes,
        }
      })
      .filter((ambulance) => ambulance.distance <= max_distance)
      .sort((a, b) => a.distance - b.distance)

    return NextResponse.json({
      success: true,
      emergency_location: { lat: emergency_lat, lng: emergency_lng },
      nearest_ambulances: ambulancesWithDistance.slice(0, 5), // Return top 5 nearest
      total_available: ambulancesWithDistance.length,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
