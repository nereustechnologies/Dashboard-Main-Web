import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date")

  if (!date) {
    return NextResponse.json({ bookings: [] }, { status: 400 })
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
          include: {
            EmailLog: true, // ✅ Include the EmailLog relation properly
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

    return NextResponse.json({ bookings })
  } catch (err) {
    console.error("Fetch bookings error:", err)
    return NextResponse.json({ bookings: [] }, { status: 500 })
  }
}
