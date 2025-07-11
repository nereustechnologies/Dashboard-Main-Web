// PUT /api/admin/timeslots/price
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  try {
    const admin = await verifyAuth(req)
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { timeSlotId, price } = await req.json()

    if (!timeSlotId || price == null) {
      return NextResponse.json({ error: 'Missing timeSlotId or price' }, { status: 400 })
    }

    const updated = await prisma.timeSlot.update({
      where: { id: timeSlotId },
      data: { price },
    })

    return NextResponse.json({ message: 'Price updated', updated })
  } catch (err) {
    console.error('Error updating price:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
