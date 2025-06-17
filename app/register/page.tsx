"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Lock } from "lucide-react"
import Image from "next/image" // Import Image component

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "doctor", // Registering user as a doctor
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      alert(`Registration successful for Dr. ${formData.name} (${formData.email}). Please login.`)
      router.push("/login")
    } catch (error) {
      console.error("Registration error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          {/* Using the Nereus logo similar to the login page */}
          <Image src="/logo.svg" alt="Nereus Technologies Logo" width={70} height={80} />
        </Link>

        <Card className="border-[#00D4EF]/20 bg-black text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#00D4EF]">Create Doctor Account</CardTitle>
            <p className="text-gray-400 mt-1">Register to access the Doctor Dashboard.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-gray-300">
                  <User size={16} className="text-[#00D4EF]" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                  placeholder="e.g., Dr. Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-300">
                  <Mail size={16} className="text-[#00D4EF]" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                  placeholder="doctor@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-gray-300">
                  <Lock size={16} className="text-[#00D4EF]" />
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-gray-300">
                  <Lock size={16} className="text-[#00D4EF]" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-3 text-sm bg-red-900/30 border border-red-700 rounded text-red-400">{error}</div>
              )}

              <div className="pt-2">
                <Button type="submit" className="w-full bg-[#00D4EF] text-black hover:bg-[#00D4EF]/90" disabled={loading}>
                  {loading ? "Creating Account..." : "Register as Doctor"}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-[#00D4EF] hover:underline">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

