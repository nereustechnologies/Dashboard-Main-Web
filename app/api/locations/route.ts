// /app/api/locations/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(locations)
}
