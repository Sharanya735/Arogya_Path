"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  User,
  Stethoscope,
  FileText,
  Activity,
  Pill,
  ClipboardList,
  AlertCircle,
  Heart,
  Thermometer,
} from "lucide-react"

interface MedicalRecordDetailsProps {
  record: any
  onClose: () => void
}

export function MedicalRecordDetails({ record, onClose }: MedicalRecordDetailsProps) {
  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800"
      case "follow-up":
        return "bg-green-100 text-green-800"
      case "emergency":
        return "bg-red-100 text-red-800"
      case "routine":
        return "bg-gray-100 text-gray-800"
      case "surgery":
        return "bg-purple-100 text-purple-800"
      case "diagnostic":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  return (
    <div className="space-y-6">
      {/* Record Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medical Record #{record.record_id}</h2>
          <p className="text-muted-foreground">{new Date(record.visit_date).toLocaleDateString()}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getVisitTypeColor(record.visit_type)}>{record.visit_type}</Badge>
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
                {record.patients?.first_name} {record.patients?.last_name}
              </h4>
              <p className="text-sm text-muted-foreground">
                ID: {record.patients?.patient_id} • Age: {calculateAge(record.patients?.date_of_birth || "")} years
              </p>
            </div>
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
                Dr. {record.doctors?.first_name} {record.doctors?.last_name}
              </h4>
              <p className="text-sm text-muted-foreground">{record.doctors?.specialization}</p>
            </div>
            <p className="text-sm text-muted-foreground">ID: {record.doctors?.doctor_id}</p>
          </CardContent>
        </Card>
      </div>

      {/* Vital Signs */}
      {record.vital_signs && Object.values(record.vital_signs).some((value) => value) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {record.vital_signs.temperature && (
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Temperature</p>
                    <p className="text-sm text-muted-foreground">{record.vital_signs.temperature}°F</p>
                  </div>
                </div>
              )}
              {record.vital_signs.blood_pressure && (
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Blood Pressure</p>
                    <p className="text-sm text-muted-foreground">{record.vital_signs.blood_pressure} mmHg</p>
                  </div>
                </div>
              )}
              {record.vital_signs.heart_rate && (
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Heart Rate</p>
                    <p className="text-sm text-muted-foreground">{record.vital_signs.heart_rate} bpm</p>
                  </div>
                </div>
              )}
              {record.vital_signs.respiratory_rate && (
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Respiratory Rate</p>
                    <p className="text-sm text-muted-foreground">{record.vital_signs.respiratory_rate}/min</p>
                  </div>
                </div>
              )}
              {record.vital_signs.weight && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Weight</p>
                    <p className="text-sm text-muted-foreground">{record.vital_signs.weight} kg</p>
                  </div>
                </div>
              )}
              {record.vital_signs.height && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Height</p>
                    <p className="text-sm text-muted-foreground">{record.vital_signs.height} cm</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chief Complaint */}
      {record.chief_complaint && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Chief Complaint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{record.chief_complaint}</p>
          </CardContent>
        </Card>
      )}

      {/* Diagnosis and Treatment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {record.diagnosis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{record.diagnosis}</p>
            </CardContent>
          </Card>
        )}

        {record.treatment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Treatment Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{record.treatment}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Prescription */}
      {record.prescription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Prescription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{record.prescription}</p>
          </CardContent>
        </Card>
      )}

      {/* Follow-up and Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {record.follow_up_date && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Follow-up Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{new Date(record.follow_up_date).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        )}

        {record.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{record.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Record Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Record Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Created</p>
              <p className="text-muted-foreground">{new Date(record.created_at).toLocaleString()}</p>
            </div>
            {record.updated_at && (
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-muted-foreground">{new Date(record.updated_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
