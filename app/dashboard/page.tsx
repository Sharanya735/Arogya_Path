import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DispatcherDashboard } from "@/components/dispatcher-dashboard"
import { HospitalDashboard } from "@/components/hospital-dashboard"
import { FamilyMobileView } from "@/components/family-mobile-view"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Render appropriate dashboard based on role
  switch (profile.role) {
    case "dispatcher":
      return <DispatcherDashboard />
    case "hospital_staff":
      return <HospitalDashboard />
    case "family_member":
    case "ambulance_driver":
      return <FamilyMobileView />
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-medical-900 mb-4">Access Denied</h1>
            <p className="text-medical-600">Your role is not recognized. Please contact support.</p>
          </div>
        </div>
      )
  }
}
