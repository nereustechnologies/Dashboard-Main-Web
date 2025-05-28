"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  FileText,
  Eye,
  BarChart2,
  Star,
} from "lucide-react"

export default function TesterDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [tester, setTester] = useState<any>(null)
  const [tests, setTests] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const testerId = params.id // Access params directly, but we'll handle it better

  useEffect(() => {
    const fetchTesterDetails = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        // Use the testerId from the closure instead of accessing params directly in the effect
        const response = await fetch(`/api/admin/testers/${testerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch tester details")
        }

        const data = await response.json()
        setTester(data.tester)
        setTests(data.tests)
        setStats(data.stats)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching tester details:", error)
        setError(error instanceof Error ? error.message : "An error occurred while fetching tester details")
        setLoading(false)
      }
    }

    fetchTesterDetails()
  }, [testerId, router]) // Add testerId to the dependency array

  const viewTestDetails = (testId: string) => {
    router.push(`/admin/test/${testId}`)
  }

  const downloadTestReport = (testId: string) => {
    // In a real app, this would download the report
    alert(`Downloading report for test ${testId}`)
  }

  const downloadTestCSV = (testId: string) => {
    // In a real app, this would download the CSV
    alert(`Downloading CSV for test ${testId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00D4EF] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading tester details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="container mx-auto max-w-6xl">
          <Button variant="outline" onClick={() => router.push("/admin/dashboard")} className="mb-4 border-gray-700">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>

          <Card className="border-red-500/20 bg-black">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Tester Details</h2>
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

  if (!tester) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="container mx-auto max-w-6xl">
          <Button variant="outline" onClick={() => router.push("/admin/dashboard")} className="mb-4 border-gray-700">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>

          <Card className="border-yellow-500/20 bg-black">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-yellow-500 mb-2">Tester Not Found</h2>
                <p className="text-gray-400">
                  The tester you're looking for doesn't exist or you don't have permission to view it.
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
        <Button variant="outline" onClick={() => router.push("/admin/dashboard")} className="mb-4 border-gray-700">
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Tester Profile Card */}
          <Card className="border-[#00D4EF]/20 bg-black md:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl text-[#00D4EF] flex items-center gap-2">
                <User className="h-5 w-5" />
                Tester Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                  <div className="bg-[#00D4EF] text-black rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                    {tester.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{tester.name}</h3>
                    <p className="text-gray-400 flex items-center gap-1">
                      <Mail size={14} />
                      {tester.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Joined</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-[#00D4EF]" />
                      {new Date(tester.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Tests</span>
                    <span className="font-bold">{stats?.totalTests || 0}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Completed Tests</span>
                    <span className="font-bold">{stats?.completedTests || 0}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Average Rating</span>
                    <span className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.round(stats?.averageRating || 0)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-500"
                          }
                        />
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-green-500/20 bg-black">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-green-500/20 p-3 rounded-full mb-3">
                    <CheckCircle size={24} className="text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold">{stats?.completedTests || 0}</h3>
                  <p className="text-gray-400 text-sm">Completed Tests</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-black">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-500/20 p-3 rounded-full mb-3">
                    <BarChart2 size={24} className="text-blue-500" />
                  </div>
                  <h3 className="text-3xl font-bold">{stats?.averageRating?.toFixed(1) || "0.0"}</h3>
                  <p className="text-gray-400 text-sm">Average Rating</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-black">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-purple-500/20 p-3 rounded-full mb-3">
                    <Clock size={24} className="text-purple-500" />
                  </div>
                  <h3 className="text-3xl font-bold">
                    {tests.length > 0
                      ? Math.round(
                          (new Date().getTime() - new Date(tests[0].createdAt).getTime()) / (1000 * 60 * 60 * 24),
                        )
                      : 0}
                  </h3>
                  <p className="text-gray-400 text-sm">Days Since Last Test</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test History */}
        <Card className="border-[#00D4EF]/20 bg-black">
          <CardHeader>
            <CardTitle className="text-xl text-[#00D4EF] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Test History
            </CardTitle>
            <CardDescription>All tests conducted by {tester.name}</CardDescription>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No tests have been conducted by this tester yet.</div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Tests</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="partial">Partial</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <TestTable
                    tests={tests}
                    viewTestDetails={viewTestDetails}
                    downloadTestReport={downloadTestReport}
                    downloadTestCSV={downloadTestCSV}
                  />
                </TabsContent>

                <TabsContent value="completed">
                  <TestTable
                    tests={tests.filter((test) => test.status === "Completed")}
                    viewTestDetails={viewTestDetails}
                    downloadTestReport={downloadTestReport}
                    downloadTestCSV={downloadTestCSV}
                  />
                </TabsContent>

                <TabsContent value="partial">
                  <TestTable
                    tests={tests.filter((test) => test.status === "Partial" || test.status === "In Progress")}
                    viewTestDetails={viewTestDetails}
                    downloadTestReport={downloadTestReport}
                    downloadTestCSV={downloadTestCSV}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TestTable({
  tests,
  viewTestDetails,
  downloadTestReport,
  downloadTestCSV,
}: {
  tests: any[]
  viewTestDetails: (id: string) => void
  downloadTestReport: (id: string) => void
  downloadTestCSV: (id: string) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Categories</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tests.map((test) => (
          <TableRow key={test.id}>
            <TableCell className="flex items-center gap-1">
              <Calendar size={14} className="text-gray-400" />
              {new Date(test.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="font-medium">{test.customer.name}</TableCell>
            <TableCell>
              {test.exercises
                .map((ex: any) => ex.category)
                .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
                .join(", ")}
            </TableCell>
            <TableCell>
              {test.ratings ? (
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < test.ratings.overall ? "text-yellow-500 fill-yellow-500" : "text-gray-500"}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">No rating</span>
              )}
            </TableCell>
            <TableCell>
              <Badge
                className={
                  test.status === "Completed" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                }
              >
                {test.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewTestDetails(test.id)}
                  className="border-[#00D4EF] text-[#00D4EF]"
                >
                  <Eye size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTestCSV(test.id)}
                  className="border-green-500 text-green-500"
                >
                  <Download size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTestReport(test.id)}
                  className="border-blue-500 text-blue-500"
                >
                  <FileText size={14} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

