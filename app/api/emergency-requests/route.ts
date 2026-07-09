import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: requests, error } = await supabase
      .from("emergency_requests")
      .select(`
        *,
        ambulance:ambulances(vehicle_number, driver_name, driver_phone),
        hospital:hospitals(name, address, phone),
        patient_vitals(*),
        messages(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching emergency requests:", error)
      return NextResponse.json({ error: "Failed to fetch emergency requests" }, { status: 500 })
    }

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: emergencyRequest, error } = await supabase.from("emergency_requests").insert([body]).select().single()

    if (error) {
      console.error("Error creating emergency request:", error)
      return NextResponse.json({ error: "Failed to create emergency request" }, { status: 500 })
    }

    return NextResponse.json(emergencyRequest, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
