"use client"

import { useState } from "react" // Added useState
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Battery, Bluetooth, CheckCircle, AlertCircle, Info, X } from "lucide-react" // Added X icon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useBluetooth, IMUData } from "@/hooks/use-bluetooth" // IMUData might be needed if we pass sensor.latestData around with explicit typing

interface SensorConnectProps {
  onConnect: () => void
  customerData: any
}

export default function SensorConnect({ onConnect, customerData }: SensorConnectProps) {
  const { sensors, connectSensor, disconnectSensor, isConnecting, connectionError, anySensorConnected, setConnectionError } = useBluetooth()
  const [showDataCard, setShowDataCard] = useState<Record<string, boolean>>({}); // State to manage individual card visibility

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
          <AlertDescription>
            {connectionError}
            <Button variant="link" onClick={() => setConnectionError(null)} className="p-0 h-auto ml-2 text-white">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        {sensors.map((sensor) => (
          <Card
            key={sensor.id}
            className={`border ${
              sensor.connected ? "border-green-500" : "border-gray-700"
            } bg-secondary transition-all duration-300`}
          >
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{sensor.name}</span>
                  <Badge
                    variant={sensor.connected ? "default" : "outline"}
                    className={`${
                      sensor.connected ? "bg-green-500" : ""
                    } transition-colors duration-300`}
                  >
                    {sensor.isConnecting ? (
                      <span className="flex items-center gap-1">
                        <svg
                          className="animate-spin h-3 w-3 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Connecting...
                      </span>
                    ) : sensor.connected ? (
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
              </div>
              <div className="mt-4 space-y-2">
                {!sensor.connected && !sensor.isConnecting && (
                  <Button
                    onClick={() => connectSensor(sensor.id)}
                    className="w-full bg-primary text-black hover:bg-primary/90"
                    disabled={isConnecting}
                  >
                    Connect
                  </Button>
                )}

                {sensor.isConnecting && (
                  <Button
                    onClick={() => disconnectSensor(sensor.id)}
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
                  >
                    Cancel Connecting
                  </Button>
                )}

                {sensor.connected && !sensor.isConnecting && (
                  <>
                    <Button
                      onClick={() => disconnectSensor(sensor.id)}
                      className="w-full bg-destructive text-white hover:bg-destructive/90"
                    >
                      Disconnect
                    </Button>

                    {/* Data display card - conditionally rendered */}
                    {showDataCard[sensor.id] && (
                      <Card className="mt-2 p-2.5 border border-gray-600 bg-gray-800 text-xs shadow-lg">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-semibold text-gray-200">Live Sensor Data</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowDataCard(prev => ({ ...prev, [sensor.id]: false }))}
                            className="h-5 w-5 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
                          >
                            <X size={12} />
                          </Button>
                        </div>
                        {sensor.latestData ? (
                          <pre className="whitespace-pre-wrap break-all text-gray-300 text-[10px] leading-tight font-mono">
                            {`Acc: X:${sensor.latestData.accX.toFixed(1)} Y:${sensor.latestData.accY.toFixed(1)} Z:${sensor.latestData.accZ.toFixed(1)}\n`}
                            {`Gyr: X:${sensor.latestData.gyrX.toFixed(1)} Y:${sensor.latestData.gyrY.toFixed(1)} Z:${sensor.latestData.gyrZ.toFixed(1)}\n`}
                            {`Mag: X:${sensor.latestData.magX.toFixed(1)} Y:${sensor.latestData.magY.toFixed(1)} Z:${sensor.latestData.magZ.toFixed(1)}`}
                          </pre>
                        ) : (
                          <p className="text-gray-400 text-[10px]">No data received yet. Waiting for sensor...</p>
                        )}
                      </Card>
                    )}

                    <Button
                      onClick={() => {
                        setShowDataCard(prev => ({ ...prev, [sensor.id]: !prev[sensor.id] }));
                        if (sensor.latestData) {
                           console.log(`Inspecting data for ${sensor.name}:`, sensor.latestData);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-600 hover:bg-gray-700"
                    >
                      {showDataCard[sensor.id] ? "Hide Incoming Data" : "Check Incoming Data"}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => window.history.back()} className="border-gray-700">
          Back
        </Button>
        <Button
          onClick={onConnect}
          disabled={!anySensorConnected || isConnecting}
          className="bg-primary text-black hover:bg-primary/90"
        >
          Next: Start Testing
        </Button>
      </div>
    </div>
  )
}
