"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Tooltip,
} from "recharts"
import { TrendingUp } from "lucide-react"

// Mock data for performance metrics
const fuelEfficiencyData = [
  { month: "Jan", actual: 7.2, target: 7.5 },
  { month: "Feb", actual: 7.3, target: 7.5 },
  { month: "Mar", actual: 7.6, target: 7.5 },
  { month: "Apr", actual: 7.8, target: 7.5 },
  { month: "May", actual: 7.9, target: 7.5 },
  { month: "Jun", actual: 7.7, target: 7.5 },
]

const maintenanceCostData = [
  { month: "Jan", preventive: 12500, repair: 8500 },
  { month: "Feb", preventive: 13200, repair: 7800 },
  { month: "Mar", preventive: 14000, repair: 6500 },
  { month: "Apr", preventive: 13800, repair: 5900 },
  { month: "May", preventive: 14200, repair: 5200 },
  { month: "Jun", preventive: 14500, repair: 4800 },
]

const utilizationData = [
  { month: "Jan", utilization: 82 },
  { month: "Feb", utilization: 84 },
  { month: "Mar", utilization: 86 },
  { month: "Apr", utilization: 85 },
  { month: "May", utilization: 87 },
  { month: "Jun", utilization: 89 },
]

export function FleetPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Fleet Performance
        </CardTitle>
        <CardDescription>Key performance indicators and trends</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fuel">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fuel">Fuel Efficiency</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Cost</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
          </TabsList>
          <TabsContent value="fuel" className="space-y-4">
            <div className="pt-4">
              <ChartContainer
                config={{
                  actual: {
                    label: "Actual (MPG)",
                    color: "hsl(var(--chart-1))",
                  },
                  target: {
                    label: "Target (MPG)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fuelEfficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[7, 8]} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="var(--color-actual)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="var(--color-target)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Current Average</div>
                <div className="mt-1 flex items-end justify-between">
                  <div className="text-2xl font-bold">7.9 MPG</div>
                  <div className="text-sm text-green-600">+5.3% YTD</div>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Projected Savings</div>
                <div className="mt-1 flex items-end justify-between">
                  <div className="text-2xl font-bold">$42,800</div>
                  <div className="text-sm text-muted-foreground">Annual</div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="maintenance" className="pt-4">
            <ChartContainer
              config={{
                preventive: {
                  label: "Preventive",
                  color: "hsl(var(--chart-1))",
                },
                repair: {
                  label: "Repair",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceCostData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="preventive" fill="var(--color-preventive)" />
                  <Bar dataKey="repair" fill="var(--color-repair)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Preventive vs. Repair</div>
                <div className="mt-1 flex items-end justify-between">
                  <div className="text-2xl font-bold">75% / 25%</div>
                  <div className="text-sm text-green-600">+12% YTD</div>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Cost per Mile</div>
                <div className="mt-1 flex items-end justify-between">
                  <div className="text-2xl font-bold">$0.12</div>
                  <div className="text-sm text-green-600">-8% YTD</div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="utilization" className="pt-4">
            <ChartContainer
              config={{
                utilization: {
                  label: "Utilization Rate (%)",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[80, 90]} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="utilization"
                    stroke="var(--color-utilization)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Current Utilization</div>
                <div className="mt-1 flex items-end justify-between">
                  <div className="text-2xl font-bold">89%</div>
                  <div className="text-sm text-green-600">+7% YTD</div>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Idle Time</div>
                <div className="mt-1 flex items-end justify-between">
                  <div className="text-2xl font-bold">11%</div>
                  <div className="text-sm text-green-600">-7% YTD</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
