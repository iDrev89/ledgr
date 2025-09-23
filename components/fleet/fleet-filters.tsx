"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

export function FleetFilters() {
  const [searchQuery, setSearchQuery] = useState("")
  const [vehicleType, setVehicleType] = useState("")
  const [status, setStatus] = useState("")
  const [location, setLocation] = useState("")

  const clearFilters = () => {
    setSearchQuery("")
    setVehicleType("")
    setStatus("")
    setLocation("")
  }

  const hasActiveFilters = searchQuery || vehicleType || status || location

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by vehicle ID, model, or driver..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:w-auto">
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="truck">Truck</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="forklift">Forklift</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="outOfService">Out of Service</SelectItem>
              </SelectContent>
            </Select>

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ny">New York</SelectItem>
                <SelectItem value="la">Los Angeles</SelectItem>
                <SelectItem value="ch">Chicago</SelectItem>
                <SelectItem value="hou">Houston</SelectItem>
                <SelectItem value="mia">Miami</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
              <span className="sr-only">More filters</span>
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 px-3">
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {searchQuery && (
              <Badge variant="secondary" className="rounded-sm">
                Search: {searchQuery}
                <button className="ml-1" onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {vehicleType && (
              <Badge variant="secondary" className="rounded-sm">
                Type: {vehicleType}
                <button className="ml-1" onClick={() => setVehicleType("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {status && (
              <Badge variant="secondary" className="rounded-sm">
                Status: {status}
                <button className="ml-1" onClick={() => setStatus("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {location && (
              <Badge variant="secondary" className="rounded-sm">
                Location: {location}
                <button className="ml-1" onClick={() => setLocation("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
