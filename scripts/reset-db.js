const { PrismaClient } = require("@prisma/client")
const { hash } = require("bcrypt")

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log("Starting database reset...")

  try {
    // Delete all data in reverse order of dependencies
    console.log("Deleting exercise data...")
    await prisma.exerciseData.deleteMany({})

    console.log("Deleting exercises...")
    await prisma.exercise.deleteMany({})

    console.log("Deleting test ratings...")
    await prisma.testRating.deleteMany({})

    console.log("Deleting tests...")
    await prisma.test.deleteMany({})

    console.log("Deleting customers...")
    await prisma.customer.deleteMany({})

    console.log("Deleting sensors...")
    await prisma.sensor.deleteMany({})

    console.log("Deleting users...")
    await prisma.user.deleteMany({})

    // Create admin user
    console.log("Creating admin user...")
    const hashedPassword = await hash("password", 10)

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      },
    })

    console.log("Database reset completed successfully!")
    console.log("Admin credentials:")
    console.log("Email: admin@example.com")
    console.log("Password: password")
  } catch (error) {
    console.error("Error resetting database:", error)
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()

