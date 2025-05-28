from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import jwt
from datetime import datetime, timedelta
import json
import asyncio
from imu_sensor import IMUSensor
import pandas as pd
from pathlib import Path

# Load environment variables
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret_key")

# Create FastAPI app
app = FastAPI(title="Nereus Fitness Tracker API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for JWT authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# IMU sensor instance
imu_sensor = IMUSensor()
connected_sensors = {}

# Models
class SensorData(BaseModel):
    id: str
    name: str
    battery: int = 100
    connected: bool = False

class SensorResponse(BaseModel):
    success: bool
    sensors: List[SensorData]

class ExerciseData(BaseModel):
    exerciseId: str
    action: str
    timestamp: str
    leg: Optional[str] = None
    customerId: str

# Routes
@app.post("/bluetooth/connect")
async def connect_bluetooth():
    """Connect to available IMU sensors"""
    try:
        # Scan for devices
        devices = await imu_sensor.scan_devices()
        
        sensors = []
        for i, device in enumerate(devices[:4]):  # Limit to 4 sensors
            # Use predefined IDs for the 4 sensors
            sensor_ids = ["LL", "LU", "RL", "RU"]
            sensor_names = ["Left Lower", "Left Upper", "Right Lower", "Right Upper"]
            
            if i < len(sensor_ids):
                sensor_id = sensor_ids[i]
                
                # Connect to the sensor
                connected = await imu_sensor.connect(device.address)
                
                # Store connection info
                connected_sensors[sensor_id] = {
                    "device": device,
                    "connected": connected,
                    "battery": 85 + i * 5  # Mock battery level
                }
                
                sensors.append(SensorData(
                    id=sensor_id,
                    name=sensor_names[i],
                    battery=connected_sensors[sensor_id]["battery"],
                    connected=connected
                ))
        
        # If no real sensors found, create mock data
        if not sensors:
            sensors = [
                SensorData(id="LL", name="Left Lower", battery=85, connected=True),
                SensorData(id="LU", name="Left Upper", battery=92, connected=True),
                SensorData(id="RL", name="Right Lower", battery=78, connected=True),
                SensorData(id="RU", name="Right Upper", battery=88, connected=True),
            ]
        
        return SensorResponse(success=True, sensors=sensors)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to connect to sensors: {str(e)}"
        )

@app.post("/exercise/data")
async def record_exercise_data(data: ExerciseData):
    """Record exercise data from IMU sensors"""
    try:
        # Start recording on the IMU sensor if connected
        if imu_sensor.connected:
            imu_sensor.start_recording(data.exerciseId, data.leg)
        
        # In a real app, save to CSV and/or database
        print(f"Recording: Exercise {data.exerciseId}, Action: {data.action}, Time: {data.timestamp}, Leg: {data.leg or 'N/A'}")
        
        # Mock response
        return {
            "success": True,
            "message": "Data recorded successfully",
            "data": data.dict()
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record data: {str(e)}"
        )

@app.get("/")
async def root():
    return {"message": "Welcome to Nereus Fitness Tracker API"}

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

