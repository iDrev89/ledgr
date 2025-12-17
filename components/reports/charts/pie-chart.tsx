"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PieChartData } from "@/lib/types/reports";

interface PieChartProps {
  data: PieChartData[];
  title: string;
  formatValue?: (value: number) => string;
  showLegend?: boolean;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(142 76% 36%)", // green
  "hsl(24 95% 53%)", // orange
  "hsl(262 83% 58%)", // purple
  "hsl(346 77% 50%)", // pink
  "hsl(173 80% 40%)", // teal
];

export function PieChart({
  data,
  title,
  formatValue,
  showLegend = true,
}: PieChartProps) {
  const defaultFormat = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatter = formatValue || defaultFormat;

  // Custom label for pie slices
  const renderLabel = (entry: PieChartData) => {
    if (entry.percentage < 5) return ""; // Don't show label for small slices
    return `${entry.percentage.toFixed(0)}%`;
  };

  // Custom legend formatter
  const renderLegend = (value: string, entry: any) => {
    const item = data.find((d) => d.name === value);
    if (!item) return value;
    return `${value}: ${formatter(item.value)} (${item.percentage.toFixed(1)}%)`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              formatter={(value: number, name: string, props: any) => [
                `${formatter(value)} (${props.payload.percentage.toFixed(1)}%)`,
                name,
              ]}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={renderLegend}
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "12px",
                }}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
