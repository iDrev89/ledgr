import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Truck, AlertTriangle, XCircle, Package } from "lucide-react"

interface ShipmentStatusBadgeProps {
  status: string
}

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
  let icon = null
  let label = ""

  switch (status) {
    case "delivered":
      variant = "default"
      icon = <CheckCircle2 className="mr-1 h-3 w-3" />
      label = "Delivered"
      break
    case "in_transit":
      variant = "secondary"
      icon = <Truck className="mr-1 h-3 w-3" />
      label = "In Transit"
      break
    case "pending":
      variant = "outline"
      icon = <Clock className="mr-1 h-3 w-3" />
      label = "Pending"
      break
    case "delayed":
      variant = "destructive"
      icon = <AlertTriangle className="mr-1 h-3 w-3" />
      label = "Delayed"
      break
    case "cancelled":
      variant = "destructive"
      icon = <XCircle className="mr-1 h-3 w-3" />
      label = "Cancelled"
      break
    case "processing":
      variant = "outline"
      icon = <Package className="mr-1 h-3 w-3" />
      label = "Processing"
      break
    default:
      label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
  }

  return (
    <Badge variant={variant} className="flex items-center">
      {icon}
      {label}
    </Badge>
  )
}
