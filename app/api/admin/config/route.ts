import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { verifyAuth } from "@/lib/auth"



type Config = {
  id: string
  price: number
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
    const result = await prisma.$queryRaw<Config[]>`
      SELECT * FROM "Config" LIMIT 1;
    `
    const config = result[0] || null
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching config:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { price } = body

    const existingConfig = await prisma.$queryRaw<Config[]>`
      SELECT * FROM "Config" LIMIT 1;
    `
    const config = existingConfig[0]

    let updatedConfig: Config

    if (config) {
      await prisma.$executeRaw`
        UPDATE "Config" SET price = ${price} WHERE id = ${config.id};
      `
      const result = await prisma.$queryRaw<Config[]>`
        SELECT * FROM "Config" WHERE id = ${config.id};
      `
      updatedConfig = result[0]
    } else {
      const result = await prisma.$queryRaw<Config[]>`
        INSERT INTO "Config" (price) VALUES (${price}) RETURNING *;
      `
      updatedConfig = result[0]
    }

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error('Error updating config:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
