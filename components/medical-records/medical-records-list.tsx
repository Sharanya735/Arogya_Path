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
import { Search, Plus, FileText, Eye, Edit, Calendar } from "lucide-react"
import { MedicalRecordForm } from "./medical-record-form"
import { MedicalRecordDetails } from "./medical-record-details"

interface MedicalRecord {
  id: string
  record_id: string
  visit_date: string
  visit_type: string
  chief_complaint: string
  diagnosis: string
  treatment: string
  prescription: string
  follow_up_date: string
  notes: string
  created_at: string
  patients: {
    first_name: string
    last_name: string
    patient_id: string
    date_of_birth: string
  }
  doctors: {
    first_name: string
    last_name: string
    doctor_id: string
    specialization: string
  }
}

export function MedicalRecordsList() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [visitTypeFilter, setVisitTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchMedicalRecords()
  }, [])

  const fetchMedicalRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select(`
          *,
          patients (first_name, last_name, patient_id, date_of_birth),
          doctors (first_name, last_name, doctor_id, specialization)
        `)
        .order("visit_date", { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error("Error fetching medical records:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredRecords = () => {
    let filtered = records

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          `${record.patients?.first_name} ${record.patients?.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${record.doctors?.first_name} ${record.doctors?.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.record_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.patients?.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.chief_complaint?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Visit type filter
    if (visitTypeFilter !== "all") {
      filtered = filtered.filter((record) => record.visit_type === visitTypeFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date()
      const recordDate = new Date(filtered[0]?.visit_date || today)

      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((record) => {
            const visitDate = new Date(record.visit_date)
            return visitDate.toDateString() === today.toDateString()
          })
          break
        case "week":
          const weekAgo = new Date(today)
          weekAgo.setDate(today.getDate() - 7)
          filtered = filtered.filter((record) => {
            const visitDate = new Date(record.visit_date)
            return visitDate >= weekAgo && visitDate <= today
          })
          break
        case "month":
          const monthAgo = new Date(today)
          monthAgo.setMonth(today.getMonth() - 1)
          filtered = filtered.filter((record) => {
            const visitDate = new Date(record.visit_date)
            return visitDate >= monthAgo && visitDate <= today
          })
          break
      }
    }

    return filtered
  }

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

  const filteredRecords = getFilteredRecords()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 text-2xl animate-spin">⚕️</div>
          <p className="text-muted-foreground">Loading medical records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Medical Records</h2>
          <p className="text-muted-foreground">Manage patient medical records and visit history</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Medical Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Medical Record</DialogTitle>
              <DialogDescription>Create a new medical record for a patient visit</DialogDescription>
            </DialogHeader>
            <MedicalRecordForm
              onSuccess={() => {
                setShowAddForm(false)
                fetchMedicalRecords()
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
                placeholder="Search by patient name, doctor, record ID, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={visitTypeFilter} onValueChange={setVisitTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by visit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visit Types</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
                <SelectItem value="diagnostic">Diagnostic</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medical Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Medical Records ({filteredRecords.length})
          </CardTitle>
          <CardDescription>Patient visit records and medical history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Visit Type</TableHead>
                  <TableHead>Chief Complaint</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.record_id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {record.patients?.first_name} {record.patients?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {record.patients?.patient_id} • Age: {calculateAge(record.patients?.date_of_birth || "")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          Dr. {record.doctors?.first_name} {record.doctors?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">{record.doctors?.specialization}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(record.visit_date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getVisitTypeColor(record.visit_type)}>{record.visit_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={record.chief_complaint}>
                        {record.chief_complaint || "Not specified"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={record.diagnosis}>
                        {record.diagnosis || "Pending"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record)
                            setShowDetails(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record)
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

          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No medical records found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || visitTypeFilter !== "all" || dateFilter !== "all"
                  ? "No records match your search criteria."
                  : "Get started by adding your first medical record."}
              </p>
              {!searchTerm && visitTypeFilter === "all" && dateFilter === "all" && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medical Record
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical Record Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
            <DialogDescription>Complete medical record information</DialogDescription>
          </DialogHeader>
          {selectedRecord && <MedicalRecordDetails record={selectedRecord} onClose={() => setShowDetails(false)} />}
        </DialogContent>
      </Dialog>

      {/* Edit Medical Record Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medical Record</DialogTitle>
            <DialogDescription>Update medical record information</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <MedicalRecordForm
              record={selectedRecord}
              onSuccess={() => {
                setShowEditForm(false)
                fetchMedicalRecords()
                setSelectedRecord(null)
              }}
              onCancel={() => {
                setShowEditForm(false)
                setSelectedRecord(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
