import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { verifyAuth } from "@/lib/auth"


// GET handler: Fetch all time slots with related slotDate and location
export async function GET(request: NextRequest) {
  
  try {

    const admin = await verifyAuth(request)
              if (!admin) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
              }
          
              // Check if user is an admin
              if (admin.role !== "admin") {
                return NextResponse.json({ error: "Only admins can access this endpoint" }, { status: 403 })
              }
    const timeSlots = await prisma.$queryRaw<any[]>`
      SELECT 
        ts.*, 
        sd.date AS "slotDate_date", 
        sd.id AS "slotDate_id",
        l.id AS "location_id",
        l.name AS "location_name"
      FROM "TimeSlot" ts
      JOIN "SlotDate" sd ON ts."slotDateId" = sd.id
      JOIN "Location" l ON sd."locationId" = l.id
      ORDER BY ts."startTime" ASC;
    `

    // Format results into nested structure
    const formatted = timeSlots.map(ts => ({
      id: ts.id,
      startTime: ts.startTime,
      endTime: ts.endTime,
      participantLimit: ts.participantLimit,
      count: ts.count,
      slotDate: {
        id: ts.slotDate_id,
        date: ts.slotDate_date,
        location: {
          id: ts.location_id,
          name: ts.location_name
        }
      }
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching time slots:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch time slots',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    )
  }
}

// POST handler: Create slotDate (if not exists) and then time slot
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAuth(request)
              if (!admin) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
              }
          
              // Check if user is an admin
              if (admin.role !== "admin") {
                return NextResponse.json({ error: "Only admins can access this endpoint" }, { status: 403 })
              }
    const body = await request.json()
    const { date, locationId, startTime, endTime, participantLimit } = body

    if (!date || !locationId || !startTime || !endTime || !participantLimit) {
      return new NextResponse(
        JSON.stringify({ error: 'All fields are required' }), 
        { status: 400 }
      )
    }

    if (participantLimit < 1) {
      return new NextResponse(
        JSON.stringify({ error: 'Participant limit must be at least 1' }), 
        { status: 400 }
      )
    }

    // Ensure SlotDate exists (manual upsert)
    const slotDateResult = await prisma.$queryRaw<any[]>`
      SELECT id FROM "SlotDate" 
      WHERE date = ${new Date(date)} AND "locationId" = ${locationId};
    `

    let slotDateId: string

    if (slotDateResult.length > 0) {
      slotDateId = slotDateResult[0].id
    } else {
      const inserted = await prisma.$queryRaw<any[]>`
        INSERT INTO "SlotDate" (id, date, "locationId")
        VALUES (gen_random_uuid(), ${new Date(date)}, ${locationId})
        RETURNING id;
      `
      slotDateId = inserted[0].id
    }

    // Insert TimeSlot
    const timeSlotInsert = await prisma.$queryRaw<any[]>`
      INSERT INTO "TimeSlot" (id, "startTime", "endTime", "count", "slotDateId")
      VALUES (
        gen_random_uuid(),
        ${new Date(`${date}T${startTime}`)},
        ${new Date(`${date}T${endTime}`)},
        ${participantLimit},
        ${slotDateId}
      )
      RETURNING *;
    `

    const insertedSlot = timeSlotInsert[0]

    // Fetch with nested data
    const fullResult = await prisma.$queryRaw<any[]>`
      SELECT 
        ts.*, 
        sd.date AS "slotDate_date", 
        sd.id AS "slotDate_id",
        l.id AS "location_id",
        l.name AS "location_name"
      FROM "TimeSlot" ts
      JOIN "SlotDate" sd ON ts."slotDateId" = sd.id
      JOIN "Location" l ON sd."locationId" = l.id
      WHERE ts.id = ${insertedSlot.id};
    `

    const ts = fullResult[0]
    const formatted = {
      id: ts.id,
      startTime: ts.startTime,
      endTime: ts.endTime,
      participantLimit: ts.participantLimit,
      count: ts.count,
      slotDate: {
        id: ts.slotDate_id,
        date: ts.slotDate_date,
        location: {
          id: ts.location_id,
          name: ts.location_name
        }
      }
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error creating time slot:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create time slot',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    )
  }
}
