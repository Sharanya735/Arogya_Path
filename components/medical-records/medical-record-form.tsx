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

interface MedicalRecord {
  id?: string
  record_id?: string
  patient_id: string
  doctor_id: string
  visit_date: string
  visit_type: string
  chief_complaint: string
  diagnosis: string
  treatment: string
  prescription: string
  follow_up_date: string
  notes: string
  vital_signs: {
    temperature: string
    blood_pressure: string
    heart_rate: string
    respiratory_rate: string
    weight: string
    height: string
  }
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

interface MedicalRecordFormProps {
  record?: any
  onSuccess: () => void
  onCancel: () => void
}

export function MedicalRecordForm({ record, onSuccess, onCancel }: MedicalRecordFormProps) {
  const [formData, setFormData] = useState<MedicalRecord>({
    patient_id: "",
    doctor_id: "",
    visit_date: "",
    visit_type: "consultation",
    chief_complaint: "",
    diagnosis: "",
    treatment: "",
    prescription: "",
    follow_up_date: "",
    notes: "",
    vital_signs: {
      temperature: "",
      blood_pressure: "",
      heart_rate: "",
      respiratory_rate: "",
      weight: "",
      height: "",
    },
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
    if (record) {
      setFormData({
        patient_id: record.patients?.id || "",
        doctor_id: record.doctors?.id || "",
        visit_date: record.visit_date,
        visit_type: record.visit_type,
        chief_complaint: record.chief_complaint || "",
        diagnosis: record.diagnosis || "",
        treatment: record.treatment || "",
        prescription: record.prescription || "",
        follow_up_date: record.follow_up_date || "",
        notes: record.notes || "",
        vital_signs: record.vital_signs || {
          temperature: "",
          blood_pressure: "",
          heart_rate: "",
          respiratory_rate: "",
          weight: "",
          height: "",
        },
      })
    }
  }, [record])

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

  const generateRecordId = async () => {
    const { data, error } = await supabase
      .from("medical_records")
      .select("record_id")
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Error fetching last record ID:", error)
      return "MR001"
    }

    if (data && data.length > 0) {
      const lastId = data[0].record_id
      const numericPart = Number.parseInt(lastId.substring(2)) + 1
      return `MR${numericPart.toString().padStart(3, "0")}`
    }

    return "MR001"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (record?.id) {
        // Update existing record
        const { error } = await supabase
          .from("medical_records")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", record.id)

        if (error) throw error
      } else {
        // Create new record
        const recordId = await generateRecordId()
        const { error } = await supabase.from("medical_records").insert({
          ...formData,
          record_id: recordId,
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

  const handleInputChange = (field: keyof MedicalRecord, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleVitalSignChange = (field: keyof MedicalRecord["vital_signs"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      vital_signs: { ...prev.vital_signs, [field]: value },
    }))
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

      {/* Visit Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visit Information</CardTitle>
          <CardDescription>Basic visit details and type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visit_date">Visit Date *</Label>
              <Input
                id="visit_date"
                type="date"
                value={formData.visit_date}
                onChange={(e) => handleInputChange("visit_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visit_type">Visit Type *</Label>
              <Select value={formData.visit_type} onValueChange={(value) => handleInputChange("visit_type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="routine">Routine Check-up</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chief_complaint">Chief Complaint</Label>
            <Textarea
              id="chief_complaint"
              value={formData.chief_complaint}
              onChange={(e) => handleInputChange("chief_complaint", e.target.value)}
              placeholder="Patient's main concern or reason for visit"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vital Signs</CardTitle>
          <CardDescription>Patient's vital signs during the visit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input
                id="temperature"
                value={formData.vital_signs.temperature}
                onChange={(e) => handleVitalSignChange("temperature", e.target.value)}
                placeholder="98.6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood_pressure">Blood Pressure</Label>
              <Input
                id="blood_pressure"
                value={formData.vital_signs.blood_pressure}
                onChange={(e) => handleVitalSignChange("blood_pressure", e.target.value)}
                placeholder="120/80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
              <Input
                id="heart_rate"
                value={formData.vital_signs.heart_rate}
                onChange={(e) => handleVitalSignChange("heart_rate", e.target.value)}
                placeholder="72"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="respiratory_rate">Respiratory Rate</Label>
              <Input
                id="respiratory_rate"
                value={formData.vital_signs.respiratory_rate}
                onChange={(e) => handleVitalSignChange("respiratory_rate", e.target.value)}
                placeholder="16"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                value={formData.vital_signs.weight}
                onChange={(e) => handleVitalSignChange("weight", e.target.value)}
                placeholder="70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                value={formData.vital_signs.height}
                onChange={(e) => handleVitalSignChange("height", e.target.value)}
                placeholder="175"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Medical Information</CardTitle>
          <CardDescription>Diagnosis, treatment, and prescription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => handleInputChange("diagnosis", e.target.value)}
              placeholder="Medical diagnosis and findings"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Treatment Plan</Label>
            <Textarea
              id="treatment"
              value={formData.treatment}
              onChange={(e) => handleInputChange("treatment", e.target.value)}
              placeholder="Treatment plan and procedures"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescription">Prescription</Label>
            <Textarea
              id="prescription"
              value={formData.prescription}
              onChange={(e) => handleInputChange("prescription", e.target.value)}
              placeholder="Medications prescribed with dosage and instructions"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow_up_date">Follow-up Date</Label>
            <Input
              id="follow_up_date"
              type="date"
              value={formData.follow_up_date}
              onChange={(e) => handleInputChange("follow_up_date", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional notes or observations"
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
          {loading ? "Saving..." : record ? "Update Record" : "Save Record"}
        </Button>
      </div>
    </form>
  )
}
