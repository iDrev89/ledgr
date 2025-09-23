"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  Download,
  X,
  CalendarIcon,
  MapPin,
  ChevronDown,
  ListFilter,
  LayoutDashboard,
  FileText,
  Printer,
} from "lucide-react"
import { ShipmentFilters } from "../types/shipment"

interface ShipmentFiltersProps {
  filters: ShipmentFilters
  showFilters: boolean
  viewMode: string
  onFiltersChange: (filters: Partial<ShipmentFilters>) => void
  onShowFiltersToggle: () => void
  onViewModeChange: (mode: string) => void
  onClearFilters: () => void
}

export function ShipmentFiltersComponent({
  filters,
  showFilters,
  viewMode,
  onFiltersChange,
  onShowFiltersToggle,
  onViewModeChange,
  onClearFilters,
}: ShipmentFiltersProps) {
  const formatDateRange = () => {
    if (!filters.dateRange.from && !filters.dateRange.to) return "Pick a date range"
    if (filters.dateRange.from && !filters.dateRange.to) return filters.dateRange.from.toLocaleDateString()
    if (!filters.dateRange.from && filters.dateRange.to) return `Until ${filters.dateRange.to.toLocaleDateString()}`
    return `${filters.dateRange.from!.toLocaleDateString()} - ${filters.dateRange.to!.toLocaleDateString()}`
  }

  const hasActiveFilters =
    filters.statusFilter !== "all" ||
    filters.typeFilter !== "all" ||
    filters.priorityFilter !== "all" ||
    filters.carrierFilter !== "all" ||
    filters.dateRange.from ||
    filters.dateRange.to

  const activeFiltersCount = [
    filters.statusFilter !== "all" && "1",
    filters.typeFilter !== "all" && "1",
    filters.priorityFilter !== "all" && "1",
    filters.carrierFilter !== "all" && "1",
    (filters.dateRange.from || filters.dateRange.to) && "1",
  ].filter(Boolean).length

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap flex-col md:flex-row gap-2 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search shipments by ID, tracking number, customer, or location..."
              className="pl-8"
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={onShowFiltersToggle}
              className="h-10"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-2 bg-primary text-primary-foreground">{activeFiltersCount}</Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className={`h-10 w-10 ${viewMode === "table" ? "bg-muted" : ""}`}
                onClick={() => onViewModeChange("table")}
              >
                <ListFilter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-10 w-10 ${viewMode === "cards" ? "bg-muted" : ""}`}
                onClick={() => onViewModeChange("cards")}
              >
                <LayoutDashboard className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-10 w-10 ${viewMode === "map" ? "bg-muted" : ""}`}
                onClick={() => onViewModeChange("map")}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-10">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={filters.statusFilter} onValueChange={(value) => onFiltersChange({ statusFilter: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Select value={filters.typeFilter} onValueChange={(value) => onFiltersChange({ typeFilter: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="road">Road</SelectItem>
                  <SelectItem value="air">Air</SelectItem>
                  <SelectItem value="sea">Sea</SelectItem>
                  <SelectItem value="rail">Rail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Priority</label>
              <Select
                value={filters.priorityFilter}
                onValueChange={(value) => onFiltersChange({ priorityFilter: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="economy">Economy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Carrier</label>
              <Select
                value={filters.carrierFilter}
                onValueChange={(value) => onFiltersChange({ carrierFilter: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Carriers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Carriers</SelectItem>
                  <SelectItem value="CargoMax Express">CargoMax Express</SelectItem>
                  <SelectItem value="FastTrack Logistics">FastTrack Logistics</SelectItem>
                  <SelectItem value="AirSpeed Cargo">AirSpeed Cargo</SelectItem>
                  <SelectItem value="OceanWave Freight">OceanWave Freight</SelectItem>
                  <SelectItem value="RailLink Transport">RailLink Transport</SelectItem>
                  <SelectItem value="SeaBreeze Shipping">SeaBreeze Shipping</SelectItem>
                  <SelectItem value="RoadRunner Logistics">RoadRunner Logistics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to,
                    }}
                    onSelect={(range) => {
                      onFiltersChange({
                        dateRange: {
                          from: range?.from,
                          to: range?.to,
                        },
                      })
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.statusFilter !== "all" && (
              <Badge variant="secondary" className="rounded-sm">
                Status: {filters.statusFilter.charAt(0).toUpperCase() + filters.statusFilter.slice(1).replace("-", " ")}
                <button className="ml-1" onClick={() => onFiltersChange({ statusFilter: "all" })}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.typeFilter !== "all" && (
              <Badge variant="secondary" className="rounded-sm">
                Type: {filters.typeFilter.charAt(0).toUpperCase() + filters.typeFilter.slice(1)}
                <button className="ml-1" onClick={() => onFiltersChange({ typeFilter: "all" })}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.priorityFilter !== "all" && (
              <Badge variant="secondary" className="rounded-sm">
                Priority: {filters.priorityFilter.charAt(0).toUpperCase() + filters.priorityFilter.slice(1)}
                <button className="ml-1" onClick={() => onFiltersChange({ priorityFilter: "all" })}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.carrierFilter !== "all" && (
              <Badge variant="secondary" className="rounded-sm">
                Carrier: {filters.carrierFilter}
                <button className="ml-1" onClick={() => onFiltersChange({ carrierFilter: "all" })}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.dateRange.from || filters.dateRange.to) && (
              <Badge variant="secondary" className="rounded-sm">
                Date: {formatDateRange()}
                <button
                  className="ml-1"
                  onClick={() => onFiltersChange({ dateRange: { from: undefined, to: undefined } })}
                >
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
