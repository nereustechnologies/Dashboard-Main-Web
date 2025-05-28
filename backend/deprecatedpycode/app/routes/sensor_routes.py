from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import List, Dict, Any
import asyncio
import os
from datetime import datetime
from pathlib import Path
import pandas as pd
import json

from ..models.sensor_models import SensorData, SensorResponse
from ..auth.auth_handler import get_current_user
from ..services.imu_service import IMUSensorManager

router = APIRouter()
sensor_manager = IMUSensorManager()

@router.post("/bluetooth/connect")
async def connect_bluetooth(current_user = Depends(get_current_user)):
    """Connect to available IMU sensors"""
    try:
        # Scan for devices and connect
        sensors = await sensor_manager.connect_to_sensors(
            user_id=current_user["id"],
            customer_id="default",  # This would be passed in a real app
            exercise_id="default"   # This would be passed in a real app
        )
        
        # Format response
        sensor_list = [
            SensorData(
                id=sensor_info["id"],
                name=sensor_info["name"],
                battery=sensor_info["battery"],
                connected=sensor_info["connected"]
            )
            for sensor_id, sensor_info in sensors.items()
        ]
        
        return SensorResponse(success=True, sensors=sensor_list)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to connect to sensors: {str(e)}"
        )

@router.get("/sensor-data/{exercise_id}")
async def get_sensor_data(
    exercise_id: str, 
    customer_id: str,
    current_user = Depends(get_current_user)
):
    """Get sensor data for a specific exercise"""
    try:
        # Connect to sensors (this would create the directory structure)
        sensors = await sensor_manager.connect_to_sensors(
            user_id=current_user["id"],
            customer_id=customer_id,
            exercise_id=exercise_id
        )
        
        # Generate some mock data if needed
        await sensor_manager.start_recording(duration=20)
        
        # Read data from each sensor
        result = []
        for sensor_id, sensor_info in sensors.items():
            data = await sensor_manager.read_sensor_data(sensor_info["file"])
            
            result.append({
                "id": sensor_id,
                "name": sensor_info["name"],
                "battery": sensor_info["battery"],
                "connected": sensor_info["connected"],
                "data": data
            })
        
        return {"success": True, "sensors": result}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sensor data: {str(e)}"
        )

@router.post("/exercise/record/{exercise_id}")
async def record_exercise_data(
    exercise_id: str,
    customer_id: str,
    current_user = Depends(get_current_user)
):
    """Start recording sensor data for an exercise"""
    try:
        # Connect to sensors
        sensors = await sensor_manager.connect_to_sensors(
            user_id=current_user["id"],
            customer_id=customer_id,
            exercise_id=exercise_id
        )
        
        # Start recording
        success = await sensor_manager.start_recording(duration=20)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to start recording"
            )
        
        return {"success": True, "message": "Recording started"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record exercise data: {str(e)}"
        )

