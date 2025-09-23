"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Copy, Trash2 } from "lucide-react"
import { Shipment } from "../types/shipment"
import { ShipmentStatusBadge } from "../shipment-status-badge"
import { ShipmentTypeIcon } from "./shipment-type-icon"

interface ShipmentCardProps {
  shipment: Shipment
  onView: (shipment: Shipment) => void
  onEdit: (shipment: Shipment) => void
  onDuplicate: (shipment: Shipment) => void
  onDelete: (shipment: Shipment) => void
}

export function ShipmentCard({ shipment, onView, onEdit, onDuplicate, onDelete }: ShipmentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">{shipment.id}</CardTitle>
          <CardDescription>{shipment.trackingNumber}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(shipment)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(shipment)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Shipment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(shipment)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(shipment)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">{shipment.customer}</div>
          <ShipmentStatusBadge status={shipment.status} />
        </div>

        <div className="flex gap-2 justify-between mb-3">
          <div className="text-xs">
            <div className="text-muted-foreground">Origin</div>
            <div>{shipment.origin}</div>
          </div>
          <div className="text-xs">
            <div className="text-muted-foreground">Destination</div>
            <div>{shipment.destination}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-xs">
            <div className="text-muted-foreground">Type</div>
            <div className="flex items-center gap-1 capitalize">
              <ShipmentTypeIcon type={shipment.type} />
              {shipment.type}
            </div>
          </div>
          <div className="text-xs">
            <div className="text-muted-foreground">Priority</div>
            <div className="capitalize">{shipment.priority}</div>
          </div>
          <div className="text-xs">
            <div className="text-muted-foreground">Carrier</div>
            <div className="truncate">{shipment.carrier}</div>
          </div>
        </div>

        {shipment.status === "in-transit" && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{shipment.progress}%</span>
            </div>
            <Progress value={shipment.progress} className="h-1" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Departure: </span>
            {formatDate(shipment.departureDate)}
          </div>
          <div>
            <span className="text-muted-foreground">ETA: </span>
            {formatDate(shipment.estimatedArrival)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
