"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BarChartData } from "@/lib/types/reports";

interface BarChartProps {
  data: BarChartData[];
  title: string;
  formatValue?: (value: number) => string;
  color?: string;
  layout?: "horizontal" | "vertical";
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function BarChart({
  data,
  title,
  formatValue,
  color,
  layout = "vertical",
}: BarChartProps) {
  const defaultFormat = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatter = formatValue || defaultFormat;

  // Truncate long names for better display
  const formattedData = data.map((item) => ({
    ...item,
    displayName: item.name.length > 25 ? item.name.substring(0, 22) + "..." : item.name,
  }));

  if (layout === "vertical") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40)}>
            <RechartsBarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                className="text-xs text-muted-foreground"
                tick={{ fill: "currentColor" }}
                tickFormatter={(value) => formatter(value)}
              />
              <YAxis
                type="category"
                dataKey="displayName"
                className="text-xs text-muted-foreground"
                tick={{ fill: "currentColor" }}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value: number, name, props) => [
                  formatter(value),
                  props.payload.name,
                ]}
                labelFormatter={(label, payload) => {
                  return payload && payload[0] ? payload[0].payload.name : label;
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {formattedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={color || COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayName"
              className="text-xs text-muted-foreground"
              tick={{ fill: "currentColor" }}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              tick={{ fill: "currentColor" }}
              tickFormatter={(value) => formatter(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              formatter={(value: number, name, props) => [
                formatter(value),
                props.payload.name,
              ]}
              labelFormatter={(label, payload) => {
                return payload && payload[0] ? payload[0].payload.name : label;
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={color || COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

