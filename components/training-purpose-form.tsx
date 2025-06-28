    "use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface Suggestion {
  title: string
  paragraph: string
}

const CATEGORIES = [
  { key: "expand", label: "Expand Your Strengths" },
  { key: "improve", label: "Targeted Improvements" },
  { key: "injury", label: "Injury Risk Assessment" },
] as const

interface TrainingPurposeFormProps {
  customerId: string
}

export function TrainingPurposeForm({ customerId }: TrainingPurposeFormProps) {
  const [suggestions, setSuggestions] = useState<Record<string, Suggestion[]>>(() => {
    const initial: Record<string, Suggestion[]> = {}
    CATEGORIES.forEach(({ key }) => {
      initial[key] = Array.from({ length: 3 }, () => ({ title: "", paragraph: "" }))
    })
    return initial
  })

  const handleChange = (
    categoryKey: string,
    index: number,
    field: keyof Suggestion,
    value: string,
  ) => {
    setSuggestions((prev) => {
      const updated = { ...prev }
      const catSuggestions = [...updated[categoryKey]]
      catSuggestions[index] = { ...catSuggestions[index], [field]: value }
      updated[categoryKey] = catSuggestions
      return updated
    })
  }

  const saveCategory = async (key: string) => {
    const payload = suggestions[key].map((s, i) => ({ slot: i, ...s }))
    try {
      const token = localStorage.getItem("token")
      await fetch("/api/training-purpose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ customerId, category: key, suggestions: payload }),
      })
      alert(`${key} saved!`)
    } catch (err) {
      console.error("Failed to save training purpose", err)
      alert("Failed to save data")
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Training with Purpose</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={CATEGORIES[0].key} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            {CATEGORIES.map(({ key, label }) => (
              <TabsTrigger key={key} value={key} className="truncate">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map(({ key, label }) => (
            <TabsContent key={key} value={key} className="space-y-6">
              {suggestions[key].map((sugg, idx) => (
                <div key={idx} className="space-y-2">
                  <Input
                    placeholder={`${label} Title ${idx + 1}`}
                    value={sugg.title}
                    onChange={(e) => handleChange(key, idx, "title", e.target.value)}
                  />
                  <div className="relative">
                    <Textarea
                      placeholder={`${label} Paragraph ${idx + 1}`}
                      value={sugg.paragraph}
                      onChange={(e) => handleChange(key, idx, "paragraph", e.target.value)}
                      className="min-h-[120px] pr-16"
                      maxLength={500}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                      {sugg.paragraph.length}/500
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button onClick={() => saveCategory(key)} className="bg-cyan-500 hover:bg-cyan-600">
                  Save
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
} 