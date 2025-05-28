import asyncio
import json
import logging
from bleak import BleakScanner, BleakClient
import pandas as pd
from datetime import datetime
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# UUIDs for the IMU service and characteristic
SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214"
CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214"

class IMUSensorManager:
    def __init__(self):
        self.sensors = {}
        self.data_dir = Path("data")
        self.data_dir.mkdir(exist_ok=True)
        
    async def scan_for_sensors(self):
        """Scan for IMU sensors"""
        logger.info("Scanning for IMU sensors...")
        devices = await BleakScanner.discover(5.0, return_adv=True)
        imu_devices = []
        
        for d, (device, adv) in devices.items():
            if adv.local_name == 'ArduinoIMU':
                imu_devices.append({
                    "address": d,
                    "name": adv.local_name
                })
                
        logger.info(f"Found {len(imu_devices)} IMU sensors")
        return imu_devices
    
    async def connect_to_sensors(self, user_id, customer_id, exercise_id):
        """Connect to all available IMU sensors"""
        # Create directory structure
        exercise_dir = self.data_dir / user_id / customer_id / exercise_id
        exercise_dir.mkdir(parents=True, exist_ok=True)
        
        # Scan for sensors
        devices = await self.scan_for_sensors()
        
        # If no real sensors found, create mock sensors
        if not devices:
            logger.warning("No real sensors found, creating mock sensors")
            self.sensors = {
                "LL": {"id": "LL", "name": "Left Upper", "battery": 92, "connected": True, "file": exercise_dir / "LU.csv"},
                "RL": {"id": "RL", "name": "Left Lower", "battery": 85, "connected": True, "file": exercise_dir / "LL.csv"},
                "LU": {"id": "LU", "name": "Right Lower", "battery": 78, "connected": True, "file": exercise_dir / "RL.csv"},
                "RU": {"id": "RU", "name": "Right Upper", "battery": 88, "connected": True, "file": exercise_dir / "RU.csv"}
            }
            
            # Initialize CSV files with headers
            for sensor_id, sensor in self.sensors.items():
                self._initialize_csv(sensor["file"])
                
            return self.sensors
        
        # Map real sensors to our sensor IDs
        sensor_ids = ["LL", "LU", "RL", "RU"]
        sensor_names = ["Left Lower", "Left Upper", "Right Lower", "Right Upper"]
        
        for i, device in enumerate(devices[:4]):  # Limit to 4 sensors
            if i < len(sensor_ids):
                sensor_id = sensor_ids[i]
                sensor_name = sensor_names[i]
                
                self.sensors[sensor_id] = {
                    "id": sensor_id,
                    "name": sensor_name,
                    "address": device["address"],
                    "battery": 85 + i * 5,  # Mock battery level
                    "connected": True,
                    "file": exercise_dir / f"{sensor_id}.csv"
                }
                
                # Initialize CSV file with headers
                self._initialize_csv(self.sensors[sensor_id]["file"])
        
        return self.sensors
    
    def _initialize_csv(self, file_path):
        """Initialize a CSV file with headers"""
        pd.DataFrame([{
            'accX': 0, 'accY': 0, 'accZ': 0,
            'gyrX': 0, 'gyrY': 0, 'gyrZ': 0,
            'magX': 0, 'magY': 0, 'magZ': 0,
            'timestamp': ''
        }]).to_csv(file_path, index=False)
        
    async def start_recording(self, duration=10):
        """Start recording data from all connected sensors"""
        if not self.sensors:
            logger.error("No sensors connected")
            return False
        
        # For real implementation, connect to each sensor and start recording
        # For demo, generate mock data
        for sensor_id, sensor in self.sensors.items():
            self._generate_mock_data(sensor["file"], duration)
            
        return True
    
    def _generate_mock_data(self, file_path, duration):
        """Generate mock sensor data and save to CSV"""
        data = []
        now = datetime.now()
        
        for i in range(duration):
            timestamp = (now.replace(microsecond=0) + 
                        pd.Timedelta(seconds=i)).isoformat()
            
            # Generate realistic IMU data
            data.append({
                'accX': round((0.15 + (0.01 * (i % 5))) * (1 if i % 2 == 0 else -1), 6),
                'accY': round(0.99 + (0.005 * (i % 3)), 6),
                'accZ': round(0.05 + (0.01 * (i % 7)), 6),
                'gyrX': round((i % 3 - 1) * 0.7, 2),
                'gyrY': round(-1.5 - (0.1 * (i % 5)), 2),
                'gyrZ': round(-0.7 - (0.2 * (i % 4)), 2),
                'magX': round((i % 3 - 1) * 0.5, 2),
                'magY': round((i % 3 - 1) * 0.7, 2),
                'magZ': round((i % 3 - 1) * 0.3, 2),
                'timestamp': timestamp
            })
        
        # Write to CSV
        pd.DataFrame(data).to_csv(file_path, mode='a', header=False, index=False)
        logger.info(f"Generated {duration} records of mock data for {file_path}")
    
    async def read_sensor_data(self, file_path):
        """Read sensor data from CSV file"""
        try:
            if not os.path.exists(file_path):
                logger.warning(f"File not found: {file_path}")
                return []
            
            df = pd.read_csv(file_path)
            # Skip the first row which is all zeros
            if len(df) > 1:
                df = df.iloc[1:]
            
            # Convert to list of dictionaries
            records = df.to_dict('records')
            return records
        except Exception as e:
            logger.error(f"Error reading sensor data: {e}")
            return []
    
    async def disconnect_sensors(self):
        """Disconnect from all sensors"""
        # In a real implementation, disconnect from each sensor
        self.sensors = {}
        return True

# Example usage
async def main():
    manager = IMUSensorManager()
    
    # Connect to sensors
    sensors = await manager.connect_to_sensors("user123", "customer456", "knee_flexion")
    print(f"Connected to {len(sensors)} sensors")
    
    # Start recording
    await manager.start_recording(duration=20)
    
    # Read data from one sensor
    if "LL" in sensors:
        data = await manager.read_sensor_data(sensors["LL"]["file"])
        print(f"Read {len(data)} records from Left Lower sensor")
        if data:
            print("Sample data:", data[0])
    
    # Disconnect
    await manager.disconnect_sensors()

if __name__ == "__main__":
    asyncio.run(main())

