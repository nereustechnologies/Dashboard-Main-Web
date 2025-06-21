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

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAuth(req)
              if (!admin) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
              }
          
              // Check if user is an admin
              if (admin.role !== "admin") {
                return NextResponse.json({ error: "Only admins can access this endpoint" }, { status: 403 })
              }

    const { name, address, link } = await req.json()

    if (!name || !address) {
      return NextResponse.json({ error: "Name and address are required" }, { status: 400 })
    }

    const location = await prisma.location.create({
      data: {
        name,
        address,
        link,
      },
    })

    return NextResponse.json(location, { status: 201 })
  } catch (err) {
    console.error("Error creating location:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}