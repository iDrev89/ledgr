"use client";

import { forwardRef, useEffect, useState } from "react";
import type { Shipment } from "./live-shipment-map";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, Ship, Truck, Train } from "lucide-react";

interface MapViewProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
  onShipmentSelect: (shipment: Shipment) => void;
  viewMode: "all" | "clusters" | "routes";
  isLoading: boolean;
  theme?: string;
}

export const MapView = forwardRef<HTMLDivElement, MapViewProps>(
  (
    {
      shipments,
      selectedShipment,
      onShipmentSelect,
      viewMode,
      isLoading,
      theme,
    },
    ref
  ) => {
    const [mapLoaded, setMapLoaded] = useState(false);

    // Simulate map loading
    useEffect(() => {
      const timer = setTimeout(() => {
        setMapLoaded(true);
      }, 1500);

      return () => clearTimeout(timer);
    }, []);

    if (isLoading || !mapLoaded) {
      return (
        <div className="h-[400px] md:h-[500px] xl:h-[600px] w-full flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      );
    }

    // In a real implementation, we would use a map library like Leaflet or Google Maps
    // For this demo, we'll create a simplified map visualization
    return (
      <div ref={ref} className="h-[600px] w-full relative overflow-hidden">
        {/* Map background - would be replaced with actual map in real implementation */}
        <div className="absolute inset-0 bg-[#f8f9fa] dark:bg-[#111827]">
          {/* World map SVG - simplified for demo */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1000 500"
            preserveAspectRatio="xMidYMid meet"
            className="opacity-20 dark:opacity-10"
          >
            <path
              d="M473,126 L510,126 L510,170 L473,170 Z M600,230 L630,230 L630,270 L600,270 Z M760,270 L790,270 L790,310 L760,310 Z M300,190 L330,190 L330,230 L300,230 Z M400,300 L430,300 L430,340 L400,340 Z M200,250 L230,250 L230,290 L200,290 Z M500,350 L530,350 L530,390 L500,390 Z M650,150 L680,150 L680,190 L650,190 Z M150,200 L180,200 L180,240 L150,240 Z M350,100 L380,100 L380,140 L350,140 Z M700,320 L730,320 L730,360 L700,360 Z M250,150 L280,150 L280,190 L250,190 Z M550,250 L580,250 L580,290 L550,290 Z"
              fill={theme === "dark" ? "#1e293b" : "#e9ecef"}
              stroke={theme === "dark" ? "#334155" : "#ced4da"}
              strokeWidth="2"
            />
            <path
              d="M100,200 C150,150 200,180 250,170 C300,160 350,140 400,160 C450,180 500,200 550,190 C600,180 650,150 700,170 C750,190 800,220 850,200"
              fill="none"
              stroke={theme === "dark" ? "#334155" : "#ced4da"}
              strokeWidth="1"
            />
            <path
              d="M150,250 C200,230 250,240 300,250 C350,260 400,270 450,260 C500,250 550,230 600,240 C650,250 700,270 750,260 C800,250 850,230 900,240"
              fill="none"
              stroke={theme === "dark" ? "#334155" : "#ced4da"}
              strokeWidth="1"
            />
            <path
              d="M100,300 C150,280 200,290 250,300 C300,310 350,320 400,310 C450,300 500,280 550,290 C600,300 650,320 700,310 C750,300 800,280 850,290"
              fill="none"
              stroke={theme === "dark" ? "#334155" : "#ced4da"}
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Shipment markers */}
        {shipments.map((shipment) => {
          // Convert coordinates to position on the map (simplified for demo)
          const x =
            ((shipment.currentLocation.coordinates[0] + 180) / 360) * 100;
          const y =
            ((90 - shipment.currentLocation.coordinates[1]) / 180) * 100;

          // Determine marker color based on status
          let color;
          switch (shipment.status) {
            case "in-transit":
              color = "text-blue-500 bg-blue-100 dark:bg-blue-900";
              break;
            case "delivered":
              color = "text-green-500 bg-green-100 dark:bg-green-900";
              break;
            case "delayed":
              color = "text-yellow-500 bg-yellow-100 dark:bg-yellow-900";
              break;
            case "pending":
              color = "text-purple-500 bg-purple-100 dark:bg-purple-900";
              break;
            case "returned":
              color = "text-red-500 bg-red-100 dark:bg-red-900";
              break;
          }

          // Determine icon based on shipment type
          let Icon;
          switch (shipment.type) {
            case "air":
              Icon = Plane;
              break;
            case "sea":
              Icon = Ship;
              break;
            case "road":
              Icon = Truck;
              break;
            case "rail":
              Icon = Train;
              break;
          }

          return (
            <div
              key={shipment.id}
              className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center cursor-pointer transition-all ${color} ${
                selectedShipment?.id === shipment.id
                  ? "ring-2 ring-primary z-10 scale-125"
                  : "hover:scale-110"
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => onShipmentSelect(shipment)}
              title={`${shipment.trackingNumber}: ${shipment.origin.name} to ${shipment.destination.name}`}
            >
              <Icon className="h-4 w-4" />
            </div>
          );
        })}

        {/* Route lines for selected shipment */}
        {selectedShipment && (viewMode === "all" || viewMode === "routes") && (
          <>
            {/* Origin to current location line */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width="100%"
              height="100%"
            >
              <line
                x1={`${
                  ((selectedShipment.origin.coordinates[0] + 180) / 360) * 100
                }%`}
                y1={`${
                  ((90 - selectedShipment.origin.coordinates[1]) / 180) * 100
                }%`}
                x2={`${
                  ((selectedShipment.currentLocation.coordinates[0] + 180) /
                    360) *
                  100
                }%`}
                y2={`${
                  ((90 - selectedShipment.currentLocation.coordinates[1]) /
                    180) *
                  100
                }%`}
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>

            {/* Current location to destination line */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width="100%"
              height="100%"
            >
              <line
                x1={`${
                  ((selectedShipment.currentLocation.coordinates[0] + 180) /
                    360) *
                  100
                }%`}
                y1={`${
                  ((90 - selectedShipment.currentLocation.coordinates[1]) /
                    180) *
                  100
                }%`}
                x2={`${
                  ((selectedShipment.destination.coordinates[0] + 180) / 360) *
                  100
                }%`}
                y2={`${
                  ((90 - selectedShipment.destination.coordinates[1]) / 180) *
                  100
                }%`}
                stroke="rgba(156, 163, 175, 0.5)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>

            {/* Origin marker */}
            <div
              className="absolute w-4 h-4 -ml-2 -mt-2 bg-blue-500 border-2 border-white dark:border-gray-800 rounded-full"
              style={{
                left: `${
                  ((selectedShipment.origin.coordinates[0] + 180) / 360) * 100
                }%`,
                top: `${
                  ((90 - selectedShipment.origin.coordinates[1]) / 180) * 100
                }%`,
              }}
              title={`Origin: ${selectedShipment.origin.name}`}
            />

            {/* Destination marker */}
            <div
              className="absolute w-4 h-4 -ml-2 -mt-2 bg-gray-500 border-2 border-white dark:border-gray-800 rounded-full"
              style={{
                left: `${
                  ((selectedShipment.destination.coordinates[0] + 180) / 360) *
                  100
                }%`,
                top: `${
                  ((90 - selectedShipment.destination.coordinates[1]) / 180) *
                  100
                }%`,
              }}
              title={`Destination: ${selectedShipment.destination.name}`}
            />
          </>
        )}
      </div>
    );
  }
);
MapView.displayName = "MapView";
