// Force this route to use Node.js runtime
export const runtime = "nodejs"
// OR: export const dynamic = "force-dynamic"

import { NextResponse,NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const timeSlotId = context.params.id  // ✅ correct way



  try {
    const bookingCount = await prisma.booking.count({
      where: { timeSlotId }
    })

    const tempCount = await prisma.temp.count({
      where: { timeSlotId }
    })

    if (bookingCount > 0 || tempCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete: Time slot is used in a booking or temporary reservation." },
        { status: 400 }
      )
    }

    await prisma.timeSlot.delete({
      where: { id: timeSlotId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete timeslot:", error)
    return NextResponse.json(
      { error: "Server error while deleting time slot." },
      { status: 500 }
    )
  }
}
