import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { ambulance_id, estimated_arrival } = await request.json()

    // Update emergency request with ambulance assignment
    const { data: request_data, error: requestError } = await supabase
      .from("emergency_requests")
      .update({
        ambulance_id,
        status: "assigned",
        estimated_arrival,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (requestError) {
      console.error("Error assigning ambulance to request:", requestError)
      return NextResponse.json({ error: "Failed to assign ambulance" }, { status: 500 })
    }

    // Update ambulance status
    const { error: ambulanceError } = await supabase
      .from("ambulances")
      .update({
        status: "dispatched",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ambulance_id)

    if (ambulanceError) {
      console.error("Error updating ambulance status:", ambulanceError)
      return NextResponse.json({ error: "Failed to update ambulance status" }, { status: 500 })
    }

    return NextResponse.json(request_data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
