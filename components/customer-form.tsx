"use client"

import type React from "react"
import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Calendar,
  Ruler,
  Weight,
  Moon,
  Activity,
  Pizza,
  Smile,
  Loader2,
} from "lucide-react"
import { unique } from "next/dist/build/utils"

interface CustomerFormProps {
  onSubmit: (data: any) => void
}

export default function CustomerForm({ onSubmit }: CustomerFormProps) {
  const [clientId, setClientId] = useState("")
  const [formData, setFormData] = useState({
    uniqueId:"",
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    sleepLevels: "",
    activityLevel: "active",
    calorieIntake: "",
    mood: "good",
  })
  const [loading, setLoading] = useState(false)
  const [fetchingClient, setFetchingClient] = useState(false)
  const [clientOptions, setClientOptions] = useState<any[]>([])
  const [clientFetched, setClientFetched] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

   useEffect(() => {
  const fetchClients = async () => {
    const res = await fetch("/api/todayBooking")
    const data = await res.json()
    setClientOptions(data.clients || [])
  }
  fetchClients()
}, [])
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const fetchClientData = async () => {
    setError("")
    setClientFetched(false)
    setFetchingClient(true)

    const token = localStorage.getItem("token")
    if (!token) {
      setError("Authentication required")
      setFetchingClient(false)
      return
    }

    try {
      const response = await fetch("/api/customers/fetchInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uniqueId: clientId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Client not found")
      }

      console.log("Fetched client data:", data)

      setFormData((prev) => ({
        ...prev,
        name: data.name,
        age: data.age.toString(),
        gender: data.gender,
      }))
  
      setClientFetched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching client data")
    } finally {
      setFetchingClient(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Authentication required")

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uniqueId: clientId,
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender,
          height: Number(formData.height),
          weight: Number(formData.weight),
          sleepLevels: Number(formData.sleepLevels),
          activityLevel: formData.activityLevel,
          calorieIntake: Number(formData.calorieIntake),
          mood: formData.mood,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save data")
      }

      onSubmit(data.customer)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred while submitting")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Step 1: Enter client ID */}
        <div className="space-y-2">
          <Label htmlFor="clientId" className="flex items-center gap-2">
            <User size={16} className="text-primary" />
            Client ID
          </Label>
          <Select
  onValueChange={(val) => setClientId(val)}
>
  <SelectTrigger>
    <SelectValue placeholder="Select Client" />
  </SelectTrigger>
  <SelectContent>
    {clientOptions.map((client) => (
      <SelectItem key={client.id} value={client.uniqueId}>
        {`${client.uniqueId} - ${client.fullName} (${client.whatsapp})`}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
          <Button type="button" onClick={fetchClientData} className="mt-2" disabled={fetchingClient}>
            {fetchingClient ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              "Fetch Client Info"
            )}
          </Button>
        </div>

        {clientFetched && (
          <>
            {/* Pre-filled and read-only fields */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                readOnly
                className="bg-muted text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  value={formData.age}
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleepLevels">Sleep (hrs/day)</Label>
              <Input
                id="sleepLevels"
                name="sleepLevels"
                value={formData.sleepLevels}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select
                defaultValue={formData.activityLevel}
                onValueChange={(value) =>
                  handleSelectChange("activityLevel", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="moderately_active">
                    Moderately Active
                  </SelectItem>
                  <SelectItem value="not_active">Not Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calorieIntake">Calorie Intake</Label>
              <Input
                id="calorieIntake"
                name="calorieIntake"
                value={formData.calorieIntake}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">Mood</Label>
              <Select
                defaultValue={formData.mood}
                onValueChange={(value) => handleSelectChange("mood", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="tired">Tired</SelectItem>
                  <SelectItem value="stressed">Stressed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-2 text-sm text-red-500 border border-red-500 bg-red-500/10 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Next: Connect Sensor"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </form>
  )
}
