import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

type RawBooking = {
  id: string
  paymentStatus: string | null
  consentAgreement: boolean
  fullName: string
  email: string
  age: number
  gender: string
  whatsapp: string
  fitnessGoal: string
  whyMove: string
  uniqueId: string
  startTime: Date
  endTime: Date
  slotDate: Date
  locationName: string
}

export async function GET(request: NextRequest) {
  console.time("⏱ API Total Time")
  console.time("⏱ Bookings + Locations Query")

  try {

     const admin = await verifyAuth(request)
        if (!admin) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
    
        // Check if user is an admin
        if (admin.role !== "admin") {
          return NextResponse.json({ error: "Only admins can access this endpoint" }, { status: 403 })
        }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const bookings = date
      ? await prisma.$queryRaw<RawBooking[]>`
        SELECT
          b.id,
          b."paymentStatus",
          b."consentAgreement",
          u."fullName",
          u.email,
          u.age,
          u.gender,
          u.whatsapp,
          u."fitnessGoal",
          u."whyMove",
          u."uniqueId",
          ts."startTime",
          ts."endTime",
          sd.date AS "slotDate",
          l.name AS "locationName"
        FROM "Booking" b
        JOIN "Client" u ON b."clientId" = u.id
        JOIN "TimeSlot" ts ON b."timeSlotId" = ts.id
        JOIN "SlotDate" sd ON ts."slotDateId" = sd.id
        JOIN "Location" l ON sd."locationId" = l.id
        WHERE sd.date = ${date}
        ORDER BY b."createdAt" DESC
      `
      : await prisma.$queryRaw<RawBooking[]>`
        SELECT
          b.id,
          b."paymentStatus",
          b."consentAgreement",
          u."fullName",
          u.email,
          u.age,
          u.gender,
          u.whatsapp,
          u."fitnessGoal",
          u."whyMove",
          u."uniqueId",
          ts."startTime",
          ts."endTime",
          sd.date AS "slotDate",
          l.name AS "locationName"
        FROM "Booking" b
        JOIN "Client" u ON b."clientId" = u.id
        JOIN "TimeSlot" ts ON b."timeSlotId" = ts.id
        JOIN "SlotDate" sd ON ts."slotDateId" = sd.id
        JOIN "Location" l ON sd."locationId" = l.id
        ORDER BY b."createdAt" DESC
      `

    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true
      }
    })

    console.timeEnd("⏱ Bookings + Locations Query")

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      name: booking.fullName,
      email: booking.email,
      age: booking.age,
      gender: booking.gender,
      whatsapp: booking.whatsapp,
      fitnessGoal: booking.fitnessGoal,
      whyMove: booking.whyMove,
      consent: booking.consentAgreement,
      uniqueId: booking.uniqueId,
      paymentStatus: booking.paymentStatus?.toLowerCase(),
      slotDate: {
        date: booking.slotDate.toISOString(),
        location: {
          name: booking.locationName
        },
        timeSlot: {
          startTime: booking.startTime.toISOString(),
          endTime: booking.endTime.toISOString()
        }
      }
    }))

    console.timeEnd("⏱ API Total Time")

    return NextResponse.json({
      bookings: formattedBookings,
      locations
    })
  } catch (error) {
    console.error('❌ Error fetching data:', error)
    console.timeEnd("⏱ API Total Time")
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
