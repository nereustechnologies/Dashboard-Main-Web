"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Download } from "lucide-react"
import { formatMillisecondsToMMSS } from "@/lib/exercise-utils"

interface SensorDataPoint {
  timestamp: number;
  sample_index: number;
  left_thigh: {
    accX: number;
    accY: number;
    accZ: number;
    gyrX: number;
    gyrY: number;
    gyrZ: number;
    magX: number;
    magY: number;
    magZ: number;
  };
  left_shin: {
    accX: number;
    accY: number;
    accZ: number;
    gyrX: number;
    gyrY: number;
    gyrZ: number;
    magX: number;
    magY: number;
    magZ: number;
  };
  right_thigh: {
    accX: number;
    accY: number;
    accZ: number;
    gyrX: number;
    gyrY: number;
    gyrZ: number;
    magX: number;
    magY: number;
    magZ: number;
  };
  right_shin: {
    accX: number;
    accY: number;
    accZ: number;
    gyrX: number;
    gyrY: number;
    gyrZ: number;
    magX: number;
    magY: number;
    magZ: number;
  };
}

interface SensorDataExportProps {
  activeExercise: string
  customerData: any
  sensorData: SensorDataPoint[]
  recordedExerciseEvents: any[]
}

export function SensorDataExport({ activeExercise, customerData, sensorData, recordedExerciseEvents }: SensorDataExportProps) {
  const downloadSensorCategory = (category: keyof Omit<SensorDataPoint, 'timestamp' | 'sample_index'>) => {
    if (!sensorData || sensorData.length === 0) return;
    
    const categoryData = sensorData.map(data => ({
      timestamp: formatMillisecondsToMMSS(data.timestamp),
      sample_index: data.sample_index,
      ...data[category]
    }));

    const csvContent = [
      // Headers
      ['Timestamp', 'Sample Index', 'accX', 'accY', 'accZ', 'gyrX', 'gyrY', 'gyrZ', 'magX', 'magY', 'magZ'],
      // Data rows
      ...categoryData.map(row => [
        row.timestamp,
        row.sample_index,
        row.accX,
        row.accY,
        row.accZ,
        row.gyrX,
        row.gyrY,
        row.gyrZ,
        row.magX,
        row.magY,
        row.magZ
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeExercise}_${category}_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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
        </div>

        <div className="mt-6">
          <h3 className="text-lg mb-4 text-center">Sensor Data Categories</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => downloadSensorCategory('left_thigh')}
              variant="outline"
              className="border-blue-500 text-blue-500"
            >
              <Download size={16} className="mr-2" />
              Left Thigh Data
            </Button>
            <Button
              onClick={() => downloadSensorCategory('left_shin')}
              variant="outline"
              className="border-green-500 text-green-500"
            >
              <Download size={16} className="mr-2" />
              Left Shin Data
            </Button>
            <Button
              onClick={() => downloadSensorCategory('right_thigh')}
              variant="outline"
              className="border-yellow-500 text-yellow-500"
            >
              <Download size={16} className="mr-2" />
              Right Thigh Data
            </Button>
            <Button
              onClick={() => downloadSensorCategory('right_shin')}
              variant="outline"
              className="border-red-500 text-red-500"
            >
              <Download size={16} className="mr-2" />
              Right Shin Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
