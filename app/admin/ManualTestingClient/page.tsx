"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ManualClientForm() {
  const router = useRouter()

  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "MALE",
    email: "",
    whatsapp: "",
    medicalHistory: "",
    whyMove: "",
    fitnessGoal: "",
    reason: ""
  })

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [clientUniqueId, setClientUniqueId] = useState("")


  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const parsed = JSON.parse(userData)
    if (parsed.role !== "admin") {
      router.push("/login")
      return
    }

    setUser(parsed)
    setLoading(false)
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")
      const res = await fetch("/api/admin/manualTestingClient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          age: parseInt(form.age)
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")

      toast({ title: "Success", description: "Manual client added!" })

setClientUniqueId(data.client.uniqueId) // 👈 NEW: store the returned uniqueId

setForm({
  fullName: "",
  age: "",
  gender: "MALE",
  email: "",
  whatsapp: "",
  medicalHistory: "",
  whyMove: "",
  fitnessGoal: "",
  reason: ""
})
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-white text-center pt-10">Loading...</p>

  return (
    <Card className="max-w-2xl mx-auto mt-10 shadow-lg border border-gray-700 bg-gray-900">
      <CardHeader>
        <CardTitle className="text-white text-2xl">➕ Add Manual Client</CardTitle>
        <p className="text-gray-400 text-sm">For internal or test purposes only. Admin access required.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input name="fullName" value={form.fullName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input type="number" name="age" value={form.age} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input name="whatsapp" value={form.whatsapp} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea name="medicalHistory" value={form.medicalHistory} onChange={handleChange} rows={3} />
          </div>
          <div>
            <Label htmlFor="whyMove">Why Move?</Label>
            <Textarea name="whyMove" value={form.whyMove} onChange={handleChange} rows={3} />
          </div>
          <div>
            <Label htmlFor="fitnessGoal">Fitness Goal</Label>
            <Textarea name="fitnessGoal" value={form.fitnessGoal} onChange={handleChange} rows={3} />
          </div>
          <div>
            <Label htmlFor="reason">Reason for Manual Entry</Label>
            <Textarea name="reason" value={form.reason} onChange={handleChange} rows={2} required />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="bg-[#5cd2ec] text-white"
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
            {clientUniqueId && (
  <div className="text-green-400 font-semibold mt-4 text-center border border-green-500 rounded p-2 bg-green-900/30">
    ✅ Client Created with ID: <span className="text-white">{clientUniqueId}</span>
  </div>
)}

          </div>
        </form>
      </CardContent>
    </Card>
  )
}
