import { format } from "date-fns"
import { NextResponse } from "next/server"
import { Client } from "pg"

function formatIST(date: Date) {
  const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30
  const istDate = new Date(date.getTime() + istOffset)
  return istDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_WAITLIST,
  })

  try {
    await client.connect()

    const result = await client.query(
      `SELECT "fullName", "phoneNumber", "email", "city", "heardFrom", "gymName", "otherSource", "createdAt"
       FROM "WaitlistEntry"
       ORDER BY "createdAt" DESC`
    )

    const headers = [
      "Full Name",
      "Phone Number",
      "Email",
      "City",
      "Heard From",
      "Gym Name",
      "Other Source",
      "Submitted At",
    ]

    const csvRows = [
      headers.join(","),
      ...result.rows.map((row) =>
        [
          `"${row.fullName}"`,
          `"${row.phoneNumber}"`,
          `"${row.email}"`,
          `"${row.city}"`,
          `"${row.heardFrom || ""}"`,
          `"${row.gymName || ""}"`,
          `"${row.otherSource || ""}"`,
          `"${formatIST(row.createdAt)}"`,
        ].join(",")
      ),
    ]

    const csvContent = csvRows.join("\n")

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=waitlist.csv",
      },
    })
  } catch (err) {
    console.error("CSV export error:", err)
    return NextResponse.json({ error: "Failed to download CSV" }, { status: 500 })
  } finally {
    await client.end()
  }
}
