"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ExerciseCharts } from "@/components/exercise-charts"
import type { ExerciseData } from "@/lib/data"

interface ExerciseContentProps {
  exerciseData: ExerciseData
  exerciseName: string
  /**
   * The unique identifier of the exercise (Prisma Exercise.id).
   * Required for fetching analysis results & processed CSV file.
   */
  exerciseId: string | undefined
}

export function ExerciseContent({ exerciseData, exerciseName, exerciseId }: ExerciseContentProps) {
  const [calculatedData, setCalculatedData] = useState<Array<{ name: string; value: string | number }>>([])
  const [csvData, setCsvData] = useState<string[][]>([])

  // Fetch analysis results & processed CSV when exerciseId changes
  useEffect(() => {
    if (!exerciseId) return

    const fetchAnalysis = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const res = await fetch(`/api/exercises/${exerciseId}/analysis`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) throw new Error("Failed to fetch analysis results")

        const { analysisResults, s3PathProcessed } = await res.json()

        // Transform analysisResults (key/value pairs) → array for rendering
        if (analysisResults && typeof analysisResults === "object") {
          const entries = Object.entries(analysisResults)
            .filter(([name]) => name !== "output_key") // omit S3 key from UI
            .map(([name, value]) => ({
              name,
              value: value as string | number,
            }))
          setCalculatedData(entries)
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
      }
    }

    fetchAnalysis()
  }, [exerciseId])

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
                          <p className="text-xl md:text-2xl font-bold">{item.value as any}</p>
                        </div>
                      ))}
                    </div>
                  </div>
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
                    <ExerciseCharts data={exerciseData.chartData} />
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
