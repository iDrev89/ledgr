"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapFilters } from "./map-filters";
import { MapControls } from "./map-controls";
import { ShipmentList } from "./shipment-list";
import { ShipmentDetails } from "./shipment-details";
import { MapLegend } from "./map-legend";
import { MapView } from "./map-view";
import { useTheme } from "next-themes";
import { generateMockShipments } from "./mock-data";

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: {
    name: string;
    coordinates: [number, number];
    country: string;
  };
  destination: {
    name: string;
    coordinates: [number, number];
    country: string;
  };
  currentLocation: {
    name: string;
    coordinates: [number, number];
    country: string;
  };
  status: "in-transit" | "delivered" | "delayed" | "pending" | "returned";
  carrier: string;
  departureTime: string;
  estimatedArrival: string;
  actualArrival?: string;
  lastUpdated: string;
  progress: number;
  type: "air" | "sea" | "road" | "rail";
  priority: "normal" | "express" | "economy";
  weight: number;
  items: number;
  customer: {
    name: string;
    id: string;
  };
  notes?: string;
  temperature?: number;
  humidity?: number;
  alerts?: {
    type: "warning" | "critical" | "info";
    message: string;
    timestamp: string;
  }[];
}

export function LiveShipmentMap() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [filters, setFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    priority: [] as string[],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [mapView, setMapView] = useState<"all" | "clusters" | "routes">("all");
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const mapRef = useRef(null);

  // Load mock shipment data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockData = generateMockShipments(50);
      setShipments(mockData);
      setFilteredShipments(mockData);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...shipments];

    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter((shipment) =>
        filters.status.includes(shipment.status)
      );
    }

    // Apply type filter
    if (filters.type.length > 0) {
      result = result.filter((shipment) =>
        filters.type.includes(shipment.type)
      );
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      result = result.filter((shipment) =>
        filters.priority.includes(shipment.priority)
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (shipment) =>
          shipment.trackingNumber.toLowerCase().includes(query) ||
          shipment.origin.name.toLowerCase().includes(query) ||
          shipment.destination.name.toLowerCase().includes(query) ||
          shipment.carrier.toLowerCase().includes(query) ||
          shipment.customer.name.toLowerCase().includes(query)
      );
    }

    setFilteredShipments(result);
  }, [shipments, filters, searchQuery]);

  const handleFilterChange = (
    filterType: keyof typeof filters,
    values: string[]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: values,
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleShipmentSelect = (shipment: Shipment) => {
    setSelectedShipment(shipment);
  };

  const handleViewChange = (view: "all" | "clusters" | "routes") => {
    setMapView(view);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockData = generateMockShipments(50);
    setShipments(mockData);
    setFilteredShipments(mockData);
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-12  gap-6">
      {/* Left sidebar - Filters and Shipment List */}
      <div className="col-span-12 md:col-span-6  xl:col-span-4 space-y-6">
        <Card className="p-4">
          <MapFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />
        </Card>

        <Card>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="list">Shipment List</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="p-0">
              <ShipmentList
                shipments={filteredShipments}
                isLoading={isLoading}
                onSelect={handleShipmentSelect}
                selectedShipmentId={selectedShipment?.id}
              />
            </TabsContent>
            <TabsContent value="details" className="p-4">
              <ShipmentDetails shipment={selectedShipment} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Right side - Map */}
      <div className="col-span-12 md:col-span-6  xl:col-span-8 space-y-4">
        <Card className="p-4">
          <MapControls
            onViewChange={handleViewChange}
            currentView={mapView}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            totalShipments={filteredShipments.length}
          />
        </Card>

        <Card className="overflow-hidden">
          <div className="relative">
            <MapView
              shipments={filteredShipments}
              selectedShipment={selectedShipment}
              onShipmentSelect={handleShipmentSelect}
              viewMode={mapView}
              isLoading={isLoading}
              theme={theme}
              ref={mapRef}
            />
            <div className="absolute bottom-4 right-4 z-10">
              <MapLegend />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
