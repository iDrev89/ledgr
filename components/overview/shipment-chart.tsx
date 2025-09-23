"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", shipments: 186, delivered: 180 },
  { month: "Feb", shipments: 205, delivered: 200 },
  { month: "Mar", shipments: 237, delivered: 230 },
  { month: "Apr", shipments: 273, delivered: 265 },
  { month: "May", shipments: 209, delivered: 205 },
  { month: "Jun", shipments: 214, delivered: 210 },
  { month: "Jul", shipments: 290, delivered: 285 },
  { month: "Aug", shipments: 320, delivered: 315 },
  { month: "Sep", shipments: 295, delivered: 290 },
  { month: "Oct", shipments: 340, delivered: 335 },
  { month: "Nov", shipments: 385, delivered: 380 },
  { month: "Dec", shipments: 420, delivered: 415 },
];

export function ShipmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipment Trends</CardTitle>
        <CardDescription>
          Monthly shipment and delivery performance over the past year
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="shipments"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="delivered"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
