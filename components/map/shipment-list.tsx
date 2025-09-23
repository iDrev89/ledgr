"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { Shipment } from "./live-shipment-map"
import { Plane, Ship, Truck, Train, Clock, CheckCircle, AlertTriangle, Timer, RotateCcw } from "lucide-react"

interface ShipmentListProps {
  shipments: Shipment[]
  isLoading: boolean
  onSelect: (shipment: Shipment) => void
  selectedShipmentId?: string
}

export function ShipmentList({ shipments, isLoading, onSelect, selectedShipmentId }: ShipmentListProps) {
  const getStatusIcon = (status: Shipment["status"]) => {
    switch (status) {
      case "in-transit":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "delayed":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "pending":
        return <Timer className="h-4 w-4 text-purple-500" />
      case "returned":
        return <RotateCcw className="h-4 w-4 text-red-500" />
    }
  }

  const getTypeIcon = (type: Shipment["type"]) => {
    switch (type) {
      case "air":
        return <Plane className="h-4 w-4 text-sky-500" />
      case "sea":
        return <Ship className="h-4 w-4 text-indigo-500" />
      case "road":
        return <Truck className="h-4 w-4 text-orange-500" />
      case "rail":
        return <Train className="h-4 w-4 text-emerald-500" />
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

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (shipments.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No shipments match your filters</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="p-4 space-y-2">
        {shipments.map((shipment) => (
          <div
            key={shipment.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedShipmentId === shipment.id ? "bg-muted border-primary" : "hover:bg-muted/50"
            }`}
            onClick={() => onSelect(shipment)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(shipment.type)}
                <span className="font-medium">{shipment.trackingNumber}</span>
              </div>
              <Badge variant="secondary" className={getStatusColor(shipment.status)}>
                {shipment.status.replace("-", " ")}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {shipment.origin.name} → {shipment.destination.name}
            </div>
            <div className="flex flex-wrap gap-1 items-center justify-between mt-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-medium">{shipment.carrier}</span>
              </div>
              <div className="text-muted-foreground">
                ETA: {new Date(shipment.estimatedArrival).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
