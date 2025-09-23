"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactNode
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {}
    Object.entries(config).forEach(([key, value]) => {
      vars[`--color-${key}`] = value.color
    })
    return vars
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("w-full", className)} style={cssVars as React.CSSProperties} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    dataKey: string
  }>
  label?: string
  config?: ChartConfig
}



export function ChartTooltipContent({ active, payload, label, config }: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="text-xs font-medium">{label}</div>
      <div className="mt-1 flex flex-col gap-0.5">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: `var(--color-${item.dataKey})`,
              }}
            />
            <span className="text-xs font-medium">
              {config?.[item.dataKey]?.label || item.dataKey}: {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-lg border bg-background p-2 shadow-md", className)} {...props} />
  ),
)
ChartTooltip.displayName = "ChartTooltip"
