"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Truck, Wrench, CheckCircle, Clock, Ban } from "lucide-react"

export function FleetOverview() {
  // Mock data for fleet overview
  const fleetData = {
    total: 45,
    active: 32,
    maintenance: 8,
    available: 5,
    outOfService: 0,
    efficiency: 87,
    fuelEfficiency: 92,
    maintenanceCompliance: 95,
    avgAge: 2.7,
  }

  // Calculate percentages
  const activePercentage = (fleetData.active / fleetData.total) * 100
  const maintenancePercentage = (fleetData.maintenance / fleetData.total) * 100
  const availablePercentage = (fleetData.available / fleetData.total) * 100
  const outOfServicePercentage = (fleetData.outOfService / fleetData.total) * 100

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
              <p className="text-2xl font-bold">{fleetData.total}</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Truck className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Active
              </span>
              <span className="font-medium">{fleetData.active}</span>
            </div>
            <Progress value={activePercentage} className="h-1 bg-muted" />

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <Wrench className="h-4 w-4 text-yellow-500 mr-1" />
                Maintenance
              </span>
              <span className="font-medium">{fleetData.maintenance}</span>
            </div>
            <Progress value={maintenancePercentage} className="h-1 bg-muted" />

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500 mr-1" />
                Available
              </span>
              <span className="font-medium">{fleetData.available}</span>
            </div>
            <Progress value={availablePercentage} className="h-1 bg-muted" />

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <Ban className="h-4 w-4 text-red-500 mr-1" />
                Out of Service
              </span>
              <span className="font-medium">{fleetData.outOfService}</span>
            </div>
            <Progress value={outOfServicePercentage} className="h-1 bg-muted" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Fleet Efficiency</p>
              <p className="text-2xl font-bold">{fleetData.efficiency}%</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={fleetData.efficiency} className="h-2" />
            <p className="mt-2 text-sm text-muted-foreground">
              Overall fleet performance based on uptime, fuel efficiency, and maintenance compliance
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Fuel Efficiency</p>
              <p className="text-2xl font-bold">{fleetData.fuelEfficiency}%</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <Truck className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={fleetData.fuelEfficiency} className="h-2" />
            <p className="mt-2 text-sm text-muted-foreground">
              Average fuel efficiency across all vehicles compared to industry standards
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Maintenance Compliance</p>
              <p className="text-2xl font-bold">{fleetData.maintenanceCompliance}%</p>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-full">
              <Wrench className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={fleetData.maintenanceCompliance} className="h-2" />
            <p className="mt-2 text-sm text-muted-foreground">
              Percentage of vehicles with up-to-date maintenance schedules
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
