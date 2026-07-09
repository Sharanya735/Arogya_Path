"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Plus, Calendar, Clock, Edit, Eye } from "lucide-react"
import { AppointmentForm } from "./appointment-form"
import { AppointmentDetails } from "./appointment-details"

interface Appointment {
  id: string
  appointment_id: string
  appointment_date: string
  appointment_time: string
  status: string
  appointment_type: string
  symptoms: string
  notes: string
  duration_minutes: number
  created_at: string
  patients: {
    first_name: string
    last_name: string
    patient_id: string
    phone: string
  }
  doctors: {
    first_name: string
    last_name: string
    doctor_id: string
    specialization: string
  }
}

export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients (first_name, last_name, patient_id, phone),
          doctors (first_name, last_name, doctor_id, specialization)
        `)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredAppointments = () => {
    let filtered = appointments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (appointment) =>
          `${appointment.patients?.first_name} ${appointment.patients?.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${appointment.doctors?.first_name} ${appointment.doctors?.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          appointment.appointment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.patients?.patient_id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date()
      const appointmentDate = new Date(filtered[0]?.appointment_date || today)

      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((appointment) => {
            const apptDate = new Date(appointment.appointment_date)
            return apptDate.toDateString() === today.toDateString()
          })
          break
        case "tomorrow":
          const tomorrow = new Date(today)
          tomorrow.setDate(today.getDate() + 1)
          filtered = filtered.filter((appointment) => {
            const apptDate = new Date(appointment.appointment_date)
            return apptDate.toDateString() === tomorrow.toDateString()
          })
          break
        case "week":
          const weekFromNow = new Date(today)
          weekFromNow.setDate(today.getDate() + 7)
          filtered = filtered.filter((appointment) => {
            const apptDate = new Date(appointment.appointment_date)
            return apptDate >= today && apptDate <= weekFromNow
          })
          break
      }
    }

    return filtered
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no-show":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-50 text-blue-700"
      case "follow-up":
        return "bg-green-50 text-green-700"
      case "emergency":
        return "bg-red-50 text-red-700"
      case "routine":
        return "bg-gray-50 text-gray-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const filteredAppointments = getFilteredAppointments()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 text-2xl animate-spin">⚕️</div>
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Appointment Scheduling</h2>
          <p className="text-muted-foreground">Manage patient appointments and schedules</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>Book an appointment for a patient</DialogDescription>
            </DialogHeader>
            <AppointmentForm
              onSuccess={() => {
                setShowAddForm(false)
                fetchAppointments()
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by patient name, doctor, or appointment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointments ({filteredAppointments.length})
          </CardTitle>
          <CardDescription>Scheduled appointments and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Appointment ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.appointment_id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {appointment.patients?.first_name} {appointment.patients?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">ID: {appointment.patients?.patient_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          Dr. {appointment.doctors?.first_name} {appointment.doctors?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">{appointment.doctors?.specialization}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {new Date(appointment.appointment_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.appointment_time} ({appointment.duration_minutes}min)
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(appointment.appointment_type)}>
                        {appointment.appointment_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setShowDetails(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setShowEditForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No appointments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "No appointments match your search criteria."
                  : "Get started by scheduling your first appointment."}
              </p>
              {!searchTerm && statusFilter === "all" && dateFilter === "all" && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>Complete appointment information</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <AppointmentDetails appointment={selectedAppointment} onClose={() => setShowDetails(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment information</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <AppointmentForm
              appointment={selectedAppointment}
              onSuccess={() => {
                setShowEditForm(false)
                fetchAppointments()
                setSelectedAppointment(null)
              }}
              onCancel={() => {
                setShowEditForm(false)
                setSelectedAppointment(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
