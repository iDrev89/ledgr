"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Wrench, Clock, Fuel, Thermometer, Bell, CheckCircle } from "lucide-react"

// Mock data for fleet alerts
const alerts = [
  {
    id: "A001",
    vehicleId: "TRK-002",
    type: "maintenance",
    severity: "high",
    message: "Maintenance overdue by 2 weeks",
    timestamp: "2023-05-24T08:30:00Z",
    acknowledged: false,
  },
  {
    id: "A002",
    vehicleId: "TRK-003",
    type: "diagnostic",
    severity: "medium",
    message: "Check engine light detected",
    timestamp: "2023-05-24T10:15:00Z",
    acknowledged: false,
  },
  {
    id: "A003",
    vehicleId: "FRK-001",
    type: "maintenance",
    severity: "high",
    message: "Hydraulic system requires immediate service",
    timestamp: "2023-05-24T09:45:00Z",
    acknowledged: false,
  },
  {
    id: "A004",
    vehicleId: "TRK-002",
    type: "compliance",
    severity: "medium",
    message: "Driver hours approaching limit",
    timestamp: "2023-05-24T11:20:00Z",
    acknowledged: false,
  },
  {
    id: "A005",
    vehicleId: "VAN-001",
    type: "fuel",
    severity: "low",
    message: "Fuel efficiency below threshold",
    timestamp: "2023-05-24T12:05:00Z",
    acknowledged: false,
  },
  {
    id: "A006",
    vehicleId: "CAR-001",
    type: "diagnostic",
    severity: "low",
    message: "Tire pressure low - rear right",
    timestamp: "2023-05-24T13:30:00Z",
    acknowledged: true,
  },
  {
    id: "A007",
    vehicleId: "TRK-001",
    type: "diagnostic",
    severity: "medium",
    message: "Battery voltage fluctuation detected",
    timestamp: "2023-05-24T14:10:00Z",
    acknowledged: true,
  },
]

export function FleetAlerts() {
  // Get counts by severity
  const highCount = alerts.filter((a) => a.severity === "high" && !a.acknowledged).length
  const mediumCount = alerts.filter((a) => a.severity === "medium" && !a.acknowledged).length
  const lowCount = alerts.filter((a) => a.severity === "low" && !a.acknowledged).length
  const totalActive = highCount + mediumCount + lowCount

  // Get icon by alert type
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Wrench className="h-4 w-4" />
      case "diagnostic":
        return <AlertTriangle className="h-4 w-4" />
      case "compliance":
        return <Clock className="h-4 w-4" />
      case "fuel":
        return <Fuel className="h-4 w-4" />
      case "temperature":
        return <Thermometer className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  // Get color by severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Fleet Alerts</span>
          </div>
          <Badge variant="destructive">{totalActive}</Badge>
        </CardTitle>
        <CardDescription>Active alerts requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-red-50 dark:bg-red-900/20">
            <span className="text-sm font-medium text-red-800 dark:text-red-300">High</span>
            <span className="text-2xl font-bold text-red-800 dark:text-red-300">{highCount}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20">
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Medium</span>
            <span className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{mediumCount}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-blue-50 dark:bg-blue-900/20">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Low</span>
            <span className="text-2xl font-bold text-blue-800 dark:text-blue-300">{lowCount}</span>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {alerts
              .sort((a, b) => {
                // Sort by acknowledged (unacknowledged first)
                if (a.acknowledged !== b.acknowledged) {
                  return a.acknowledged ? 1 : -1
                }
                // Then by severity
                const severityOrder = { high: 0, medium: 1, low: 2 }
                return (
                  severityOrder[a.severity as keyof typeof severityOrder] -
                  severityOrder[b.severity as keyof typeof severityOrder]
                )
              })
              .map((alert) => (
                <div key={alert.id} className={`p-3 rounded-md border ${alert.acknowledged ? "opacity-60" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                      {getAlertIcon(alert.type)}
                      <span className="ml-1 capitalize">{alert.type}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{alert.vehicleId}</span>
                    {alert.acknowledged && (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{alert.message}</p>
                  {!alert.acknowledged && (
                    <div className="mt-2 flex justify-end">
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Acknowledge
                      </Button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
