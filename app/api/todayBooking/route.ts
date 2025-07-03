import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export async function GET() {
  const today = new Date()

  // Clients who booked for today
  const bookedClients = await prisma.booking.findMany({
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

  // Clients who were manually tested today
  const manuallyAdded = await prisma.manualClientTest.findMany({
    where: {
      createdAt: {
        gte: startOfDay(today),
        lte: endOfDay(today),
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

  // Combine and remove duplicates
  const allClients = [...bookedClients, ...manuallyAdded].map((entry) => entry.client)

  const uniqueClients = Array.from(
    new Map(allClients.map((client) => [client.id, client])).values()
  )

  return NextResponse.json({ clients: uniqueClients })
}
