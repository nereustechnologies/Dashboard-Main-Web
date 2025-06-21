// /app/api/clients/todayBookings/route.ts

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export async function GET() {
  const today = new Date()
  const clients = await prisma.booking.findMany({
    where: {
      timeSlot: {
        slotDate: {
          date: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
        },
      },
    },
    select: {
      client: {
        select: {
          id: true,
          uniqueId: true,
          fullName: true,
          whatsapp: true,
        },
      },
    },
  })

  const uniqueClients = Array.from(
    new Map(clients.map((b) => [b.client.id, b.client])).values()
  )

  return NextResponse.json({ clients: uniqueClients })
}
