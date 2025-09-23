"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Wrench, CalendarIcon, Clock, CheckCircle } from "lucide-react"

// Mock data for maintenance schedule
const maintenanceData = [
  {
    id: "M001",
    vehicleId: "TRK-002",
    vehicleModel: "Kenworth T680",
    type: "Regular Service",
    date: new Date("2023-05-25"),
    status: "scheduled",
    technician: "Robert Johnson",
    estimatedDuration: 3, // hours
    notes: "Oil change, filter replacement, brake inspection",
  },
  {
    id: "M002",
    vehicleId: "FRK-001",
    vehicleModel: "Toyota 8FGU25",
    type: "Major Repair",
    date: new Date("2023-05-26"),
    status: "scheduled",
    technician: "Michael Chen",
    estimatedDuration: 8, // hours
    notes: "Hydraulic system repair, engine diagnostics",
  },
  {
    id: "M003",
    vehicleId: "VAN-001",
    vehicleModel: "Mercedes-Benz Sprinter",
    type: "Regular Service",
    date: new Date("2023-05-28"),
    status: "scheduled",
    technician: "Robert Johnson",
    estimatedDuration: 2, // hours
    notes: "Tire rotation, fluid check, general inspection",
  },
  {
    id: "M004",
    vehicleId: "TRK-003",
    vehicleModel: "Volvo VNL",
    type: "Inspection",
    date: new Date("2023-05-30"),
    status: "scheduled",
    technician: "Sarah Williams",
    estimatedDuration: 1, // hours
    notes: "DOT compliance inspection",
  },
  {
    id: "M005",
    vehicleId: "CAR-001",
    vehicleModel: "Toyota Camry",
    type: "Regular Service",
    date: new Date("2023-06-02"),
    status: "scheduled",
    technician: "Michael Chen",
    estimatedDuration: 2, // hours
    notes: "Oil change, filter replacement",
  },
]

// Past maintenance for history tab
const pastMaintenanceData = [
  {
    id: "M006",
    vehicleId: "TRK-001",
    vehicleModel: "Freightliner Cascadia",
    type: "Regular Service",
    date: new Date("2023-05-15"),
    status: "completed",
    technician: "Robert Johnson",
    duration: 2.5, // actual hours
    notes: "Completed oil change, filter replacement, brake inspection. Brake pads replaced.",
  },
  {
    id: "M007",
    vehicleId: "VAN-002",
    vehicleModel: "Ford Transit",
    type: "Regular Service",
    date: new Date("2023-05-10"),
    status: "completed",
    technician: "Sarah Williams",
    duration: 2, // actual hours
    notes: "Completed oil change, filter replacement, tire rotation.",
  },
  {
    id: "M008",
    vehicleId: "TRK-003",
    vehicleModel: "Volvo VNL",
    type: "Repair",
    date: new Date("2023-05-05"),
    status: "completed",
    technician: "Michael Chen",
    duration: 4, // actual hours
    notes: "Fixed electrical issue with dashboard. Replaced wiring harness.",
  },
]

export function MaintenanceSchedule() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("upcoming")

  // Filter maintenance events for the selected date
  const selectedDateEvents = maintenanceData.filter(
    (event) => date && event.date.toDateString() === date.toDateString(),
  )

  // Get dates with maintenance events for highlighting in calendar
  const maintenanceDates = maintenanceData.map((event) => event.date)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance Schedule
            </CardTitle>
            <CardDescription>Upcoming and past maintenance activities</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="border rounded-md p-3"
                  modifiers={{
                    maintenance: maintenanceDates,
                  }}
                  modifiersClassNames={{
                    maintenance: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
                  }}
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">
                  {date
                    ? date.toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Select a date"}
                </h3>
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <div key={event.id} className="border rounded-md p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          >
                            {event.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{event.vehicleId}</span>
                          <span className="text-sm text-muted-foreground">{event.vehicleModel}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{event.estimatedDuration} hours</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{event.notes}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center border rounded-md p-4">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                    <p className="text-sm text-muted-foreground">
                      {date ? "No maintenance scheduled for this date" : "Select a date to view scheduled maintenance"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="space-y-4 mt-4">
              {pastMaintenanceData.map((event) => (
                <div key={event.id} className="border rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        {event.type}
                      </Badge>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-xs text-muted-foreground">{event.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{event.vehicleId}</span>
                    <span className="text-sm text-muted-foreground">{event.vehicleModel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{event.duration} hours</span>
                    <span className="text-sm text-muted-foreground">by {event.technician}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{event.notes}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
