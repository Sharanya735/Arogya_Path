"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Heart, Shield, Truck, Users, Stethoscope, FlaskConical } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user has a profile, if not create one
      if (data.user && role) {
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (!profile && !profileError) {
          // Generate employee ID
          const employeeId = `E${Date.now().toString().slice(-6)}`

          // Create profile if it doesn't exist
          await supabase.from("user_profiles").insert({
            id: data.user.id,
            employee_id: employeeId,
            first_name: data.user.email?.split("@")[0] || "User",
            last_name: "Staff",
            role,
            email: data.user.email,
            is_active: true,
          })
        }
      }

      router.push("/")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (roleValue: string) => {
    switch (roleValue) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "doctor":
        return <Stethoscope className="h-4 w-4" />
      case "nurse":
        return <Heart className="h-4 w-4" />
      case "receptionist":
        return <Users className="h-4 w-4" />
      case "pharmacist":
        return <Truck className="h-4 w-4" />
      case "lab_technician":
        return <FlaskConical className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-accent flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Arogya Path</h1>
          </div>
          <p className="text-muted-foreground">Healthcare Management System</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Sign In</CardTitle>
            <CardDescription>Access your healthcare dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@hospital.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="focus:border-primary">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        {getRoleIcon("admin")}
                        Administrator
                      </div>
                    </SelectItem>
                    <SelectItem value="doctor">
                      <div className="flex items-center gap-2">
                        {getRoleIcon("doctor")}
                        Doctor
                      </div>
                    </SelectItem>
                    <SelectItem value="nurse">
                      <div className="flex items-center gap-2">
                        {getRoleIcon("nurse")}
                        Nurse
                      </div>
                    </SelectItem>
                    <SelectItem value="receptionist">
                      <div className="flex items-center gap-2">
                        {getRoleIcon("receptionist")}
                        Receptionist
                      </div>
                    </SelectItem>
                    <SelectItem value="pharmacist">
                      <div className="flex items-center gap-2">
                        {getRoleIcon("pharmacist")}
                        Pharmacist
                      </div>
                    </SelectItem>
                    <SelectItem value="lab_technician">
                      <div className="flex items-center gap-2">
                        {getRoleIcon("lab_technician")}
                        Lab Technician
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !role}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-primary hover:text-primary/80 underline underline-offset-4">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground text-center">
                Demo credentials: Use any email/password combination with your selected role
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
