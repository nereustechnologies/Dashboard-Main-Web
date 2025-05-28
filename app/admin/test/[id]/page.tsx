"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Calendar,
  Clock,
  ArrowLeft,
  Download,
  FileText,
  Activity,
  Star,
  ChevronRight,
  BarChart2,
  Dumbbell,
  Brain,
  Heart,
  AlertCircle,
} from "lucide-react"

export default function TestDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [test, setTest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const testId = params.id // Access params directly, but we'll handle it better

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        // Use the testId from the closure instead of accessing params directly in the effect
        const response = await fetch(`/api/admin/tests/${testId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch test details")
        }

        const data = await response.json()
        setTest(data.test)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching test details:", error)
        setError(error instanceof Error ? error.message : "An error occurred while fetching test details")
        setLoading(false)
      }
    }

    fetchTestDetails()
  }, [testId, router]) // Add testId to the dependency array

  const downloadTestReport = () => {
    // In a real app, this would download the report
    alert(`Downloading report for test ${params.id}`)
  }

  const downloadTestCSV = (exerciseId: string) => {
    // In a real app, this would download the CSV for a specific exercise
    alert(`Downloading CSV for exercise ${exerciseId}`)
  }

  const downloadAllSensorData = () => {
    // In a real app, this would download all sensor data for the test
    alert(`Downloading all sensor data for test ${params.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00D4EF] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading test details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="container mx-auto max-w-6xl">
          <Button variant="outline" onClick={() => router.back()} className="mb-4 border-gray-700">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>

          <Card className="border-red-500/20 bg-black">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Test Details</h2>
                <p className="text-gray-400">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="container mx-auto max-w-6xl">
          <Button variant="outline" onClick={() => router.back()} className="mb-4 border-gray-700">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>

          <Card className="border-yellow-500/20 bg-black">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-yellow-500 mb-2">Test Not Found</h2>
                <p className="text-gray-400">
                  The test you're looking for doesn't exist or you don't have permission to view it.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="container mx-auto max-w-6xl">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 border-gray-700">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Test Overview Card */}
          <Card className="border-[#00D4EF]/20 bg-black md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl text-[#00D4EF]">Test Details</CardTitle>
                <CardDescription>Conducted on {new Date(test.createdAt).toLocaleDateString()}</CardDescription>
              </div>
              <Badge
                className={
                  test.status === "Completed" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                }
              >
                {test.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Customer</p>
                    <p className="font-medium flex items-center gap-2">
                      <User size={16} className="text-[#00D4EF]" />
                      {test.customer.name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Tester</p>
                    <p className="font-medium flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      {test.tester.name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Test Date</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar size={16} className="text-green-500" />
                      {new Date(test.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Test Duration</p>
                    <p className="font-medium flex items-center gap-2">
                      <Clock size={16} className="text-yellow-500" />
                      {test.duration || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={downloadTestReport} className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black mr-2">
                    <FileText size={16} className="mr-2" />
                    Download Full Report
                  </Button>
                  <Button
                    onClick={() => downloadAllSensorData()}
                    variant="outline"
                    className="border-green-500 text-green-500"
                  >
                    <Download size={16} className="mr-2" />
                    Download All Sensor Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info Card */}
          <Card className="border-[#00D4EF]/20 bg-black md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg text-[#00D4EF]">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Age</span>
                  <span className="font-medium">{test.customer.age} years</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Gender</span>
                  <span className="font-medium">{test.customer.gender}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Height</span>
                  <span className="font-medium">{test.customer.height} cm</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Weight</span>
                  <span className="font-medium">{test.customer.weight} kg</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Activity Level</span>
                  <span className="font-medium">{test.customer.activityLevel.replace("_", " ")}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Sleep</span>
                  <span className="font-medium">{test.customer.sleepLevels} hours</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Mood</span>
                  <span className="font-medium">{test.customer.mood}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <Card className="border-[#00D4EF]/20 bg-black mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-[#00D4EF] flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="mobility">
                  <Brain size={16} className="mr-1" />
                  Mobility
                </TabsTrigger>
                <TabsTrigger value="strength">
                  <Dumbbell size={16} className="mr-1" />
                  Strength
                </TabsTrigger>
                <TabsTrigger value="endurance">
                  <Heart size={16} className="mr-1" />
                  Endurance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-purple-500/20 bg-gray-900">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-purple-500/20 p-2 rounded-full">
                            <Brain size={20} className="text-purple-500" />
                          </div>
                          <div>
                            <h3 className="font-medium">Mobility</h3>
                            <p className="text-xs text-gray-400">Flexibility & Range of Motion</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < (test.ratings?.mobility || 0)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-500"
                                }
                              />
                            ))}
                          </div>
                          <p className="text-sm font-bold">{test.ratings?.mobility || 0}/5</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-500/20 bg-gray-900">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-500/20 p-2 rounded-full">
                            <Dumbbell size={20} className="text-blue-500" />
                          </div>
                          <div>
                            <h3 className="font-medium">Strength</h3>
                            <p className="text-xs text-gray-400">Power & Muscle Control</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < (test.ratings?.strength || 0)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-500"
                                }
                              />
                            ))}
                          </div>
                          <p className="text-sm font-bold">{test.ratings?.strength || 0}/5</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/20 bg-gray-900">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-500/20 p-2 rounded-full">
                            <Heart size={20} className="text-green-500" />
                          </div>
                          <div>
                            <h3 className="font-medium">Endurance</h3>
                            <p className="text-xs text-gray-400">Stamina & Cardiovascular</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < (test.ratings?.endurance || 0)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-500"
                                }
                              />
                            ))}
                          </div>
                          <p className="text-sm font-bold">{test.ratings?.endurance || 0}/5</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Tester Feedback</h3>
                    <Card className="border-gray-700 bg-gray-900">
                      <CardContent className="p-4">
                        <p className="text-gray-300">{test.ratings?.feedback || "No feedback provided."}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Customer Feedback</h3>
                    <Card className="border-gray-700 bg-gray-900">
                      <CardContent className="p-4">
                        <p className="text-gray-300">{test.ratings?.customerFeedback || "No feedback provided."}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mobility">
                <ExerciseList
                  exercises={test.exercises.filter((ex: any) => ex.category === "mobility")}
                  downloadTestCSV={downloadTestCSV}
                />
              </TabsContent>

              <TabsContent value="strength">
                <ExerciseList
                  exercises={test.exercises.filter((ex: any) => ex.category === "strength")}
                  downloadTestCSV={downloadTestCSV}
                />
              </TabsContent>

              <TabsContent value="endurance">
                <ExerciseList
                  exercises={test.exercises.filter((ex: any) => ex.category === "endurance")}
                  downloadTestCSV={downloadTestCSV}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card className="border-[#00D4EF]/20 bg-black">
          <CardHeader>
            <CardTitle className="text-xl text-[#00D4EF] flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-400">
              <p>Detailed performance analysis charts would be displayed here.</p>
              <p className="text-sm mt-2">
                This would include visualizations of sensor data, comparisons to previous tests, and trend analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ExerciseList({
  exercises,
  downloadTestCSV,
}: {
  exercises: any[]
  downloadTestCSV: (id: string) => void
}) {
  if (exercises.length === 0) {
    return <div className="text-center py-8 text-gray-400">No exercises found in this category.</div>
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <Card key={exercise.id} className="border-gray-700 bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  {exercise.name.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </h3>
                <Badge
                  className={
                    exercise.completed ? "bg-green-500/20 text-green-500 mt-1" : "bg-yellow-500/20 text-yellow-500 mt-1"
                  }
                >
                  {exercise.completed ? "Completed" : "Incomplete"}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTestCSV(exercise.id)}
                className="border-green-500 text-green-500"
              >
                <Download size={14} className="mr-1" />
                Download Data
              </Button>
            </div>

            {exercise.data && exercise.data.length > 0 ? (
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Leg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exercise.data.slice(0, 5).map((data: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{data.timestamp}</TableCell>
                        <TableCell>{data.action}</TableCell>
                        <TableCell>{data.leg}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {exercise.data.length > 5 && (
                  <div className="text-center mt-2">
                    <Button variant="link" className="text-[#00D4EF]">
                      View All {exercise.data.length} Records
                      <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm mt-2">No data recorded for this exercise.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

