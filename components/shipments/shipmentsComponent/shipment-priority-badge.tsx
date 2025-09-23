import { Badge } from "@/components/ui/badge"

interface ShipmentPriorityBadgeProps {
  priority: "express" | "standard" | "economy"
}

export function ShipmentPriorityBadge({ priority }: ShipmentPriorityBadgeProps) {
  switch (priority) {
    case "express":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          Express
        </Badge>
      )
    case "standard":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          Standard
        </Badge>
      )
    case "economy":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Economy
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}
