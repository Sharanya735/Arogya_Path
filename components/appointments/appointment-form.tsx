"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X, Search } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Appointment {
  id?: string
  appointment_id?: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  status: string
  appointment_type: string
  notes: string
  symptoms: string
}

interface Patient {
  id: string
  patient_id: string
  first_name: string
  last_name: string
}

interface Doctor {
  id: string
  doctor_id: string
  first_name: string
  last_name: string
  specialization: string
}

interface AppointmentFormProps {
  appointment?: any
  onSuccess: () => void
  onCancel: () => void
}

export function AppointmentForm({ appointment, onSuccess, onCancel }: AppointmentFormProps) {
  const [formData, setFormData] = useState<Appointment>({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    duration_minutes: 30,
    status: "scheduled",
    appointment_type: "consultation",
    notes: "",
    symptoms: "",
  })
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [patientOpen, setPatientOpen] = useState(false)
  const [doctorOpen, setDoctorOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchPatientsAndDoctors()
    if (appointment) {
      setFormData({
        patient_id: appointment.patients?.id || "",
        doctor_id: appointment.doctors?.id || "",
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        duration_minutes: appointment.duration_minutes,
        status: appointment.status,
        appointment_type: appointment.appointment_type,
        notes: appointment.notes || "",
        symptoms: appointment.symptoms || "",
      })
    }
  }, [appointment])

  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientsResponse, doctorsResponse] = await Promise.all([
        supabase.from("patients").select("id, patient_id, first_name, last_name").order("first_name"),
        supabase.from("doctors").select("id, doctor_id, first_name, last_name, specialization").order("first_name"),
      ])

      if (patientsResponse.error) throw patientsResponse.error
      if (doctorsResponse.error) throw doctorsResponse.error

      setPatients(patientsResponse.data || [])
      setDoctors(doctorsResponse.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const generateAppointmentId = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("appointment_id")
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Error fetching last appointment ID:", error)
      return "A001"
    }

    if (data && data.length > 0) {
      const lastId = data[0].appointment_id
      const numericPart = Number.parseInt(lastId.substring(1)) + 1
      return `A${numericPart.toString().padStart(3, "0")}`
    }

    return "A001"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (appointment?.id) {
        // Update existing appointment
        const { error } = await supabase
          .from("appointments")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", appointment.id)

        if (error) throw error
      } else {
        // Create new appointment
        const appointmentId = await generateAppointmentId()
        const { error } = await supabase.from("appointments").insert({
          ...formData,
          appointment_id: appointmentId,
        })

        if (error) throw error
      }

      onSuccess()
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Appointment, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedPatient = patients.find((p) => p.id === formData.patient_id)
  const selectedDoctor = doctors.find((d) => d.id === formData.doctor_id)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Patient and Doctor Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patient & Doctor</CardTitle>
          <CardDescription>Select patient and attending doctor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Popover open={patientOpen} onOpenChange={setPatientOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={patientOpen}
                    className="w-full justify-between bg-transparent"
                  >
                    {selectedPatient
                      ? `${selectedPatient.first_name} ${selectedPatient.last_name} (${selectedPatient.patient_id})`
                      : "Select patient..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search patients..." />
                    <CommandList>
                      <CommandEmpty>No patients found.</CommandEmpty>
                      <CommandGroup>
                        {patients.map((patient) => (
                          <CommandItem
                            key={patient.id}
                            value={`${patient.first_name} ${patient.last_name} ${patient.patient_id}`}
                            onSelect={() => {
                              handleInputChange("patient_id", patient.id)
                              setPatientOpen(false)
                            }}
                          >
                            {patient.first_name} {patient.last_name} ({patient.patient_id})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Doctor *</Label>
              <Popover open={doctorOpen} onOpenChange={setDoctorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={doctorOpen}
                    className="w-full justify-between bg-transparent"
                  >
                    {selectedDoctor
                      ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name} - ${selectedDoctor.specialization}`
                      : "Select doctor..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search doctors..." />
                    <CommandList>
                      <CommandEmpty>No doctors found.</CommandEmpty>
                      <CommandGroup>
                        {doctors.map((doctor) => (
                          <CommandItem
                            key={doctor.id}
                            value={`${doctor.first_name} ${doctor.last_name} ${doctor.specialization}`}
                            onSelect={() => {
                              handleInputChange("doctor_id", doctor.id)
                              setDoctorOpen(false)
                            }}
                          >
                            Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appointment Details</CardTitle>
          <CardDescription>Date, time, and appointment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Date *</Label>
              <Input
                id="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => handleInputChange("appointment_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment_time">Time *</Label>
              <Input
                id="appointment_time"
                type="time"
                value={formData.appointment_time}
                onChange={(e) => handleInputChange("appointment_time", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Select
                value={formData.duration_minutes.toString()}
                onValueChange={(value) => handleInputChange("duration_minutes", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_type">Type</Label>
              <Select
                value={formData.appointment_type}
                onValueChange={(value) => handleInputChange("appointment_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="routine">Routine Check-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms/Reason for Visit</Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => handleInputChange("symptoms", e.target.value)}
              placeholder="Describe symptoms or reason for appointment"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional notes or instructions"
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.patient_id || !formData.doctor_id}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : appointment ? "Update Appointment" : "Schedule Appointment"}
        </Button>
      </div>
    </form>
  )
}
