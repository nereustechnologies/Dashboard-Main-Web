"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Battery, Bluetooth, CheckCircle, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useBluetooth } from "@/hooks/use-bluetooth"

// UUIDs for the IMU service and characteristic (from backend)
const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214"
const CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214"

interface Sensor {
  id: string
  name: string
  battery: number
  connected: boolean
  device: BluetoothDevice | null
  characteristic: BluetoothRemoteGATTCharacteristic | null
}

interface SensorConnectProps {
  onConnect: () => void
  customerData: any
}

export default function SensorConnect({ onConnect, customerData }: SensorConnectProps) {
  const { sensors, connectSensors, isConnecting, connectionError, anySensorConnected } = useBluetooth()

  const handleConnect = async () => {
    await connectSensors()
  }

  const getBatteryIcon = (level: number) => {
    if (level >= 80) return <Battery size={16} className="text-green-500" />
    if (level >= 40) return <Battery size={16} className="text-yellow-500" />
    return <Battery size={16} className="text-red-500" />
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Bluetooth size={20} className="text-primary" />
          Connect IMU Sensors
        </h3>
        <p className="text-sm text-gray-400">
          Please connect the IMU sensors to the customer. Click "Connect to Sensors" to pair each device one by one.
        </p>
      </div>

      {connectionError && !isConnecting && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        {sensors.map((sensor) => (
          <Card
            key={sensor.id}
            className={`border ${sensor.connected ? "border-green-500" : "border-gray-700"} bg-secondary`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{sensor.name}</span>
                <Badge
                  variant={sensor.connected ? "default" : "outline"}
                  className={sensor.connected ? "bg-green-500" : ""}
                >
                  {sensor.connected ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle size={12} />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <AlertCircle size={12} />
                      Disconnected
                    </span>
                  )}
                </Badge>
              </div>
              {sensor.connected && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm flex items-center gap-1">
                    {getBatteryIcon(sensor.battery)}
                    Battery:
                  </span>
                  <Progress value={sensor.battery} className="h-2" />
                  <span className="text-sm">{sensor.battery}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isConnecting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Following browser prompts to connect sensors...</span>
          </div>
          <Progress value={undefined} className="h-2" />
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()} className="border-gray-700">
          Back
        </Button>

        {!anySensorConnected && !isConnecting ? (
          <Button onClick={handleConnect} disabled={isConnecting} className="bg-primary text-black hover:bg-primary/90">
            {isConnecting ? "Connecting..." : "Connect to Sensors"}
          </Button>
        ) : (
          <Button onClick={onConnect} disabled={isConnecting} className="bg-primary text-black hover:bg-primary/90">
            Next: Start Testing
          </Button>
        )}
      </div>
    </div>
  )
}
