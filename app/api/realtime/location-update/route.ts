import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { ambulance_id, lat, lng } = await request.json()

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

    // Broadcast location update to all subscribers
    console.log("[v0] Location updated for ambulance:", ambulance_id)

    return NextResponse.json({ success: true, ambulance })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
