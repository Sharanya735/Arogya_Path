import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: vitals, error } = await supabase.from("patient_vitals").insert([body]).select().single()

    if (error) {
      console.error("Error recording patient vitals:", error)
      return NextResponse.json({ error: "Failed to record vitals" }, { status: 500 })
    }

    return NextResponse.json(vitals, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
