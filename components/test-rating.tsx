"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Star, FileText } from "lucide-react"

interface TestRatingProps {
  onSubmit: () => void
  onBack: () => void
  customerData: any
  testId: string
}

export default function TestRating({ onSubmit, onBack, customerData, testId }: TestRatingProps) {
  const [overallRating, setOverallRating] = useState("3")
  const [mobilityRating, setMobilityRating] = useState("3")
  const [strengthRating, setStrengthRating] = useState("3")
  const [enduranceRating, setEnduranceRating] = useState("3")
  const [observation, setObservation] = useState("")
  const [rpe, setRPE] = useState("5")
  const [feltAfter, setFeltAfter] = useState("Satisfied – solid effort, no regrets")

  const handleSubmit = async () => {
    const ratings = {
      overall: parseInt(overallRating),
      mobility: parseInt(mobilityRating),
      strength: parseInt(strengthRating),
      endurance: parseInt(enduranceRating),
      observation,
      RPE: parseInt(rpe),
      FeltAfterWorkOut: feltAfter,
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Authentication required. Please log in again.")

      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ testId, ratings }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit ratings.")
      }

      alert("Test completed and data saved successfully!")
      onSubmit()
    } catch (e) {
      const error = e instanceof Error ? e.message : "An unknown error occurred."
      console.error("Failed to submit ratings:", error)
      alert(error)
    }
  }

  const downloadReport = () => {
    const reportContent = `
Nereus Fitness Test Report
=========================
Date: ${new Date().toLocaleDateString()}

Customer Information:
- Name: ${customerData?.name || "N/A"}
- Age: ${customerData?.age || "N/A"}
- Gender: ${customerData?.gender || "N/A"}
- Height: ${customerData?.height || "N/A"} cm
- Weight: ${customerData?.weight || "N/A"} kg

Test Ratings:
- Overall: ${overallRating}/5
- Mobility: ${mobilityRating}/5
- Strength: ${strengthRating}/5
- Endurance: ${enduranceRating}/5
- RPE: ${rpe}/10
- Felt After Workout: ${feltAfter}

Observation:
${observation || "No feedback provided."}
    `

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `fitness_report_${customerData?.name || "customer"}_${new Date().toISOString().split("T")[0]}.txt`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Star size={20} className="text-[#00D4EF]" />
          Test Completed
        </h3>
        <p className="text-sm text-gray-400">Please rate the test performance and provide any feedback.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* <div className="space-y-2">
            <Label>Overall Rating (1–5)</Label>
            <Select value={overallRating} onValueChange={setOverallRating}>
              <SelectTrigger className="bg-gray-900 border-gray-700"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{[1,2,3,4,5].map(v => <SelectItem key={v} value={v.toString()}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mobility Rating (1–5)</Label>
            <Select value={mobilityRating} onValueChange={setMobilityRating}>
              <SelectTrigger className="bg-gray-900 border-gray-700"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{[1,2,3,4,5].map(v => <SelectItem key={v} value={v.toString()}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Strength Rating (1–5)</Label>
            <Select value={strengthRating} onValueChange={setStrengthRating}>
              <SelectTrigger className="bg-gray-900 border-gray-700"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{[1,2,3,4,5].map(v => <SelectItem key={v} value={v.toString()}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Endurance Rating (1–5)</Label>
            <Select value={enduranceRating} onValueChange={setEnduranceRating}>
              <SelectTrigger className="bg-gray-900 border-gray-700"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{[1,2,3,4,5].map(v => <SelectItem key={v} value={v.toString()}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div> */}
        </div>

        <div className="space-y-2">
          <Label>RPE (Rate of Perceived Exertion 1–10)</Label>
          <Select value={rpe} onValueChange={setRPE}>
            <SelectTrigger className="bg-gray-900 border-gray-700"><SelectValue placeholder="Select RPE" /></SelectTrigger>
            <SelectContent>{Array.from({ length: 10 }, (_, i) => {
  const val = (i + 1).toString()
  return <SelectItem key={val} value={val}>{val}</SelectItem>
})}</SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>How did you feel after the workout?</Label>
          <Select value={feltAfter} onValueChange={setFeltAfter}>
            <SelectTrigger className="bg-gray-900 border-gray-700"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Exhausted – wiped, hit your limit">Exhausted</SelectItem>
              <SelectItem value="Tired – fatigued, but manageable">Tired</SelectItem>
              <SelectItem value="Satisfied – solid effort, no regrets">Satisfied</SelectItem>
              <SelectItem value="At Ease – clear-headed">At Ease</SelectItem>
              <SelectItem value="Uplifted – emotionally light and positive">Uplifted</SelectItem>
              <SelectItem value="Charged – body lit up and mind clear">Charged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observation">Observation</Label>
          <Textarea
            id="observation"
            placeholder="Enter your observations and feedback about the test"
            className="bg-gray-900 border-gray-700 min-h-[100px]"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <Button onClick={downloadReport} variant="outline" className="border-[#00D4EF] text-[#00D4EF]">
            <FileText size={16} className="mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button type="submit" onClick={handleSubmit} className="bg-primary hover:bg-primary/80 text-black">
          Submit Review
        </Button>
      </div>
    </div>
  )
}
