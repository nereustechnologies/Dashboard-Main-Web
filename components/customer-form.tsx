"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Loader2, User } from "lucide-react"

interface CustomerFormProps {
  onSubmit: (data: any) => void
}

export default function CustomerForm({ onSubmit }: CustomerFormProps) {
  const [clientId, setClientId] = useState("")
  const [manualClientId, setManualClientId] = useState("")
  const [formData, setFormData] = useState({
    uniqueId: "",
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
    const selectedId = manualClientId || clientId
    if (!token) {
      setError("Authentication required")
      setFetchingClient(false)
      return
    }

    if (!selectedId) {
      setError("Please select or enter a client ID.")
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
        body: JSON.stringify({ uniqueId: selectedId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Client not found")
      }

      setFormData((prev) => ({
        ...prev,
        uniqueId: selectedId,
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
          ...formData,
          age: Number(formData.age),
          height: Number(formData.height),
          weight: Number(formData.weight),
          sleepLevels: Number(formData.sleepLevels),
          calorieIntake: Number(formData.calorieIntake),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to save data")
      }

      onSubmit(data.customer)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while submitting")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Step 1: Enter or Select client ID */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User size={16} className="text-primary" />
            Client ID (Select OR Enter)
          </Label>

          <Select onValueChange={val => setClientId(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              {clientOptions.map(client => (
                <SelectItem key={client.id} value={client.uniqueId}>
                  {`${client.uniqueId} - ${client.fullName} (${client.whatsapp})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="pt-2">
            <Label htmlFor="manualClientId">Or Enter Unique ID</Label>
            <Input
              id="manualClientId"
              placeholder="e.g., NT-0001"
              value={manualClientId}
              onChange={e => setManualClientId(e.target.value)}
            />
          </div>

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
            {/* Autofilled fields */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formData.name} readOnly className="bg-muted text-muted-foreground" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input value={formData.age} readOnly className="bg-muted text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input value={formData.gender} readOnly className="bg-muted text-muted-foreground" />
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Height (cm)</Label>
                <Input name="height" value={formData.height} onChange={handleChange} required />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input name="weight" value={formData.weight} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <Label>Sleep (hrs/day)</Label>
              <Input name="sleepLevels" value={formData.sleepLevels} onChange={handleChange} required />
            </div>

            <div>
              <Label>Activity Level</Label>
              <Select
                defaultValue={formData.activityLevel}
                onValueChange={(val) => handleSelectChange("activityLevel", val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active</SelectItem>
                  <SelectItem value="not_active">Not Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Calorie Intake</Label>
              <Input name="calorieIntake" value={formData.calorieIntake} onChange={handleChange} required />
            </div>

            <div>
              <Label>How you feel before the workout:</Label>
              <Select
                defaultValue={formData.mood}
                onValueChange={(val) => handleSelectChange("mood", val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="energized">Energized</SelectItem>
                  <SelectItem value="zone">In the Zone</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="tired">Tired</SelectItem>
                  <SelectItem value="stressed">Stressed</SelectItem>
                  <SelectItem value="low">Feeling Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}

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
