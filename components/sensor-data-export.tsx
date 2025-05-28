"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Download } from "lucide-react"
import { downloadCSV, downloadSensorDataAsCSV } from "@/lib/exercise-utils"

interface SensorDataExportProps {
  activeExercise: string
  customerData: any
  sensorData: { [key: string]: any[] }
}

export function SensorDataExport({ activeExercise, customerData, sensorData }: SensorDataExportProps) {
  return (
    <Card className="border-[#00D4EF]/20 bg-black">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-[#00D4EF] flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sensor Data Export
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="mb-4">Sensor data is available for download as CSV files.</p>
          <Button
            onClick={() => downloadCSV(activeExercise, customerData)}
            className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black"
          >
            <Download size={16} className="mr-2" />
            Download Exercise Data (CSV)
          </Button>
        </div>

        <div className="mt-6">
          <h3 className="text-lg mb-4 text-center">Sensor Data</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => downloadSensorDataAsCSV(activeExercise, sensorData)}
              variant="outline"
              className="border-green-500 text-green-500"
            >
              <Download size={16} className="mr-2" />
              Download Sensor Data (CSV)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
