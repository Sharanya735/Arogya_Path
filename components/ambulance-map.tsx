"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet-defaulticon-compatibility"
import type { Ambulance } from "@/lib/mock-data"
import L from "leaflet"

interface AmbulanceMapProps {
  ambulances: Ambulance[]
}

const createIcon = (color: string) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="font-size: 14px;">🚑</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

const icons = {
  available: createIcon("#10b981"), // green
  busy: createIcon("#ef4444"), // red
  maintenance: createIcon("#6b7280"), // gray
}

export default function AmbulanceMap({ ambulances }: AmbulanceMapProps) {
  // Center roughly on New Delhi based on mock data
  const center: [number, number] = [28.6139, 77.209]

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {ambulances.map((amb) =>
        amb.coordinates ? (
          <Marker
            key={amb.id}
            position={[amb.coordinates.lat, amb.coordinates.lng]}
            icon={icons[amb.status as keyof typeof icons] || icons.available}
          >
            <Popup>
              <div className="text-sm">
                <strong>{amb.id}</strong>
                <br />
                Driver: {amb.driver}
                <br />
                Status: <span className="capitalize">{amb.status}</span>
                <br />
                {amb.eta && (
                  <>
                    ETA: {amb.eta}
                    <br />
                  </>
                )}
                {amb.location}
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  )
}
