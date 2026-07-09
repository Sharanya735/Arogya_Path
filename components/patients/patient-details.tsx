"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  AlertTriangle,
  FileText,
  Shield,
  Stethoscope,
  Receipt,
} from "lucide-react"

interface Patient {
  id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  phone: string
  email: string
  address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  blood_group: string
  allergies: string
  medical_history: string
  insurance_provider: string
  insurance_number: string
  created_at: string
}

interface PatientDetailsProps {
  patient: Patient
  onClose: () => void
}

export function PatientDetails({ patient, onClose }: PatientDetailsProps) {
  const [appointments, setAppointments] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [billingRecords, setBillingRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchPatientData()
  }, [patient.id])

  const fetchPatientData = async () => {
    try {
      // Fetch appointments
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select(`
          *,
          doctors (first_name, last_name, specialization)
        `)
        .eq("patient_id", patient.id)
        .order("appointment_date", { ascending: false })

      // Fetch medical records
      const { data: recordsData } = await supabase
        .from("medical_records")
        .select(`
          *,
          doctors (first_name, last_name, specialization)
        `)
        .eq("patient_id", patient.id)
        .order("visit_date", { ascending: false })

      // Fetch billing records
      const { data: billingData } = await supabase
        .from("billing")
        .select("*")
        .eq("patient_id", patient.id)
        .order("bill_date", { ascending: false })

      setAppointments(appointmentsData || [])
      setMedicalRecords(recordsData || [])
      setBillingRecords(billingData || [])
    } catch (error) {
      console.error("Error fetching patient data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {patient.first_name} {patient.last_name}
            </h2>
            <p className="text-muted-foreground">
              Patient ID: {patient.patient_id} • {calculateAge(patient.date_of_birth)} years old
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={patient.gender === "male" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"}>
                {patient.gender}
              </Badge>
              {patient.blood_group && (
                <Badge variant="outline">
                  <Heart className="h-3 w-3 mr-1" />
                  {patient.blood_group}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span className="text-sm">{patient.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.emergency_contact_name && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.emergency_contact_name}</span>
                  </div>
                )}
                {patient.emergency_contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.emergency_contact_phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.allergies && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Allergies</h4>
                    <p className="text-sm text-muted-foreground">{patient.allergies}</p>
                  </div>
                )}
                {patient.medical_history && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Medical History</h4>
                    <p className="text-sm text-muted-foreground">{patient.medical_history}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.insurance_provider && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Provider</h4>
                    <p className="text-sm text-muted-foreground">{patient.insurance_provider}</p>
                  </div>
                )}
                {patient.insurance_number && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Policy Number</h4>
                    <p className="text-sm text-muted-foreground">{patient.insurance_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
              <CardDescription>All appointments for this patient</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {new Date(appointment.appointment_date).toLocaleDateString()} at{" "}
                            {appointment.appointment_time}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Dr. {appointment.doctors?.first_name} {appointment.doctors?.last_name} -{" "}
                            {appointment.doctors?.specialization}
                          </p>
                          {appointment.symptoms && (
                            <p className="text-sm text-muted-foreground mt-1">Symptoms: {appointment.symptoms}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No appointments found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>Patient's medical history and visit records</CardDescription>
            </CardHeader>
            <CardContent>
              {medicalRecords.length > 0 ? (
                <div className="space-y-4">
                  {medicalRecords.map((record: any) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{new Date(record.visit_date).toLocaleDateString()}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Dr. {record.doctors?.first_name} {record.doctors?.last_name}
                        </span>
                      </div>
                      {record.diagnosis && (
                        <div className="mb-2">
                          <h4 className="font-medium text-sm">Diagnosis</h4>
                          <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                        </div>
                      )}
                      {record.treatment && (
                        <div className="mb-2">
                          <h4 className="font-medium text-sm">Treatment</h4>
                          <p className="text-sm text-muted-foreground">{record.treatment}</p>
                        </div>
                      )}
                      {record.prescription && (
                        <div>
                          <h4 className="font-medium text-sm">Prescription</h4>
                          <p className="text-sm text-muted-foreground">{record.prescription}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No medical records found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Payment history and outstanding bills</CardDescription>
            </CardHeader>
            <CardContent>
              {billingRecords.length > 0 ? (
                <div className="space-y-4">
                  {billingRecords.map((bill: any) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Bill #{bill.bill_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(bill.bill_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm">
                            Total: ₹{bill.total_amount} | Paid: ₹{bill.paid_amount} | Balance: ₹{bill.balance_amount}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No billing records found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
