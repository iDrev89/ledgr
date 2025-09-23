"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Truck,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import Image, { StaticImageData } from "next/image";
import user1 from "@/public/user2.png";
import user2 from "@/public/user3.png";
import user3 from "@/public/user4.png";
import user4 from "@/public/user5.png";
import user5 from "@/public/user6.png";

interface Activity {
  id: string;
  type: "shipment" | "delivery" | "alert" | "maintenance";
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "warning" | "error" | "info";
  user?: {
    name: string;
    avatar: StaticImageData;
  };
}

const activities: Activity[] = [
  {
    id: "1",
    type: "shipment",
    title: "New shipment created",
    description: "Shipment #SH-2024-001 from New York to Los Angeles",
    timestamp: "2 minutes ago",
    status: "info",
    user: { name: "John Doe", avatar: user1 },
  },
  {
    id: "2",
    type: "delivery",
    title: "Delivery completed",
    description: "Package #PKG-789 delivered successfully to client",
    timestamp: "15 minutes ago",
    status: "success",
    user: { name: "Sarah Wilson", avatar: user2 },
  },
  {
    id: "3",
    type: "alert",
    title: "Vehicle maintenance due",
    description: "Truck TRK-042 requires scheduled maintenance",
    timestamp: "1 hour ago",
    status: "warning",
    user: { name: "Mike Johnson", avatar: user3 },
  },
  {
    id: "4",
    type: "shipment",
    title: "Shipment delayed",
    description: "SH-2024-002 delayed due to weather conditions",
    timestamp: "2 hours ago",
    status: "error",
    user: { name: "Emily Chen", avatar: user4 },
  },
  {
    id: "5",
    type: "delivery",
    title: "Route optimized",
    description: "Delivery route updated for better efficiency",
    timestamp: "3 hours ago",
    status: "success",
    user: { name: "David Brown", avatar: user5 },
  },
];

export function ActivityFeed() {
  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "shipment":
        return <Truck className="h-4 w-4" />;
      case "delivery":
        return <Package className="h-4 w-4" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
      case "maintenance":
        return <Clock className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Activity["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 mt-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div
                className={`p-2 rounded-full ${getStatusColor(
                  activity.status
                )}`}
              >
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1 items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </p>
                {activity.user && (
                  <div className="flex items-center mt-2 space-x-2">
                    <Avatar className="h-6 w-6">
                      <Image src={activity?.user?.avatar} alt="user" />
                      <AvatarFallback className="text-xs">
                        {activity.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.user.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
