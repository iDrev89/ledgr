"use client"
import type { Shipment } from "./live-shipment-map"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Plane,
  Ship,
  Truck,
  Train,
  Clock,
  CheckCircle,
  AlertTriangle,
  Timer,
  RotateCcw,
  MapPin,
  Calendar,
  Package,
  User,
  Thermometer,
  Droplets,
  AlertCircle,
} from "lucide-react"

interface ShipmentDetailsProps {
  shipment: Shipment | null
}

export function ShipmentDetails({ shipment }: ShipmentDetailsProps) {
  if (!shipment) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
        <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <h3 className="text-lg font-medium mb-1">No Shipment Selected</h3>
        <p className="text-sm text-muted-foreground">Select a shipment from the map or list to view details</p>
      </div>
    )
  }

  const getStatusIcon = (status: Shipment["status"]) => {
    switch (status) {
      case "in-transit":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "delayed":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "pending":
        return <Timer className="h-5 w-5 text-purple-500" />
      case "returned":
        return <RotateCcw className="h-5 w-5 text-red-500" />
    }
  }

  const getTypeIcon = (type: Shipment["type"]) => {
    switch (type) {
      case "air":
        return <Plane className="h-5 w-5 text-sky-500" />
      case "sea":
        return <Ship className="h-5 w-5 text-indigo-500" />
      case "road":
        return <Truck className="h-5 w-5 text-orange-500" />
      case "rail":
        return <Train className="h-5 w-5 text-emerald-500" />
    }
  }

  const getStatusColor = (status: Shipment["status"]) => {
    switch (status) {
      case "in-transit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "delayed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "pending":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "returned":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    }
  }

  const getPriorityColor = (priority: Shipment["priority"]) => {
    switch (priority) {
      case "express":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "normal":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "economy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    }
  }

  return (
    <div className="h-[400px] overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(shipment.type)}
            <h3 className="font-semibold">{shipment.trackingNumber}</h3>
          </div>
          <Badge variant="secondary" className={getStatusColor(shipment.status)}>
            {shipment.status.replace("-", " ")}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{shipment.progress}%</span>
          </div>
          <Progress value={shipment.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Origin</div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{shipment.origin.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">{shipment.origin.country}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Destination</div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{shipment.destination.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">{shipment.destination.country}</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Current Location</div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm font-medium">{shipment.currentLocation.name}</span>
          </div>
          <div className="text-xs text-muted-foreground">{shipment.currentLocation.country}</div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Carrier</div>
            <div className="text-sm font-medium">{shipment.carrier}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Priority</div>
            <Badge variant="secondary" className={getPriorityColor(shipment.priority)}>
              {shipment.priority}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Departure
            </div>
            <div className="text-sm">{new Date(shipment.departureTime).toLocaleDateString()}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Estimated Arrival
            </div>
            <div className="text-sm">{new Date(shipment.estimatedArrival).toLocaleDateString()}</div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Weight</div>
            <div className="text-sm font-medium">{shipment.weight} kg</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Items</div>
            <div className="text-sm font-medium">{shipment.items}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Last Updated</div>
            <div className="text-sm">{new Date(shipment.lastUpdated).toLocaleTimeString()}</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            Customer
          </div>
          <div className="text-sm font-medium">{shipment.customer.name}</div>
          <div className="text-xs text-muted-foreground">ID: {shipment.customer.id}</div>
        </div>

        {(shipment.temperature !== undefined || shipment.humidity !== undefined) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {shipment.temperature !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Thermometer className="h-3 w-3" />
                    Temperature
                  </div>
                  <div className="text-sm font-medium">{shipment.temperature}°C</div>
                </div>
              )}

              {shipment.humidity !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Droplets className="h-3 w-3" />
                    Humidity
                  </div>
                  <div className="text-sm font-medium">{shipment.humidity}%</div>
                </div>
              )}
            </div>
          </>
        )}

        {shipment.notes && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Notes</div>
            <div className="text-sm p-2 bg-muted rounded-md">{shipment.notes}</div>
          </div>
        )}

        {shipment.alerts && shipment.alerts.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                Alerts
              </div>
              {shipment.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`text-sm p-2 rounded-md ${
                    alert.type === "critical"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      : alert.type === "warning"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  }`}
                >
                  <div className="font-medium">{alert.message}</div>
                  <div className="text-xs mt-1">{new Date(alert.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
