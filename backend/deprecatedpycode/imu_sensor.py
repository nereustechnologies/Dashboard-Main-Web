import asyncio
import json
import logging
from bleak import BleakScanner, BleakClient
import numpy as np
import pandas as pd
from datetime import datetime
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# IMU Sensor Configuration
SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214"
CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214"

class IMUSensor:
    def __init__(self, device_name="ArduinoIMU"):
        self.device_name = device_name
        self.client = None
        self.connected = False
        self.data_buffer = []
        self.recording = False
        self.current_exercise = None
        self.current_leg = None
        self.output_dir = "data"
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
    
    async def scan_devices(self):
        """Scan for BLE devices with the specified name"""
        logger.info(f"Scanning for {self.device_name} devices...")
        devices = await BleakScanner.discover()
        imu_devices = [d for d in devices if d.name == self.device_name]
        
        if not imu_devices:
            logger.warning(f"No {self.device_name} devices found")
            return []
        
        logger.info(f"Found {len(imu_devices)} {self.device_name} devices")
        return imu_devices
    
    async def connect(self, device_address):
        """Connect to a specific IMU sensor by address"""
        try:
            logger.info(f"Connecting to {device_address}...")
            self.client = BleakClient(device_address)
            await self.client.connect()
            self.connected = True
            
            # Start notification handler
            await self.client.start_notify(CHARACTERISTIC_UUID, self.notification_handler)
            
            logger.info(f"Connected to {device_address}")
            return True
        except Exception as e:
            logger.error(f"Error connecting to device: {e}")
            self.connected = False
            return False
    
    def notification_handler(self, sender, data):
        """Handle incoming data from the IMU sensor"""
        try:
            # Parse the data (format depends on your IMU sensor implementation)
            # Example format: [accX, accY, accZ, gyrX, gyrY, gyrZ]
            values = [float(x) for x in data.decode().strip().split(',')]
            
            timestamp = datetime.now().isoformat()
            
            imu_data = {
                'timestamp': timestamp,
                'accX': values[0],
                'accY': values[1],
                'accZ': values[2],
                'gyrX': values[3],
                'gyrY': values[4],
                'gyrZ': values[5],
                'exercise': self.current_exercise,
                'leg': self.current_leg
            }
            
            # Add to buffer if recording
            if self.recording:
                self.data_buffer.append(imu_data)
                
                # Save periodically to avoid data loss
                if len(self.data_buffer) >= 100:
                    self.save_data()
        
        except Exception as e:
            logger.error(f"Error processing IMU data: {e}")
    
    def start_recording(self, exercise_id, leg=None):
        """Start recording data for a specific exercise"""
        if not self.connected:
            logger.error("Cannot start recording: not connected to sensor")
            return False
        
        self.current_exercise = exercise_id
        self.current_leg = leg
        self.recording = True
        logger.info(f"Started recording for exercise: {exercise_id}, leg: {leg}")
        return True
    
    def stop_recording(self):
        """Stop recording data"""
        if not self.recording:
            return False
        
        self.recording = False
        self.save_data()
        logger.info("Stopped recording")
        return True
    
    def save_data(self):
        """Save recorded data to CSV file"""
        if not self.data_buffer:
            logger.info("No data to save")
            return
        
        try:
            # Create directory structure
            exercise_dir = os.path.join(self.output_dir, self.current_exercise or "unknown")
            os.makedirs(exercise_dir, exist_ok=True)
            
            # Generate filename
            leg_str = f"_{self.current_leg}" if self.current_leg else ""
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{self.current_exercise}{leg_str}_{timestamp}.csv"
            filepath = os.path.join(exercise_dir, filename)
            
            # Save to CSV
            df = pd.DataFrame(self.data_buffer)
            df.to_csv(filepath, index=False)
            
            logger.info(f"Saved {len(self.data_buffer)} records to {filepath}")
            self.data_buffer = []
            
            return filepath
        except Exception as e:
            logger.error(f"Error saving data: {e}")
            return None
    
    async def disconnect(self):
        """Disconnect from the IMU sensor"""
        if self.connected and self.client:
            # Stop recording if active
            if self.recording:
                self.stop_recording()
            
            # Disconnect
            await self.client.disconnect()
            self.connected = False
            logger.info("Disconnected from IMU sensor")
            return True
        return False

# Example usage
async def main():
    imu = IMUSensor()
    
    # Scan for devices
    devices = await imu.scan_devices()
    if not devices:
        return
    
    # Connect to the first device found
    connected = await imu.connect(devices[0].address)
    if not connected:
        return
    
    # Start recording for a test exercise
    imu.start_recording("knee_flexion", "left")
    
    # Record for 10 seconds
    await asyncio.sleep(10)
    
    # Stop recording
    imu.stop_recording()
    
    # Disconnect
    await imu.disconnect()

if __name__ == "__main__":
    asyncio.run(main())

