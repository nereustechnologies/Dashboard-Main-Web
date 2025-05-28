"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, FileText, Calendar, Filter, ChevronDown, Download, Trash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTester, setFilterTester] = useState("all")
  const [testers, setTesters] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState("all")
  const [error, setError] = useState("")

  useEffect(() => {
    // Fetch reports and testers from API
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication required")
        }

        // Fetch testers
        const testersResponse = await fetch("/api/admin/testers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!testersResponse.ok) {
          throw new Error("Failed to fetch testers")
        }

        const testersData = await testersResponse.json()
        setTesters(testersData.testers || [])

        // Fetch reports
        const reportsResponse = await fetch("/api/admin/reports", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!reportsResponse.ok) {
          throw new Error("Failed to fetch reports")
        }

        const reportsData = await reportsResponse.json()
        setReports(reportsData.reports || [])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "Failed to load data")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      report.testerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      report.date?.includes(searchTerm) ||
      false

    const matchesTester = filterTester === "all" || report.testerId === filterTester
    const matchesStatus = filterStatus === "all" || report.status?.toLowerCase() === filterStatus.toLowerCase() || false

    return matchesSearch && matchesTester && matchesStatus
  })

  // Update the download function to properly handle authorization
  const downloadZipReport = async (reportId: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      // Create a direct download link with the token as a query parameter
      const downloadUrl = `/api/admin/download-report/${reportId}?token=${encodeURIComponent(token)}`

      // Open the download in a new tab/window
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

  const deleteTest = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`/api/admin/tests/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete test")
      }

      // Remove the test from the local state
      setReports((prev) => prev.filter((report) => report.id !== reportId))
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
          <FileText className="h-5 w-5" />
          Test Reports
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={filterTester} onValueChange={setFilterTester}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
              <SelectValue placeholder="Filter by tester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Testers</SelectItem>
              {testers.map((tester) => (
                <SelectItem key={tester.id} value={tester.id}>
                  {tester.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-700 flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Status
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("completed")}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("partial")}>Partial</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-gray-900 border-gray-700"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading reports...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchTerm || filterTester !== "all" || filterStatus !== "all"
              ? "No reports match your filters"
              : "No reports found. Reports will appear here when testers complete tests."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tester</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {report.date}
                  </TableCell>
                  <TableCell>{report.customerName}</TableCell>
                  <TableCell>{report.testerName}</TableCell>
                  <TableCell>{report.categories?.join(", ") || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        report.status === "Completed"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {report.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = `/admin/report/${report.id}`)}
                        className="border-[#00D4EF] text-[#00D4EF]"
                        title="View Test Details"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadZipReport(report.id)}
                        className="border-green-500 text-green-500"
                        title="Download Complete Test Report (ZIP)"
                      >
                        <Download size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTest(report.id)}
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

