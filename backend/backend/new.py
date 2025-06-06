import asyncio
import websockets
import json
import pandas as pd
import numpy as np
from datetime import datetime
import time
from scipy.spatial.transform import Rotation as R
from imu_kalman_processing import imu_kalman_processing

class RealTimeKneeProcessor:
    def __init__(self, websocket_url="ws://localhost:8765", csv_output="real_time_knee_angles.csv", interval_output="interval_knee_data.csv"):
        self.websocket_url = websocket_url
        self.csv_output = csv_output
        self.interval_output = interval_output
        
        # Initialize Kalman filter states for each sensor
        self.sensor_states = {
            'right_thigh': None,
            'right_shin': None,
            'left_thigh': None,
            'left_shin': None
        }
        
        # Initialize CSV files
        self.init_csv_file()
        self.init_interval_csv_file()
        
        # Store latest angles for monitoring
        self.latest_angles = {
            'left_knee': None,
            'right_knee': None,
            'left_hip': None,
            'right_hip': None,
            'timestamp': None
        }
        
        # Timer for 0.5 second intervals
        self.last_interval_save = time.time()
        self.interval_duration = 0.5  # 0.5 seconds
        
    def init_csv_file(self):
        """Initialize main CSV file with headers"""
        headers = [
            'Timestamp', 'SampleIndex',
            'Left_Knee_Angle', 'Right_Knee_Angle',
            'Left_Hip_Angle', 'Right_Hip_Angle',
            'Processing_Time_Ms'
        ]
        
        df = pd.DataFrame(columns=headers)
        df.to_csv(self.csv_output, index=False)
        print(f"Initialized main CSV output: {self.csv_output}")
        
    def init_interval_csv_file(self):
        """Initialize interval CSV file with headers"""
        headers = [
            'Timestamp', 'Elapsed_Time_Seconds',
            'Left_Knee_Angle', 'Right_Knee_Angle',
            'Left_Hip_Angle', 'Right_Hip_Angle',
            'Sample_Count'
        ]
        
        df = pd.DataFrame(columns=headers)
        df.to_csv(self.interval_output, index=False)
        print(f"Initialized interval CSV output: {self.interval_output}")
        
    def process_sensor_data(self, websocket_data):
        """Process incoming WebSocket data and calculate knee angles"""
        start_time = time.time()
        
        try:
            # Extract sensor data from WebSocket message
            sensor_readings = {
                'right_thigh': self.extract_sensor_array(websocket_data.get('right_thigh', {})),
                'right_shin': self.extract_sensor_array(websocket_data.get('right_shin', {})),
                'left_thigh': self.extract_sensor_array(websocket_data.get('left_thigh', {})),
                'left_shin': self.extract_sensor_array(websocket_data.get('left_shin', {}))
            }
            
            # Process each sensor through Kalman filter
            orientations = {}
            for sensor_name, sensor_data in sensor_readings.items():
                if sensor_data is not None:
                    result, new_state = imu_kalman_processing(
                        sensor_data, 
                        state=self.sensor_states[sensor_name]
                    )
                    self.sensor_states[sensor_name] = new_state
                    orientations[sensor_name] = result
            
            # Calculate knee and hip angles
            left_knee_angle = self.calculate_knee_angle(
                orientations.get('left_thigh'), 
                orientations.get('left_shin')
            )
            
            right_knee_angle = self.calculate_knee_angle(
                orientations.get('right_thigh'), 
                orientations.get('right_shin')
            )
            
            left_hip_angle = self.calculate_hip_angle(orientations.get('left_thigh'))
            right_hip_angle = self.calculate_hip_angle(orientations.get('right_thigh'))
            
            # Calculate processing time
            processing_time = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            # Prepare data for CSV
            timestamp = datetime.now().strftime('%H:%M:%S.%f')[:-3]  # Include milliseconds
            sample_index = websocket_data.get('sample_index', 0)
            
            data_row = {
                'Timestamp': timestamp,
                'SampleIndex': sample_index,
                'Left_Knee_Angle': round(left_knee_angle, 1) if left_knee_angle is not None else '-',
                'Right_Knee_Angle': round(right_knee_angle, 1) if right_knee_angle is not None else '-',
                'Left_Hip_Angle': round(left_hip_angle, 1) if left_hip_angle is not None else '-',
                'Right_Hip_Angle': round(right_hip_angle, 1) if right_hip_angle is not None else '-',
                'Processing_Time_Ms': round(processing_time, 2)
            }
            
            # Save to main CSV
            self.append_to_csv(data_row)
            
            # Update latest angles for monitoring
            self.latest_angles = {
                'left_knee': left_knee_angle,
                'right_knee': right_knee_angle,
                'left_hip': left_hip_angle,
                'right_hip': right_hip_angle,
                'timestamp': timestamp,
                'processing_time': processing_time
            }
            
            return self.latest_angles
            
        except Exception as e:
            print(f"Error processing sensor data: {e}")
            return None
    
    def save_interval_data(self, sample_count, start_time):
        """Save data to interval CSV every 0.5 seconds"""
        current_time = time.time()
        elapsed_time = current_time - start_time
        
        if self.latest_angles['left_knee'] is not None:
            interval_row = {
                'Timestamp': datetime.now().strftime('%H:%M:%S.%f')[:-3],
                'Elapsed_Time_Seconds': round(elapsed_time, 2),
                'Left_Knee_Angle': round(self.latest_angles['left_knee'], 1) if self.latest_angles['left_knee'] is not None else '-',
                'Right_Knee_Angle': round(self.latest_angles['right_knee'], 1) if self.latest_angles['right_knee'] is not None else '-',
                'Left_Hip_Angle': round(self.latest_angles['left_hip'], 1) if self.latest_angles['left_hip'] is not None else '-',
                'Right_Hip_Angle': round(self.latest_angles['right_hip'], 1) if self.latest_angles['right_hip'] is not None else '-',
                'Sample_Count': sample_count
            }
            
            # Append to interval CSV
            self.append_to_interval_csv(interval_row)
    
    def extract_sensor_array(self, sensor_dict):
        """Extract sensor data array from dictionary"""
        try:
            # Expected order: [AX, AY, AZ, GX, GY, GZ, MX, MY, MZ]
            return [
                sensor_dict.get('AX', 0.0),
                sensor_dict.get('AY', 0.0),
                sensor_dict.get('AZ', 0.0),
                sensor_dict.get('GX', 0.0),
                sensor_dict.get('GY', 0.0),
                sensor_dict.get('GZ', 0.0),
                sensor_dict.get('MX', 0.0),
                sensor_dict.get('MY', 0.0),
                sensor_dict.get('MZ', 0.0)
            ]
        except Exception as e:
            print(f"Error extracting sensor array: {e}")
            return None
    
    def calculate_knee_angle(self, thigh_orient, shin_orient):
        """Calculate knee flexion angle from thigh and shin orientations"""
        if not thigh_orient or not shin_orient:
            return None
            
        try:
            thigh_rot = R.from_euler('xyz', [
                thigh_orient['roll_deg'], 
                thigh_orient['pitch_deg'], 
                thigh_orient['yaw_deg']
            ], degrees=True)
            
            shin_rot = R.from_euler('xyz', [
                shin_orient['roll_deg'], 
                shin_orient['pitch_deg'], 
                shin_orient['yaw_deg']
            ], degrees=True)
            
            relative_rot = shin_rot * thigh_rot.inv()
            angles = relative_rot.as_euler('xyz', degrees=True)
            knee_flexion = abs(angles[1])  # Pitch component for knee flexion
            
            return knee_flexion
        except Exception as e:
            print(f"Error calculating knee angle: {e}")
            return None
    
    def calculate_hip_angle(self, thigh_orient):
        """Calculate hip flexion angle from thigh orientation"""
        if not thigh_orient:
            return None
            
        try:
            thigh_rot = R.from_euler('xyz', [
                thigh_orient['roll_deg'], 
                thigh_orient['pitch_deg'], 
                thigh_orient['yaw_deg']
            ], degrees=True)
            
            vertical_ref = np.array([0, 0, 1])
            thigh_z_axis = thigh_rot.apply([0, 0, 1])
            
            dot_product = np.dot(thigh_z_axis, vertical_ref)
            dot_product = np.clip(dot_product, -1.0, 1.0)
            hip_flexion = np.degrees(np.arccos(abs(dot_product)))
            
            return hip_flexion
        except Exception as e:
            print(f"Error calculating hip angle: {e}")
            return None
    
    def append_to_csv(self, data_row):
        """Append single row to main CSV file"""
        try:
            df = pd.DataFrame([data_row])
            df.to_csv(self.csv_output, mode='a', header=False, index=False)
        except Exception as e:
            print(f"Error writing to main CSV: {e}")
            
    def append_to_interval_csv(self, data_row):
        """Append single row to interval CSV file"""
        try:
            df = pd.DataFrame([data_row])
            df.to_csv(self.interval_output, mode='a', header=False, index=False)
        except Exception as e:
            print(f"Error writing to interval CSV: {e}")
    
    async def connect_and_process(self):
        """Connect to WebSocket and process incoming data"""
        print(f"Connecting to WebSocket server at {self.websocket_url}")
        
        try:
            async with websockets.connect(self.websocket_url) as websocket:
                print("Connected to WebSocket server!")
                print("Starting real-time knee angle processing...")
                print("Data will be saved to CSV files every 0.5 seconds")
                
                sample_count = 0
                start_time = time.time()
                self.last_interval_save = start_time
                
                async for message in websocket:
                    try:
                        # Parse incoming JSON data
                        data = json.loads(message)
                        
                        # Process the data
                        angles = self.process_sensor_data(data)
                        
                        sample_count += 1
                        
                        # Check if 0.5 seconds have passed
                        current_time = time.time()
                        if current_time - self.last_interval_save >= self.interval_duration:
                            self.save_interval_data(sample_count, start_time)
                            self.last_interval_save = current_time
                        
                    except json.JSONDecodeError as e:
                        print(f"Error parsing JSON: {e}")
                    except Exception as e:
                        print(f"Error processing message: {e}")
                        
        except websockets.exceptions.ConnectionClosed:
            print("WebSocket connection closed")
        except Exception as e:
            print(f"WebSocket connection error: {e}")
    
    def get_latest_angles(self):
        """Get the most recently calculated angles"""
        return self.latest_angles

# Main execution
async def main():
    processor = RealTimeKneeProcessor(
        websocket_url="ws://localhost:8765",
        csv_output="live_knee_angles.csv",
        interval_output="interval_knee_data.csv"
    )
    
    print("Real-Time Knee Angle Processor")
    print("==============================")
    print("Make sure your WebSocket server (socketpy.py) is running!")
    print("Data will be saved every 0.5 seconds to interval_knee_data.csv")
    print("Press Ctrl+C to stop processing\n")
    
    try:
        await processor.connect_and_process()
    except KeyboardInterrupt:
        print("\nStopping real-time processing...")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    asyncio.run(main())