import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

export async function GET(request: NextRequest, { params }: { params: { exerciseId: string } }) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exerciseId = params.exerciseId
    const url = new URL(request.url)
    const customerId = url.searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    // In a real app, this would fetch data from a database
    // For demo purposes, we'll generate mock data for each sensor

    // Define the sensors
    const sensors = [
      { id: "LL", name: "Left Lower", battery: 85, connected: true, data: [] },
      { id: "LU", name: "Left Upper", battery: 92, connected: true, data: [] },
      { id: "RL", name: "Right Lower", battery: 78, connected: true, data: [] },
      { id: "RU", name: "Right Upper", battery: 88, connected: true, data: [] },
    ]

    // Try to read data from CSV files if they exist
    const dataDir = path.join(process.cwd(), "data", user.id, customerId, exerciseId)

    // Generate mock data if files don't exist
    for (const sensor of sensors) {
      try {
        const filePath = path.join(dataDir, `${sensor.id}.csv`)

        if (fs.existsSync(filePath)) {
          // Read and parse the CSV file
          const fileContent = fs.readFileSync(filePath, "utf8")
          const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
          })

          sensor.data = records
        } else {
          // Generate mock data
          sensor.data = generateMockSensorData(20) as typeof sensor.data
        }
      } catch (error) {
        console.error(`Error reading sensor data for ${sensor.id}:`, error)
        // Fall back to mock data
        sensor.data = generateMockSensorData(20) as typeof sensor.data
      }
    }

    return NextResponse.json({ success: true, sensors })
  } catch (error) {
    console.error("Error fetching sensor data:", error)
    return NextResponse.json({ error: "An error occurred while fetching sensor data" }, { status: 500 })
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

