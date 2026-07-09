import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: ambulances, error } = await supabase
      .from("ambulances")
      .select(`
        *,
        hospital:hospitals(name, address)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching ambulances:", error)
      return NextResponse.json({ error: "Failed to fetch ambulances" }, { status: 500 })
    }

    return NextResponse.json(ambulances)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: ambulance, error } = await supabase.from("ambulances").insert([body]).select().single()

    if (error) {
      console.error("Error creating ambulance:", error)
      return NextResponse.json({ error: "Failed to create ambulance" }, { status: 500 })
    }

    return NextResponse.json(ambulance, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
