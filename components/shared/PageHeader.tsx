"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

type TProps = {
  pageTitle: string;
  pageDes: string;
};

const PageHeader = ({ pageTitle, pageDes }: TProps) => {
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground">{pageDes}</p>
      </div>

      <div className="flex gap-2">
        <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>
                Enter the details for the new vehicle to add it to your fleet.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle-id">Vehicle ID</Label>
                <Input id="vehicle-id" placeholder="e.g., TRK-004" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="forklift">Forklift</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input id="make" placeholder="e.g., Freightliner" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" placeholder="e.g., Cascadia" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" placeholder="e.g., 2023" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license-plate">License Plate</Label>
                <Input id="license-plate" placeholder="e.g., TRK-004-NY" />
              </div>
              <div className=" space-y-2">
                <Label htmlFor="vin">VIN</Label>
                <Input id="vin" placeholder="Vehicle Identification Number" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the vehicle..."
                />
              </div>
            </div>
            <DialogFooter className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddVehicle(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowAddVehicle(false)}>
                Add Vehicle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Shipment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] overflow-y-scroll max-h-[90vh] h-max">
            <DialogHeader>
              <DialogTitle>Create New Shipment</DialogTitle>
              <DialogDescription>
                Enter the details for the new shipment. Click save when you're
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="customer" className="text-sm font-medium">
                    Customer
                  </label>
                  <Input id="customer" placeholder="Customer name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="carrier" className="text-sm font-medium">
                    Carrier
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cargomax">CargoMax Express</SelectItem>
                      <SelectItem value="fasttrack">
                        FastTrack Logistics
                      </SelectItem>
                      <SelectItem value="airspeed">AirSpeed Cargo</SelectItem>
                      <SelectItem value="oceanwave">
                        OceanWave Freight
                      </SelectItem>
                      <SelectItem value="raillink">
                        RailLink Transport
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="origin" className="text-sm font-medium">
                    Origin
                  </label>
                  <Input id="origin" placeholder="City, Country" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="destination" className="text-sm font-medium">
                    Destination
                  </label>
                  <Input id="destination" placeholder="City, Country" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Shipment Type
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="road">Road</SelectItem>
                      <SelectItem value="air">Air</SelectItem>
                      <SelectItem value="sea">Sea</SelectItem>
                      <SelectItem value="rail">Rail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="economy">Economy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid  grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="weight" className="text-sm font-medium">
                    Weight (kg)
                  </label>
                  <Input id="weight" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="items" className="text-sm font-medium">
                    Items
                  </label>
                  <Input id="items" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="value" className="text-sm font-medium">
                    Value ($)
                  </label>
                  <Input id="value" type="number" placeholder="0.00" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Create Shipment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PageHeader;
