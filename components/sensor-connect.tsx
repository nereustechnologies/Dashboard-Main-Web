"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Battery, Bluetooth, CheckCircle, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  const [connecting, setConnecting] = useState(true)
  const [overallConnected, setOverallConnected] = useState(true) // Renamed from 'connected' to avoid conflict
  const [progress, setProgress] = useState(0)
  const [sensors, setSensors] = useState<Sensor[]>(
    [
      { id: "LL", name: "Left Lower", battery: 0, connected: false, device: null, characteristic: null },
      { id: "LU", name: "Left Upper", battery: 0, connected: false, device: null, characteristic: null },
      { id: "RL", name: "Right Lower", battery: 0, connected: false, device: null, characteristic: null },
      { id: "RU", name: "Right Upper", battery: 0, connected: false, device: null, characteristic: null },
    ],
  )
  const [bluetoothSupported, setBluetoothSupported] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof navigator !== "undefined" && !navigator.bluetooth) {
      setBluetoothSupported(false)
      setConnectionError("Web Bluetooth is not supported in your browser. Using mock data.")
    }
  }, [])

  const runMockConnection = () => {
    setConnecting(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setConnecting(false)
          setOverallConnected(true)
          setSensors((prevSensors) =>
            prevSensors.map((sensor) => ({
              ...sensor,
              battery: Math.floor(Math.random() * 30) + 70, // 70-100%
              connected: true,
              device: null, // Mock connection has no real device
              characteristic: null,
            })),
          )
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const handleConnect = async () => {
    if (!bluetoothSupported) {
      runMockConnection()
      return
    }

    setConnecting(true)
    setConnectionError(null)
    setProgress(0)
    let connectedCount = 0
    const updatedSensors = [...sensors]

    for (let i = 0; i < updatedSensors.length; i++) {
      if (updatedSensors[i].connected) {
        // Already connected from a previous attempt in this session
        connectedCount++
        setProgress((i + 1) * (100 / updatedSensors.length))
        continue
      }
      try {
        console.log(`Attempting to connect ${updatedSensors[i].name}...`)
        alert(
          `Please select the IMU device for: ${updatedSensors[i].name}. If you don't have 4 devices, you can cancel remaining prompts.`,
        )

  
        const device = await navigator.bluetooth.requestDevice({
          // Try to filter by name if possible, otherwise accept all
          // Add filters if you know the names of your devices
          // filters: [{ namePrefix: 'IMU' }],  // Uncomment and customize if you know the device name prefix
          
          acceptAllDevices: true,
          
          // Include more common service UUIDs to ensure broader device compatibility
          optionalServices: [
            // Original IMU service
            SERVICE_UUID,
            // Standard BLE services
            '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
            '0000180a-0000-1000-8000-00805f9b34fb', // Device Information Service
            '0000180d-0000-1000-8000-00805f9b34fb', // Heart Rate Service
            // Add more services as needed for your devices
          ]
        })

        if (!device.gatt) {
          throw new Error("GATT server not available.")
        }

        console.log(`Device selected: ${device.name || "Unknown"} (${device.id})`)
        const server = await device.gatt.connect()
        
        // More robust service discovery
        let service;
        let characteristic;
        try {
          // Try the primary IMU service first
          service = await server.getPrimaryService(SERVICE_UUID)
          characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID)
        } catch (serviceError) {
          console.log(`Specific IMU service/characteristic not found, exploring available services...`)
          
          // Get all services
          const services = await server.getPrimaryServices()
          console.log(`Found ${services.length} services on device ${device.name || "Unknown"}`)
          
          if (services.length === 0) {
            throw new Error("No services found on this device.")
          }
          
          // Use the first service and characteristic available as fallback
          service = services[0]
          console.log(`Using service: ${service.uuid}`)
          
          const characteristics = await service.getCharacteristics()
          if (characteristics.length === 0) {
            throw new Error("No characteristics found in the selected service.")
          }
          
          // Find a characteristic with notify property if possible
          characteristic = characteristics.find(c => c.properties.notify) || characteristics[0]
          console.log(`Using characteristic: ${characteristic.uuid} (Notify: ${characteristic.properties.notify})`)
        }

        // Capture sensor details and characteristic for use in event listeners' closures
        const sensorForEvents = updatedSensors[i];
        const gattCharacteristic = characteristic;

        updatedSensors[i] = {
          ...updatedSensors[i],
          connected: true,
          device: device,
          characteristic: gattCharacteristic, // Store the characteristic instance
          battery: Math.floor(Math.random() * 30) + 70, // Mock battery for now
        }
        connectedCount++

        // Log device UUID
        console.log(`${sensorForEvents.name} - Device ID (UUID): ${device.id}`)

        // Log battery percentage (currently mocked)
        console.log(`${sensorForEvents.name} - Battery: ${updatedSensors[i].battery}%`)

        // Start notifications and listen for data
        if (gattCharacteristic.properties.notify) {
          await gattCharacteristic.startNotifications()
          console.log(`Notifications started for ${sensorForEvents.name} on characteristic: ${gattCharacteristic.uuid}`)
          gattCharacteristic.addEventListener("characteristicvaluechanged", (event) => {
            const value = (event.target as BluetoothRemoteGATTCharacteristic).value
            if (!value) return;
            
            // Enhanced data parsing to handle different formats
            try {
              // Try to decode as text first
              const dataString = new TextDecoder().decode(value)
              console.log(`Data from ${sensorForEvents.name} (${gattCharacteristic.uuid}) - Text:`, dataString)
              
              // If it looks like JSON, parse it
              if (dataString.trim().startsWith('{') || dataString.trim().startsWith('[')) {
                try {
                  const jsonData = JSON.parse(dataString)
                  console.log(`JSON data:`, jsonData)
                } catch (e) {
                  // Not valid JSON, already logged as string
                }
              }
            } catch (e) {
              // If text decoding fails, process as binary data
              // Convert DataView to array for easier logging
              const dataArray = new Uint8Array(value.buffer)
              console.log(`Data from ${sensorForEvents.name} (${gattCharacteristic.uuid}) - Binary:`, 
                Array.from(dataArray).map(b => b.toString(16).padStart(2, '0')).join(' '))
            }
          })
        } else if (gattCharacteristic.properties.read) {
          // If notify isn't supported, try periodic reading
          console.log(`Notifications not supported for ${sensorForEvents.name}. Setting up periodic reads.`)
          
          // Setup periodic reading every second
          const readInterval = setInterval(async () => {
            try {
              if (device.gatt?.connected) {
                const value = await gattCharacteristic.readValue()
                console.log(`Read value from ${sensorForEvents.name}:`, value)
              } else {
                clearInterval(readInterval)
              }
            } catch (e) {
              console.error(`Error reading from ${sensorForEvents.name}:`, e)
              clearInterval(readInterval)
            }
          }, 1000)
          
          // Store the interval ID somewhere to clear it on disconnect
          // For simplicity in this example, we're using a global-like approach
          if (!window.readIntervals) window.readIntervals = {}
          window.readIntervals[sensorForEvents.id] = readInterval
          
        } else {
          console.log(`Neither notify nor read supported for ${sensorForEvents.name} characteristic.`)
        }


        device.addEventListener("gattserverdisconnected", () => {
          console.log(`${sensorForEvents.name} disconnected.`)

          // Clear any read intervals
          if (window.readIntervals && window.readIntervals[sensorForEvents.id]) {
            clearInterval(window.readIntervals[sensorForEvents.id])
            delete window.readIntervals[sensorForEvents.id]
          }

          // Attempt to stop notifications if the characteristic was notifying
          if (gattCharacteristic && gattCharacteristic.properties.notify) {
            gattCharacteristic.stopNotifications()
              .then(() => {
                console.log(`Notifications stopped for ${sensorForEvents.name}.`);
              })
              .catch(err => {
                console.error(`Error stopping notifications for ${sensorForEvents.name}: ${err.message}`);
              });
            // Note: To properly remove 'characteristicvaluechanged', the listener function
            // needs to be a named function or stored, then passed to removeEventListener.
            // Anonymous functions like the one above cannot be easily removed this way.
          }

          setSensors((prevSensors) => {
            const newSensors = prevSensors.map((s) =>
              s.id === sensorForEvents.id ? { ...s, connected: false, device: null, characteristic: null } : s,
            )
            // Determine if any sensors are still connected based on the *new* state
            const anyStillConnected = newSensors.some((s) => s.connected)
            if (!anyStillConnected) {
              setOverallConnected(false)
            }
            return newSensors
          })
        })

        console.log(`${sensorForEvents.name} connected successfully.`)
      } catch (error: any) {
        console.error(`Error connecting ${updatedSensors[i].name}:`, error)
        if (error.name === "NotFoundError" || error.name === "AbortError") {
          alert(`Connection cancelled for ${updatedSensors[i].name}. You can proceed with fewer sensors or try again.`)
        } else {
          setConnectionError(`Failed to connect ${updatedSensors[i].name}: ${error.message}.`)
        }
        // Stop trying to connect more if user cancels or an error occurs for one
        // Or, allow continuing: comment out the break if you want to try all 4 regardless of individual failures/cancellations
        // break;
      }
      setProgress(Math.round(((i + 1) / updatedSensors.length) * 100))
    }

    setSensors(updatedSensors)
    if (connectedCount > 0) {
      setOverallConnected(true)
    } else {
      setOverallConnected(false)
      // If no real sensors were connected, fall back to mock.
      setConnectionError("No real sensors connected. Simulating connection for testing.")
      runMockConnection()
      return // runMockConnection will handle setConnecting(false)
    }
    setConnecting(false)
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
          Please connect the IMU sensors to the customer. Click "Connect to Sensors" to pair each device.
        </p>
      </div>

      {!bluetoothSupported && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Web Bluetooth Not Supported</AlertTitle>
          <AlertDescription>
            Your browser does not support Web Bluetooth. Please use a compatible browser like Chrome or Edge.
            Mock sensor data will be used for demonstration.
          </AlertDescription>
        </Alert>
      )}
      {connectionError && !connecting && (
        <Alert variant="warning">
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

      {connecting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Connecting to sensors...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()} className="border-gray-700">
          Back
        </Button>

        {!overallConnected ? (
          <Button onClick={handleConnect} disabled={connecting} className="bg-primary text-black hover:bg-primary/90">
            {connecting ? "Connecting..." : "Connect to Sensors"}
          </Button>
        ) : (
          <Button onClick={onConnect} className="bg-primary text-black hover:bg-primary/90">
            Next: Start Testing
          </Button>
        )}
      </div>
    </div>
  )
}
