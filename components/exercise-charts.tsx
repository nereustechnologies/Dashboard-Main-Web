"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Bar,
  BarChart,
  ReferenceArea,
} from "recharts"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define specific data point types
interface ProgressDataPoint {
  date: string
  value: number
}

interface ComparisonDataPoint {
  date: string
  current: number
  target: number
}

interface DistributionDataPoint {
  name: string
  value: number
}

// Union type for any data point
type ChartDataItem = ProgressDataPoint | ComparisonDataPoint | DistributionDataPoint

// Props for the main component
interface ChartData {
  progress: ProgressDataPoint[]
  comparison: ComparisonDataPoint[]
  distribution: DistributionDataPoint[]
}

interface ExerciseChartsProps {
  data: ChartData
}

// Type for the active tab
type ActiveTab = "progress" | "comparison" | "distribution"

// Type for zoomed data structure
interface ZoomedChartDomain {
  x: [number, number] // Indices
  y: [number, number] // Values
}

interface ZoomedData {
  data: ChartDataItem[]
  domain: ZoomedChartDomain
}

// Type for zoom state
interface ZoomState {
  refAreaLeft: string
  refAreaRight: string
  isZooming: boolean
  zoomedData: ZoomedData | null
}

// Type for Recharts mouse event (simplified)
interface RechartsMouseEvent {
  activeLabel?: string
}

export function ExerciseCharts({ data }: ExerciseChartsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("progress")

  const initialZoomState: ZoomState = {
    refAreaLeft: "",
    refAreaRight: "",
    isZooming: false,
    zoomedData: null,
  }
  const [zoomState, setZoomState] = useState<ZoomState>(initialZoomState)

  const getAxisYDomain = <TData extends Record<K, number>, K extends keyof TData>(
    from: number,
    to: number,
    inputData: TData[],
    key: K,
  ): [number, number] => {
    if (from < 0 || to < 0 || from >= inputData.length || to >= inputData.length || from > to) {
      return [0, 1] // Default domain for invalid indices
    }
    const refData = inputData.slice(from, to + 1)
    if (refData.length === 0) {
      return [0, 1] // Default domain if slice is empty
    }

    const values = refData.map((d) => d[key])
    let [minVal, maxVal] = [Math.min(...values), Math.max(...values)]

    const range = maxVal - minVal
    let padding = range * 0.1

    if (minVal === maxVal) {
      // If all values are the same, or only one point, add fixed padding
      padding = Math.abs(minVal * 0.1) || 0.5 // Ensure padding is reasonable, fallback to 0.5
      minVal -= padding
      maxVal += padding
    } else {
      minVal -= padding
      maxVal += padding
    }
    
    // Ensure minVal is not greater than maxVal after padding
    if (minVal > maxVal) {
        [minVal, maxVal] = [maxVal, minVal];
    }
    // Ensure domain has a non-zero range if it became zero after padding
    if (minVal === maxVal) {
        minVal -= 0.5;
        maxVal += 0.5;
    }

    return [minVal, maxVal]
  }

  const zoom = () => {
    setZoomState((prevState) => {
      let { refAreaLeft, refAreaRight } = prevState

      if (!refAreaLeft || !refAreaRight) {
        return {
          ...prevState,
          refAreaLeft: "",
          refAreaRight: "",
          isZooming: !!prevState.zoomedData, // Keep isZooming if already zoomed from a previous action
        }
      }

      if (refAreaLeft > refAreaRight) {
        ;[refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft]
      }

      const currentDataSet: ChartDataItem[] =
        activeTab === "progress"
          ? data.progress
          : activeTab === "comparison"
          ? data.comparison
          : data.distribution

      const fromIndex = currentDataSet.findIndex(
        (d) => (("date" in d && d.date === refAreaLeft) || ("name" in d && d.name === refAreaLeft)),
      )
      const toIndex = currentDataSet.findIndex(
        (d) => (("date" in d && d.date === refAreaRight) || ("name" in d && d.name === refAreaRight)),
      )

      if (fromIndex === -1 || toIndex === -1 || fromIndex > toIndex) {
        return {
          ...prevState,
          refAreaLeft: "",
          refAreaRight: "",
          isZooming: !!prevState.zoomedData,
        }
      }
      
      const yDomain: [number, number] = (() => {
        switch (activeTab) {
          case "progress":
            return getAxisYDomain(fromIndex, toIndex, currentDataSet as ProgressDataPoint[], "value")
          case "comparison": {
            const typedData = currentDataSet as ComparisonDataPoint[]
            const currentDomain = getAxisYDomain(fromIndex, toIndex, typedData, "current")
            const targetDomain = getAxisYDomain(fromIndex, toIndex, typedData, "target")
            return [Math.min(currentDomain[0], targetDomain[0]), Math.max(currentDomain[1], targetDomain[1])]
          }
          case "distribution":
            return getAxisYDomain(fromIndex, toIndex, currentDataSet as DistributionDataPoint[], "value")
          default:
            return [0, 1] as [number, number] // Should not happen
        }
      })();


      return {
        ...prevState,
        refAreaLeft: "",
        refAreaRight: "",
        isZooming: true,
        zoomedData: {
          data: currentDataSet.slice(fromIndex, toIndex + 1),
          domain: { x: [fromIndex, toIndex], y: yDomain },
        },
      }
    })
  }

  const resetZoom = () => {
    setZoomState(initialZoomState)
  }

  const handleMouseDown = (e: RechartsMouseEvent) => {
    if (e && e.activeLabel) {
      setZoomState((prevState) => ({
        ...prevState,
        refAreaLeft: e.activeLabel!,
        refAreaRight: "", // Reset right on new drag start
      }))
    }
  }

  const handleMouseMove = (e: RechartsMouseEvent) => {
    if (e && e.activeLabel && zoomState.refAreaLeft) {
      setZoomState((prevState) => ({
        ...prevState,
        refAreaRight: e.activeLabel!,
      }))
    }
  }

  const handleMouseUp = () => {
    if (zoomState.refAreaLeft && zoomState.refAreaRight) {
      zoom()
    } else { // If only one point was selected (mousedown but no mousemove to a different point)
        setZoomState(prevState => ({
            ...prevState,
            refAreaLeft: "",
            refAreaRight: "",
        }));
    }
  }

  const baseChartData =
    activeTab === "progress"
      ? data.progress
      : activeTab === "comparison"
      ? data.comparison
      : data.distribution

  const displayedChartData: ChartDataItem[] =
    zoomState.isZooming && zoomState.zoomedData ? zoomState.zoomedData.data : baseChartData

  const yAxisDomain: [number | string, number | string] =
    zoomState.isZooming && zoomState.zoomedData ? zoomState.zoomedData.domain.y : ["auto", "auto"]

  const renderChart = () => {
    const commonLineChartProps = {
      data: displayedChartData,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      margin: { top: 5, right: 20, left: -20, bottom: 5 }, // Adjusted left margin for YAxis labels
    }

    const commonAxisProps = {
      stroke: "#888",
      tickLine: false,
      axisLine: false,
      allowDataOverflow: true,
    }
    
    const referenceAreaFillColor = activeTab === "comparison" ? "var(--color-current)" : "var(--color-value)";

    switch (activeTab) {
      case "progress":
        return (
          <LineChart {...commonLineChartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" {...commonAxisProps} />
            <YAxis {...commonAxisProps} domain={yAxisDomain} />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-value)" }}
              activeDot={{ r: 6, stroke: "var(--background)", fill: "var(--color-value)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {zoomState.refAreaLeft && zoomState.refAreaRight && (
              <ReferenceArea
                x1={zoomState.refAreaLeft}
                x2={zoomState.refAreaRight}
                strokeOpacity={0.3}
                fill={referenceAreaFillColor}
                fillOpacity={0.1}
              />
            )}
          </LineChart>
        )
      case "comparison":
        return (
          <LineChart {...commonLineChartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" {...commonAxisProps} />
            <YAxis {...commonAxisProps} domain={yAxisDomain} />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Line
              type="monotone"
              dataKey="current"
              stroke="var(--color-current)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-current)" }}
              activeDot={{ r: 6, stroke: "var(--background)", fill: "var(--color-current)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="var(--color-target)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "var(--color-target)" }}
              activeDot={{ r: 6, stroke: "var(--background)", fill: "var(--color-target)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {zoomState.refAreaLeft && zoomState.refAreaRight && (
              <ReferenceArea
                x1={zoomState.refAreaLeft}
                x2={zoomState.refAreaRight}
                strokeOpacity={0.3}
                fill={referenceAreaFillColor}
                fillOpacity={0.1}
              />
            )}
          </LineChart>
        )
      case "distribution":
        return (
          <BarChart
            data={displayedChartData}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }} // Adjusted left margin
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" {...commonAxisProps} />
            <YAxis {...commonAxisProps} domain={yAxisDomain} />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "hsl(var(--muted-foreground))", fillOpacity: 0.1 }} />
            <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            {zoomState.refAreaLeft && zoomState.refAreaRight && (
              <ReferenceArea
                x1={zoomState.refAreaLeft}
                x2={zoomState.refAreaRight}
                strokeOpacity={0.3}
                fill={referenceAreaFillColor}
                fillOpacity={0.1}
              />
            )}
          </BarChart>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      <Tabs
        defaultValue="progress"
        className="w-full"
        onValueChange={(value) => {
          setActiveTab(value as ActiveTab)
          resetZoom()
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <TabsList>
            <TabsTrigger value="progress">Progress Over Time</TabsTrigger>
            <TabsTrigger value="comparison">Current vs Target</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={resetZoom}
              disabled={!zoomState.isZooming && !zoomState.zoomedData}
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {zoomState.isZooming || zoomState.zoomedData ? "Drag to re-zoom, or reset" : "Drag to zoom in"}
            </span>
          </div>
        </div>

        <TabsContent value="progress" className="h-[350px] mt-0">
          <ChartContainer
            config={{
              value: {
                label: "Value",
                color: "hsl(var(--chart-1))", // Using shadcn/ui chart color convention
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>

        <TabsContent value="comparison" className="h-[350px] mt-0">
          <ChartContainer
            config={{
              current: {
                label: "Current",
                color: "hsl(var(--chart-1))", // Using shadcn/ui chart color convention
              },
              target: {
                label: "Target",
                color: "hsl(var(--chart-2))", // Using shadcn/ui chart color convention
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>

        <TabsContent value="distribution" className="h-[350px] mt-0">
          <ChartContainer
            config={{
              value: {
                label: "Value",
                color: "hsl(var(--chart-1))", // Using shadcn/ui chart color convention
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}
