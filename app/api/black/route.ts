import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

// POST handler for database initialization
export async function POST(request: NextRequest) {
    try {
        // TODO: Add authentication check here
        // This should only be accessible by authorized administrators

        // Create admin user with hashed password
        const hashedPassword = await hash("password", 10); // Common password for all demo users
        // const adminUser = await prisma.user.upsert({
        //     where: { email: "admin@example.com" },
        //     update: {},
        //     create: {
        //         name: "Admin User",
        //         email: "admin@example.com",
        //         password: hashedPassword,
        //         role: "admin",
        //     },
        // });

        // // Create a tester user for demonstration
        // await prisma.user.upsert({
        //     where: { email: "tester@example.com" },
        //     update: {},
        //     create: {
        //         name: "Test User",
        //         email: "tester@example.com",
        //         password: hashedPassword,
        //         role: "tester",
        //         adminId: adminUser.id, // Associate tester with the created admin
        //     },
        // });

        // Create a doctor user for demonstration
        await prisma.user.upsert({
            where: { email: "doctor@example.com" },
            update: {},
            create: {
                name: "Doctor User",
                email: "doctor@example.com",
                password: hashedPassword, // Use the same hashed password for demo purposes
                role: "doctor",
                // adminId: adminUser.id, // Optional: Associate doctor with an admin if needed
            },
        });

        return NextResponse.json({ 
            success: true, 
            message: "Database initialized successfully with admin, tester, and doctor users." 
        });
    } catch (error) {
        console.error("Error during database initialization:", error);
        return NextResponse.json(
            { success: false, error: "Failed to initialize database" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// Optional: GET handler to check status
export async function GET() {
    return NextResponse.json({
        message: "Database initialization endpoint. Use POST to initialize."
    });
}