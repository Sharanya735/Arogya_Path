"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, Stethoscope, Phone, FileText, AlertCircle, CheckCircle, XCircle } from "lucide-react"

interface AppointmentDetailsProps {
  appointment: any
  onClose: () => void
}

export function AppointmentDetails({ appointment, onClose }: AppointmentDetailsProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
      case "no-show":
        return <XCircle className="h-4 w-4" />
      case "in-progress":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
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

  return (
    <div className="space-y-6">
      {/* Appointment Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Appointment #{appointment.appointment_id}</h2>
          <p className="text-muted-foreground">
            {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusIcon(appointment.status)}
              <span className="ml-1">{appointment.status}</span>
            </Badge>
            <Badge className={getTypeColor(appointment.appointment_type)}>{appointment.appointment_type}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">
                {appointment.patients?.first_name} {appointment.patients?.last_name}
              </h4>
              <p className="text-sm text-muted-foreground">ID: {appointment.patients?.patient_id}</p>
            </div>
            {appointment.patients?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{appointment.patients.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">
                Dr. {appointment.doctors?.first_name} {appointment.doctors?.last_name}
              </h4>
              <p className="text-sm text-muted-foreground">{appointment.doctors?.specialization}</p>
            </div>
            <p className="text-sm text-muted-foreground">ID: {appointment.doctors?.doctor_id}</p>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{new Date(appointment.appointment_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {appointment.appointment_time} ({appointment.duration_minutes} minutes)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Type: {appointment.appointment_type}</span>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(appointment.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Symptoms and Notes */}
      {(appointment.symptoms || appointment.notes) && (
        <div className="space-y-4">
          <Separator />
          {appointment.symptoms && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Symptoms/Reason for Visit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{appointment.symptoms}</p>
              </CardContent>
            </Card>
          )}
          {appointment.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{appointment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
