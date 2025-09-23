"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Truck, Wrench, CheckCircle, AlertTriangle } from "lucide-react"

interface FleetData {
  total: number
  active: number
  maintenance: number
  available: number
  efficiency: number
}

const fleetData: FleetData = {
  total: 45,
  active: 32,
  maintenance: 8,
  available: 5,
  efficiency: 87,
}

export function FleetStatus() {
  const activePercentage = (fleetData.active / fleetData.total) * 100
  const maintenancePercentage = (fleetData.maintenance / fleetData.total) * 100
  const availablePercentage = (fleetData.available / fleetData.total) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Fleet Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{fleetData.total}</div>
            <div className="text-sm text-muted-foreground">Total Vehicles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{fleetData.efficiency}%</div>
            <div className="text-sm text-muted-foreground">Efficiency</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{fleetData.active}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                {activePercentage.toFixed(0)}%
              </Badge>
            </div>
          </div>
          <Progress value={activePercentage} className="h-2" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{fleetData.maintenance}</span>
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              >
                {maintenancePercentage.toFixed(0)}%
              </Badge>
            </div>
          </div>
          <Progress value={maintenancePercentage} className="h-2" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{fleetData.available}</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {availablePercentage.toFixed(0)}%
              </Badge>
            </div>
          </div>
          <Progress value={availablePercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
