"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ExerciseCharts } from "@/components/exercise-charts"
import type { ExerciseData } from "@/lib/data"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { useToast } from "./ui/use-toast"

interface ExerciseContentProps {
  exerciseData: ExerciseData
  exerciseName: string
  /**
   * The unique identifier of the exercise (Prisma Exercise.id).
   * Required for fetching analysis results & processed CSV file.
   */
  exerciseId: string | undefined
}

function StepUpMetricsEditor({
  initialData,
  exerciseId,
  onSave,
}: {
  initialData: Array<{ name: string; value: string | number }>
  exerciseId: string
  onSave: () => void
}) {
  const [metrics, setMetrics] = useState(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMetrics(initialData)
  }, [initialData])

  const handleChange = (name: string, value: string) => {
    setMetrics((currentMetrics) =>
      currentMetrics.map((m) => (m.name === name ? { ...m, value } : m))
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    const metricsToSave = metrics.reduce((acc, { name, value }) => {
      const numericValue = Number(value)
      acc[name] = isNaN(numericValue) || value.toString().trim() === "" ? value : numericValue
      return acc
    }, {} as Record<string, string | number>)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/exercises/${exerciseId}/analysis`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ metrics: metricsToSave }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to save metrics")
      }

    alert("Success: Metrics saved successfully.");

      onSave()
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (metrics.length === 0) {
    return <p className="text-sm text-muted-foreground">No metrics available to edit for this exercise.</p>
  }

  return (
    <div className="space-y-4">
      {metrics.map((metric) => (
        <div key={metric.name} className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor={metric.name} className="text-right capitalize">
            {metric.name.replace(/_/g, " ")}
          </Label>
          <Input
            id={metric.name}
            value={metric.value ?? ""}
            onChange={(e) => handleChange(metric.name, e.target.value)}
            className="col-span-2"
          />
        </div>
      ))}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Metrics"}
        </Button>
      </div>
    </div>
  )
}

export function ExerciseContent({ exerciseData, exerciseName, exerciseId }: ExerciseContentProps) {
  const [calculatedData, setCalculatedData] = useState<Array<{ name: string; value: string | number }>>([])
  const [csvData, setCsvData] = useState<string[][]>([])

  const fetchAnalysis = useCallback(async () => {
    if (!exerciseId) return

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(`/api/exercises/${exerciseId}/analysis`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error("Failed to fetch analysis results")

      const { analysisResults, s3PathProcessed } = await res.json()

      if (
        analysisResults &&
        typeof analysisResults === "object" &&
        analysisResults.body
      ) {
        let metricsObj;
        try {
          metricsObj = JSON.parse(analysisResults.body);
        } catch (e) {
          metricsObj = {};
        }
        const skipKeys = ["output_key", "status"];
        const entries = Object.entries(metricsObj)
          .filter(([name]) => !skipKeys.includes(name.trim().toLowerCase()))
          .map(([name, value]) => ({
            name,
            value: value as string | number,
          }));
        setCalculatedData(entries);
      } else {
        setCalculatedData([]);
      }

      // Helper: Convert "s3://bucket/key" → "https://bucket.s3.amazonaws.com/key" for browser fetch
      const transformS3Path = (path: string): string => {
        // Always proxy through our backend route to avoid CORS / permissions issues
        return `/api/s3/download?path=${encodeURIComponent(path)}`
      }

      // Fetch & parse processed CSV
      if (s3PathProcessed) {
        const fetchUrl = transformS3Path(s3PathProcessed)
        const csvRes = await fetch(fetchUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (csvRes.ok) {
          const csvText = await csvRes.text()
          const rows = csvText
            .trim()
            .split(/\r?\n/) // split by new line
            .map((line) => line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)) // naive CSV split respecting quotes
          setCsvData(rows)
        }
      }
    } catch (err) {
      console.error(err)
      setCalculatedData([]);
    }
  }, [exerciseId]);

  // Fetch analysis results & processed CSV when exerciseId changes
  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis])

  const formattedName = exerciseName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return (
    <div className="flex-1 w-full space-y-6">
      {(() => {
        const graphSupportedExercises = [
          "lunge_stretch",
          "squats",
          "lunges",
          "plank_hold",
          "stepUp"
        ] as const
        const graphSupported = graphSupportedExercises.includes(exerciseName as any)

        return (
          <Tabs defaultValue="metrics" className="w-full space-y-4" key={exerciseName}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="graph" disabled={!graphSupported}>
                Graph
              </TabsTrigger>
              <TabsTrigger value="csv" disabled={csvData.length === 0}>
                CSV
              </TabsTrigger>
            </TabsList>

            {/* Metrics / Analysis */}
            <TabsContent value="metrics">
              <Card className="max-w-xl">
                <CardHeader className="pb-3">
                  <CardTitle>Exercise Metrics for {formattedName}</CardTitle>
                  <CardDescription>Measured &amp; calculated values</CardDescription>
                </CardHeader>
                <CardContent>
                  { exerciseId ? (
                    <StepUpMetricsEditor 
                      initialData={calculatedData} 
                      exerciseId={exerciseId} 
                      onSave={fetchAnalysis}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {calculatedData.length === 0 && <p className="text-sm text-muted-foreground">No analysis results yet.</p>}
                        {calculatedData.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                          >
                            <p className="text-sm font-medium text-muted-foreground capitalize">
                              {item.name.toString().replace(/_/g, " ")}
                            </p>
                           <p className="text-xl md:text-xl font-bold">
    {typeof item.value === "object" ? JSON.stringify(item.value) : item.value}
  </p>

                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Graph */}
            {graphSupported && (
              <TabsContent value="graph">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>{formattedName} Progress Graph</CardTitle>
                    <CardDescription>Visual representation of performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExerciseCharts data={exerciseData.chartData} csv={csvData} exerciseName={exerciseName} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* CSV */}
            {csvData.length > 0 && (
              <TabsContent value="csv" className="h-[calc(100vh-12rem)]">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle>Processed CSV Data</CardTitle>
                    <CardDescription>Data returned from processing pipeline</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-5rem)] overflow-hidden">
                    <div className="h-full overflow-auto">
                      <table className="min-w-full text-sm text-left">
                        <thead className="sticky top-0 bg-background">
                          <tr>
                            {csvData[0].map((header, idx) => (
                              <th key={idx} className="border-b px-2 py-1 font-medium text-muted-foreground">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(1).map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-muted/50">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-2 py-1 whitespace-nowrap border-b">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
