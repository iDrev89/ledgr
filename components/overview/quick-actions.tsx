"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusSquare, Navigation, UserPlus, Bus, Package, BarChart3, Settings, FileText } from "lucide-react"
import Link from "next/link"

const quickActions = [
  {
    title: "Create Shipment",
    description: "Add a new shipment to the system",
    icon: PlusSquare,
    color: "bg-blue-500 hover:bg-blue-600",
    href: "/shipments/create",
  },
  {
    title: "Track Package",
    description: "Track existing shipments",
    icon: Navigation,
    color: "bg-green-500 hover:bg-green-600",
    href: "/shipments/track",
  },
  {
    title: "Add Vehicle",
    description: "Register a new vehicle",
    icon: Bus,
    color: "bg-purple-500 hover:bg-purple-600",
    href: "/fleet/vehicles",
  },
  {
    title: "Add Vendor",
    description: "Register a new vendor",
    icon: UserPlus,
    color: "bg-orange-500 hover:bg-orange-600",
    href: "/vendors/add",
  },
  {
    title: "Inventory Check",
    description: "Check warehouse inventory",
    icon: Package,
    color: "bg-teal-500 hover:bg-teal-600",
    href: "/warehouses/inventory",
  },
  {
    title: "Generate Report",
    description: "Create performance reports",
    icon: BarChart3,
    color: "bg-indigo-500 hover:bg-indigo-600",
    href: "reports/delivery",
  },
  {
    title: "System Settings",
    description: "Configure system preferences",
    icon: Settings,
    color: "bg-gray-500 hover:bg-gray-600",
    href: "/settings",
  },
  {
    title: "Documentation",
    description: "Access help and guides",
    icon: FileText,
    color: "bg-pink-500 hover:bg-pink-600",
    href: "/help",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all border rounded-md border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <div className={`p-2 rounded-full text-white ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground hidden md:block">{action.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
