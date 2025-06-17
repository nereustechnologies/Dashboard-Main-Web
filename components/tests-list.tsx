// filepath: x:\Partnership work\Nerues\newcode2\components\tests-list.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Download, Eye, Calendar, Filter, ChevronDown, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation" // Import useRouter

export default function TestsList() { // Renamed component
  const router = useRouter() // Initialize router
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [error, setError] = useState("")

  useEffect(() => {
    // Fetch test history from API
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          // For the doctor's view, you might have a different auth mechanism
          // or this page might be protected by a higher-level route guard.
          // If doctors don't log in the same way, this needs adjustment.
          // For now, assuming similar token-based auth for fetching tests.
          console.warn("TestsList: No token found, attempting to fetch tests without auth. This might need adjustment for doctor roles.")
          // If doctors don't need a token to view tests, remove token logic here.
          // If they do, ensure the token is available or handle the error.
        }

        const response = await fetch("/api/tests", { // Assuming doctors can access the same endpoint
          headers: token ? { // Conditionally add Authorization header
            Authorization: `Bearer ${token}`,
          } : {},
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || "Failed to fetch test list")
        }

        const data = await response.json()
        setTests(data.tests || [])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching test list:", error)
        setError(error instanceof Error ? error.message : "Failed to load test list")
        setLoading(false)
      }
    }

    fetchTests()
  }, [])

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      test.date?.includes(searchTerm) ||
      false

    const matchesCategory =
      filterCategory === "all" ||
      (filterCategory === "completed" && test.status === "Completed") ||
      (filterCategory === "partial" && test.status === "Partial")

    return matchesSearch && matchesCategory
  })

  const viewTestDetails = (testId: string) => {
    // Navigate to doctor's test details page
    router.push(`/doctor/${testId}`) // MODIFIED LINE
  }

  // Update the download function to properly handle authorization
  const downloadZipReport = async (testId: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      // Consider if doctors need a token for downloads or if the endpoint is public/different
      // if (!token) {
      //   throw new Error("Authentication required for download");
      // }

      const downloadUrl = `/api/download-report/${testId}${token ? `?token=${encodeURIComponent(token)}` : ''}`

      window.open(downloadUrl, "_blank")

      toast({
        title: "Download started",
        description: "Your report download has started.",
      })
    } catch (error) {
      console.error("Error downloading report:", error)
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download report",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteTest = async (testId: string) => {
    // Consider if doctors should have delete permissions.
    // If not, this function and the delete button should be removed.
    if (!confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token") // Assuming doctors might need a token for deletion
      if (!token) {
        throw new Error("Authentication required for deletion")
      }

      const response = await fetch(`/api/tests/${testId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete test")
      }

      setTests((prev) => prev.filter((test) => test.id !== testId))
      toast({
        title: "Test deleted",
        description: "The test has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting test:", error)
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete test",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-[#00D4EF]/20 bg-black">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-[#00D4EF] flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Available Tests {/* Optionally change title */}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-700 flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filter
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterCategory("all")}>All Tests</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("completed")}>Completed Tests</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("partial")}>Partial Tests</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-gray-900 border-gray-700"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading available tests...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchTerm ? "No tests match your search" : "No tests currently available."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient Name</TableHead> {/* Changed from Customer Name */}
                <TableHead>Gender</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{new Date(test.date || test.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{test.customer?.name || "Unknown"}</TableCell> {/* Assuming 'customer' object contains patient info */}
                  <TableCell>{test.customer?.gender || "N/A"}</TableCell>
                  <TableCell>
                    {test.exercises
                      ?.map((ex: any) => ex.category)
                      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
                      .join(", ") || "N/A"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        test.status === "Completed"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {test.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewTestDetails(test.id)}
                        className="border-[#00D4EF] text-[#00D4EF]"
                        title="View Test Details"
                      >
                        <Eye size={14} />
                      </Button>
                      {/* Consider if doctors should download or delete. Remove if not. */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadZipReport(test.id)}
                        className="border-green-500 text-green-500"
                        title="Download Test Report (ZIP)"
                      >
                        <Download size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTest(test.id)}
                        className="border-red-500 text-red-500"
                        title="Delete Test"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}