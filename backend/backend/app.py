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
                    data = json.loads(message)

                    # Helper to build sample
                    def make_sample(prefix):
                        return [
                            data[f'{prefix}_AZ'], data[f'{prefix}_AY'], data[f'{prefix}_AX'],
                            data[f'{prefix}_GZ'], data[f'{prefix}_GY'], data[f'{prefix}_GX'],
                            data[f'{prefix}_MX'], data[f'{prefix}_MY'], data[f'{prefix}_MZ']
                        ]

                    # Collect IMU samples
                    # sample_torso = make_sample('torso')
                    # Run Kalman processing
                    # data_torso = imu_kalman_processing(sample_torso, dt=dt_param, alpha=alpha_param, beta=beta_param)
                    # torso_pitch_angle = data_torso['pitch_deg'] # Overall hip/torso angle

                    # Determine if data is available per leg
                    has_left = all(f'left_{p}_{axis}' in data for p in ['thigh', 'shin'] for axis in ['AX', 'AY', 'AZ', 'GX', 'GY', 'GZ', 'MX', 'MY', 'MZ'])
                    has_right = all(f'right_{p}_{axis}' in data for p in ['thigh', 'shin'] for axis in ['AX', 'AY', 'AZ', 'GX', 'GY', 'GZ', 'MX', 'MY', 'MZ'])

                    # Calculate angles conditionally
                    left_knee_angle = None
                    right_knee_angle = None
                    # Removed left_hip_angle and right_hip_angle initializations
                    data_left_thigh = {} # Initialize with empty dict or default values
                    data_right_thigh = {} # Initialize with empty dict or default values

                    if has_left:
                        sample_left_thigh = make_sample('left_thigh')
                        sample_left_shin = make_sample('left_shin')
                        data_left_thigh = imu_kalman_processing(sample_left_thigh, dt=dt_param, alpha=alpha_param, beta=beta_param)
                        data_left_shin = imu_kalman_processing(sample_left_shin, dt=dt_param, alpha=alpha_param, beta=beta_param)
                        left_knee_angle = data_left_thigh['pitch_deg'] - data_left_shin['pitch_deg']
                        # Removed left_hip_angle calculation


                    if has_right:
                        sample_right_thigh = make_sample('right_thigh')
                        sample_right_shin = make_sample('right_shin')
                        data_right_thigh = imu_kalman_processing(sample_right_thigh, dt=dt_param, alpha=alpha_param, beta=beta_param)
                        data_right_shin = imu_kalman_processing(sample_right_shin, dt=dt_param, alpha=alpha_param, beta=beta_param)
                        right_knee_angle = data_right_thigh['pitch_deg'] - data_right_shin['pitch_deg']
                        # Removed right_hip_angle calculation

                    sample_count += 1
                    # Print in separate column format
                    print(f"\nSample {sample_count}:")
                    print("=" * 80)
                    print(f"{'':<20} | {'Left Leg':<28} | {'Right Leg':<28}")
                    print("-" * 80)
                    print(f"{'Knee Angle (°)':<20} | "
                          f"{f'{left_knee_angle:.2f}'.ljust(28) if left_knee_angle is not None else '-'.ljust(28)} | "
                          f"{f'{right_knee_angle:.2f}'.ljust(28) if right_knee_angle is not None else '-'.ljust(28)}")
                    
                    # Print Torso Pitch Angle (Overall Hip Angle)
                    # formatted_tpa = f"{torso_pitch_angle:.2f}" if torso_pitch_angle is not None else "-"
                    # print(f"{'Torso Pitch (°)':<20} | {formatted_tpa.center(28 + 3 + 28)}") # Centered across the two leg columns
                    
                    # Print velocity and acceleration if data is available
                    left_velocity_str = "-"
                    left_accel_str = "-"
                    if has_left and data_left_thigh:
                        left_velocity_str = f"{np.round(data_left_thigh.get('velocity', [0,0,0]), 3).tolist()}"
                        left_accel_str = f"{np.round(data_left_thigh.get('acceleration', [0,0,0]), 3).tolist()}"

                    right_velocity_str = "-"
                    right_accel_str = "-"
                    if has_right and data_right_thigh:
                        right_velocity_str = f"{np.round(data_right_thigh.get('velocity', [0,0,0]), 3).tolist()}"
                        right_accel_str = f"{np.round(data_right_thigh.get('acceleration', [0,0,0]), 3).tolist()}"

                    print(f"{'Velocity (m/s)':<20} | {left_velocity_str:<28} | {right_velocity_str:<28}")
                    print(f"{'Acceleration (m/s²)':<20} | {left_accel_str:<28} | {right_accel_str:<28}")
                    print("=" * 80)

                except json.JSONDecodeError as e:
                    print(f"JSON decode error: {e}")
                except KeyError as e:
                    print(f"Missing key: {e}")
                except Exception as e:
                    print(f"Error in sample {sample_count + 1}: {e}")
                    print("-" * 60)

    except websockets.exceptions.ConnectionClosed:
        print("WebSocket connection closed")
    except Exception as e:
        print(f"Connection error: {e}")

async def main():
    await process_websocket_data()

if __name__ == "__main__":
    asyncio.run(main())
