"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"
import { MapPin, Truck, Wrench, CheckCircle, Clock, Ban, RefreshCw, Layers } from "lucide-react"

// Mock data for vehicle locations
const vehicleLocations = [
  {
    id: "TRK-001",
    model: "Freightliner Cascadia",
    status: "active",
    driver: "John Smith",
    location: { name: "New York, NY", coordinates: [-74.006, 40.7128] },
    lastUpdated: "2 minutes ago",
    heading: 45, // degrees
    speed: 55, // mph
  },
  {
    id: "TRK-002",
    model: "Kenworth T680",
    status: "maintenance",
    driver: "Sarah Johnson",
    location: { name: "Chicago, IL", coordinates: [-87.6298, 41.8781] },
    lastUpdated: "5 minutes ago",
    heading: 270, // degrees
    speed: 0, // mph
  },
  {
    id: "VAN-001",
    model: "Mercedes-Benz Sprinter",
    status: "active",
    driver: "Michael Brown",
    location: { name: "Los Angeles, CA", coordinates: [-118.2437, 34.0522] },
    lastUpdated: "1 minute ago",
    heading: 180, // degrees
    speed: 40, // mph
  },
  {
    id: "CAR-001",
    model: "Toyota Camry",
    status: "available",
    driver: "Unassigned",
    location: { name: "Houston, TX", coordinates: [-95.3698, 29.7604] },
    lastUpdated: "10 minutes ago",
    heading: 0, // degrees
    speed: 0, // mph
  },
  {
    id: "TRK-003",
    model: "Volvo VNL",
    status: "active",
    driver: "David Wilson",
    location: { name: "Miami, FL", coordinates: [-80.1918, 25.7617] },
    lastUpdated: "3 minutes ago",
    heading: 90, // degrees
    speed: 62, // mph
  },
  {
    id: "FRK-001",
    model: "Toyota 8FGU25",
    status: "outOfService",
    driver: "Unassigned",
    location: { name: "Chicago, IL", coordinates: [-87.6298, 41.8781] },
    lastUpdated: "1 hour ago",
    heading: 0, // degrees
    speed: 0, // mph
  },
  {
    id: "VAN-002",
    model: "Ford Transit",
    status: "active",
    driver: "Emily Davis",
    location: { name: "Seattle, WA", coordinates: [-122.3321, 47.6062] },
    lastUpdated: "4 minutes ago",
    heading: 135, // degrees
    speed: 35, // mph
  },
]

export function FleetMap() {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [mapView, setMapView] = useState<"all" | "active" | "maintenance">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { theme } = useTheme()

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  // Filter vehicles based on map view
  const filteredVehicles = vehicleLocations.filter((vehicle) => {
    if (mapView === "all") return true
    if (mapView === "active") return vehicle.status === "active"
    if (mapView === "maintenance") return vehicle.status === "maintenance" || vehicle.status === "outOfService"
    return true
  })

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return { icon: CheckCircle, color: "text-green-500 bg-green-100 dark:bg-green-900" }
      case "maintenance":
        return { icon: Wrench, color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900" }
      case "available":
        return { icon: Clock, color: "text-blue-500 bg-blue-100 dark:bg-blue-900" }
      case "outOfService":
        return { icon: Ban, color: "text-red-500 bg-red-100 dark:bg-red-900" }
      default:
        return { icon: Truck, color: "text-gray-500 bg-gray-100 dark:bg-gray-900" }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Fleet Location Map
          </CardTitle>
          <CardDescription>Real-time location of all vehicles</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={mapView} onValueChange={(value) => setMapView(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button variant="outline" size="icon">
            <Layers className="h-4 w-4" />
            <span className="sr-only">Layers</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md overflow-hidden border h-[500px]">
          {!mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            </div>
          ) : (
            <>
              {/* Map background - would be replaced with actual map in real implementation */}
              <div className="absolute inset-0 bg-[#f8f9fa] dark:bg-[#111827]">
                {/* Simplified US map for demo */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1000 500"
                  preserveAspectRatio="xMidYMid meet"
                  className="opacity-20 dark:opacity-10"
                >
                  <path
                    d="M215,220 L240,220 L260,200 L280,210 L300,190 L330,190 L350,170 L380,170 L400,150 L430,150 L450,130 L480,130 L500,110 L530,110 L550,130 L580,130 L600,150 L630,150 L650,170 L680,170 L700,190 L730,190 L750,210 L780,210 L800,230 L830,230 L850,250 L880,250 L900,270 L930,270 L950,290 L980,290"
                    fill="none"
                    stroke={theme === "dark" ? "#334155" : "#ced4da"}
                    strokeWidth="2"
                  />
                  <path
                    d="M215,290 L980,290"
                    fill="none"
                    stroke={theme === "dark" ? "#334155" : "#ced4da"}
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                  <path
                    d="M215,350 L980,350"
                    fill="none"
                    stroke={theme === "dark" ? "#334155" : "#ced4da"}
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                </svg>
              </div>

              {/* Vehicle markers */}
              {filteredVehicles.map((vehicle) => {
                // Convert coordinates to position on the map (simplified for demo)
                const x = ((vehicle.location.coordinates[0] + 125) / 70) * 100
                const y = ((vehicle.location.coordinates[1] - 25) / 25) * 100

                // Get status icon and color
                const statusInfo = getStatusInfo(vehicle.status)

                return (
                  <div
                    key={vehicle.id}
                    className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center cursor-pointer transition-all ${statusInfo.color} ${
                      selectedVehicle === vehicle.id ? "ring-2 ring-primary z-10 scale-125" : "hover:scale-110"
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: `translate(-50%, -50%) rotate(${vehicle.heading}deg)`,
                    }}
                    onClick={() => setSelectedVehicle(vehicle.id === selectedVehicle ? null : vehicle.id)}
                    title={`${vehicle.id}: ${vehicle.model}`}
                  >
                    <Truck className="h-5 w-5" />
                  </div>
                )
              })}

              {/* Selected vehicle info */}
              {selectedVehicle &&
                (() => {
                  const vehicle = vehicleLocations.find((v) => v.id === selectedVehicle)
                  if (!vehicle) return null

                  // Convert coordinates to position on the map (simplified for demo)
                  const x = ((vehicle.location.coordinates[0] + 125) / 70) * 100
                  const y = ((vehicle.location.coordinates[1] - 25) / 25) * 100

                  const statusInfo = getStatusInfo(vehicle.status)

                  return (
                    <div
                      className="absolute z-20 bg-background border rounded-lg shadow-lg p-3 w-64"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: "translate(-50%, -130%)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{vehicle.id}</span>
                        <Badge variant="outline" className={statusInfo.color}>
                          {React.createElement(statusInfo.icon, { className: "h-3 w-3 mr-1" })}
                          <span className="capitalize">{vehicle.status.replace(/([A-Z])/g, " $1").trim()}</span>
                        </Badge>
                      </div>
                      <div className="text-sm mb-1">{vehicle.model}</div>
                      <div className="text-sm mb-1">Driver: {vehicle.driver}</div>
                      <div className="text-sm mb-1">Location: {vehicle.location.name}</div>
                      <div className="flex justify-between text-sm">
                        <span>Speed: {vehicle.speed} mph</span>
                        <span>Updated: {vehicle.lastUpdated}</span>
                      </div>
                    </div>
                  )
                })()}

              {/* Map legend */}
              <div className="absolute bottom-4 right-4 bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs font-medium mb-1">Vehicle Status</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-xs">Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs">Maintenance</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs">Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-xs">Out of Service</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
