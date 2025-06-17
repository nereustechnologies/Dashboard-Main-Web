import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { customerId, identity, rating } = await request.json()

    if (!customerId || !identity || !rating) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const record = await prisma.movementSignature.upsert({
      where: { customerId },
      create: { customerId, identity, rating },
      update: { identity, rating },
    })

    return NextResponse.json({ movementSignature: record })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
} 