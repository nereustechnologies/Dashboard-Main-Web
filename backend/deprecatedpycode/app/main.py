from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
import os
import jwt
from datetime import datetime, timedelta
import json
import asyncio
from bleak import BleakScanner, BleakClient
import pandas as pd
from pathlib import Path

# Load environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "fitness_tracker")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "namit2424")
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

# Models
class User(BaseModel):
    id: str
    name: str
    email: str
    role: str

class UserInDB(User):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class Customer(BaseModel):
    name: str
    age: int
    gender: str
    height: float
    weight: float
    sleepLevels: float
    activityLevel: str
    calorieIntake: int
    mood: str

class ExerciseData(BaseModel):
    exerciseId: str
    action: str
    timestamp: str
    leg: Optional[str] = None
    customerId: str

# Mock database (replace with actual database in production)
users_db = {
    "john@example.com": {
        "id": "1",
        "name": "John Smith",
        "email": "john@example.com",
        "password": "password",
        "role": "tester"
    },
    "sarah@example.com": {
        "id": "2",
        "name": "Sarah Johnson",
        "email": "sarah@example.com",
        "password": "password",
        "role": "tester"
    },
    "admin@example.com": {
        "id": "3",
        "name": "Admin User",
        "email": "admin@example.com",
        "password": "password",
        "role": "admin"
    }
}

# Authentication functions
def verify_password(plain_password, password):
    return plain_password == password  # Replace with proper hashing in production

def get_user(email: str):
    if email in users_db:
        user_dict = users_db[email]
        return UserInDB(**user_dict)
    return None

def authenticate_user(email: str, password: str):
    user = get_user(email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except jwt.PyJWTError:
        raise credentials_exception
    user = get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    return current_user

# Routes
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=1)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.post("/customers")
async def create_customer(customer: Customer, current_user: User = Depends(get_current_active_user)):
    # In a real app, save to database
    return {"id": "cust_123", **customer.dict()}

@app.post("/bluetooth/connect")
async def connect_bluetooth(current_user: User = Depends(get_current_active_user)):
    # In a real app, this would connect to actual sensors
    # For demo, return mock data
    return {
        "success": True,
        "sensors": [
            {"id": "LL", "name": "Left Lower", "battery": 85, "connected": True},
            {"id": "LU", "name": "Left Upper", "battery": 92, "connected": True},
            {"id": "RL", "name": "Right Lower", "battery": 78, "connected": True},
            {"id": "RU", "name": "Right Upper", "battery": 88, "connected": True},
        ]
    }

@app.post("/exercise/data")
async def record_exercise_data(data: ExerciseData, current_user: User = Depends(get_current_active_user)):
    # In a real app, save to CSV and/or database
    
    # Create directory structure if it doesn't exist
    base_dir = Path(f"data/{current_user.id}/{data.customerId}")
    base_dir.mkdir(parents=True, exist_ok=True)
    
    # Determine category from exercise ID
    category = "unknown"
    if data.exerciseId in ["knee_flexion", "lunge_stretch", "knee_to_wall"]:
        category = "mobility"
    elif data.exerciseId in ["squats", "lunges"]:
        category = "strength"
    elif data.exerciseId in ["plank_hold", "sprint", "shuttle_run"]:
        category = "endurance"
    
    # Create category directory
    category_dir = base_dir / category
    category_dir.mkdir(exist_ok=True)
    
    # CSV file path
    csv_file = category_dir / f"{data.exerciseId}.csv"
    
    # Create CSV if it doesn't exist
    if not csv_file.exists():
        pd.DataFrame([{
            "timestamp": "",
            "action": "",
            "leg": "",
            "exerciseId": ""
        }]).to_csv(csv_file, index=False)
    
    # Append data to CSV
    pd.DataFrame([{
        "timestamp": data.timestamp,
        "action": data.action,
        "leg": data.leg or "N/A",
        "exerciseId": data.exerciseId
    }]).to_csv(csv_file, mode='a', header=False, index=False)
    
    return {"success": True, "message": "Data recorded successfully"}

# IMU sensor connection code
SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214"
CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214"

@app.post("/bluetooth/scan")
async def scan_bluetooth_devices():
    try:
        devices = await BleakScanner.discover(5.0, return_adv=True)
        imu_devices = []
        
        for d, (device, adv) in devices.items():
            if adv.local_name == 'ArduinoIMU':
                imu_devices.append({
                    "address": d,
                    "name": adv.local_name
                })
        
        return {"success": True, "devices": imu_devices}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/")
async def root():
    return {"message": "Welcome to Nereus Fitness Tracker API"}

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

