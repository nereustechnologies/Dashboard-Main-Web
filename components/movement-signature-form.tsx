"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const OPTIONS = [
  "Mobility-Dominant",
  "Strength-Dominant",
  "Endurance-Dominant",
  "Balanced-Hybrid",
]

interface MovementSignatureFormProps {
  customerId: string
}

export function MovementSignatureForm({ customerId }: MovementSignatureFormProps) {
  const [identity, setIdentity] = useState<string>("")
  const [rating, setRating] = useState<number>(0)

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token")
      await fetch("/api/movement-signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ customerId, identity, rating }),
      })
      alert("Movement Signature saved!")
    } catch (err) {
      console.error("Failed to save Movement Signature", err)
      alert("Failed to save data")
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Movement Signature</CardTitle>
        <Button onClick={handleSave} className="bg-cyan-500 hover:bg-cyan-600">
          Save
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm">Movement Identity [Doctor]</label>
          <Select value={identity} onValueChange={setIdentity}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select identity" />
            </SelectTrigger>
            <SelectContent>
              {OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating bar */}
        <div className="space-y-1">
          <label className="text-sm">Rating (1-10)</label>
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Rate ${i + 1}`}
                onClick={() => setRating(i + 1)}
                className={`h-4 flex-1 rounded-sm ${i < rating ? "bg-[#00D4EF]" : "bg-gray-700"}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 