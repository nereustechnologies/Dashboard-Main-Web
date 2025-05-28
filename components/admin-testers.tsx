"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Users, Calendar, Mail, Activity, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function AdminTesters() {
  const [testers, setTesters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newTester, setNewTester] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [error, setError] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testerToDelete, setTesterToDelete] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    // Get current user from localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
    }

    // Fetch testers from API
    const fetchTesters = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication required")
        }

        const response = await fetch("/api/admin/testers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch testers")
        }

        const data = await response.json()
        setTesters(data.testers || [])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching testers:", error)
        setLoading(false)
        setError(error instanceof Error ? error.message : "Failed to load testers")
        setTesters([])
      }
    }

    fetchTesters()
  }, [])

  const filteredTesters = testers.filter(
    (tester) =>
      tester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tester.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const viewTesterDetails = (testerId: string) => {
    router.push(`/admin/tester/${testerId}`)
  }

  const handleAddTester = async () => {
    try {
      setError("")

      // Validate inputs
      if (!newTester.name || !newTester.email || !newTester.password) {
        setError("All fields are required")
        return
      }

      // Get token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      // Send registration request to API
      const response = await fetch("/api/admin/register-tester", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTester.name,
          email: newTester.email,
          password: newTester.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add tester")
      }

      const data = await response.json()

      // Refresh the tester list
      const refreshResponse = await fetch("/api/admin/testers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        setTesters(refreshData.testers || [])
      }

      alert(`Tester ${newTester.name} added successfully!`)

      // Reset form
      setNewTester({
        name: "",
        email: "",
        password: "",
      })

      // Close dialog
      setAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding tester:", error)
      setError(error instanceof Error ? error.message : "An error occurred while adding tester")
    }
  }

  return (
    <Card className="border-[#00D4EF]/20 bg-black">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-[#00D4EF] flex items-center gap-2">
          <Users className="h-5 w-5" />
          Testers
        </CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search testers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-gray-900 border-gray-700"
            />
          </div>

          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Tester
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-[#00D4EF]">Add New Tester</DialogTitle>
                <DialogDescription>Create a new tester account for an employee.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newTester.name}
                    onChange={(e) => setNewTester({ ...newTester, name: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTester.email}
                    onChange={(e) => setNewTester({ ...newTester, email: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newTester.password}
                    onChange={(e) => setNewTester({ ...newTester, password: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm bg-red-500/20 border border-red-500 rounded text-red-500">{error}</div>
                )}
              </div>

              <DialogFooter>
                <Button onClick={handleAddTester} className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black">
                  Add Tester
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading testers...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filteredTesters.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchTerm
              ? "No testers match your search"
              : "No testers found. Add your first tester using the button above."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tests Completed</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTesters.map((tester) => (
                <TableRow key={tester.id}>
                  <TableCell className="font-medium">{tester.name}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Mail size={14} className="text-gray-400" />
                    {tester.email}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Activity size={14} className="text-green-500" />
                    {tester.testsCompleted || 0}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Calendar size={14} className="text-blue-500" />
                    {tester.lastActive || "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewTesterDetails(tester.id)}
                        className="border-[#00D4EF] text-[#00D4EF]"
                      >
                        <Eye size={14} />
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

