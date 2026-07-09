"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAmbulanceData } from "@/hooks/use-ambulance-data"
import dynamic from "next/dynamic"

const AmbulanceMap = dynamic(() => import("@/components/ambulance-map"), {
  ssr: false,
  loading: () => (
    <div className="h-80 bg-muted flex items-center justify-center rounded-lg border">
      <div className="text-muted-foreground flex flex-col items-center">
        <span className="text-2xl mb-2 animate-bounce">🌍</span>
        <p>Loading interactive map...</p>
      </div>
    </div>
  ),
})

export function DispatcherDashboard() {
  const {
    ambulances,
    hospitals,
    availableAmbulances,
    busyAmbulances,
    maintenanceAmbulances,
    totalAvailableBeds,
    assignAmbulance,
    lastUpdate,
  } = useAmbulanceData()

  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null)
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredAmbulances = ambulances.filter((ambulance) => {
    const matchesSearch =
      ambulance.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambulance.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambulance.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || ambulance.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAssignAmbulance = () => {
    if (selectedAmbulance && selectedHospital) {
      assignAmbulance(selectedAmbulance, selectedHospital)
      setSelectedAmbulance(null)
      setSelectedHospital(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4 animate-stagger-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg gradient-text">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <span className="mr-2">🚑</span>
              Ambulances ({availableAmbulances.length} Available)
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <span className="mr-2">🏥</span>
              Hospitals ({totalAvailableBeds} Beds)
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <span className="mr-2">📍</span>
              Active Assignments ({busyAmbulances.length})
            </Button>
          </CardContent>
        </Card>

        {/* Fleet Status */}
        <Card className="animate-stagger-2">
          <CardHeader>
            <CardTitle className="text-lg">Fleet Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Available</span>
              <Badge variant="secondary" className="bg-emerald-500 hover:bg-emerald-600 text-white">{availableAmbulances.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">On Duty</span>
              <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">{busyAmbulances.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Maintenance</span>
              <Badge variant="outline" className="border-gray-400">{maintenanceAmbulances.length}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="animate-stagger-3">
          <CardHeader>
            <CardTitle className="text-lg">Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span>📞</span>
              <span>Control Room: 102</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>📞</span>
              <span>Fire: 101</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>📞</span>
              <span>Police: 100</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Panel */}
      <div className="lg:col-span-3 space-y-6">
        {/* Map */}
        <Card className="animate-stagger-2 glass-panel border-0 shadow-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-primary/5 pb-4">
            <div>
              <CardTitle>Live Ambulance Tracking</CardTitle>
              <CardDescription>Real-time locations of all ambulances in the fleet</CardDescription>
            </div>
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              Updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full rounded-lg overflow-hidden border">
              <AmbulanceMap ambulances={ambulances} />
            </div>
          </CardContent>
        </Card>

        {/* Ambulance Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ambulance Fleet Management</CardTitle>
              <CardDescription>Monitor and assign ambulances to hospitals</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <span className="mr-2">+</span>
                  Assign Ambulance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Ambulance to Hospital</DialogTitle>
                  <DialogDescription>Select an available ambulance and destination hospital</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ambulance-select">Select Ambulance</Label>
                    <Select value={selectedAmbulance || ""} onValueChange={setSelectedAmbulance}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an available ambulance" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAmbulances.map((ambulance) => (
                          <SelectItem key={ambulance.id} value={ambulance.id}>
                            {ambulance.id} - {ambulance.driver} ({ambulance.location})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hospital-select">Select Hospital</Label>
                    <Select value={selectedHospital || ""} onValueChange={setSelectedHospital}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose destination hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals.map((hospital) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            {hospital.name} ({hospital.availableBeds} beds available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAssignAmbulance}
                    className="w-full"
                    disabled={!selectedAmbulance || !selectedHospital}
                  >
                    Assign Ambulance
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">🔍</span>
                <Input
                  placeholder="Search ambulances, drivers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <span className="mr-2">🔽</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ambulance List */}
            <div className="space-y-4">
              {filteredAmbulances.map((ambulance) => (
                <div
                  key={ambulance.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                        ambulance.status === "available"
                          ? "bg-secondary"
                          : ambulance.status === "busy"
                            ? "bg-destructive"
                            : "bg-muted"
                      }`}
                    >
                      <span className="text-lg">🚑</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{ambulance.id}</p>
                        <Badge
                          variant={
                            ambulance.status === "available"
                              ? "secondary"
                              : ambulance.status === "busy"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {ambulance.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{ambulance.location}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Driver: {ambulance.driver}</span>
                        <span>•</span>
                        <span>Updated: {ambulance.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {ambulance.eta && (
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <span>⏰</span>
                        {ambulance.eta}
                      </div>
                    )}
                    {ambulance.status === "busy" && (
                      /* Replaced AlertTriangle icon with warning emoji */
                      <span className="text-lg">⚠️</span>
                    )}
                    <Button size="sm" variant="outline">
                      <span className="mr-1">📞</span>
                      Call
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hospital Status */}
        <Card>
          <CardHeader>
            <CardTitle>Hospital Bed Availability</CardTitle>
            <CardDescription>Current capacity at nearby hospitals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hospitals.map((hospital) => (
                <div key={hospital.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{hospital.name}</h4>
                      <p className="text-sm text-muted-foreground">{hospital.address}</p>
                    </div>
                    <Badge variant={hospital.availableBeds > 5 ? "secondary" : "destructive"}>
                      {hospital.distance}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span>🏥</span>
                      <span className="text-sm">
                        {hospital.availableBeds}/{hospital.totalBeds} beds available
                      </span>
                    </div>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${hospital.availableBeds > 5 ? "bg-secondary" : "bg-destructive"}`}
                        style={{ width: `${(hospital.availableBeds / hospital.totalBeds) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
