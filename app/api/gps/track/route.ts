import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { ambulance_id, lat, lng, heading, speed, accuracy } = await request.json()

    // Validate required fields
    if (!ambulance_id || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update ambulance location
    const { data: ambulance, error } = await supabase
      .from("ambulances")
      .update({
        current_lat: lat,
        current_lng: lng,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ambulance_id)
      .select()
      .single()

    if (error) {
      console.error("Error updating ambulance location:", error)
      return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
    }

    // Store GPS tracking data for history
    const { error: trackingError } = await supabase.from("gps_tracking").insert({
      ambulance_id,
      lat,
      lng,
      heading: heading || null,
      speed: speed || null,
      accuracy: accuracy || null,
      recorded_at: new Date().toISOString(),
    })

    if (trackingError) {
      console.error("Error storing GPS tracking data:", trackingError)
      // Don't fail the request if tracking storage fails
    }

    console.log("[v0] GPS location updated for ambulance:", ambulance_id, "at", lat, lng)

    return NextResponse.json({
      success: true,
      ambulance,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
