"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, RefreshCw, AlertCircle, Bluetooth, Database } from "lucide-react"

interface SensorDataViewerProps {
  exerciseId: string
  customerId: string
}

export default function SensorDataViewer({ exerciseId, customerId }: SensorDataViewerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sensorsReady, setSensorsReady] = useState(false)

  const fetchSensorData = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      // Fetch sensor data from API (but don't display it)
      const response = await fetch(`/api/sensor-data/${exerciseId}?customerId=${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch sensor data")
      }

      // Just mark that data is ready for download
      setSensorsReady(true)
    } catch (error) {
      console.error("Error fetching sensor data:", error)
      setError(error instanceof Error ? error.message : "An error occurred while fetching sensor data")
    } finally {
      setLoading(false)
    }
  }

  const downloadSensorData = async (sensorId: string) => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      // Fetch sensor data from API
      const response = await fetch(`/api/sensor-data/${exerciseId}?customerId=${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch sensor data")
      }

      const data = await response.json()
      const sensors = data.sensors

      if (!sensors || sensors.length === 0) {
        throw new Error("No sensor data available")
      }

      // If sensorId is "ALL", download all sensors, otherwise just the specified one
      const sensorsToDownload = sensorId === "ALL" ? sensors : sensors.filter((s: any) => s.id === sensorId)

      for (let i = 0; i < sensorsToDownload.length; i++) {
        const sensor = sensorsToDownload[i]
        const sensorData = sensor.data

        if (!sensorData || sensorData.length === 0) {
          continue
        }

        // Create CSV content
        const headers = ["timestamp", "accX", "accY", "accZ", "gyrX", "gyrY", "gyrZ", "magX", "magY", "magZ"]
        let csvContent = headers.join(",") + "\n"

        sensorData.forEach((row: any) => {
          const values = headers.map((header: string) => {
            const value = row[header] || ""
            // Escape commas and quotes
            return `"${value.toString().replace(/"/g, '""')}"`
          })
          csvContent += values.join(",") + "\n"
        })

        // Create and download the file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute(
          "download",
          `${exerciseId}_${sensor.id}_sensor_data_${new Date().toISOString().split("T")[0]}.csv`,
        )

        // Add a small delay between downloads to prevent browser blocking
        setTimeout(() => {
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }, 200 * i)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error downloading sensor data:", error)
      setError(error instanceof Error ? error.message : "An error occurred while downloading sensor data")
      setLoading(false)
    }
  }

  return (
    <Card className="border-[#00D4EF]/20 bg-black">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-[#00D4EF] flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sensor Data Export
        </CardTitle>
        <Button onClick={fetchSensorData} disabled={loading} className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <Bluetooth className="mr-2 h-4 w-4" />
              Prepare Sensor Data
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 mb-4 text-sm bg-red-500/20 border border-red-500 rounded text-red-500">
            <AlertCircle className="inline-block mr-2 h-4 w-4" />
            {error}
          </div>
        )}

        {sensorsReady ? (
          <div className="space-y-4">
            <p className="text-center">Sensor data is ready for download.</p>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => downloadSensorData("LL")}
                variant="outline"
                className="border-green-500 text-green-500"
              >
                <Download size={16} className="mr-2" />
                Left Lower Sensor
              </Button>

              <Button
                onClick={() => downloadSensorData("LU")}
                variant="outline"
                className="border-green-500 text-green-500"
              >
                <Download size={16} className="mr-2" />
                Left Upper Sensor
              </Button>

              <Button
                onClick={() => downloadSensorData("RL")}
                variant="outline"
                className="border-green-500 text-green-500"
              >
                <Download size={16} className="mr-2" />
                Right Lower Sensor
              </Button>

              <Button
                onClick={() => downloadSensorData("RU")}
                variant="outline"
                className="border-green-500 text-green-500"
              >
                <Download size={16} className="mr-2" />
                Right Upper Sensor
              </Button>
            </div>

            <div className="mt-4">
              <Button
                onClick={() => downloadSensorData("ALL")}
                className="w-full bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black"
              >
                <Download size={16} className="mr-2" />
                Download All Sensor Data
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Click "Prepare Sensor Data" to fetch and prepare the sensor data for download.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

