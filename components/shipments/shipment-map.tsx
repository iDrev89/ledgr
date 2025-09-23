"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, Navigation, MapPin, ArrowRight } from "lucide-react"

interface ShipmentMapProps {
  shipment: any
}

export function ShipmentMap({ shipment }: ShipmentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedStop, setSelectedStop] = useState<any>(null)
  const [mapView, setMapView] = useState<"route" | "current">("route")

  useEffect(() => {
    // In a real implementation, this would initialize a map library like Mapbox or Google Maps
    // For this demo, we'll simulate a map with a placeholder
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (!shipment || !shipment.route) {
    return <div>No map data available</div>
  }

  const handleStopClick = (stop: any) => {
    setSelectedStop(stop)
  }

  const currentLocationStop = shipment.route.find((stop: any) => stop.city === shipment.currentLocation.city)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button variant={mapView === "route" ? "default" : "outline"} size="sm" onClick={() => setMapView("route")}>
            <Truck className="mr-2 h-4 w-4" />
            Full Route
          </Button>
          <Button
            variant={mapView === "current" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapView("current")}
          >
            <Navigation className="mr-2 h-4 w-4" />
            Current Location
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center">
            <div className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></div>
            Current
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <div className="mr-1.5 h-2 w-2 rounded-full bg-blue-500"></div>
            Completed
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <div className="mr-1.5 h-2 w-2 rounded-full bg-gray-300"></div>
            Upcoming
          </Badge>
        </div>
      </div>

      <div ref={mapRef} className="relative h-[400px] w-full overflow-hidden rounded-lg border bg-muted/20">
        {!mapLoaded ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-full w-full">
            {/* This would be replaced with an actual map in a real implementation */}
            <div className="absolute inset-0 bg-[url('/los-angeles-to-new-york-route.png')] bg-cover bg-center"></div>

            {/* Simulated route line */}
            <div className="absolute left-1/2 top-1/2 h-0.5 w-3/4 -translate-x-1/2 -translate-y-1/2 transform bg-primary opacity-70"></div>

            {/* Map pins for each stop */}
            {shipment.route.map((stop: any, index: number) => {
              const isCompleted = stop.status !== "Scheduled"
              const isCurrent = stop.city === shipment.currentLocation.city

              // Simplified positioning for demo
              const left = `${10 + index * (80 / (shipment.route.length - 1))}%`

              return (
                <div
                  key={index}
                  className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full ${
                    isCurrent
                      ? "bg-green-500 text-white"
                      : isCompleted
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-gray-700"
                  }`}
                  style={{ left, top: "50%" }}
                  onClick={() => handleStopClick(stop)}
                >
                  <MapPin className="h-4 w-4" />
                </div>
              )
            })}
          </div>
        )}

        {/* Info card for selected location */}
        {selectedStop && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{selectedStop.city}</h4>
                  <Badge variant={selectedStop.status === "Scheduled" ? "outline" : "default"}>
                    {selectedStop.status}
                  </Badge>
                </div>
                {selectedStop.timestamp && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(selectedStop.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full justify-between"
                  onClick={() => setSelectedStop(null)}
                >
                  Close
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-primary/10 p-2">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Origin</h4>
                <p className="text-xs text-muted-foreground">{shipment.origin}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Current Location</h4>
                <p className="text-xs text-muted-foreground">{shipment.currentLocation.city}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Navigation className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Destination</h4>
                <p className="text-xs text-muted-foreground">{shipment.destination}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
