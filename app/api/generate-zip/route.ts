import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import JSZip from "jszip"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import fs from "fs"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { customerId, customerName, exerciseData, date } = body

    if (!customerId || !exerciseData) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Create a new zip file
    const zip = new JSZip()

    // Process each exercise with proper column headers
    for (const [exerciseId, data] of Object.entries(exerciseData)) {
      // Create a folder for each exercise
      const exerciseFolder = zip.folder(exerciseId)
      if (!exerciseFolder) continue

      // Define headers based on exercise type
      let headers: string[] = []
      let actionCsv = ""

      if (exerciseId === "knee_flexion" || exerciseId === "knee_to_wall") {
        headers = ["Timestamp", "Knee Angle Left (°)", "Knee Angle Right (°)", "Leg Used", "Phase Label", "Rep Count"]
      } else if (exerciseId === "lunge_stretch") {
        headers = [
          "Timestamp",
          "Hip Flexion Angle (°)",
          "Knee Flexion Angle Left (°)",
          "Knee Flexion Angle Right (°)",
          "Leg Used",
          "Phase Label",
          "Hold Duration (s)",
          "Reps",
        ]
      } else if (exerciseId === "squats") {
        headers = [
          "Timestamp",
          "Knee Angle Left (°)",
          "Knee Angle Right (°)",
          "Hip Angle (°)",
          "Phase Label",
          "Rep Count",
        ]
      } else if (exerciseId === "lunges") {
        headers = [
          "Timestamp",
          "Knee Angle Left (°)",
          "Knee Angle Right (°)",
          "Hip Angle (°)",
          "Leg Used",
          "Phase Label",
          "Rep Count",
        ]
      } else if (exerciseId === "plank_hold") {
        headers = ["Timestamp", "Hip Angle (°)", "Phase Label", "Hold Duration (s)"]
      } else if (exerciseId === "stepUp") {
        headers = [
        "Timestamp",
        "Knee Angle Left",
        "Knee Angle Right",
        "Phase Label",
        "Rep Count",
      ]
      
      } else {
        // Default format for other exercises
        headers = ["Timestamp", "Action", "Leg", "Rep Count"]
      }

      // Create CSV header
      actionCsv = headers.join(",") + "\n"

      // Convert action data to the appropriate CSV structure
      const actionData = data as any[]
      if (actionData.length > 0) {
        // Create proper CSV rows using the headers
        actionData.forEach((row) => {
          const rowValues = headers.map((header) => {
            const normalizedHeader = header.replace(/\s?$$.*$$/, "").trim()
            const value = row[normalizedHeader] || row[camelCase(normalizedHeader)] || ""
            return `"${value}"`
          })
          actionCsv += rowValues.join(",") + "\n"
        })

        // Add the CSV file to the exercise folder
        exerciseFolder.file("actions.csv", actionCsv)
      }

      // Generate sensor data for this exercise with proper headers
      const sensorHeaders = ["timestamp", "accX", "accY", "accZ", "gyrX", "gyrY", "gyrZ", "magX", "magY", "magZ"]

      // Generate sensor data for each of the 4 sensors
      const sensors = ["leftLower", "leftUpper", "rightLower", "rightUpper"]
      const sensorNames = ["Left Lower", "Left Upper", "Right Lower", "Right Upper"]

      for (let i = 0; i < sensors.length; i++) {
        const sensorData = generateMockSensorData(20)
        let sensorCsv = sensorHeaders.join(",") + "\n"
        sensorData.forEach((row) => {
          const rowValues = sensorHeaders.map((header) => `"${row[header as keyof typeof row]}"`)
          sensorCsv += rowValues.join(",") + "\n"
        })

        // Add the sensor CSV to the exercise folder
        exerciseFolder.file(`sensor_data_${sensors[i]}.csv`, sensorCsv)
      }
    }

    // Generate the zip file
    const zipContent = await zip.generateAsync({ type: "nodebuffer" })

    // Create a unique ID for the zip file
    const zipId = uuidv4()
    const sanitizedName = (customerName || "customer").replace(/[^a-z0-9]/gi, "_").toLowerCase()
    const filename = `${sanitizedName}_${date || new Date().toISOString().split("T")[0]}_${zipId}.zip`

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "uploads")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const filePath = path.join(uploadsDir, filename)
    fs.writeFileSync(filePath, zipContent)

    console.log(`Zip file created at: ${filePath}`)

    // Store the zip file information in the database
    const zipFile = await prisma.zipFile.create({
      data: {
        id: zipId,
        filename,
        filePath,
        testerId: user.id,
        customerId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Zip file generated successfully",
      zipFileId: zipId,
      filename,
    })
  } catch (error) {
    console.error("Error generating zip file:", error)
    return NextResponse.json({ error: "An error occurred while generating the zip file" }, { status: 500 })
  }
}

// Function to generate mock sensor data
function generateMockSensorData(count: number) {
  const data = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - (count - i) * 1000).toISOString()

    data.push({
      accX: (Math.random() * 0.2).toFixed(6),
      accY: (0.99 + Math.random() * 0.01).toFixed(6),
      accZ: (Math.random() * 0.1).toFixed(6),
      gyrX: (Math.random() * 2 - 1).toFixed(2),
      gyrY: (Math.random() * 2 - 2).toFixed(2),
      gyrZ: (Math.random() * 2 - 1).toFixed(2),
      magX: (Math.random() * 2 - 1).toFixed(2),
      magY: (Math.random() * 2 - 1).toFixed(2),
      magZ: (Math.random() * 2 - 1).toFixed(2),
      timestamp,
    })
  }

  return data
}

// Helper function to convert header to camelCase
function camelCase(str: string): string {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
}

