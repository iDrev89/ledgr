"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, ChevronDown, X } from "lucide-react";

// Define allowed filter keys
export type FilterKey = "status" | "type" | "priority";

interface MapFiltersProps {
  filters: Record<FilterKey, string[]>;
  onFilterChange: (filterType: FilterKey, values: string[]) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
}

const statusOptions = [
  { value: "in-transit", label: "In Transit", color: "bg-blue-500" },
  { value: "delivered", label: "Delivered", color: "bg-green-500" },
  { value: "delayed", label: "Delayed", color: "bg-yellow-500" },
  { value: "pending", label: "Pending", color: "bg-purple-500" },
  { value: "returned", label: "Returned", color: "bg-red-500" },
];

const typeOptions = [
  { value: "air", label: "Air Freight", color: "bg-sky-500" },
  { value: "sea", label: "Sea Freight", color: "bg-indigo-500" },
  { value: "road", label: "Road Freight", color: "bg-orange-500" },
  { value: "rail", label: "Rail Freight", color: "bg-emerald-500" },
];

const priorityOptions = [
  { value: "express", label: "Express", color: "bg-red-500" },
  { value: "normal", label: "Normal", color: "bg-blue-500" },
  { value: "economy", label: "Economy", color: "bg-green-500" },
];

export function MapFilters({
  filters,
  onFilterChange,
  onSearch,
  searchQuery,
}: MapFiltersProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [isTypeOpen, setIsTypeOpen] = useState(true);
  const [isPriorityOpen, setIsPriorityOpen] = useState(true);

  const toggleFilter = (filterType: FilterKey, value: string) => {
    const currentFilters = filters[filterType];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter((v) => v !== value)
      : [...currentFilters, value];
    onFilterChange(filterType, newFilters);
  };

  const clearFilters = () => {
    onFilterChange("status", []);
    onFilterChange("type", []);
    onFilterChange("priority", []);
    onSearch("");
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.type.length > 0 ||
    filters.priority.length > 0 ||
    searchQuery.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search shipments..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <Separator />

      {/* Status */}
      <Collapsible open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <Label className="text-sm font-medium">Status</Label>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isStatusOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <Badge
                key={option.value}
                variant={
                  filters.status.includes(option.value) ? "default" : "outline"
                }
                className={`cursor-pointer ${
                  filters.status.includes(option.value) ? option.color : ""
                }`}
                onClick={() => toggleFilter("status", option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Type */}
      <Collapsible open={isTypeOpen} onOpenChange={setIsTypeOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <Label className="text-sm font-medium">Transport Type</Label>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isTypeOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((option) => (
              <Badge
                key={option.value}
                variant={
                  filters.type.includes(option.value) ? "default" : "outline"
                }
                className={`cursor-pointer ${
                  filters.type.includes(option.value) ? option.color : ""
                }`}
                onClick={() => toggleFilter("type", option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Priority */}
      <Collapsible open={isPriorityOpen} onOpenChange={setIsPriorityOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <Label className="text-sm font-medium">Priority</Label>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isPriorityOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => (
              <Badge
                key={option.value}
                variant={
                  filters.priority.includes(option.value)
                    ? "default"
                    : "outline"
                }
                className={`cursor-pointer ${
                  filters.priority.includes(option.value) ? option.color : ""
                }`}
                onClick={() => toggleFilter("priority", option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
