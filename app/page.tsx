"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DispatcherDashboard } from "@/components/dispatcher-dashboard"
import { HospitalDashboard } from "@/components/hospital-dashboard"
import { FamilyMobileView } from "@/components/family-mobile-view"
import { useAuth } from "@/components/auth-provider"
import { Activity } from "lucide-react"
import Link from "next/link"

export default function ArogyaPath() {
  const [activeRole, setActiveRole] = useState<"dispatcher" | "hospital" | "family">("dispatcher")
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading Arogya Path...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg shadow-sm">
                  <Activity className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-card-foreground">Arogya Path</h1>
                  <p className="text-sm text-muted-foreground">Ambulance Tracking System</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  Demo System
                </Badge>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <span>→</span>
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Welcome Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto animate-stagger-1">
            <h2 className="text-3xl font-bold mb-6">Welcome to Arogya Path</h2>
            <p className="text-lg text-muted-foreground mb-8">
              A comprehensive ambulance tracking and dispatch management system designed for healthcare providers,
              hospitals, and families to ensure rapid emergency response.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 border rounded-lg glass-card">
                <div className="text-4xl mx-auto mb-4">🚑</div>
                <h3 className="font-semibold mb-2">Dispatcher Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Manage ambulance fleet, assign emergency requests, and track real-time locations.
                </p>
              </div>

              <div className="p-6 border rounded-lg glass-card">
                <div className="text-4xl mx-auto mb-4">🏥</div>
                <h3 className="font-semibold mb-2">Hospital Portal</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor incoming ambulances, patient vitals, and coordinate with emergency teams.
                </p>
              </div>

              <div className="p-6 border rounded-lg glass-card">
                <div className="text-4xl mx-auto mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="font-semibold mb-2">Family Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time updates on ambulance location and estimated arrival times for families.
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center animate-stagger-2">
              <Link href="/auth/login">
                <Button size="lg">Login to Dashboard</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg shadow-sm">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-card-foreground">Arogya Path</h1>
                <p className="text-sm text-muted-foreground">Ambulance Tracking System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                Live System
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Role Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dispatcher" className="flex items-center gap-2">
              <span>🚑</span>
              Dispatcher
            </TabsTrigger>
            <TabsTrigger value="hospital" className="flex items-center gap-2">
              <span>🏥</span>
              Hospital
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <span>👨‍👩‍👧‍👦</span>
              Family
            </TabsTrigger>
          </TabsList>

          {/* Dispatcher Dashboard */}
          <TabsContent value="dispatcher" className="space-y-6">
            <DispatcherDashboard />
          </TabsContent>

          {/* Hospital Dashboard */}
          <TabsContent value="hospital" className="space-y-6">
            <HospitalDashboard />
          </TabsContent>

          {/* Family Mobile View */}
          <TabsContent value="family" className="space-y-6">
            <FamilyMobileView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
