export interface Shipment {
  id: string
  trackingNumber: string
  customer: string
  origin: string
  destination: string
  departureDate: string
  estimatedArrival: string
  status: "in-transit" | "delivered" | "pending" | "delayed" | "cancelled"
  priority: "express" | "standard" | "economy"
  type: "road" | "air" | "sea" | "rail"
  carrier: string
  weight: number
  items: number
  value: number
  progress: number
  lastUpdated: string
}

export interface ShipmentStats {
  total: number
  inTransit: number
  delivered: number
  pending: number
  delayed: number
  cancelled: number
  totalWeight: number
  totalValue: number
  totalItems: number
}

export interface ShipmentFilters {
  searchQuery: string
  statusFilter: string
  typeFilter: string
  priorityFilter: string
  carrierFilter: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}
