"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Truck,
  Activity,
  MessageSquare,
  Bell,
  Phone,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Send,
  Bed,
  Heart,
  Thermometer,
} from "lucide-react"

interface IncomingAmbulance {
  id: string
  eta: string
  patient: {
    name: string
    age: number
    condition: string
    priority: "high" | "medium" | "low"
    vitals: {
      heartRate: number
      bloodPressure: string
      temperature: number
      oxygenSaturation: number
    }
  }
  crew: {
    paramedic: string
    driver: string
    phone: string
  }
  location: string
  distance: string
  assignedBed: string | null
}

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
  type: "crew" | "hospital" | "dispatch"
}

interface Notification {
  id: string
  type: "arrival" | "assignment" | "emergency" | "update"
  title: string
  message: string
  timestamp: string
  priority: "high" | "medium" | "low"
  read: boolean
}

export function HospitalDashboard() {
  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "arrival",
      title: "High Priority Arrival",
      message: "AMB-002 arriving in 8 minutes with cardiac patient",
      timestamp: "2 min ago",
      priority: "high",
      read: false,
    },
    {
      id: "2",
      type: "assignment",
      title: "Bed Assignment",
      message: "Room 12 prepared for incoming patient",
      timestamp: "5 min ago",
      priority: "medium",
      read: false,
    },
    {
      id: "3",
      type: "update",
      title: "Patient Update",
      message: "AMB-005 patient condition stable",
      timestamp: "10 min ago",
      priority: "low",
      read: true,
    },
  ])

  // Mock data for incoming ambulances
  const incomingAmbulances: IncomingAmbulance[] = [
    {
      id: "AMB-002",
      eta: "8 min",
      patient: {
        name: "Rajesh Gupta",
        age: 58,
        condition: "Acute Myocardial Infarction",
        priority: "high",
        vitals: {
          heartRate: 110,
          bloodPressure: "160/95",
          temperature: 98.6,
          oxygenSaturation: 92,
        },
      },
      crew: {
        paramedic: "Dr. Priya Sharma",
        driver: "Amit Kumar",
        phone: "+91 98765 43211",
      },
      location: "Connaught Place",
      distance: "2.3 km",
      assignedBed: "ICU-12",
    },
    {
      id: "AMB-005",
      eta: "22 min",
      patient: {
        name: "Sunita Devi",
        age: 34,
        condition: "Orthopedic Transfer",
        priority: "medium",
        vitals: {
          heartRate: 78,
          bloodPressure: "120/80",
          temperature: 98.2,
          oxygenSaturation: 98,
        },
      },
      crew: {
        paramedic: "Nurse Kavita Singh",
        driver: "Ravi Sharma",
        phone: "+91 98765 43214",
      },
      location: "Safdarjung Hospital",
      distance: "8.5 km",
      assignedBed: "Ward-A-15",
    },
    {
      id: "AMB-007",
      eta: "35 min",
      patient: {
        name: "Mohammad Ali",
        age: 67,
        condition: "Routine Dialysis Transport",
        priority: "low",
        vitals: {
          heartRate: 72,
          bloodPressure: "130/85",
          temperature: 98.4,
          oxygenSaturation: 96,
        },
      },
      crew: {
        paramedic: "Nurse Deepak Yadav",
        driver: "Suresh Kumar",
        phone: "+91 98765 43215",
      },
      location: "Lajpat Nagar",
      distance: "12.1 km",
      assignedBed: "Dialysis-3",
    },
  ]

  // Mock chat messages
  const chatMessages: ChatMessage[] = [
    {
      id: "1",
      sender: "AMB-002 Crew",
      message: "Patient stable, ETA 8 minutes. Requesting ICU bed preparation.",
      timestamp: "2 min ago",
      type: "crew",
    },
    {
      id: "2",
      sender: "Hospital Staff",
      message: "ICU bed 12 prepared. Cardiac team on standby.",
      timestamp: "1 min ago",
      type: "hospital",
    },
    {
      id: "3",
      sender: "Dispatch",
      message: "Traffic update: Route clear via Ring Road",
      timestamp: "3 min ago",
      type: "dispatch",
    },
    {
      id: "4",
      sender: "AMB-005 Crew",
      message: "Patient comfortable, no complications during transfer",
      timestamp: "5 min ago",
      type: "crew",
    },
  ]

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // In a real app, this would send the message via API
      console.log("Sending message:", chatMessage)
      setChatMessage("")
    }
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "border-l-destructive bg-destructive/5"
      case "medium":
        return "border-l-primary bg-primary/5"
      case "low":
        return "border-l-secondary bg-secondary/5"
    }
  }

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Incoming Ambulances - Main Panel */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Incoming Ambulances
            </CardTitle>
            <CardDescription>Expected arrivals and patient information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomingAmbulances.map((ambulance) => (
              <Card
                key={ambulance.id}
                className={`border-l-4 cursor-pointer transition-all hover:shadow-md ${getPriorityColor(
                  ambulance.patient.priority,
                )} ${selectedAmbulance === ambulance.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedAmbulance(ambulance.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                        <Truck className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{ambulance.id}</h4>
                        <p className="text-sm text-muted-foreground">{ambulance.distance} away</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{ambulance.eta}</div>
                      <Badge variant={getPriorityBadge(ambulance.patient.priority)}>
                        {ambulance.patient.priority} priority
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Patient Information */}
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-sm text-muted-foreground mb-2">PATIENT DETAILS</h5>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {ambulance.patient.name}, {ambulance.patient.age}y
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{ambulance.patient.condition}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{ambulance.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Assigned Bed */}
                      {ambulance.assignedBed && (
                        <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg">
                          <Bed className="w-4 h-4 text-secondary" />
                          <span className="text-sm font-medium">Assigned: {ambulance.assignedBed}</span>
                          <CheckCircle className="w-4 h-4 text-secondary ml-auto" />
                        </div>
                      )}
                    </div>

                    {/* Vital Signs */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm text-muted-foreground">VITAL SIGNS</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <div>
                            <div className="text-sm font-medium">{ambulance.patient.vitals.heartRate} BPM</div>
                            <div className="text-xs text-muted-foreground">Heart Rate</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="text-sm font-medium">{ambulance.patient.vitals.bloodPressure}</div>
                            <div className="text-xs text-muted-foreground">Blood Pressure</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-orange-500" />
                          <div>
                            <div className="text-sm font-medium">{ambulance.patient.vitals.temperature}°F</div>
                            <div className="text-xs text-muted-foreground">Temperature</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-green-500" />
                          <div>
                            <div className="text-sm font-medium">{ambulance.patient.vitals.oxygenSaturation}%</div>
                            <div className="text-xs text-muted-foreground">O2 Saturation</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Crew Information */}
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Crew:</span> {ambulance.crew.paramedic} • {ambulance.crew.driver}
                    </div>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-1" />
                      Call Crew
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Hospital Bed Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="w-5 h-5" />
              Bed Availability
            </CardTitle>
            <CardDescription>Current capacity across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { department: "ICU", available: 3, total: 12, color: "bg-destructive" },
                { department: "Emergency", available: 8, total: 20, color: "bg-primary" },
                { department: "General Ward", available: 15, total: 45, color: "bg-secondary" },
              ].map((dept) => (
                <div key={dept.department} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{dept.department}</h4>
                    <Badge variant={dept.available < 5 ? "destructive" : "secondary"}>{dept.available} available</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${dept.color}`}
                        style={{ width: `${(dept.available / dept.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {dept.available}/{dept.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication and Notifications Sidebar */}
      <div className="space-y-6">
        {/* Communication Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Communication
            </CardTitle>
            <CardDescription>Real-time messaging with ambulance crews</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 mb-4">
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.type === "hospital"
                        ? "bg-primary text-primary-foreground ml-4"
                        : message.type === "crew"
                          ? "bg-accent text-accent-foreground mr-4"
                          : "bg-muted text-muted-foreground mx-2"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{message.sender}</span>
                      <span className="text-xs opacity-70">{message.timestamp}</span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="sm" onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {notifications.filter((n) => !n.read).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notifications.filter((n) => !n.read).length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Important updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      !notification.read ? "bg-accent/50 border-primary" : "bg-muted/30 border-border"
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          notification.priority === "high"
                            ? "bg-destructive"
                            : notification.priority === "medium"
                              ? "bg-primary"
                              : "bg-secondary"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {notification.type === "arrival" && <Truck className="w-4 h-4" />}
                          {notification.type === "assignment" && <Bed className="w-4 h-4" />}
                          {notification.type === "emergency" && <AlertTriangle className="w-4 h-4" />}
                          {notification.type === "update" && <CheckCircle className="w-4 h-4" />}
                          <span className="font-medium text-sm">{notification.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
                        <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Alert
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Bed className="w-4 h-4 mr-2" />
              Manage Beds
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              Contact Dispatch
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
