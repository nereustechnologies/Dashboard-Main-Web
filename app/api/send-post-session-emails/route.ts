// app/api/send-post-session-emails/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { date } = body

  if (!date) {
    return NextResponse.json({ message: "Date is required" }, { status: 400 })
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        timeSlot: {
          slotDate: {
            date: new Date(date),
          },
        },
      },
      include: {
        client: {
          select: {
            fullName: true,
            email: true,
            uniqueId: true,
            EmailLog: true,
          },
        },
        timeSlot: {
          select: {
            startTime: true,
            endTime: true,
            slotDate: {
              select: {
                date: true,
              },
            },
          },
        },
      },
    })

    const emailResults = await Promise.all(
      bookings.map(async booking => {
        const hasSent = booking.client.EmailLog.some(e => e.emailType === "POST_SESSION")
        if (hasSent) return { clientId: booking.clientId, status: "ALREADY_SENT" }

        const payload = {
          name: booking.client.fullName,
          email: booking.client.email,
          uniqueId: booking.client.uniqueId,
          sessionDate: booking.timeSlot.slotDate.date,
          sessionStart: booking.timeSlot.startTime,
        }

        try {
          const response = await fetch("http://129.154.255.167:5678/webhook/2353608f-b5a2-4659-8f3f-bcb66bfa47b3", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

          if (response.ok) {
            await prisma.emailLog.create({
              data: {
                clientId: booking.clientId,
                emailType: "POST_SESSION",
                subject: "Post Session Summary",
                status: "SENT",
                sentVia: "EMAIL",
                sessionDate: booking.timeSlot.slotDate.date,
              },
            })
            return { clientId: booking.clientId, status: "SENT" }
          } else {
            return { clientId: booking.clientId, status: "FAILED" }
          }
        } catch (err) {
          console.error("n8n error:", err)
          return { clientId: booking.clientId, status: "FAILED" }
        }
      })
    )

    return NextResponse.json({ results: emailResults })
  } catch (error) {
    console.error("Post-session API error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
