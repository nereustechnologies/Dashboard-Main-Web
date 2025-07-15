import { useEffect, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Loader2 } from "lucide-react"

interface ScoreInputs {
  title: string
  current: string
  target: string
}

interface ScoresToBeatProps {
  customerId: string
}

export function ScoresToBeat({ customerId }: ScoresToBeatProps) {
  const [data, setData] = useState<ScoreInputs[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/scores_to_beat?customerId=${customerId}`)
        const json = await res.json()
        if (Array.isArray(json.data) && json.data.length > 0) {
          const formatted = json.data.map((entry: any) => ({
            title: entry.title || "",
            current: entry.current || "",
            target: entry.best || "",
          }))
          setData(formatted)
        } else {
          setData([{ title: "", current: "", target: "" }])
        }
      } catch (error) {
        console.error("Failed to fetch scores:", error)
        setData([{ title: "", current: "", target: "" }])
      } finally {
        setLoading(false)
      }
    }

    fetchScores()
  }, [customerId])

  const handleChange = (index: number, field: keyof ScoreInputs, value: string) => {
    const updated = [...data]
    updated[index][field] = value
    setData(updated)
  }

  const handleAddSet = () => {
    setData((prev) => [...prev, { title: "", current: "", target: "" }])
  }

  const handleDelete = (index: number) => {
    const updated = [...data]
    updated.splice(index, 1)
    setData(updated)
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/scores_to_beat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ customerId, scores: data }),
      })

      if (!response.ok) throw new Error("Save failed.")
      alert("Data saved successfully!")
    } catch (err) {
      console.error("Failed to save scores", err)
      alert("Save failed.")
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Scores To Beat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-600">Loading scores...</span>
          </div>
        ) : (
          <>
            {data.map((score, idx) => (
              <div key={idx} className="space-y-2 relative border p-4 rounded-md shadow-sm ">
                <div
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
                  onClick={() => handleDelete(idx)}
                >
                  <Trash2 className="w-5 h-5" />
                </div>
                <Input
                  placeholder="Title"
                  value={score.title}
                  onChange={(e) => handleChange(idx, "title", e.target.value)}
                />
                <Input
                  placeholder="Current Score"
                  value={score.current}
                  onChange={(e) => handleChange(idx, "current", e.target.value)}
                />
                <Input
                  placeholder="Target Score"
                  value={score.target}
                  onChange={(e) => handleChange(idx, "target", e.target.value)}
                />
              </div>
            ))}

            <div className="flex items-center justify-between">
              <Button
                type="button"
                onClick={handleAddSet}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add More
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Save All
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
