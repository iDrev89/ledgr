"use client"

import { Card } from "@/components/ui/card"
import { Plane, Ship, Truck, Train } from "lucide-react"

export function MapLegend() {
  return (
    <Card className="p-3 shadow-lg">
      <div className="text-xs font-medium mb-2">Legend</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span className="text-xs">In Transit</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-xs">Delivered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <span className="text-xs">Delayed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-purple-500"></div>
          <span className="text-xs">Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span className="text-xs">Returned</span>
        </div>
      </div>
      <div className="border-t my-2"></div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex items-center gap-1">
          <Plane className="h-3 w-3 text-sky-500" />
          <span className="text-xs">Air</span>
        </div>
        <div className="flex items-center gap-1">
          <Ship className="h-3 w-3 text-indigo-500" />
          <span className="text-xs">Sea</span>
        </div>
        <div className="flex items-center gap-1">
          <Truck className="h-3 w-3 text-orange-500" />
          <span className="text-xs">Road</span>
        </div>
        <div className="flex items-center gap-1">
          <Train className="h-3 w-3 text-emerald-500" />
          <span className="text-xs">Rail</span>
        </div>
      </div>
    </Card>
  )
}
