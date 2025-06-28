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
  // Dropdown options
  const strengthFieldOptions: Record<string, string[]> = {
    "Squat Depth Rating": ["Deep", "Parallel", "Partial"],
    "Repetition Consistency (Squat)": ["Good", "Satisfactory", "Needs Improvement"],
    "Stability (Squat)": ["Good", "Satisfactory", "Needs Improvement"],
    "Fatigue Score (Squat)": ["1", "2", "3", "4", "5"],
    "Lunge Depth Rating": ["Good", "Satisfactory", "Needs Improvement"],
    "Repetition Consistency (Lunge)": ["Good", "Satisfactory", "Needs Improvement"],
    "Stability (Lunge)": ["Good", "Satisfactory", "Needs Improvement"],
    "Fatigue Score (Lunge)": ["1", "2", "3", "4", "5"],
  }

  const enduranceFieldOptions: Record<string, string[]> = {
    "Stability Score (for Plank Hold)": ["Good", "Satisfactory", "Inconsistent"],
    "Fatigue Score (for Plank Hold)": [
      "1 – Fatigues rapidly · Endurance is a major weakness",
      "2 – Low stamina · Strength drops off early",
      "3 – Decent base · Fades under sustained effort",
      "4 – Strong endurance · Holds output well",
      "5 – Elite stamina · Repeats high effort with ease",
    ],
    "Fatigue Score (for Step Ups)": [
      "1 – Fatigues rapidly · Endurance is a major weakness",
      "2 – Low stamina · Strength drops off early",
      "3 – Decent base · Fades under sustained effort",
      "4 – Strong endurance · Holds output well",
      "5 – Elite stamina · Repeats high effort with ease",
    ],
  }

  const mobilityFieldOptions: Record<string, string[]> = {
    "Range of Motion": ["Good", "Satisfactory", "Needs Improvement"],
    "Quadriceps Stretch": ["Good", "Satisfactory", "Needs Improvement"],
    "Hip Stability": ["Good", "Satisfactory", "Needs Improvement"],
    "Calf Flexibility": ["Good", "Satisfactory", "Needs Improvement"],
    "Ankle Mobility": ["Good", "Satisfactory", "Needs Improvement"],
  }

  const dropdownFields: string[] = (() => {
    if (section === "strength") return Object.keys(strengthFieldOptions)
    if (section === "mobility") return Object.keys(mobilityFieldOptions)
    if (section === "endurance") return Object.keys(enduranceFieldOptions)
    return []
  })()

  const baseTextFields = [
    { key: "inference-title-1", label: "Inference Title" },
    { key: "inference-title-2", label: "Inference Title" },
  ]

  const textFields =
    section === "mobility"
      ? [...baseTextFields, { key: "inference-title-3", label: "Inference Title" }]
      : baseTextFields

  const [dropdownValues, setDropdownValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    dropdownFields.forEach((f) => (init[f] = ""))
    return init
  })

  const [textValues, setTextValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    textFields.forEach(({ key }) => (init[key] = ""))
    return init
  })

  const [textLabels, setTextLabels] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    textFields.forEach(({ key, label }) => (init[key] = label))
    return init
  })

  useEffect(() => {
    setDropdownValues(() => {
      const init: Record<string, string> = {}
      dropdownFields.forEach((f) => (init[f] = ""))
      return init
    })

    setTextValues(() => {
      const init: Record<string, string> = {}
      textFields.forEach(({ key }) => (init[key] = ""))
      return init
    })

    setTextLabels(() => {
      const init: Record<string, string> = {}
      textFields.forEach(({ key, label }) => (init[key] = label))
      return init
    })
  }, [section])

  const handleDropdownChange = (field: string, value: string) => {
    setDropdownValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleTextChange = (key: string, value: string) => {
    setTextValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleLabelChange = (key: string, value: string) => {
    setTextLabels((prev) => ({ ...prev, [key]: value }))
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
          textLabels,
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
        <CardDescription>
          Fill out your assessment for the {displayName} section
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {dropdownFields.map((field) => (
          <div key={field} className="flex flex-col gap-1">
            <label className="text-sm">{field}</label>
            <Select
              value={dropdownValues[field]}
              onValueChange={(val) => handleDropdownChange(field, val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {(section === "strength"
                  ? strengthFieldOptions[field]
                  : section === "mobility"
                  ? mobilityFieldOptions[field]
                  : enduranceFieldOptions[field]
                ).map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {textFields.map(({ key }) => (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={textLabels[key]}
                onChange={(e) => handleLabelChange(key, e.target.value)}
                className="text-sm border rounded px-2 py-1 w-48"
                placeholder="Field label"
              />
            </div>
            <div className="relative">
              <Textarea
                value={textValues[key]}
                onChange={(e) => handleTextChange(key, e.target.value)}
                placeholder="Enter Inference"
                maxLength={500}
                className="pr-16"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {textValues[key].length}/500
              </div>
            </div>
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
