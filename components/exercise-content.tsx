"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ExerciseCharts } from "@/components/exercise-charts"
import type { ExerciseData } from "@/lib/data"
import { ExerciseMetrics } from "@/components/exercise-metrics"

interface ExerciseContentProps {
  exerciseData: ExerciseData
  exerciseName: string
}

export function ExerciseContent({ exerciseData, exerciseName }: ExerciseContentProps) {
  const [calculatedData, setCalculatedData] = useState<Array<{ name: string; value: string }>>([])

  useEffect(() => {
    // Mock fetching calculated data from the cloud
    const timer = setTimeout(() => {
      setCalculatedData([
        { name: "Calc Metric 1", value: "123" },
        { name: "Calc Metric 2", value: "45%" },
        { name: "Calc Metric 3", value: "Good" },
        { name: "Calc Metric 4", value: "Low Risk" },
        { name: "Calc Metric 5", value: "75" },
      ])
    }, 500)

    return () => clearTimeout(timer)
  }, [exerciseName])

  const formattedName = exerciseName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return (
    <div className="flex-1 w-full">
      {(() => {
        const graphSupportedExercises = [
          "lunge_stretch",
          "squats",
          "lunges",
          "plank_hold",
        ] as const
        const graphSupported = graphSupportedExercises.includes(exerciseName as any)

        return (
          <Tabs defaultValue="metrics" className="w-full space-y-4" key={exerciseName}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="graph" disabled={!graphSupported}>
                Graph
              </TabsTrigger>
            </TabsList>

            <TabsContent value="metrics">
              <Card className="max-w-xl">
                <CardHeader className="pb-3">
                  <CardTitle>Exercise Metrics for {formattedName}</CardTitle>
                  <CardDescription>Measured & calculated values</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* <ExerciseMetrics metrics={exerciseData.metrics} /> */}
                    <div className="space-y-3">
                      {calculatedData.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <p className="text-sm font-medium text-muted-foreground">{item.name}</p>
                          <p className="text-xl md:text-2xl font-bold">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {graphSupported && (
              <TabsContent value="graph">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>{formattedName} Progress Graph</CardTitle>
                    <CardDescription>Visual representation of performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExerciseCharts data={exerciseData.chartData} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        )
      })()}
    </div>
  )
}
