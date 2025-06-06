"use client"

import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from "react"

const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
const CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"

export interface IMUData {
  AX: number
  AY: number
  AZ: number
  GX: number
  GY: number
  GZ: number
  MX: number
  MY: number
  MZ: number
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
}

interface BluetoothContextType {
  sensors: Sensor[]
  connectSensors: () => Promise<void>
  disconnectSensors: () => void
  isConnecting: boolean
  anySensorConnected: boolean
  connectionError: string | null
  sensorData: SensorDataPoint[]
  isRecording: boolean
  startRecording: (startTime: number) => void
  stopRecordingAndGetData: () => SensorDataPoint[]
  clearSensorData: () => void
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined)

interface IMUDataNumericKeys {
  AX?: number
  AY?: number
  AZ?: number
  GX?: number
  GY?: number
  GZ?: number
  MX?: number
  MY?: number
  MZ?: number
}

function parseIMUData(dataStr: string): IMUData | null {
  const parsed: Partial<IMUData> = {}
  const keyMap: { [key: string]: keyof IMUDataNumericKeys } = {
    AX: "AX",
    AY: "AY",
    AZ: "AZ",
    GX: "GX",
    GY: "GY",
    GZ: "GZ",
    MX: "MX",
    MY: "MY",
    MZ: "MZ",
  }
  const regex = /([A-Z]{2}):\s*([-]?\d+(?:\.\d+)?)/g
  let match
  while ((match = regex.exec(dataStr)) !== null) {
    const label = match[1]
    const value = parseFloat(match[2])
    if (label in keyMap) {
      const dataKey = keyMap[label]
      // @ts-ignore
      parsed[dataKey] = value
    }
  }

  const imuKeys: (keyof IMUDataNumericKeys)[] = ["AX", "AY", "AZ", "GX", "GY", "GZ", "MX", "MY", "MZ"]
  const hasIMUData = imuKeys.every((key) => parsed[key] !== undefined)

  if (hasIMUData) {
    return parsed as IMUData
  }
  return null
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

  const exerciseStartTimeRef = useRef<number | null>(null)
  const sampleIndexRef = useRef(0)
  const sensorsRef = useRef(sensors)

  useEffect(() => {
    sensorsRef.current = sensors
  }, [sensors])

  const handleNotifications = useCallback(
    (event: Event, sensorId: string) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic
      const value = target.value
      if (!value) return

      const text = new TextDecoder().decode(value).trim()
      const parsedData = parseIMUData(text)

      if (parsedData) {
        setSensors((prev) => prev.map((s) => (s.id === sensorId ? { ...s, latestData: parsedData } : s)))

        if (isRecording && exerciseStartTimeRef.current) {
          const defaultImuData: IMUData = { AX: 0, AY: 0, AZ: 0, GX: 0, GY: 0, GZ: 0, MX: 0, MY: 0, MZ: 0 }
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

          setSensorData((prevData) => [...prevData, finalDataPointWithDefaults])
        }
      }
    },
    [isRecording],
  )

  const connectSensors = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.bluetooth) {
      setConnectionError("Web Bluetooth is not supported in this browser. Please use Chrome or Edge.")
      return
    }
    setIsConnecting(true)
    setConnectionError(null)

    const updatedSensors = [...sensorsRef.current]

    for (let i = 0; i < updatedSensors.length; i++) {
      const sensorToConnect = updatedSensors[i]
      if (sensorToConnect.connected) continue

      try {
        alert(`Please select the Bluetooth device for: ${sensorToConnect.name}`)

        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [SERVICE_UUID, "battery_service"],
        })

        if (!device.gatt) {
          throw new Error("GATT server not available.")
        }

        const server = await device.gatt.connect()
        const service = await server.getPrimaryService(SERVICE_UUID)
        const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID)

        const notificationHandler = (event: Event) => handleNotifications(event, sensorToConnect.id)
        const disconnectHandler = () => {
          if (characteristic) {
            characteristic.removeEventListener("characteristicvaluechanged", notificationHandler)
          }
          if (device) {
            device.removeEventListener("gattserverdisconnected", disconnectHandler)
          }
          setSensors((prev) =>
            prev.map((s) =>
              s.id === sensorToConnect.id
                ? { ...s, connected: false, device: null, characteristic: null, notificationHandler: null }
                : s,
            ),
          )
        }

        if (characteristic.properties.notify) {
          await characteristic.startNotifications()
          characteristic.addEventListener("characteristicvaluechanged", notificationHandler)
          device.addEventListener("gattserverdisconnected", disconnectHandler)
        }

        let batteryLevel = 0
        try {
          const batteryService = await server.getPrimaryService("battery_service")
          const batteryCharacteristic = await batteryService.getCharacteristic("battery_level")
          const batteryValue = await batteryCharacteristic.readValue()
          batteryLevel = batteryValue.getUint8(0)
        } catch (e) {
          console.warn(`Could not get battery for ${sensorToConnect.name}, using mock value.`)
          batteryLevel = Math.floor(Math.random() * 30) + 70
        }

        updatedSensors[i] = {
          ...sensorToConnect,
          connected: true,
          device,
          characteristic,
          battery: batteryLevel,
          notificationHandler,
          disconnectHandler,
        }

        setSensors([...updatedSensors])
      } catch (error: any) {
        if (error.name === "NotFoundError" || error.name === "AbortError") {
          alert(`Device selection cancelled for ${sensorToConnect.name}. You can continue with fewer sensors.`)
        } else {
          setConnectionError(`Failed to connect ${sensorToConnect.name}: ${error.message}`)
          break
        }
      }
    }
    setSensors(updatedSensors)
    setIsConnecting(false)
  }, [handleNotifications])

  const disconnectSensors = useCallback(async () => {
    for (const sensor of sensorsRef.current) {
      if (sensor.connected && sensor.device?.gatt?.connected) {
        if (sensor.characteristic && sensor.notificationHandler) {
          try {
            if (sensor.characteristic.properties.notify) {
              await sensor.characteristic.stopNotifications()
            }
            sensor.characteristic.removeEventListener("characteristicvaluechanged", sensor.notificationHandler)
          } catch (e) {
            console.error(`Error stopping notifications for ${sensor.name}`, e)
          }
        }
        if (sensor.disconnectHandler) {
          sensor.device.removeEventListener("gattserverdisconnected", sensor.disconnectHandler)
        }
        sensor.device.gatt.disconnect()
      }
    }
    setSensors((prev) =>
      prev.map((s) => ({
        ...s,
        connected: false,
        device: null,
        characteristic: null,
        latestData: null,
        notificationHandler: null,
        disconnectHandler: null,
      })),
    )
  }, [])

  useEffect(() => {
    return () => {
      disconnectSensors()
    }
  }, [disconnectSensors])

  const startRecording = (startTime: number) => {
    clearSensorData()
    exerciseStartTimeRef.current = startTime
    sampleIndexRef.current = 0
    setIsRecording(true)
  }

  const stopRecordingAndGetData = () => {
    setIsRecording(false)
    exerciseStartTimeRef.current = null
    return sensorData
  }

  const clearSensorData = () => {
    setSensorData([])
  }

  const anySensorConnected = sensors.some((s) => s.connected)

  const value = {
    sensors,
    connectSensors,
    disconnectSensors,
    isConnecting,
    anySensorConnected,
    connectionError,
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