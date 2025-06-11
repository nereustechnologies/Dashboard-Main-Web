"use client"

import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from "react"

const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
const CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"

export interface IMUData {
  accX: number
  accY: number
  accZ: number
  gyrX: number
  gyrY: number
  gyrZ: number
  magX: number
  magY: number
  magZ: number
}

export interface SensorDataPoint {
  timestamp: number
  sample_index: number
  left_thigh: IMUData
  left_shin: IMUData
  right_thigh: IMUData
  right_shin: IMUData
}

export interface Sensor {
  id: string
  name: string
  connected: boolean
  battery: number
  device: BluetoothDevice | null
  characteristic: BluetoothRemoteGATTCharacteristic | null
  latestData: IMUData | null
  notificationHandler: ((event: Event) => void) | null
  disconnectHandler: (() => void) | null
  isConnecting?: boolean
}

interface BluetoothContextType {
  sensors: Sensor[]
  connectSensor: (sensorId: string) => Promise<void>
  disconnectSensor: (sensorId: string) => Promise<void>
  isConnecting: boolean
  anySensorConnected: boolean
  connectionError: string | null
  setConnectionError: (error: string | null) => void
  sensorData: SensorDataPoint[]
  isRecording: boolean
  startRecording: (startTime: number) => void
  stopRecordingAndGetData: () => SensorDataPoint[]
  clearSensorData: () => void
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined)

function parseSensorPacket(dataStr: string): { imu: IMUData | null; battery: number | null } {
  const parsed: Partial<IMUData> = {}
  const keyMap: { [key: string]: keyof IMUData } = {
    AX: "accX",
    AY: "accY",
    AZ: "accZ",
    GX: "gyrX",
    GY: "gyrY",
    GZ: "gyrZ",
    MX: "magX",
    MY: "magY",
    MZ: "magZ",
  }
  const imuRegex = /([A-Z]{2}):\s*([-]?\d+(?:\.\d+)?)/g
  let match

  while ((match = imuRegex.exec(dataStr)) !== null) {
    const label = match[1]
    const value = parseFloat(match[2])
    if (label in keyMap) {
      // @ts-ignore
      parsed[keyMap[label] as keyof IMUData] = value
    }
  }

  const batteryMatch = dataStr.match(/Battery:\s*(\d+)/)
  let battery: number | null = null
  if (batteryMatch) {
    battery = parseInt(batteryMatch[1], 10)
  }

  const imuKeys: (keyof IMUData)[] = ["accX", "accY", "accZ", "gyrX", "gyrY", "gyrZ", "magX", "magY", "magZ"]
  const hasIMUData = imuKeys.some((key) => parsed[key] !== undefined)

  if (!hasIMUData) {
    return { imu: null, battery }
  }

  // Ensure a full IMUData object is returned to match the type, filling missing values with 0.
  const imu: IMUData = {
    accX: parsed.accX ?? 0,
    accY: parsed.accY ?? 0,
    accZ: parsed.accZ ?? 0,
    gyrX: parsed.gyrX ?? 0,
    gyrY: parsed.gyrY ?? 0,
    gyrZ: parsed.gyrZ ?? 0,
    magX: parsed.magX ?? 0,
    magY: parsed.magY ?? 0,
    magZ: parsed.magZ ?? 0,
  }

  return { imu, battery }
}

export function BluetoothProvider({ children }: { children: React.ReactNode }) {
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: "left_thigh",
      name: "Left Thigh (Upper)",
      battery: 0,
      connected: false,
      device: null,
      characteristic: null,
      latestData: null,
      notificationHandler: null,
      disconnectHandler: null,
    },
    {
      id: "left_shin",
      name: "Left Shin (Lower)",
      battery: 0,
      connected: false,
      device: null,
      characteristic: null,
      latestData: null,
      notificationHandler: null,
      disconnectHandler: null,
    },
    {
      id: "right_thigh",
      name: "Right Thigh (Upper)",
      battery: 0,
      connected: false,
      device: null,
      characteristic: null,
      latestData: null,
      notificationHandler: null,
      disconnectHandler: null,
    },
    {
      id: "right_shin",
      name: "Right Shin (Lower)",
      battery: 0,
      connected: false,
      device: null,
      characteristic: null,
      latestData: null,
      notificationHandler: null,
      disconnectHandler: null,
    },
  ])
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [sensorData, setSensorData] = useState<SensorDataPoint[]>([])
  const [isRecording, setIsRecording] = useState(false)

  const isRecordingRef = useRef(isRecording)

  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording])

  const exerciseStartTimeRef = useRef<number | null>(null)
  const sampleIndexRef = useRef(0)
  const sensorsRef = useRef(sensors)
  const sensorDataRef = useRef<SensorDataPoint[]>([])

  useEffect(() => {
    sensorsRef.current = sensors
  }, [sensors])

  const handleNotifications = useCallback(
    (event: Event, sensorId: string) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic
      const value = target.value
      if (!value) return

      const text = new TextDecoder().decode(value).trim()
      const { imu: parsedData, battery } = parseSensorPacket(text)

      if (parsedData) {
        setSensors((prev) =>
          prev.map((s) =>
            s.id === sensorId
              ? {
                  ...s,
                  latestData: parsedData,
                  ...(battery !== null && { battery }),
                }
              : s,
          ),
        )

        if (isRecordingRef.current && exerciseStartTimeRef.current) {
          const defaultImuData: IMUData = {
            accX: 0,
            accY: 0,
            accZ: 0,
            gyrX: 0,
            gyrY: 0,
            gyrZ: 0,
            magX: 0,
            magY: 0,
            magZ: 0,
          }
          const currentSensors = sensorsRef.current
          const finalDataPointWithDefaults: SensorDataPoint = {
            timestamp: Date.now() - exerciseStartTimeRef.current,
            sample_index: sampleIndexRef.current++,
            left_thigh:
              currentSensors.find((s) => s.id === "left_thigh" && s.connected)?.latestData || defaultImuData,
            left_shin:
              currentSensors.find((s) => s.id === "left_shin" && s.connected)?.latestData || defaultImuData,
            right_thigh:
              currentSensors.find((s) => s.id === "right_thigh" && s.connected)?.latestData || defaultImuData,
            right_shin:
              currentSensors.find((s) => s.id === "right_shin" && s.connected)?.latestData || defaultImuData,
          }

          // Update the just-received data
          const key = sensorId as keyof Omit<SensorDataPoint, "timestamp" | "sample_index">
          if (key in finalDataPointWithDefaults) {
            // @ts-ignore
            finalDataPointWithDefaults[key] = parsedData
          }

          setSensorData((prevData) => {
            const newData = [...prevData, finalDataPointWithDefaults]
            sensorDataRef.current = newData
            return newData
          })
        }
      }
    },
    [],
  )

  const setSensorState = useCallback((sensorId: string, updates: Partial<Sensor>) => {
    setSensors((prev) => prev.map((s) => (s.id === sensorId ? { ...s, ...updates } : s)))
  }, [])

  const connectSensor = useCallback(
    async (sensorId: string) => {
      if (typeof navigator === "undefined" || !navigator.bluetooth) {
        setConnectionError("Web Bluetooth is not supported in this browser. Please use Chrome or Edge.")
        return
      }

      const sensorToConnect = sensorsRef.current.find((s) => s.id === sensorId)
      if (!sensorToConnect) {
        setConnectionError(`Sensor with ID ${sensorId} not found.`)
        return
      }

      // Prevent multiple connection attempts
      if (sensorToConnect.isConnecting || sensorToConnect.connected) {
        return
      }

      setIsConnecting(true)
      setConnectionError(null)
      setSensorState(sensorId, { isConnecting: true, connected: false })

      try {
        let device = sensorToConnect.device
        if (!device) {
          alert(`Please select the Bluetooth device for: ${sensorToConnect.name}`)
          device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [SERVICE_UUID, "battery_service"],
          })
          setSensorState(sensorId, { device })
        }

        if (!device?.gatt) {
          throw new Error("GATT server not available.")
        }

        const server = await device.gatt.connect()
        const service = await server.getPrimaryService(SERVICE_UUID)
        const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID)

        const notificationHandler = (event: Event) => handleNotifications(event, sensorId)
        const disconnectHandler = () => {
          setSensorState(sensorId, {
            connected: false,
            characteristic: null,
            notificationHandler: null,
            disconnectHandler: null,
            isConnecting: false,
          })
          characteristic?.removeEventListener("characteristicvaluechanged", notificationHandler)
          device?.removeEventListener("gattserverdisconnected", disconnectHandler)
          const sensorName = sensorsRef.current.find(s => s.id === sensorId)?.name || sensorId;

          if (isRecordingRef.current) {
            console.log(`Sensor ${sensorName} disconnected during the test.`);
            alert(`Sensor ${sensorName} has disconnected during the test.`);
          } else {
            console.log(`Sensor ${sensorName} disconnected (not during an active test).`);
          }
        }

        if (characteristic.properties.notify) {
          await characteristic.startNotifications()
          characteristic.addEventListener("characteristicvaluechanged", notificationHandler)
          device.addEventListener("gattserverdisconnected", disconnectHandler)
        }

        setSensorState(sensorId, {
          connected: true,
          characteristic,
          notificationHandler,
          disconnectHandler,
          isConnecting: false,
        })
      } catch (error: any) {
        if (error.name === "NotFoundError" || error.name === "AbortError") {
          alert(`Device selection cancelled for ${sensorToConnect.name}.`)
        } else {
          setConnectionError(`Failed to connect ${sensorToConnect.name}: ${error.message}`)
        }
        setSensorState(sensorId, { isConnecting: false, connected: false })
      } finally {
        setIsConnecting(false)
      }
    },
    [handleNotifications, setSensorState],
  )

  const disconnectSensor = useCallback(async (sensorId: string) => {
    const sensorToDisconnect = sensorsRef.current.find((s) => s.id === sensorId)

    if (sensorToDisconnect?.device?.gatt?.connected) {
      const { characteristic, notificationHandler, disconnectHandler, device } = sensorToDisconnect

      if (characteristic && notificationHandler) {
        try {
          if (characteristic.properties.notify) {
            await characteristic.stopNotifications()
          }
          characteristic.removeEventListener("characteristicvaluechanged", notificationHandler)
        } catch (e) {
          console.error(`Error stopping notifications for ${sensorToDisconnect.name}`, e)
        }
      }

      if (disconnectHandler) {
        device.removeEventListener("gattserverdisconnected", disconnectHandler)
      }

      device.gatt?.disconnect()
    }

    setSensorState(sensorId, {
      connected: false,
      characteristic: null,
      notificationHandler: null,
      disconnectHandler: null,
      latestData: null,
    })
  }, [setSensorState])

  const disconnectAllSensors = useCallback(async () => {
    for (const sensor of sensorsRef.current) {
      if (sensor.connected) {
        await disconnectSensor(sensor.id)
      }
    }
  }, [disconnectSensor])

  useEffect(() => {
    return () => {
      disconnectAllSensors()
    }
  }, [disconnectAllSensors])

  const startRecording = (startTime: number) => {
    clearSensorData()
    exerciseStartTimeRef.current = startTime
    sampleIndexRef.current = 0
    setIsRecording(true)
  }

  const stopRecordingAndGetData = () => {
    setIsRecording(false)
    exerciseStartTimeRef.current = null
    return sensorDataRef.current
  }

  const clearSensorData = () => {
    setSensorData([])
    sensorDataRef.current = []
  }

  const anySensorConnected = sensors.some((s) => s.connected)

  const value = {
    sensors,
    connectSensor,
    disconnectSensor,
    isConnecting: isConnecting || sensors.some(s => s.isConnecting),
    anySensorConnected,
    connectionError,
    setConnectionError,
    sensorData,
    isRecording,
    startRecording,
    stopRecordingAndGetData,
    clearSensorData,
  }

  return <BluetoothContext.Provider value={value}>{children}</BluetoothContext.Provider>
}

export function useBluetooth() {
  const context = useContext(BluetoothContext)
  if (context === undefined) {
    throw new Error("useBluetooth must be used within a BluetoothProvider")
  }
  return context
}