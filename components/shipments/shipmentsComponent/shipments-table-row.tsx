"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Copy, Trash2 } from "lucide-react"
import { ShipmentPriorityBadge } from "./shipment-priority-badge"
import { Shipment } from "../types/shipment"
import { ShipmentStatusBadge } from "../shipment-status-badge"
import { ShipmentTypeIcon } from "./shipment-type-icon"

interface ShipmentTableRowProps {
  shipment: Shipment
  isSelected: boolean
  onSelect: (id: string) => void
  onView: (shipment: Shipment) => void
  onEdit: (shipment: Shipment) => void
  onDuplicate: (shipment: Shipment) => void
  onDelete: (shipment: Shipment) => void
}

export function ShipmentTableRow({
  shipment,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: ShipmentTableRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <TableRow>
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={() => onSelect(shipment.id)} />
      </TableCell>
      <TableCell className="font-medium">
        <div>{shipment.id}</div>
        <div className="text-xs text-muted-foreground">{shipment.trackingNumber}</div>
      </TableCell>
      <TableCell>{shipment.customer}</TableCell>
      <TableCell className="hidden md:table-cell">{shipment.origin}</TableCell>
      <TableCell className="hidden md:table-cell">{shipment.destination}</TableCell>
      <TableCell className="hidden lg:table-cell">{formatDate(shipment.departureDate)}</TableCell>
      <TableCell className="hidden lg:table-cell">{formatDate(shipment.estimatedArrival)}</TableCell>
      <TableCell>
        <ShipmentStatusBadge status={shipment.status} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-2">
          <ShipmentTypeIcon type={shipment.type} />
          <span className="hidden lg:inline capitalize">{shipment.type}</span>
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <ShipmentPriorityBadge priority={shipment.priority} />
      </TableCell>
      <TableCell>
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
      </TableCell>
    </TableRow>
  )
}
