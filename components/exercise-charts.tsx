"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ExerciseData } from "@/lib/data"
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
interface PlotPoint {
  time: string
  value1: number
  value2?: number
}

// Union type for any data point
type ChartDataItem = ProgressDataPoint | ComparisonDataPoint | DistributionDataPoint | PlotPoint

// Props for the main component
interface ChartData {
  progress: ProgressDataPoint[]
  comparison: ComparisonDataPoint[]
  distribution: DistributionDataPoint[]
   
}



// Type for the active tab
type ActiveTab = "progress" | "comparison" | "distribution" |"plot"

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

interface ExerciseChartsProps {
  data: ChartData
  csv: string[][]
  exerciseName: string
}
// Type for Recharts mouse event (simplified)
interface RechartsMouseEvent {
  activeLabel?: string
}

export function ExerciseCharts({ data, csv, exerciseName }: ExerciseChartsProps) {
  console.log(exerciseName)
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
  function getPlotChartConfig(exerciseName: string) {
  switch (exerciseName) {
    case "lunge_stretch":
      return {
        value1: { label: "Overall Hip Angle", color: "hsl(var(--chart-1))" },
        value2:{}
      }
    case "squats":
      return {
        value1: { label: "overall hip angle", color: "hsl(var(--chart-1))" },
        value2:{}
      }
    case "lunges":
      return {
        value1: { label: "overall hip angle", color: "hsl(var(--chart-1))" },
        value2:{}
      }
    case "plank_hold":
      return {
        value1: { label: "hip angles", color: "hsl(var(--chart-1))" },
        value2:{}
      }


    default:
      return {
        value1: { label: "Metric 1", color: "hsl(var(--chart-1))" },
        value2: { label: "Metric 2", color: "hsl(var(--chart-2))" },
      }
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

const baseChartData: ChartDataItem[] =
  activeTab === "progress"
    ? data.progress
    : activeTab === "comparison"
    ? data.comparison
    : activeTab === "distribution"
    ? data.distribution
    : [] 
      
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
   console.log(activeTab)
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
      case "plot":
    if (exerciseName === "lunge_stretch") {
  const fullPlotData: PlotPoint[] = [];

  let currentSecond = -1;
  let secondStartIndex = 0;

  for (let i = 1; i < csv.length; i++) {
    const [timestamp] = csv[i];
    const [mins, secs] = timestamp.split(":").map(Number);
    const timeInSeconds = mins * 60 + secs;

    // If it's a new second or the last row
    if (timeInSeconds !== currentSecond || i === csv.length - 1) {
      const group = csv.slice(secondStartIndex, i === csv.length - 1 ? i + 1 : i); // Group of rows with same second
      const count = group.length;

      group.forEach((row, idx) => {
        const fractionalTime = currentSecond + (idx / count);
        fullPlotData.push({
          time: fractionalTime.toFixed(2),
          value1: Number(row[5]), // Overall Hip Angle
          value2: Number(row[6]), // Knee Angle
        });
      });

      currentSecond = timeInSeconds;
      secondStartIndex = i;
    }
  }

  const plotData = zoomState.isZooming && zoomState.zoomedData
    ? (zoomState.zoomedData.data as PlotPoint[])
    : fullPlotData;
    const yValues = plotData.flatMap(d => [d.value1, d.value2 ?? d.value1])
const minY = Math.min(...yValues)
const maxY = Math.max(...yValues)
const yPadding = (maxY - minY) * 0.15 || 0.5
const tightDomain: [number, number] = [minY - yPadding, maxY + yPadding]


  return (
    <LineChart
      data={plotData}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
    <XAxis dataKey="time" stroke="#888" 
       label={{
    value: "Time (seconds)",
    position: "insideBottomLeft",
    offset: -5,
    style: { textAnchor: "start", fill: "#aaa" },
  }}

      />
  <YAxis
  {...commonAxisProps}
  domain={tightDomain}
  tickFormatter={(value) => value.toFixed(2)} // Round ticks to 2 decimals
  label={{
    value: "Hip Angle (°)",
    angle: -90,
    position: "insideLeft", // You can also try "outsideLeft"
    offset: 10, // Increased for better spacing
    style: {
      textAnchor: "start",
      fill: "#aaa",
      fontSize: 12,
    },
  }}
/>

      <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }} />
     <Line
  type="monotone"
  dataKey="value1"
  stroke="white"
  strokeWidth={1.2}
  dot={false} // remove dots for clarity
  isAnimationActive={false}
/>
     
      {zoomState.refAreaLeft && zoomState.refAreaRight && (
        <ReferenceArea
          x1={zoomState.refAreaLeft}
          x2={zoomState.refAreaRight}
          strokeOpacity={0.3}
          fill="var(--color-current)"
          fillOpacity={0.1}
        />
      )}
    </LineChart>
  );
}
  else if(exerciseName=="squats"){
     const fullPlotData: PlotPoint[] = [];

  let currentSecond = 0;
  let secondStartIndex = 1;

  for (let i = 1; i < csv.length; i++) {
    const [timestamp] = csv[i];
    const [mins, secs] = timestamp.split(":").map(Number);
    const timeInSeconds = mins * 60 + secs;

    // If it's a new second or the last row
    if (timeInSeconds !== currentSecond || i === csv.length - 1) {
      const group = csv.slice(secondStartIndex, i === csv.length - 1 ? i + 1 : i); // Group of rows with same second
      const count = group.length;

      group.forEach((row, idx) => {
        const fractionalTime = currentSecond + (idx / count);
        fullPlotData.push({
          time: fractionalTime.toFixed(2),
          value1: Number(row[6]), // Overall Hip Angle
         
        });
      });

      currentSecond = timeInSeconds;
      secondStartIndex = i;
    }
  }

  const plotData = zoomState.isZooming && zoomState.zoomedData
    ? (zoomState.zoomedData.data as PlotPoint[])
    : fullPlotData;
    const yValues = plotData.flatMap(d => [d.value1, d.value2 ?? d.value1])
const minY = Math.min(...yValues)
const maxY = Math.max(...yValues)
const yPadding = (maxY - minY) * 0.15 || 0.5
const tightDomain: [number, number] = [minY - yPadding, maxY + yPadding]


  return (
    <LineChart
      data={plotData}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
    <XAxis dataKey="time" stroke="#888" 
       label={{
    value: "Time (seconds)",
    position: "insideBottomLeft",
    offset: -5,
    style: { textAnchor: "start", fill: "#aaa" },
  }}

      />
  <YAxis
  {...commonAxisProps}
  domain={tightDomain}
  tickFormatter={(value) => value.toFixed(2)} // Round ticks to 2 decimals
  label={{
    value: "Hip Angle (°)",
    angle: -90,
    position: "insideLeft", // You can also try "outsideLeft"
    offset: 10, // Increased for better spacing
    style: {
      textAnchor: "start",
      fill: "#aaa",
      fontSize: 12,
    },
  }}
/>
      <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }} />
     <Line
  type="monotone"
  dataKey="value1"
  stroke="white"
  strokeWidth={1.2}
  dot={false} // remove dots for clarity
  isAnimationActive={false}
/>
     
      {zoomState.refAreaLeft && zoomState.refAreaRight && (
        <ReferenceArea
          x1={zoomState.refAreaLeft}
          x2={zoomState.refAreaRight}
          strokeOpacity={0.3}
          fill="var(--color-current)"
          fillOpacity={0.1}
        />
      )}
    </LineChart>
  );
  }

  else if(exerciseName=="lunges"){
     const fullPlotData: PlotPoint[] = [];

  let currentSecond = 0;
  let secondStartIndex = 1;

  for (let i = 1; i < csv.length; i++) {
    const [timestamp] = csv[i];
    const [mins, secs] = timestamp.split(":").map(Number);
    const timeInSeconds = mins * 60 + secs;

    // If it's a new second or the last row
    if (timeInSeconds !== currentSecond || i === csv.length - 1) {
      const group = csv.slice(secondStartIndex, i === csv.length - 1 ? i + 1 : i); // Group of rows with same second
      const count = group.length;

      group.forEach((row, idx) => {
        const fractionalTime = currentSecond + (idx / count);
        fullPlotData.push({
          time: fractionalTime.toFixed(2),
          value1: Number(row[6]), // Overall Hip Angle
         
        });
      });

      currentSecond = timeInSeconds;
      secondStartIndex = i;
    }
  }
const plotData = zoomState.isZooming && zoomState.zoomedData
  ? (zoomState.zoomedData.data as PlotPoint[])
  : fullPlotData;

const yValues = plotData.flatMap(d => [d.value1, d.value2 ?? d.value1]);
const minY = Math.min(...yValues);
const maxY = Math.max(...yValues);
const yPadding = (maxY - minY) * 0.15 || 0.5;

const tightDomain: [number, number] = [
  parseFloat((minY - yPadding).toFixed(2)),
  parseFloat((maxY + yPadding).toFixed(2))
];

  return (
    <LineChart
      data={plotData}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
    <XAxis dataKey="time" stroke="#888" 
       label={{
    value: "Time (seconds)",
    position: "insideBottomLeft",
    offset: -5,
    style: { textAnchor: "start", fill: "#aaa" },
  }}

      />
   <YAxis
  {...commonAxisProps}
  domain={tightDomain}
  tickFormatter={(value) => value.toFixed(2)} // Round ticks to 2 decimals
  label={{
    value: "Hip Angle (°)",
    angle: -90,
    position: "insideLeft", // You can also try "outsideLeft"
    offset: 10, // Increased for better spacing
    style: {
      textAnchor: "start",
      fill: "#aaa",
      fontSize: 12,
    },
  }}
/>


      <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }} />
     <Line
  type="monotone"
  dataKey="value1"
  stroke="white"
  strokeWidth={1.2}
  dot={false} // remove dots for clarity
  isAnimationActive={false}
/>
     
      {zoomState.refAreaLeft && zoomState.refAreaRight && (
        <ReferenceArea
          x1={zoomState.refAreaLeft}
          x2={zoomState.refAreaRight}
          strokeOpacity={0.3}
          fill="var(--color-current)"
          fillOpacity={0.1}
        />
      )}
    </LineChart>
  );
  }
  else if(exerciseName=="plank_hold"){
     const fullPlotData: PlotPoint[] = [];

  let currentSecond = 0;
  let secondStartIndex = 1;

  for (let i = 1; i < csv.length; i++) {
    const [timestamp] = csv[i];
    const [sec, millisecs] = timestamp.split(".").map(Number);
    const timeInSeconds = sec

    // If it's a new second or the last row
    if (timeInSeconds !== currentSecond || i === csv.length - 1) {
      const group = csv.slice(secondStartIndex, i === csv.length - 1 ? i + 1 : i); // Group of rows with same second
      const count = group.length;

      group.forEach((row, idx) => {
        const fractionalTime = currentSecond + (idx / count);
        fullPlotData.push({
          time: fractionalTime.toFixed(2),
          value1: Number(row[3]), // Overall Hip Angle
         
        });
      });

      currentSecond = timeInSeconds;
      secondStartIndex = i;
    }
  }

  const plotData = zoomState.isZooming && zoomState.zoomedData
    ? (zoomState.zoomedData.data as PlotPoint[])
    : fullPlotData;
    const yValues = plotData.flatMap(d => [d.value1, d.value2 ?? d.value1])
const minY = Math.min(...yValues)
const maxY = Math.max(...yValues)
const yPadding = (maxY - minY) * 0.15 || 0.5
const tightDomain: [number, number] = [minY - yPadding, maxY + yPadding]


  return (
 
  
    <LineChart
      data={plotData}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      margin={{ top: 5, right: 10, left: 10, bottom:30 }}
    >


   
      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
      <XAxis dataKey="time" stroke="#888" 
       label={{
    value: "Time (seconds)",
    position: "insideBottomLeft",
    offset: -5,
    style: { textAnchor: "start", fill: "#aaa" },
  }}

      />
      <YAxis
  {...commonAxisProps}
  domain={tightDomain}
  tickFormatter={(value) => value.toFixed(2)} // Round ticks to 2 decimals
  label={{
    value: "Hip Angle (°)",
    angle: -90,
    position: "insideLeft", // You can also try "outsideLeft"
    offset: 10, // Increased for better spacing
    style: {
      textAnchor: "start",
      fill: "#aaa",
      fontSize: 12,
    },
  }}
/>
      <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }} />
     <Line
  type="monotone"
  dataKey="value1"
  stroke="white"
  strokeWidth={1.2}
  dot={false} // remove dots for clarity
  isAnimationActive={false}
/>
     
      {zoomState.refAreaLeft && zoomState.refAreaRight && (
        <ReferenceArea
          x1={zoomState.refAreaLeft}
          x2={zoomState.refAreaRight}
          strokeOpacity={0.3}
          fill="var(--color-current)"
          fillOpacity={0.1}
        />
      )}
    </LineChart>
    

  );
  }
      
      default:
        return(

          <div></div>
        )
      
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
            <TabsTrigger value="plot">Exercise Plot</TabsTrigger>
          </TabsList>

          
        </div>
        <div className="flex items-center gap-2 m-2">
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
  <TabsContent value="plot" className="h-[350px] mt-0">
  <ChartContainer
    config={getPlotChartConfig(exerciseName)}
    className="h-full w-full"
  >
<div
  style={{
    overflowX: "scroll",
    overflowY: "hidden",
    width: "100%",
  }}
>
  <div style={{ minWidth: "2000px", height: "350px" }}>
    <ResponsiveContainer width="100%" height="95%" >
      {renderChart()}
    </ResponsiveContainer>
    <div className="text-xs text-muted-foreground italic z-10">
          ⬅ scroll ➡
        </div>
     </div>
</div>
  </ChartContainer>
</TabsContent>

      </Tabs>
    </div>
  )
}
