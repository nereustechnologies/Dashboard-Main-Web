"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, FileText } from "lucide-react"

interface TestRatingProps {
  onSubmit: (ratings: any) => void
  onBack: () => void
  customerData: any
}

export default function TestRating({ onSubmit, onBack, customerData }: TestRatingProps) {
  const [overallRating, setOverallRating] = useState("3")
  const [mobilityRating, setMobilityRating] = useState("3")
  const [strengthRating, setStrengthRating] = useState("3")
  const [enduranceRating, setEnduranceRating] = useState("3")
  const [feedback, setFeedback] = useState("")
  const [customerFeedback, setCustomerFeedback] = useState("")

  const handleSubmit = () => {
    const ratings = {
      overall: Number.parseInt(overallRating),
      mobility: Number.parseInt(mobilityRating),
      strength: Number.parseInt(strengthRating),
      endurance: Number.parseInt(enduranceRating),
      feedback,
      customerFeedback,
    }

    onSubmit(ratings)
  }

  const downloadReport = () => {
    // Create a simple report
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

Tester Feedback:
${feedback || "No feedback provided."}

Customer Feedback:
${customerFeedback || "No feedback provided."}
    `

    // Create and download the file
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
          <div className="space-y-2">
            <Label htmlFor="overallRating">Overall Rating (1-5)</Label>
            <Select value={overallRating} onValueChange={setOverallRating}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Poor</SelectItem>
                <SelectItem value="2">2 - Fair</SelectItem>
                <SelectItem value="3">3 - Good</SelectItem>
                <SelectItem value="4">4 - Very Good</SelectItem>
                <SelectItem value="5">5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobilityRating">Mobility Rating (1-5)</Label>
            <Select value={mobilityRating} onValueChange={setMobilityRating}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Poor</SelectItem>
                <SelectItem value="2">2 - Fair</SelectItem>
                <SelectItem value="3">3 - Good</SelectItem>
                <SelectItem value="4">4 - Very Good</SelectItem>
                <SelectItem value="5">5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="strengthRating">Strength Rating (1-5)</Label>
            <Select value={strengthRating} onValueChange={setStrengthRating}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Poor</SelectItem>
                <SelectItem value="2">2 - Fair</SelectItem>
                <SelectItem value="3">3 - Good</SelectItem>
                <SelectItem value="4">4 - Very Good</SelectItem>
                <SelectItem value="5">5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="enduranceRating">Endurance Rating (1-5)</Label>
            <Select value={enduranceRating} onValueChange={setEnduranceRating}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Poor</SelectItem>
                <SelectItem value="2">2 - Fair</SelectItem>
                <SelectItem value="3">3 - Good</SelectItem>
                <SelectItem value="4">4 - Very Good</SelectItem>
                <SelectItem value="5">5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback">Tester Feedback</Label>
          <Textarea
            id="feedback"
            placeholder="Enter your observations and feedback about the test"
            className="bg-gray-900 border-gray-700 min-h-[100px]"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerFeedback">Customer Feedback</Label>
          <Textarea
            id="customerFeedback"
            placeholder="Enter any feedback from the customer"
            className="bg-gray-900 border-gray-700 min-h-[100px]"
            value={customerFeedback}
            onChange={(e) => setCustomerFeedback(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <Button onClick={downloadReport} variant="outline" className="border-[#00D4EF] text-[#00D4EF]">
            <FileText size={16} className="mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" className="border-gray-700">
          Back
        </Button>
        <Button onClick={handleSubmit} className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black">
          Submit & Finish
        </Button>
      </div>
    </div>
  )
}

