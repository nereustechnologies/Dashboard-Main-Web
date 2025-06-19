import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { verifyAuth } from "@/lib/auth"



type Location = {
  id: string
  name: string
}

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
    const locations = await prisma.$queryRaw<Location[]>`
      SELECT * FROM "Location" ORDER BY name ASC;
    `
    return NextResponse.json(locations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
