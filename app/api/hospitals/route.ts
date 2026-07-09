import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: hospitals, error } = await supabase.from("hospitals").select("*").order("name")

    if (error) {
      console.error("Error fetching hospitals:", error)
      return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 })
    }

    return NextResponse.json(hospitals)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
