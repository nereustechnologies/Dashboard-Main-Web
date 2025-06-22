"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface SectionEvaluationProps {
  section: "mobility" | "strength" | "endurance"
  customerId: string
}

export function SectionEvaluation({ section, customerId }: SectionEvaluationProps) {
  // Configuration for strength section dropdowns
  const strengthFieldOptions: Record<string, string[]> = {
    "Squat Depth Rating": ["Deep", "Parallel", "Partial"],
    "Repetition Consistency (Squat)": [ "Good", "Satisfactory", "Needs Improvement"],
    "Stability (Squat)": [ "Good", "Satisfactory", "Needs Improvement"],
    "Fatigue Score (Squat)": ["1", "2", "3", "4", "5"],
    "Lunge Depth Rating": [ "Good", "Satisfactory", "Needs Improvement"],
    "Repetition Consistency (Lunge)": [ "Good", "Satisfactory", "Needs Improvement"],
    "Stability (Lunge)": [ "Good", "Satisfactory", "Needs Improvement"],
    "Fatigue Score (Lunge)": ["1", "2", "3", "4", "5"],
    // "Core Strength Rating (Plank)": ["1", "2", "3", "4", "5"],
  }

  // Configuration for mobility section dropdowns
  const mobilityFieldOptions: Record<string, string[]> = {
    "Range of Motion": [ "Good", "Satisfactory", "Needs Improvement"],
    "Quadriceps Stretch": ["Good", "Satisfactory", "Needs Improvement"],
    "Hip Stability": ["Good", "Satisfactory", "Needs Improvement"],
    "Calf Flexibility": ["Good","Satisfactor", "Needs Improvement"],
    "Ankle Mobility": ["Good","Satisfactor", "Needs Improvement"],
  }

  const dropdownFields: string[] = (() => {
    if (section === "strength") return Object.keys(strengthFieldOptions)
    if (section === "mobility") return Object.keys(mobilityFieldOptions)
    return [] // endurance
  })()

  const baseTextFields = ["Inference Title", "Inference Title"]
  const textFields = section === "mobility" ? [...baseTextFields, "Inference Title"] : baseTextFields

  const [dropdownValues, setDropdownValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    dropdownFields.forEach((f) => (init[f] = ""))
    return init
  })

  const [textValues, setTextValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    textFields.forEach((f) => (init[f] = ""))
    return init
  })

  const [textLabels, setTextLabels] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    textFields.forEach((f) => (init[f] = f))
    return init
  })

  // Reset state when section changes (e.g., navigating across tabs)
  useEffect(() => {
    setDropdownValues(() => {
      const init: Record<string, string> = {}
      dropdownFields.forEach((f) => (init[f] = ""))
      return init
    })
    setTextValues(() => {
      const init: Record<string, string> = {}
      textFields.forEach((f) => (init[f] = ""))
      return init
    })
    setTextLabels(() => {
      const init: Record<string, string> = {}
      textFields.forEach((f) => (init[f] = f))
      return init
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section])

  const handleDropdownChange = (field: string, value: string) => {
    setDropdownValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleTextChange = (field: string, value: string) => {
    setTextValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleLabelChange = (field: string, value: string) => {
    setTextLabels((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token")
      await fetch("/api/section-evaluation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ 
          customerId, 
          section, 
          dropdowns: dropdownValues, 
          texts: textValues,
          textLabels: textLabels 
        }),
      })
      alert("Section evaluation saved!")
    } catch (err) {
      console.error("Error saving section evaluation", err)
      alert("Submission failed")
    }
  }

  const displayName = section.charAt(0).toUpperCase() + section.slice(1)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{displayName} Evaluation</CardTitle>
        <CardDescription>Fill out your assessment for the {displayName} section</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {dropdownFields.length > 0 &&
          dropdownFields.map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-sm">{field}</label>
              <Select value={dropdownValues[field]} onValueChange={(val) => handleDropdownChange(field, val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {(section === "strength"
                    ? strengthFieldOptions[field]
                    : section === "mobility"
                    ? mobilityFieldOptions[field]
                    : [
                        "Excellent",
                        "Good",
                        "Average",
                        "Poor",
                        "N/A",
                      ]
                  ).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

        {textFields.map((field) => (
          <div key={field} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={textLabels[field]}
                onChange={(e) => handleLabelChange(field, e.target.value)}
                className="text-sm border rounded px-2 py-1 w-48"
                placeholder="Field label"
              />
            </div>
            <Textarea
              value={textValues[field]}
              onChange={(e) => handleTextChange(field, e.target.value)}
              placeholder={`Enter Inference`}
            />
          </div>
        ))}

        <div className="flex justify-end mt-2">
          <Button onClick={handleSubmit} className="bg-cyan-500 hover:bg-cyan-600">
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 