import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { emergency_request_id, alert_type, custom_message } = await request.json()

    // Get emergency request details
    const { data: emergencyRequest, error: requestError } = await supabase
      .from("emergency_requests")
      .select(`
        *,
        ambulance:ambulances(vehicle_number, driver_name),
        hospital:hospitals(name)
      `)
      .eq("id", emergency_request_id)
      .single()

    if (requestError || !emergencyRequest) {
      return NextResponse.json({ error: "Emergency request not found" }, { status: 404 })
    }

    const notifications = []

    switch (alert_type) {
      case "ambulance_dispatched":
        // Notify hospital staff
        notifications.push({
          title: "Ambulance Dispatched",
          message:
            custom_message ||
            `Ambulance ${emergencyRequest.ambulance?.vehicle_number} dispatched for ${emergencyRequest.patient_name}. ETA: ${emergencyRequest.estimated_arrival ? new Date(emergencyRequest.estimated_arrival).toLocaleTimeString() : "TBD"}`,
          type: "ambulance_dispatch",
          recipient_role: "hospital_staff",
          emergency_request_id,
          priority: emergencyRequest.severity === "critical" ? "high" : "medium",
        })

        // Notify family (if we had family contact info)
        notifications.push({
          title: "Emergency Response Update",
          message:
            custom_message ||
            `An ambulance has been dispatched for ${emergencyRequest.patient_name}. We will keep you updated.`,
          type: "family_update",
          recipient_role: "family_member",
          emergency_request_id,
          priority: "medium",
        })
        break

      case "patient_picked_up":
        notifications.push({
          title: "Patient Picked Up",
          message:
            custom_message ||
            `Patient ${emergencyRequest.patient_name} has been picked up and is en route to ${emergencyRequest.hospital?.name}`,
          type: "patient_update",
          recipient_role: "hospital_staff",
          emergency_request_id,
          priority: "medium",
        })
        break

      case "arriving_hospital":
        notifications.push({
          title: "Ambulance Arriving",
          message:
            custom_message ||
            `Ambulance ${emergencyRequest.ambulance?.vehicle_number} with patient ${emergencyRequest.patient_name} arriving in 5 minutes`,
          type: "arrival_alert",
          recipient_role: "hospital_staff",
          emergency_request_id,
          priority: "high",
        })
        break

      case "critical_alert":
        notifications.push({
          title: "CRITICAL EMERGENCY",
          message:
            custom_message || `Critical emergency for ${emergencyRequest.patient_name}. Immediate attention required.`,
          type: "critical_alert",
          recipient_role: "dispatcher",
          emergency_request_id,
          priority: "critical",
        })

        notifications.push({
          title: "CRITICAL PATIENT INCOMING",
          message: custom_message || `Critical patient ${emergencyRequest.patient_name} incoming. Prepare trauma team.`,
          type: "critical_alert",
          recipient_role: "hospital_staff",
          emergency_request_id,
          priority: "critical",
        })
        break
    }

    // Insert all notifications
    const { data: createdNotifications, error: notificationError } = await supabase
      .from("notifications")
      .insert(notifications)
      .select()

    if (notificationError) {
      console.error("Error creating notifications:", notificationError)
      return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 })
    }

    console.log("[v0] Emergency alert sent:", alert_type, "for request:", emergency_request_id)

    return NextResponse.json({
      success: true,
      notifications_sent: createdNotifications.length,
      notifications: createdNotifications,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
