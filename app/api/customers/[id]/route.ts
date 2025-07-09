import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customerId = request.nextUrl.pathname.split("/").pop() as string

    const customerInfo = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        // Include all tests with their exercises and ratings
        tests: {
          include: {
            exercises: {
              include: {
                assetFiles: {
                  select: {
                    id: true,
                    fileName: true,
                    fileType: true,
                    s3PathRaw: true,
                    s3PathProcessed: true,
                    status: true,
                    analysisResults: true,
                    createdAt: true,
                    updatedAt: true
                  }
                }
              }
            },
            ratings: true,
            tester: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        },
        // Include section evaluations
        sectionEvaluations: {
          orderBy: {
            createdAt: "desc"
          }
        },
        // Include training purposes
        trainingPurposes: {
          orderBy: {
            createdAt: "desc"
          }
        },
        // Include scores to beat
        ScoresToBeat: {
          orderBy: {
            createdAt: "desc"
          }
        },
        // Include movement signature
        movementSignature: true
      }
    })

    if (!customerInfo) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Also fetch related Client information if it exists
    const clientInfo = await prisma.client.findFirst({
      where: {
        fullName: customerInfo.name
      },
      include: {
        Booking: {
          include: {
            timeSlot: {
              include: {
                slotDate: {
                  include: {
                    location: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        },
        EmailLog: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    // Structure the response
    const response = {
      success: true,
      customer: {
        // Basic customer information
        id: customerInfo.id,
        name: customerInfo.name,
        age: customerInfo.age,
        gender: customerInfo.gender,
        height: customerInfo.height,
        weight: customerInfo.weight,
        sleepLevels: customerInfo.sleepLevels,
        activityLevel: customerInfo.activityLevel,
        calorieIntake: customerInfo.calorieIntake,
        mood: customerInfo.mood,
        uniqueId: customerInfo.UniqueId,
        createdAt: customerInfo.createdAt,
        updatedAt: customerInfo.updatedAt,
        
        // Related data
        tests: customerInfo.tests,
        sectionEvaluations: customerInfo.sectionEvaluations,
        trainingPurposes: customerInfo.trainingPurposes,
        scoresToBeat: customerInfo.ScoresToBeat,
        movementSignature: customerInfo.movementSignature,
        
        // Client information (if exists)
        client: clientInfo
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching customer information:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching customer information" },
      { status: 500 }
    )
  }
} 