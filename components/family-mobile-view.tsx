"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

const AmbulanceMap = dynamic(() => import("@/components/ambulance-map"), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-muted flex items-center justify-center rounded-lg border">
      <div className="animate-spin text-2xl">🌍</div>
    </div>
  ),
})
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  Navigation,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Share,
  MessageCircle,
} from "lucide-react"

interface AmbulanceTracking {
  id: string
  eta: number // in minutes
  patient: {
    name: string
    relation: string
  }
  crew: {
    driver: string
    paramedic: string
    phone: string
  }
  location: {
    current: string
    destination: string
    coordinates: { lat: number; lng: number }
  }
  status: "dispatched" | "en_route" | "arrived" | "transporting"
  distance: string
  estimatedArrival: string
}

interface StatusUpdate {
  id: string
  title: string
  description: string
  timestamp: string
  status: "completed" | "current" | "upcoming"
  icon: "dispatched" | "pickup" | "transport" | "arrival"
}

export function FamilyMobileView() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Mock ambulance tracking data
  const ambulanceData: AmbulanceTracking = {
    id: "AMB-002",
    eta: 8,
    patient: {
      name: "Rajesh Gupta",
      relation: "Father",
    },
    crew: {
      driver: "Amit Kumar",
      paramedic: "Dr. Priya Sharma",
      phone: "+91 98765 43211",
    },
    location: {
      current: "Connaught Place",
      destination: "All India Institute of Medical Sciences",
      coordinates: { lat: 28.6139, lng: 77.209 },
    },
    status: "transporting",
    distance: "2.3 km",
    estimatedArrival: "3:45 PM",
  }

  // Mock status updates
  const statusUpdates: StatusUpdate[] = [
    {
      id: "1",
      title: "Ambulance Dispatched",
      description: "Emergency response team assigned and dispatched",
      timestamp: "15 minutes ago",
      status: "completed",
      icon: "dispatched",
    },
    {
      id: "2",
      title: "Patient Picked Up",
      description: "Patient safely loaded and medical care initiated",
      timestamp: "5 minutes ago",
      status: "completed",
      icon: "pickup",
    },
    {
      id: "3",
      title: "En Route to Hospital",
      description: "Transporting patient with continuous monitoring",
      timestamp: "Current",
      status: "current",
      icon: "transport",
    },
    {
      id: "4",
      title: "Hospital Arrival",
      description: "Expected arrival at emergency department",
      timestamp: `In ${ambulanceData.eta} minutes`,
      status: "upcoming",
      icon: "arrival",
    },
  ]

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Ambulance Tracking",
        text: `Tracking ${ambulanceData.id} - ETA: ${ambulanceData.eta} minutes`,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Tracking link copied to clipboard")
    }
  }

  const getStatusIcon = (icon: string, status: string) => {
    const iconClass = `w-5 h-5 ${
      status === "completed" ? "text-secondary" : status === "current" ? "text-primary" : "text-muted-foreground"
    }`

    switch (icon) {
      case "dispatched":
        return <Truck className={iconClass} />
      case "pickup":
        return <User className={iconClass} />
      case "transport":
        return <Activity className={iconClass} />
      case "arrival":
        return <MapPin className={iconClass} />
      default:
        return <CheckCircle className={iconClass} />
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-6">
      {/* Header Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              Live Tracking
            </Badge>
            <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <CardTitle className="text-2xl">Your Ambulance</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2">
            <Truck className="w-4 h-4" />
            {ambulanceData.id} is on the way
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ETA Display */}
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">{ambulanceData.eta}</div>
            <p className="text-lg text-muted-foreground mb-1">minutes</p>
            <p className="text-sm text-muted-foreground">Expected arrival: {ambulanceData.estimatedArrival}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-muted-foreground">{ambulanceData.distance} remaining</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card id="live-map">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Live Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-lg overflow-hidden border">
            <AmbulanceMap 
              ambulances={[{
                id: ambulanceData.id,
                driver: ambulanceData.crew.driver,
                status: ambulanceData.status === 'transporting' ? 'busy' : 'busy',
                location: ambulanceData.location.current,
                coordinates: ambulanceData.location.coordinates,
                lastUpdate: currentTime.toISOString(),
                eta: `${ambulanceData.eta} mins`
              }]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient and Crew Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Trip Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Patient Info */}
          <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-accent-foreground">Patient</p>
                <p className="text-sm text-muted-foreground">
                  {ambulanceData.patient.name} ({ambulanceData.patient.relation})
                </p>
              </div>
            </div>
          </div>

          {/* Crew Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-accent-foreground" />
                <div>
                  <p className="font-medium text-accent-foreground">Paramedic</p>
                  <p className="text-sm text-muted-foreground">{ambulanceData.crew.paramedic}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-accent-foreground" />
                <div>
                  <p className="font-medium text-accent-foreground">Driver</p>
                  <p className="text-sm text-muted-foreground">{ambulanceData.crew.driver}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" asChild>
                <a href={`tel:${ambulanceData.crew.phone.replace(/\s/g, "")}`}>
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          className="w-full" 
          size="lg" 
          onClick={() => document.getElementById('live-map')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <MapPin className="w-5 h-5 mr-2" />
          Track Live
        </Button>
        <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={handleShare}>
          <Share className="w-5 h-5 mr-2" />
          Share
        </Button>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Status Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusUpdates.map((update, index) => (
              <div key={update.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      update.status === "completed"
                        ? "bg-secondary text-secondary-foreground"
                        : update.status === "current"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {getStatusIcon(update.icon, update.status)}
                  </div>
                  {index < statusUpdates.length - 1 && (
                    <div
                      className={`w-0.5 h-8 mt-2 ${update.status === "completed" ? "bg-secondary" : "bg-muted"}`}
                    ></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${update.status === "current" ? "text-primary" : "text-foreground"}`}>
                      {update.title}
                    </h4>
                    {update.status === "current" && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{update.description}</p>
                  <p className="text-xs text-muted-foreground">{update.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h4 className="font-medium">Emergency Contact</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            If you need immediate assistance or have concerns about the patient's condition
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="destructive" size="sm" asChild>
              <a href="tel:102">
                <Phone className="w-4 h-4 mr-2" />
                Call 102
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="sms:102">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
