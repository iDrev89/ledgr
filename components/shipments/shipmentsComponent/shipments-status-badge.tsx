import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertTriangle, X } from "lucide-react"

interface ShipmentStatusBadgeProps {
  status: "in-transit" | "delivered" | "pending" | "delayed" | "cancelled"
}

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  switch (status) {
    case "in-transit":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          <Clock className="mr-1 h-3 w-3" />
          In Transit
        </Badge>
      )
    case "delivered":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="mr-1 h-3 w-3" />
          Delivered
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      )
    case "delayed":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Delayed
        </Badge>
      )
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <X className="mr-1 h-3 w-3" />
          Cancelled
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}
