"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function DownloadCsvButton() {
  const [loading, setLoading] = useState(false)

  const downloadCSV = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/waitlist/download")

      if (!res.ok) throw new Error("Failed to fetch CSV")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "waitlist.csv"
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("CSV download failed:", error)
      alert("Failed to download CSV")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={downloadCSV}
      disabled={loading}
      className="bg-[#5cd2ec] text-black font-semibold hover:scale-105 transition mr-2 ml-2"
    >
      <Download className="mr-2 w-4 h-4" />
      {loading ? "Downloading..." : "Download Waitlist"}
    </Button>
  )
}
