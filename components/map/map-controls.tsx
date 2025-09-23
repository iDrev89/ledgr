"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Layers, Route, Map } from "lucide-react";

interface MapControlsProps {
  onViewChange: (view: "all" | "clusters" | "routes") => void;
  currentView: "all" | "clusters" | "routes";
  onRefresh: () => void;
  isLoading: boolean;
  totalShipments: number;
}

export function MapControls({
  onViewChange,
  currentView,
  onRefresh,
  isLoading,
  totalShipments,
}: MapControlsProps) {
  return (
    <div className="flex flex-wrap flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <Tabs
          value={currentView}
          onValueChange={(v) => onViewChange(v as any)}
          className="w-full"
        >
          <TabsList className="flex flex-wrap  gap-2 h-max justify-start">
            <TabsTrigger value="all" className="flex  items-center gap-1">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">All Shipments</span>
            </TabsTrigger>
            <TabsTrigger value="clusters" className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Clusters</span>
            </TabsTrigger>
            <TabsTrigger value="routes" className="flex items-center gap-1">
              <Route className="h-4 w-4" />
              <span className="hidden sm:inline">Routes</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <Badge variant="outline" className="h-7 px-3">
          {totalShipments} shipments
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8"
        >
          <RefreshCw
            className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
    </div>
  );
}
