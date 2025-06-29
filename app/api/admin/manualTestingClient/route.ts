// ============================
// 📦 BACKEND: /app/api/manual-client/route.ts
// ============================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAuth(req)
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      fullName,
      age,
      gender,
      email,
      whatsapp,
      medicalHistory,
      whyMove,
      fitnessGoal,
      reason
    } = body

    if (!fullName || !age || !gender || !email || !whatsapp || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userCount = await prisma.client.count()
    const uniqueId = `NT-${(userCount + 1).toString().padStart(4, "0")}`

    const createdClient = await prisma.client.create({
      data: {
        fullName,
        age,
        gender,
        email,
        whatsapp,
        medicalHistory,
        whyMove,
        fitnessGoal,
        uniqueId
      }
    })

    await prisma.manualClientTest.create({
      data: {
        clientId: createdClient.id,
        reason
      }
    })

    return NextResponse.json({ message: 'Manual client added successfully', client: createdClient })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
