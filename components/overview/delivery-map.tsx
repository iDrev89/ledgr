"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Truck, Clock, CheckCircle } from "lucide-react"

interface DeliveryLocation {
  id: string
  city: string
  state: string
  activeShipments: number
  status: "on-time" | "delayed" | "completed"
  estimatedTime: string
}

const deliveryLocations: DeliveryLocation[] = [
  {
    id: "1",
    city: "New York",
    state: "NY",
    activeShipments: 12,
    status: "on-time",
    estimatedTime: "2h 30m",
  },
  {
    id: "2",
    city: "Los Angeles",
    state: "CA",
    activeShipments: 8,
    status: "delayed",
    estimatedTime: "4h 15m",
  },
  {
    id: "3",
    city: "Chicago",
    state: "IL",
    activeShipments: 15,
    status: "on-time",
    estimatedTime: "1h 45m",
  },
  {
    id: "4",
    city: "Houston",
    state: "TX",
    activeShipments: 6,
    status: "completed",
    estimatedTime: "Delivered",
  },
  {
    id: "5",
    city: "Phoenix",
    state: "AZ",
    activeShipments: 9,
    status: "on-time",
    estimatedTime: "3h 20m",
  },
]

export function DeliveryMap() {
  const getStatusIcon = (status: DeliveryLocation["status"]) => {
    switch (status) {
      case "on-time":
        return <Truck className="h-4 w-4 text-green-500" />
      case "delayed":
        return <Clock className="h-4 w-4 text-red-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: DeliveryLocation["status"]) => {
    switch (status) {
      case "on-time":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "delayed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Active Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deliveryLocations.map((location) => (
            <div
              key={location.id}
              className="flex flex-wrap gap-1 items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(location.status)}
                <div>
                  <div className="font-medium">
                    {location.city}, {location.state}
                  </div>
                  <div className="text-sm text-muted-foreground">{location.activeShipments} active shipments</div>
                </div>
              </div>
              <div className="sm:text-right space-y-1">
                <Badge variant="secondary" className={getStatusColor(location.status)}>
                  {location.status.replace("-", " ")}
                </Badge>
                <div className="text-xs text-muted-foreground">{location.estimatedTime}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
