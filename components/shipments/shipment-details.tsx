"use client"

import {
  Package,
  Truck,
  User,
  Building,
  Calendar,
  Clock,
  AlertTriangle,
  Thermometer,
  Droplets,
  Scale,
  Box,
  Tag,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface ShipmentDetailsProps {
  shipment: any
}

export function ShipmentDetails({ shipment }: ShipmentDetailsProps) {
  if (!shipment) {
    return <div>No shipment details available</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Shipment Information</h3>

          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tracking Number</span>
              </div>
              <span className="font-mono text-sm">{shipment.trackingNumber}</span>
            </div>

            <Separator />

            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Carrier</span>
              </div>
              <span className="text-sm">{shipment.carrier}</span>
            </div>

            <Separator />

            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Shipment Type</span>
              </div>
              <span className="text-sm">{shipment.shipmentType}</span>
            </div>

            <Separator />

            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Priority</span>
              </div>
              <Badge variant={shipment.priority === "High" ? "destructive" : "outline"}>{shipment.priority}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Customer Information</h3>

          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Customer</span>
              </div>
              <span className="text-sm">{shipment.customer}</span>
            </div>

            <Separator />

            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Account Number</span>
              </div>
              <span className="font-mono text-sm">ACC-12345</span>
            </div>

            <Separator />

            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Ship Date</span>
              </div>
              <span className="text-sm">
                {new Date(shipment.shipDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <Separator />

            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Estimated Delivery</span>
              </div>
              <span className="text-sm">
                {new Date(shipment.estimatedDelivery).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Package Details</h3>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Scale className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Weight</span>
              </div>
              <span className="text-sm">{shipment.weight}</span>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Box className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Dimensions</span>
              </div>
              <span className="text-sm">{shipment.dimensions}</span>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Package Count</span>
              </div>
              <span className="text-sm">{shipment.packageCount}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Environmental Conditions</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Thermometer className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Temperature</span>
              </div>
              <span className="text-sm">{shipment.temperature}</span>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Droplets className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Humidity</span>
              </div>
              <span className="text-sm">{shipment.humidity}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Special Instructions</h3>

        <div className="rounded-lg border p-4">
          <p className="text-sm">{shipment.specialInstructions}</p>
        </div>
      </div>
    </div>
  )
}
