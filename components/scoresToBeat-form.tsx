"use client"

import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ScoreInputs {
  title: string
  current: string
  target: string
}

interface ScoresToBeatProps {
  customerId: string
}

export function ScoresToBeat({ customerId }: ScoresToBeatProps) {
  const [data, setData] = useState<ScoreInputs[]>([
    { title: "", current: "", target: "" },
    { title: "", current: "", target: "" },
    { title: "", current: "", target: "" },
  ])

  const handleChange = (index: number, field: keyof ScoreInputs, value: string) => {
    const updated = [...data]
    updated[index][field] = value
    setData(updated)
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token")
      await fetch("/api/scores_to_beat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ customerId, scores: data }),
      })
      alert("Data saved!")
    } catch (err) {
      console.error("Failed to save data", err)
      alert("Save failed.")
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Scores To Beat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((score, idx) => (
          <div key={idx} className="space-y-3">
            <Input
              placeholder={`Title ${idx + 1}`}
              value={score.title}
              onChange={(e) => handleChange(idx, "title", e.target.value)}
            />
            <Input
              placeholder={`Current Score ${idx + 1}`}
              value={score.current}
              onChange={(e) => handleChange(idx, "current", e.target.value)}
            />
            <Input
              placeholder={`Target Score ${idx + 1}`}
              value={score.target}
              onChange={(e) => handleChange(idx, "target", e.target.value)}
            />
          </div>
        ))}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-cyan-500 hover:bg-cyan-600">
            Save All
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
