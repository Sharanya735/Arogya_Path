import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { type, id, status, additional_data } = await request.json()

    if (type === "ambulance") {
      const { data, error } = await supabase
        .from("ambulances")
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...additional_data,
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating ambulance status:", error)
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    } else if (type === "emergency_request") {
      const { data, error } = await supabase
        .from("emergency_requests")
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...additional_data,
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating emergency request status:", error)
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
