"use client"

import { useState, useRef } from "react"

export function useWebSocket() {
  const [sensorData, setSensorData] = useState<{ [key: string]: any[] }>({})
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)

  const connectWebSocket = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    const socket = new WebSocket('ws://localhost:8765');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ Connected to Python WebSocket Server');
      setIsWebSocketConnected(true);
    };

    socket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const jsonData = JSON.parse(event.data);
          if (typeof jsonData === 'object' && jsonData !== null) {
            // Store the raw sensor data
            setSensorData(prevData => {
              const newData = { ...prevData };
              Object.entries(jsonData).forEach(([key, value]) => {
                if (!newData[key]) {
                  newData[key] = [];
                }
                newData[key].push(value);
              });
              return newData;
            });
          }
        } catch (e) {
          console.log('Received non-JSON string or malformed JSON:', event.data);
        }
      }
    };

    socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setIsWebSocketConnected(false);
    };

    socket.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setIsWebSocketConnected(false);
    };
  };

  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsWebSocketConnected(false);
    }
  };

  const clearSensorData = () => {
    setSensorData({});
  };

  return {
    sensorData,
    setSensorData,
    isWebSocketConnected,
    connectWebSocket,
    disconnectWebSocket,
    clearSensorData,
  }
}
