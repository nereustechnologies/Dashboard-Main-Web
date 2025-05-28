from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SensorData(BaseModel):
    id: str
    name: str
    battery: int = 100
    connected: bool = False

class SensorResponse(BaseModel):
    success: bool
    sensors: List[SensorData]

class IMUData(BaseModel):
    accX: float
    accY: float
    accZ: float
    gyrX: float
    gyrY: float
    gyrZ: float
    magX: Optional[float] = None
    magY: Optional[float] = None
    magZ: Optional[float] = None
    timestamp: str

class ExerciseData(BaseModel):
    exerciseId: str
    action: str
    timestamp: str
    leg: Optional[str] = None
    customerId: str

