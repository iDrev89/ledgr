"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  User,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// Mock data for drivers
const drivers = [
  {
    id: "D001",
    name: "John Smith",
    avatar: "/javascript-code.png",
    vehicleId: "TRK-001",
    vehicleModel: "Freightliner Cascadia",
    status: "active",
    location: "New York, NY",
    lastActive: "10 minutes ago",
    contact: "+1 (555) 123-4567",
    email: "john.smith@example.com",
    hoursThisWeek: 32,
    maxHours: 60,
    certifications: ["CDL-A", "Hazmat", "Tanker"],
    alerts: 0,
  },
  {
    id: "D002",
    name: "Sarah Johnson",
    avatar: "/stylized-letters-sj.png",
    vehicleId: "TRK-002",
    vehicleModel: "Kenworth T680",
    status: "maintenance",
    location: "Chicago, IL",
    lastActive: "2 hours ago",
    contact: "+1 (555) 234-5678",
    email: "sarah.johnson@example.com",
    hoursThisWeek: 45,
    maxHours: 60,
    certifications: ["CDL-A", "Doubles/Triples"],
    alerts: 1,
  },
  {
    id: "D003",
    name: "Michael Brown",
    avatar: "/monogram-mb.png",
    vehicleId: "VAN-001",
    vehicleModel: "Mercedes-Benz Sprinter",
    status: "active",
    location: "Los Angeles, CA",
    lastActive: "5 minutes ago",
    contact: "+1 (555) 345-6789",
    email: "michael.brown@example.com",
    hoursThisWeek: 38,
    maxHours: 60,
    certifications: ["CDL-B"],
    alerts: 0,
  },
  {
    id: "D004",
    name: "Emily Davis",
    avatar: "/ed-initials-abstract.png",
    vehicleId: "VAN-002",
    vehicleModel: "Ford Transit",
    status: "active",
    location: "Seattle, WA",
    lastActive: "30 minutes ago",
    contact: "+1 (555) 456-7890",
    email: "emily.davis@example.com",
    hoursThisWeek: 42,
    maxHours: 60,
    certifications: ["CDL-B"],
    alerts: 0,
  },
  {
    id: "D005",
    name: "David Wilson",
    avatar: "/abstract-dw.png",
    vehicleId: "TRK-003",
    vehicleModel: "Volvo VNL",
    status: "active",
    location: "Miami, FL",
    lastActive: "15 minutes ago",
    contact: "+1 (555) 567-8901",
    email: "david.wilson@example.com",
    hoursThisWeek: 52,
    maxHours: 60,
    certifications: ["CDL-A", "Hazmat", "Tanker"],
    alerts: 1,
  },
];

export function DriverAssignments() {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Driver Assignments
          </CardTitle>
          <CardDescription>
            Current driver status and vehicle assignments
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Driver</TableHead>
                <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Contact</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead className="hidden md:table-cell">
                  Certifications
                </TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={driver.avatar || "/placeholder.svg"}
                          alt={driver.name}
                        />
                        <AvatarFallback>
                          {driver.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {driver.lastActive}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div>
                      <div className="font-medium">{driver.vehicleId}</div>
                      <div className="text-xs text-muted-foreground">
                        {driver.vehicleModel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{driver.location}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{driver.contact}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{driver.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>{driver.hoursThisWeek} hrs</span>
                        <span className="text-muted-foreground">
                          / {driver.maxHours}
                        </span>
                      </div>
                      <Progress
                        value={(driver.hoursThisWeek / driver.maxHours) * 100}
                        className="h-2"
                        indicatorClassName={
                          driver.hoursThisWeek > driver.maxHours * 0.9
                            ? "bg-red-500"
                            : driver.hoursThisWeek > driver.maxHours * 0.75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {driver.certifications.map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {driver.status === "active" ? (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        >
                          Standby
                        </Badge>
                      )}
                      {driver.alerts > 0 && (
                        <Badge
                          variant="destructive"
                          className="flex items-center gap-1"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {driver.alerts}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
