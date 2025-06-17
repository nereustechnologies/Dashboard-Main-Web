import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { customerId, category, suggestions } = await request.json()

    if (!customerId || !category || !Array.isArray(suggestions)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const ops = suggestions.map((s: any) =>
      prisma.trainingPurpose.upsert({
        where: {
          customerId_category_slot: {
            customerId,
            category,
            slot: s.slot,
          },
        },
        create: {
          customerId,
          category,
          slot: s.slot,
          title: s.title,
          paragraph: s.paragraph,
        },
        update: {
          title: s.title,
          paragraph: s.paragraph,
        },
      }),
    )

    const results = await prisma.$transaction(ops)

    return NextResponse.json({ trainingPurpose: results })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
} 