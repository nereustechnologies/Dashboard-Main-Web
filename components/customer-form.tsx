"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Calendar, Ruler, Weight, Moon, Activity, Pizza, Smile } from "lucide-react"

interface CustomerFormProps {
  onSubmit: (data: any) => void
}

export default function CustomerForm({ onSubmit }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    height: "",
    weight: "",
    sleepLevels: "",
    activityLevel: "active",
    calorieIntake: "",
    mood: "good",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const prefillWithDummyData = () => {
    setFormData({
      name: `Marshal Mathers - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      age: "42", 
      gender: "male",
      height: "178",
      weight: "82",
      sleepLevels: "7",
      activityLevel: "moderately_active",
      calorieIntake: "2400",
      mood: "good",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      // Send customer data to API
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          age: Number.parseInt(formData.age),
          gender: formData.gender,
          height: Number.parseFloat(formData.height),
          weight: Number.parseFloat(formData.weight),
          sleepLevels: Number.parseFloat(formData.sleepLevels),
          activityLevel: formData.activityLevel,
          calorieIntake: Number.parseInt(formData.calorieIntake),
          mood: formData.mood,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create customer")
      }

      // Pass the customer data to the parent component
      onSubmit(data.customer)
    } catch (error) {
      console.error("Error creating customer:", error)
      setError(error instanceof Error ? error.message : "An error occurred while creating the customer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User size={16} className="text-primary" />
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="bg-secondary border-border"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age" className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              Age
            </Label>
            <Input
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              required
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="flex items-center gap-2">
              <User size={16} className="text-primary" />
              Gender
            </Label>
            <Select defaultValue={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height" className="flex items-center gap-2">
              <Ruler size={16} className="text-primary" />
              Height (cm)
            </Label>
            <Input
              id="height"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              required
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center gap-2">
              <Weight size={16} className="text-primary" />
              Weight (kg)
            </Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              required
              className="bg-secondary border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sleepLevels" className="flex items-center gap-2">
            <Moon size={16} className="text-primary" />
            Sleep Levels (hours/day)
          </Label>
          <Input
            id="sleepLevels"
            name="sleepLevels"
            type="number"
            value={formData.sleepLevels}
            onChange={handleChange}
            required
            className="bg-secondary border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activityLevel" className="flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            Activity Level
          </Label>
          <Select
            defaultValue={formData.activityLevel}
            onValueChange={(value) => handleSelectChange("activityLevel", value)}
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Select activity level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="moderately_active">Moderately Active</SelectItem>
              <SelectItem value="not_active">Not Active</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="calorieIntake" className="flex items-center gap-2">
            <Pizza size={16} className="text-primary" />
            Calorie Intake (per day)
          </Label>
          <Input
            id="calorieIntake"
            name="calorieIntake"
            type="number"
            value={formData.calorieIntake}
            onChange={handleChange}
            required
            className="bg-secondary border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mood" className="flex items-center gap-2">
            <Smile size={16} className="text-primary" />
            Current Mood
          </Label>
          <Select defaultValue={formData.mood} onValueChange={(value) => handleSelectChange("mood", value)}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Select mood" />
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
      </div>

      {error && <div className="p-3 text-sm bg-red-500/20 border border-red-500 rounded text-red-500">{error}</div>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={prefillWithDummyData}>
          Prefill
        </Button>
        <Button type="submit" className="bg-primary text-black hover:bg-primary/90" disabled={loading}>
          {loading ? "Saving..." : "Next: Connect Sensor"}
        </Button>
      </div>
    </form>
  )
}

