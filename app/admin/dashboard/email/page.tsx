"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminEmailTracker() {
  const [date, setDate] = useState("")
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const fetchBookings = async () => {
    setLoading(true)
    const res = await fetch(`/api/get-bookings-by-date?date=${date}`)
    const data = await res.json()
    setBookings(data.bookings || [])
    setLoading(false)
  }

  const sendPostSessionEmails = async () => {
    setSending(true)
    const res = await fetch(`/api/send-post-session-emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    })
    const result = await res.json()
    alert("Post-session emails sent.")
    fetchBookings()
    setSending(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-64"
        />
        <Button onClick={fetchBookings} disabled={!date}>Fetch Bookings</Button>
      </div>

      {bookings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-center">Unique ID</th>
                <th className="px-4 py-2 text-center">Confirmation</th>
                <th className="px-4 py-2 text-center">Reminder</th>
                <th className="px-4 py-2 text-center">Post Session</th>
                <th className="px-4 py-2 text-center">Report</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{b.client.fullName}</td>
                  <td className="px-4 py-2 text-center">{b.client.uniqueId}</td>
                  {["CONFIRMATION", "REMINDER", "POST_SESSION", "REPORT"].map(type => (
                    <td key={type} className="px-4 py-2 text-center">
                      {b.client.EmailLog?.find((e: any) => e.emailType === type) ? "✅" : "❌"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6">
            <Button onClick={sendPostSessionEmails} disabled={sending}>
              {sending ? "Sending..." : "Send Post-Session Emails"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
