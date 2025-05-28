import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { hash } from "bcrypt"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const admin = await verifyAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    if (admin.role !== "admin") {
      return NextResponse.json({ error: "Only admins can register testers" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password } = body

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash the password with bcrypt
    const hashedPassword = await hash(password, 10)

    // Create the tester user with reference to the admin
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "tester",
        adminId: admin.id, // Associate tester with the admin who created them
      },
    })

    // Return the user without the password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: "Tester registered successfully",
        user: userWithoutPassword,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Tester registration error:", error)
    return NextResponse.json({ error: "An error occurred during tester registration" }, { status: 500 })
  }
}

