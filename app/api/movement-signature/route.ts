import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { customerId, identity, enduranceRating, mobilityRating, strengthRating } = await request.json()

    if (!customerId || !identity) {
      return NextResponse.json({ error: "customerId and identity are required" }, { status: 400 })
    }

    // Validate ratings are numbers between 1-10 if provided
    const validateRating = (rating: any, fieldName: string) => {
      if (rating !== undefined) {
        const num = Number(rating)
        if (isNaN(num) || num < 1 || num > 10) {
          throw new Error(`${fieldName} must be a number between 1 and 10`)
        }
        return num
      }
      return undefined
    }

    const validatedEnduranceRating = validateRating(enduranceRating, "enduranceRating")
    const validatedMobilityRating = validateRating(mobilityRating, "mobilityRating")
    const validatedStrengthRating = validateRating(strengthRating, "strengthRating")

    const record = await prisma.movementSignature.upsert({
      where: { customerId },
      create: {
        customerId,
        identity,
        ...(validatedEnduranceRating !== undefined && { enduranceRating: validatedEnduranceRating }),
        ...(validatedMobilityRating !== undefined && { mobilityRating: validatedMobilityRating }),
        ...(validatedStrengthRating !== undefined && { strengthRating: validatedStrengthRating }),
      },
      update: {
        identity,
        ...(validatedEnduranceRating !== undefined && { enduranceRating: validatedEnduranceRating }),
        ...(validatedMobilityRating !== undefined && { mobilityRating: validatedMobilityRating }),
        ...(validatedStrengthRating !== undefined && { strengthRating: validatedStrengthRating }),
      },
    })

    return NextResponse.json({ movementSignature: record })
  } catch (err) {
    console.error(err)
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 })
    }

    const movementSignature = await prisma.movementSignature.findUnique({
      where: { customerId },
    })

    if (!movementSignature) {
      return NextResponse.json({ error: "Movement signature not found" }, { status: 404 })
    }

    return NextResponse.json({ movementSignature })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
} 