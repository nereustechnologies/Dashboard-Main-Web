"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminTesters from "@/components/admin-testers"
import AdminReports from "@/components/admin-reports"
import Image from "next/image"

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-black">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Nereus Technologies Logo" width={40} height={45} />
            <div>
              <h1 className="text-2xl font-bold text-[#00D4EF]">Admin Dashboard</h1>
              <p className="text-gray-400">Welcome, {user?.name || "Admin"}</p>
            </div>
          </div>
          <div>
          <Button
      variant="outline"
      onClick={() => router.push("/admin/dashboard/booking")}
      className="border-[#00D4EF] text-[#00D4EF] m-2"
    >
      Booking Dashboard
    </Button>
          <Button variant="outline" onClick={handleLogout} className="border-[#00D4EF] text-[#00D4EF]">
            Logout
          </Button>
          </div>
        </header>

        <Tabs defaultValue="testers">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="testers">Testers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="testers">
            <AdminTesters />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

