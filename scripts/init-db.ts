import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database initialization...")

  try {
    // Create admin user with hashed password
    const hashedPassword = await hash("password", 10)
    await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      },
    })
    console.log("Admin user created: admin@example.com")

    // Create a tester user for demonstration
    await prisma.user.upsert({
      where: { email: "tester@example.com" },
      update: {},
      create: {
        name: "Test User",
        email: "tester@example.com",
        password: hashedPassword,
        role: "tester",
        adminId: (await prisma.user.findUnique({ where: { email: "admin@example.com" } }))?.id,
      },
    })
    console.log("Tester user created: tester@example.com")

    console.log("Database initialization completed successfully!")
  } catch (error) {
    console.error("Error during database initialization:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

