import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 })
  }

  const user = await verifyAuth(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    await prisma.booking.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ Deletion error:", err)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
