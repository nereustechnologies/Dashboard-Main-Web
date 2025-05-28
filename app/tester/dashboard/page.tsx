"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TestHistory from "@/components/test-history"
import NewTest from "@/components/new-test"
import Image from "next/image"

export default function TesterDashboard() {
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

    try {
      // Verify token is valid by making a request to the API
      const fetchUserData = async () => {
        try {
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            // Token is invalid, redirect to login
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.push("/login")
            return
          }

          // Token is valid, set user data
          setUser(JSON.parse(userData))
          setLoading(false)
        } catch (error) {
          console.error("Error verifying token:", error)
          router.push("/login")
        }
      }

      fetchUserData()
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    }
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
              <h1 className="text-2xl font-bold text-[#00D4EF]">Tester Dashboard</h1>
              <p className="text-gray-400">Welcome, {user?.name || "Tester"}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-[#00D4EF] text-[#00D4EF]">
            Logout
          </Button>
        </header>

        <Tabs defaultValue="new-test">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="new-test">New Test</TabsTrigger>
            <TabsTrigger value="test-history">Test History</TabsTrigger>
          </TabsList>

          <TabsContent value="new-test">
            <NewTest />
          </TabsContent>

          <TabsContent value="test-history">
            <TestHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

