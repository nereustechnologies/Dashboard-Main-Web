"use client"

import { ArrowDown, ArrowUp, Minus } from "lucide-react"

interface Metric {
  name: string
  value: number
  unit: string
  change: number
}

interface ExerciseMetricsProps {
  metrics: Metric[]
}

export function ExerciseMetrics({ metrics }: ExerciseMetricsProps) {
  return (
    <div className="space-y-3">
      {metrics.map((metric) => (
        <div
          key={metric.name}
          className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
            <p className="text-xl md:text-2xl font-bold">
              {metric.value} <span className="text-xs md:text-sm text-muted-foreground">{metric.unit}</span>
            </p>
          </div>
          <div className={`flex items-center ${getChangeColor(metric.change)}`}>
            {getChangeIcon(metric.change)}
            <span className="ml-1">{Math.abs(metric.change)}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function getChangeColor(change: number): string {
  if (change > 0) return "text-green-500"
  if (change < 0) return "text-red-500"
  return "text-yellow-500"
}

function getChangeIcon(change: number) {
  if (change > 0) return <ArrowUp className="h-4 w-4" />
  if (change < 0) return <ArrowDown className="h-4 w-4" />
  return <Minus className="h-4 w-4" />
}
