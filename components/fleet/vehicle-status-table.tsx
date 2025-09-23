"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Truck,
  Car,
  Forklift,
  Package,
  MoreHorizontal,
  CheckCircle,
  Wrench,
  Clock,
  Ban,
  FileEdit,
  Calendar,
  User,
  AlertTriangle,
  Download,
} from "lucide-react"

// Define vehicle types and statuses for consistent styling
const vehicleTypeIcons = {
  truck: Truck,
  van: Package,
  car: Car,
  forklift: Forklift,
}

const statusConfig = {
  active: { icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900" },
  maintenance: { icon: Wrench, color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900" },
  available: { icon: Clock, color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900" },
  outOfService: { icon: Ban, color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900" },
}

// Mock data for vehicles
const vehicles = [
  {
    id: "TRK-001",
    type: "truck",
    model: "Freightliner Cascadia",
    status: "active",
    driver: "John Smith",
    location: "New York, NY",
    lastMaintenance: "2023-04-15",
    nextMaintenance: "2023-07-15",
    fuelLevel: 85,
    mileage: 45892,
    alerts: 0,
  },
  {
    id: "TRK-002",
    type: "truck",
    model: "Kenworth T680",
    status: "maintenance",
    driver: "Sarah Johnson",
    location: "Chicago, IL",
    lastMaintenance: "2023-05-20",
    nextMaintenance: "2023-08-20",
    fuelLevel: 42,
    mileage: 78541,
    alerts: 2,
  },
  {
    id: "VAN-001",
    type: "van",
    model: "Mercedes-Benz Sprinter",
    status: "active",
    driver: "Michael Brown",
    location: "Los Angeles, CA",
    lastMaintenance: "2023-03-10",
    nextMaintenance: "2023-06-10",
    fuelLevel: 72,
    mileage: 32145,
    alerts: 0,
  },
  {
    id: "CAR-001",
    type: "car",
    model: "Toyota Camry",
    status: "available",
    driver: "Unassigned",
    location: "Houston, TX",
    lastMaintenance: "2023-05-05",
    nextMaintenance: "2023-08-05",
    fuelLevel: 90,
    mileage: 12567,
    alerts: 0,
  },
  {
    id: "TRK-003",
    type: "truck",
    model: "Volvo VNL",
    status: "active",
    driver: "David Wilson",
    location: "Miami, FL",
    lastMaintenance: "2023-04-25",
    nextMaintenance: "2023-07-25",
    fuelLevel: 65,
    mileage: 56789,
    alerts: 1,
  },
  {
    id: "FRK-001",
    type: "forklift",
    model: "Toyota 8FGU25",
    status: "outOfService",
    driver: "Unassigned",
    location: "Chicago, IL",
    lastMaintenance: "2023-02-15",
    nextMaintenance: "2023-05-15",
    fuelLevel: 20,
    mileage: 8765,
    alerts: 3,
  },
  {
    id: "VAN-002",
    type: "van",
    model: "Ford Transit",
    status: "active",
    driver: "Emily Davis",
    location: "Seattle, WA",
    lastMaintenance: "2023-05-10",
    nextMaintenance: "2023-08-10",
    fuelLevel: 78,
    mileage: 28976,
    alerts: 0,
  },
]

export function VehicleStatusTable() {
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])

  const toggleVehicle = (vehicleId: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(vehicleId) ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId],
    )
  }

  const toggleAllVehicles = () => {
    if (selectedVehicles.length === vehicles.length) {
      setSelectedVehicles([])
    } else {
      setSelectedVehicles(vehicles.map((vehicle) => vehicle.id))
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle>Vehicle Status</CardTitle>
          <CardDescription>Detailed status of all vehicles in your fleet</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Input placeholder="Find vehicle..." className="h-8 w-[150px] sm:w-[200px]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedVehicles.length === vehicles.length}
                    onCheckedChange={toggleAllVehicles}
                    aria-label="Select all vehicles"
                  />
                </TableHead>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[140px]">Type/Model</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="hidden md:table-cell">Driver</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Maintenance</TableHead>
                <TableHead className="hidden md:table-cell">Fuel</TableHead>
                <TableHead className="hidden md:table-cell">Mileage</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => {
                const TypeIcon = vehicleTypeIcons[vehicle.type as keyof typeof vehicleTypeIcons]
                const { icon: StatusIcon, color, bgColor } = statusConfig[vehicle.status as keyof typeof statusConfig]

                return (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedVehicles.includes(vehicle.id)}
                        onCheckedChange={() => toggleVehicle(vehicle.id)}
                        aria-label={`Select ${vehicle.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{vehicle.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="hidden sm:inline">{vehicle.model}</span>
                        <span className="sm:hidden">{vehicle.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`flex items-center gap-1 ${bgColor}`}>
                        <StatusIcon className={`h-3 w-3 ${color}`} />
                        <span className="capitalize">{vehicle.status.replace(/([A-Z])/g, " $1").trim()}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{vehicle.driver}</TableCell>
                    <TableCell className="hidden lg:table-cell">{vehicle.location}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          Next: {new Date(vehicle.nextMaintenance).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Last: {new Date(vehicle.lastMaintenance).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              vehicle.fuelLevel > 70
                                ? "bg-green-500"
                                : vehicle.fuelLevel > 30
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${vehicle.fuelLevel}%` }}
                          />
                        </div>
                        <span className="text-xs">{vehicle.fuelLevel}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{vehicle.mileage.toLocaleString()} mi</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {vehicle.alerts > 0 && (
                          <Badge variant="destructive" className="mr-2 px-1 min-w-[20px]">
                            {vehicle.alerts}
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <FileEdit className="h-4 w-4 mr-2" />
                              Edit details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule maintenance
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <User className="h-4 w-4 mr-2" />
                              Assign driver
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Report issue
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  )
}
