"use client"

import { CheckCircle2, Clock, MapPin, Package, Truck } from "lucide-react"

interface ShipmentTimelineProps {
  shipment: any
}

export function ShipmentTimeline({ shipment }: ShipmentTimelineProps) {
  if (!shipment || !shipment.updates) {
    return <div>No timeline data available</div>
  }

  // Combine actual updates with future scheduled stops
  const allUpdates = [...shipment.updates]

  // Add future stops from the route that aren't in updates yet
  const updatedLocations = new Set(shipment.updates.map((update: any) => update.location))

  shipment.route.forEach((stop: any, index: number) => {
    if (index > 0 && !updatedLocations.has(stop.city) && stop.status === "Scheduled") {
      allUpdates.push({
        status: `Scheduled arrival at ${stop.city}`,
        location: stop.city,
        timestamp: null,
        isScheduled: true,
      })
    }
  })

  // Sort by timestamp (scheduled events at the end)
  allUpdates.sort((a: any, b: any) => {
    if (a.timestamp === null) return 1
    if (b.timestamp === null) return -1
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {allUpdates.map((update: any, index: number) => (
          <div key={index} className="flex">
            <div className="mr-4 flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  update.isScheduled
                    ? "border-muted bg-background text-muted-foreground"
                    : "border-primary bg-primary text-primary-foreground"
                }`}
              >
                {getStatusIcon(update.status)}
              </div>
              {index < allUpdates.length - 1 && <div className="h-full w-0.5 bg-border"></div>}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{update.status}</h4>
                {update.timestamp ? (
                  <time className="text-sm text-muted-foreground">
                    {new Date(update.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </time>
                ) : (
                  <span className="text-sm text-muted-foreground">Scheduled</span>
                )}
              </div>
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {update.location}
              </div>
              {update.details && <p className="mt-2 text-sm">{update.details}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getStatusIcon(status: string) {
  if (status.toLowerCase().includes("picked up")) {
    return <Package className="h-5 w-5" />
  } else if (status.toLowerCase().includes("transit") || status.toLowerCase().includes("departed")) {
    return <Truck className="h-5 w-5" />
  } else if (status.toLowerCase().includes("scheduled")) {
    return <Clock className="h-5 w-5" />
  } else if (status.toLowerCase().includes("delivered")) {
    return <CheckCircle2 className="h-5 w-5" />
  } else {
    return <MapPin className="h-5 w-5" />
  }
}
