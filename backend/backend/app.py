import asyncio
import websockets
import json
from imu_kalman_processing import imu_kalman_processing
import numpy as np

# Parameters
dt_param = 0.2 
alpha_param = 0.95
beta_param = 0.1

async def process_websocket_data():
    uri = "ws://localhost:8765"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket server")
            print("Processing incoming data...\n")
            
            sample_count = 0
            
            async for message in websocket:
                try:
                    # Parse incoming JSON data
                    data = json.loads(message)

                    def make_sample(prefix):
                        return [
                            data[f'{prefix}_AZ'], data[f'{prefix}_AY'], data[f'{prefix}_AX'],
                            data[f'{prefix}_GZ'], data[f'{prefix}_GY'], data[f'{prefix}_GX'],
                            data[f'{prefix}_MX'], data[f'{prefix}_MY'], data[f'{prefix}_MZ']
                        ]

                    sample_torso = make_sample('torso')
                    sample_thigh = make_sample('thigh')
                    sample_shin = make_sample('shin')

                    # Run Kalman filter for each IMU
                    data_torso = imu_kalman_processing(sample_torso, dt=dt_param, alpha=alpha_param, beta=beta_param)
                    data_thigh = imu_kalman_processing(sample_thigh, dt=dt_param, alpha=alpha_param, beta=beta_param)
                    data_shin = imu_kalman_processing(sample_shin, dt=dt_param, alpha=alpha_param, beta=beta_param)

                    # Compute joint angles
                    hip_angle = data_torso['pitch_deg'] - data_thigh['pitch_deg']
                    knee_angle = data_thigh['pitch_deg'] - data_shin['pitch_deg']

                    sample_count += 1
                    print(f"\nSample {sample_count}:")
                    print("=" * 40)

                    def print_imu_outputs(label, imu_data):
                        print(f"IMU: {label}")
                        print(f"  Roll  (deg): {imu_data['roll_deg']:.2f}")
                        print(f"  Pitch (deg): {imu_data['pitch_deg']:.2f}")
                        print(f"  Yaw   (deg): {imu_data['yaw_deg']:.2f}")
                        print(f"  Velocity        : {np.round(imu_data['velocity'], 3).tolist()}")
                        print(f"  High-pass Vel.  : {np.round(imu_data['velocity_highpass'], 3).tolist()}")
                        print("-" * 40)

                    print_imu_outputs("Torso", data_torso)
                    print_imu_outputs("Thigh", data_thigh)
                    print_imu_outputs("Shin", data_shin)

                    # Print joint angles
                    print("Joint Angles:")
                    print(f"  Hip  Flexion (Pitch_torso - Pitch_thigh): {hip_angle:.2f}°")
                    print(f"  Knee Flexion (Pitch_thigh - Pitch_shin) : {knee_angle:.2f}°")
                    print("=" * 40)

                except json.JSONDecodeError as e:
                    print(f"Error parsing JSON: {e}")
                except KeyError as e:
                    print(f"Missing expected data field: {e}")
                except Exception as e:
                    print(f"Error in sample {sample_count + 1}: {e}")
                    print("-" * 30)
                    
    except websockets.exceptions.ConnectionClosed:
        print("WebSocket connection closed")
    except Exception as e:
        print(f"Connection error: {e}")

async def main():
    await process_websocket_data()

if __name__ == "__main__":
    asyncio.run(main())
