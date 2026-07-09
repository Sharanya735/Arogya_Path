// Mock data for the Arogya Path ambulance tracking system

export interface Ambulance {
  id: string
  status: "available" | "busy" | "maintenance"
  location: string
  eta: string | null
  driver: string
  phone: string
  lastUpdate: string
  coordinates: { lat: number; lng: number }
}

export interface Hospital {
  id: string
  name: string
  address: string
  availableBeds: number
  totalBeds: number
  distance: string
  departments: {
    icu: { available: number; total: number }
    emergency: { available: number; total: number }
    general: { available: number; total: number }
  }
}

export interface IncomingAmbulance {
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

export interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
  type: "crew" | "hospital" | "dispatch"
}

export interface Notification {
  id: string
  type: "arrival" | "assignment" | "emergency" | "update"
  title: string
  message: string
  timestamp: string
  priority: "high" | "medium" | "low"
  read: boolean
}

export interface AmbulanceTracking {
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

export interface StatusUpdate {
  id: string
  title: string
  description: string
  timestamp: string
  status: "completed" | "current" | "upcoming"
  icon: "dispatched" | "pickup" | "transport" | "arrival"
}

// Mock ambulances data
export const mockAmbulances: Ambulance[] = [
  {
    id: "AMB-001",
    status: "available",
    location: "Central Hospital Parking",
    eta: null,
    driver: "Rajesh Kumar",
    phone: "+91 98765 43210",
    lastUpdate: "2 min ago",
    coordinates: { lat: 28.6139, lng: 77.209 },
  },
  {
    id: "AMB-002",
    status: "busy",
    location: "En route to City General Hospital",
    eta: "8 min",
    driver: "Priya Sharma",
    phone: "+91 98765 43211",
    lastUpdate: "1 min ago",
    coordinates: { lat: 28.6129, lng: 77.2295 },
  },
  {
    id: "AMB-003",
    status: "available",
    location: "Station 3 - Sector 15",
    eta: null,
    driver: "Amit Singh",
    phone: "+91 98765 43212",
    lastUpdate: "5 min ago",
    coordinates: { lat: 28.5355, lng: 77.391 },
  },
  {
    id: "AMB-004",
    status: "busy",
    location: "Emergency pickup - MG Road",
    eta: "15 min",
    driver: "Sunita Devi",
    phone: "+91 98765 43213",
    lastUpdate: "3 min ago",
    coordinates: { lat: 28.6304, lng: 77.2177 },
  },
  {
    id: "AMB-005",
    status: "maintenance",
    location: "Service Center",
    eta: null,
    driver: "N/A",
    phone: "N/A",
    lastUpdate: "1 hour ago",
    coordinates: { lat: 28.7041, lng: 77.1025 },
  },
  {
    id: "AMB-006",
    status: "available",
    location: "District Hospital - Rohini",
    eta: null,
    driver: "Vikram Singh",
    phone: "+91 98765 43216",
    lastUpdate: "10 min ago",
    coordinates: { lat: 28.7041, lng: 77.1025 },
  },
]

// Mock hospitals data
export const mockHospitals: Hospital[] = [
  {
    id: "HOSP-001",
    name: "All India Institute of Medical Sciences",
    address: "Ansari Nagar, New Delhi",
    availableBeds: 12,
    totalBeds: 50,
    distance: "2.5 km",
    departments: {
      icu: { available: 3, total: 12 },
      emergency: { available: 8, total: 20 },
      general: { available: 15, total: 45 },
    },
  },
  {
    id: "HOSP-002",
    name: "Safdarjung Hospital",
    address: "Safdarjung, New Delhi",
    availableBeds: 8,
    totalBeds: 40,
    distance: "3.2 km",
    departments: {
      icu: { available: 2, total: 8 },
      emergency: { available: 5, total: 15 },
      general: { available: 12, total: 30 },
    },
  },
  {
    id: "HOSP-003",
    name: "Ram Manohar Lohia Hospital",
    address: "Baba Kharak Singh Marg, New Delhi",
    availableBeds: 15,
    totalBeds: 35,
    distance: "4.1 km",
    departments: {
      icu: { available: 4, total: 10 },
      emergency: { available: 6, total: 12 },
      general: { available: 18, total: 25 },
    },
  },
  {
    id: "HOSP-004",
    name: "Lady Hardinge Medical College",
    address: "Shaheed Bhagat Singh Marg, New Delhi",
    availableBeds: 3,
    totalBeds: 25,
    distance: "5.8 km",
    departments: {
      icu: { available: 1, total: 6 },
      emergency: { available: 2, total: 8 },
      general: { available: 8, total: 20 },
    },
  },
]

// Mock incoming ambulances for hospital dashboard
export const mockIncomingAmbulances: IncomingAmbulance[] = [
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
export const mockChatMessages: ChatMessage[] = [
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
  {
    id: "5",
    sender: "AMB-007 Crew",
    message: "Dialysis patient picked up, all vitals normal",
    timestamp: "8 min ago",
    type: "crew",
  },
]

// Mock notifications
export const mockNotifications: Notification[] = [
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
  {
    id: "4",
    type: "emergency",
    title: "Emergency Alert",
    message: "Multiple casualties reported, all available units dispatched",
    timestamp: "15 min ago",
    priority: "high",
    read: true,
  },
  {
    id: "5",
    type: "assignment",
    title: "New Assignment",
    message: "AMB-006 assigned to pickup at Rohini",
    timestamp: "20 min ago",
    priority: "medium",
    read: true,
  },
]

// Mock ambulance tracking data for family view
export const mockAmbulanceTracking: AmbulanceTracking = {
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

// Mock status updates for family view
export const mockStatusUpdates: StatusUpdate[] = [
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
    timestamp: "In 8 minutes",
    status: "upcoming",
    icon: "arrival",
  },
]

// Utility functions for data manipulation
export const getAvailableAmbulances = () => mockAmbulances.filter((amb) => amb.status === "available")

export const getBusyAmbulances = () => mockAmbulances.filter((amb) => amb.status === "busy")

export const getMaintenanceAmbulances = () => mockAmbulances.filter((amb) => amb.status === "maintenance")

export const getTotalAvailableBeds = () => mockHospitals.reduce((sum, hospital) => sum + hospital.availableBeds, 0)

export const getUnreadNotifications = () => mockNotifications.filter((notif) => !notif.read)

export const getHighPriorityNotifications = () => mockNotifications.filter((notif) => notif.priority === "high")

// Simulate real-time updates
export const simulateAmbulanceUpdate = (ambulanceId: string) => {
  const ambulance = mockAmbulances.find((amb) => amb.id === ambulanceId)
  if (ambulance && ambulance.eta) {
    const currentEta = Number.parseInt(ambulance.eta.split(" ")[0])
    if (currentEta > 1) {
      ambulance.eta = `${currentEta - 1} min`
      ambulance.lastUpdate = "Just now"
    }
  }
  return ambulance
}

// Generate random coordinates within Delhi NCR bounds
export const generateRandomCoordinates = () => ({
  lat: 28.4 + Math.random() * 0.4, // Delhi latitude range
  lng: 77.0 + Math.random() * 0.4, // Delhi longitude range
})

// Calculate estimated time based on distance (mock calculation)
export const calculateETA = (distance: string) => {
  const distanceNum = Number.parseFloat(distance.split(" ")[0])
  const estimatedMinutes = Math.round(distanceNum * 3) // Rough estimate: 3 minutes per km
  return `${estimatedMinutes} min`
}
