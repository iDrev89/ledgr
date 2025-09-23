import { Truck, Plane, Ship, Train, Package } from "lucide-react"

interface ShipmentTypeIconProps {
  type: "road" | "air" | "sea" | "rail"
  className?: string
}

export function ShipmentTypeIcon({ type, className = "h-4 w-4 text-muted-foreground" }: ShipmentTypeIconProps) {
  switch (type) {
    case "road":
      return <Truck className={className} />
    case "air":
      return <Plane className={className} />
    case "sea":
      return <Ship className={className} />
    case "rail":
      return <Train className={className} />
    default:
      return <Package className={className} />
  }
}
