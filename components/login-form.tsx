"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("tester")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Store user info and token in localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          adminId: data.user.adminId,
        }),
      )

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/tester/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tabs defaultValue="tester" onValueChange={setUserType}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="tester">Tester</TabsTrigger>
        <TabsTrigger value="admin">Admin</TabsTrigger>
      </TabsList>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <User size={16} />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-900 border-gray-700"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock size={16} />
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-gray-900 border-gray-700"
          />
        </div>

        {error && <div className="p-3 text-sm bg-red-500/20 border border-red-500 rounded text-red-500">{error}</div>}

        <div className="pt-2">
          <Button type="submit" className="w-full bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black" disabled={loading}>
            {loading ? "Logging in..." : `Login as ${userType === "admin" ? "Admin" : "Tester"}`}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Demo Credentials:</p>
          {userType === "tester" ? (
            <p>Email: tester@example.com / Password: password</p>
          ) : (
            <p>Email: admin@example.com / Password: password</p>
          )}
        </div>
      </form>
    </Tabs>
  )
}

