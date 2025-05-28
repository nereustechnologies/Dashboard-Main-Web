'''
This module integrates IMU data parsing and Kalman filter processing.
'''
import re
import numpy as np
from scipy.spatial.transform import Rotation as R
from datetime import datetime

# --- Copied and adapted from imu_service.py --- 
def parse_imu_string(data_str):
    """
    Parses a raw IMU data string into a dictionary of sensor values.
    Example input: "AX:0.10AY:0.20AZ:9.80GX:0.01GY:0.02GZ:0.03MX:0.50MY:0.60MZ:0.70Battery:85%"
    """
    parsed = {}
    # Regex to find key-value pairs like AX:0.10, GY:-0.5, etc.
    matches = re.findall(r'([A-Z]{2}):([-]?\d+\.\d+)', data_str)
    key_map = {
        'AX': 'accX', 'AY': 'accY', 'AZ': 'accZ',
        'GX': 'gyrX', 'GY': 'gyrY', 'GZ': 'gyrZ',
        'MX': 'magX', 'MY': 'magY', 'MZ': 'magZ'
    }

    for label, value in matches:
        if label in key_map:
            parsed[key_map[label]] = float(value)

    # Regex to find battery percentage like Battery: 85%
    battery_match = re.search(r'Battery:\s*(\d+)%', data_str)
    parsed['Battery'] = int(battery_match.group(1)) if battery_match else 0

    # Ensure all expected sensor fields are present, defaulting to 0.0 if not found
    sensor_fields = ['accX', 'accY', 'accZ', 'gyrX', 'gyrY', 'gyrZ', 'magX', 'magY', 'magZ']
    for field in sensor_fields:
        parsed.setdefault(field, 0.0)
    
    # Ensure battery field is present, defaulting to 0 if not found
    parsed.setdefault('Battery', 0)

    return parsed

# --- Copied from imu_kalman_processing.py --- 
def process_imu_sample(data):
    """
    Processes a list/array of raw IMU sensor data into a structured dictionary.
    Input `data` order: [accZ, accY, accX, gyrZ, gyrY, gyrX, magX, magY, magZ]
    Gyro values are expected in degrees/s and are converted to radians/s.
    """
    return {
        'accel': np.array([data[2], data[1], data[0]]),  # accX, accY, accZ
        'gyro': np.radians([data[5], data[4], data[3]]), # gyrX, gyrY, gyrZ (converted to rad/s)
        'mag': np.array([data[6], data[7], data[8]])     # magX, magY, magZ
    }

def compute_orientation_from_sample(imu):
    """
    Computes initial roll, pitch from accelerometer and yaw from magnetometer.
    """
    ax, ay, az = imu['accel']
    mx, my, mz = imu['mag']

    # Roll and Pitch from accelerometer
    roll_acc = np.arctan2(ay, np.sqrt(ax**2 + az**2))
    pitch_acc = np.arctan2(-ax, np.sqrt(ay**2 + az**2))

    # Yaw from magnetometer, corrected for roll and pitch
    mx_c = mx * np.cos(pitch_acc) + mz * np.sin(pitch_acc)
    my_c = (mx * np.sin(roll_acc) * np.sin(pitch_acc) +
            my * np.cos(roll_acc) -
            mz * np.sin(roll_acc) * np.cos(pitch_acc))

    yaw_mag = np.arctan2(-my_c, mx_c)
    return roll_acc, pitch_acc, yaw_mag

def kalman_orientation_filter(roll_acc, pitch_acc, yaw_mag, gyro_rad, dt, Q_matrix, R_matrix):
    """
    Applies a Kalman filter to estimate orientation (roll, pitch, yaw).
    `gyro_rad` should be in radians/second.
    """
    # State vector: [roll, pitch, yaw, gyro_bias_x, gyro_bias_y, gyro_bias_z]
    # For simplicity, this version matches the original which doesn't explicitly model gyro bias in state vector shown here
    # The original seems to model [orientation_angles, angular_velocities_body_frame_implicitly]
    # Let's stick to the original structure from imu_kalman_processing.py
    X_k = np.zeros((6, 1))  # State: [roll, pitch, yaw, roll_rate, pitch_rate, yaw_rate] (implied)
    P_k = np.eye(6)         # State covariance

    # State transition model (A)
    # Assumes angular rates from gyro are used as control input u, not part of state vector directly integrated by A
    # This A matrix implies: angle_new = angle_old + gyro_integrated_angle_change
    # And gyro_integrated_angle_change is effectively B*u
    # The original code has A for [angles; biases] or [angles; rates]. Let's re-verify its structure.
    # Original A: [[I, dt*I], [0, I]] implies state is [angles, rates_bias_or_actual_rates_if_not_in_u]
    # Original B: [[0], [dt*I]] implies u is gyro reading affecting rates/biases.
    A = np.block([[np.eye(3), dt * np.eye(3)],
                  [np.zeros((3, 3)), np.eye(3)]])
    
    # Control input model (B)
    # This B implies that gyro input u directly affects the angular rates part of the state.
    B = np.vstack([dt * np.eye(3), np.eye(3)]) # Corrected B if state is [angles, rates] and u is gyro
                                              # Original B was np.vstack([np.zeros((3,3)), dt*np.eye(3)])
                                              # if u was acceleration of angles (jerks?)
                                              # Given u = gyro.reshape(3,1), B should map gyro to affect angles or rates.
                                              # If X_k = [angles, rates], then A should be [[I, dt*I], [0, I]]
                                              # and B should be [[0.5*dt^2*I],[dt*I]] if u is angular acceleration
                                              # or [[dt*I],[I]] if u is angular velocity to directly set rates and integrate angles.
                                              # Or, if gyro is treated as direct measurement of rates:
                                              # X_k = [angles]. A = I. B maps gyro to d_angles. Z_k = [roll_acc, pitch_acc, yaw_mag]
                                              # The original code from imu_kalman_processing.py was:
                                              # A = np.block([[np.eye(3), dt * np.eye(3)], [np.zeros((3, 3)), np.eye(3)]])
                                              # B = np.vstack([np.zeros((3,3)), dt*np.eye(3)]) -> This implies u is some sort of angular acceleration for the bias/rate part.
                                              # H = np.hstack([np.eye(3), np.zeros((3,3))]) -> Measures only angles.
                                              # This structure is a bit unusual if u is raw gyro. Let's assume it was tuned.
                                              # For now, faithfully reproducing the original provided structure.
    B_original = np.vstack([np.zeros((3,3)), dt*np.eye(3)])

    # Observation model (H)
    H = np.hstack([np.eye(3), np.zeros((3, 3))])

    # Measurement (Z_k)
    Z_k = np.array([[roll_acc], [pitch_acc], [yaw_mag]])
    
    # Control input (u_k) - Gyro readings (already in rad/s)
    u_k = gyro_rad.reshape(3, 1)

    # Prediction
    X_pred = A @ X_k + B_original @ u_k # Using B_original as per the source file
    P_pred = A @ P_k @ A.T + Q_matrix

    # Update
    K_k = P_pred @ H.T @ np.linalg.inv(H @ P_pred @ H.T + R_matrix)
    X_k = X_pred + K_k @ (Z_k - H @ X_pred)
    P_k = (np.eye(6) - K_k @ H) @ P_pred

    return X_k[0, 0], X_k[1, 0], X_k[2, 0] # Filtered roll, pitch, yaw

def transform_acceleration_step(acc_body, roll, pitch, yaw, acc_prev, vel_prev, beta, dt):
    """
    Transforms body frame acceleration to world frame, removes gravity, filters, and integrates for velocity.
    """
    R_mat = R.from_euler('ZYX', [yaw, pitch, roll]).as_matrix() # ZYX order for yaw, pitch, roll
    acc_body_col = acc_body.reshape(3, 1)
    acc_w = R_mat @ acc_body_col  # Transform to world frame
    acc_w[2, 0] -= 9.81          # Remove gravity (assuming Z is up)
    acc_raw_w = acc_w.flatten()

    if acc_prev is None:
        acc_filtered_w = acc_raw_w
    else:
        acc_filtered_w = beta * acc_raw_w + (1 - beta) * acc_prev # Low-pass filter

    if vel_prev is None:
        vel_w = np.zeros(3)
    else:
        vel_w = vel_prev + acc_filtered_w * dt # Integrate acceleration to get velocity

    return acc_filtered_w, vel_w

def high_pass_filter_velocity_step(vel_curr, vel_prev, vel_prev_hp, alpha):
    """
    Applies a high-pass filter to the velocity to reduce drift.
    """
    if vel_prev_hp is None or vel_prev is None: # vel_prev also needed for first step
        vel_hp = np.zeros(3)
    else:
        vel_hp = alpha * (vel_prev_hp + vel_curr - vel_prev)
    return vel_hp, vel_hp # Return current HP velocity and store it as previous HP for next step

def imu_kalman_processing(sample, dt=0.02, alpha=0.95, beta=0.1):
    """
    Main Kalman processing function for a single IMU sample.
    `sample` is a list/array: [accZ, accY, accX, gyrZ, gyrY, gyrX, magX, magY, magZ]
    `dt` is the time delta in seconds.
    `alpha` is for the high-pass filter on velocity.
    `beta` is for the low-pass filter on world-frame acceleration.
    """
    # Kalman filter noise parameters (these could be tuned or made arguments)
    Q_matrix = 0.01 * np.eye(6)  # Process noise covariance
    R_matrix = 0.1 * np.eye(3)   # Measurement noise covariance for orientation (roll, pitch, yaw_mag)

    # These state variables are re-initialized on each call in the original script.
    # For continuous processing, these would need to be managed externally (e.g., in a class).
    acc_prev_state = None
    vel_prev_state = None
    vel_prev_hp_state = None

    # 1. Process the raw sample data
    imu_data = process_imu_sample(sample) # accel (X,Y,Z), gyro (X,Y,Z in rad/s), mag (X,Y,Z)

    # 2. Compute initial orientation from accelerometer and magnetometer
    roll_acc, pitch_acc, yaw_mag = compute_orientation_from_sample(imu_data)

    # 3. Kalman filter for orientation
    # Gyro data for Kalman filter (Gx, Gy, Gz in rad/s)
    gyro_rad_for_kalman = imu_data['gyro'] # Already in X, Y, Z order from process_imu_sample
    filtered_roll, filtered_pitch, filtered_yaw = kalman_orientation_filter(
        roll_acc, pitch_acc, yaw_mag, gyro_rad_for_kalman, dt, Q_matrix, R_matrix
    )

    # 4. Transform acceleration to world frame, filter, and integrate for velocity
    # Accelerometer data (Ax, Ay, Az)
    acc_body_for_transform = imu_data['accel']
    acc_filtered_w, vel_w = transform_acceleration_step(
        acc_body_for_transform, filtered_roll, filtered_pitch, filtered_yaw, 
        acc_prev_state, vel_prev_state, beta, dt
    )
    # Update state for next call (if state were managed across calls)
    # acc_prev_state = acc_filtered_w
    # vel_prev_state = vel_w

    # 5. High-pass filter velocity to reduce drift
    vel_hp, vel_prev_hp_updated = high_pass_filter_velocity_step(
        vel_w, vel_prev_state, vel_prev_hp_state, alpha
    )
    # Update state for next call (if state were managed across calls)
    # vel_prev_hp_state = vel_prev_hp_updated

    return {
        "roll_deg": np.degrees(filtered_roll),
        "pitch_deg": np.degrees(filtered_pitch),
        "yaw_deg": np.degrees(filtered_yaw),
        "accel_world_X": acc_filtered_w[0],
        "accel_world_Y": acc_filtered_w[1],
        "accel_world_Z": acc_filtered_w[2],
        "velocity_world_X": vel_w[0],
        "velocity_world_Y": vel_w[1],
        "velocity_world_Z": vel_w[2],
        "velocity_hp_X": vel_hp[0],
        "velocity_hp_Y": vel_hp[1],
        "velocity_hp_Z": vel_hp[2],
    }

# --- Main integration function --- 
def main_imu_processing_pipeline(raw_imu_string: str, dt: float = 0.02, alpha: float = 0.95, beta: float = 0.1):
    """
    Processes a raw IMU data string through parsing and Kalman filtering.
    
    Args:
        raw_imu_string: The raw string data from the IMU sensor.
        dt: Time delta between samples, in seconds (e.g., 0.02 for 50Hz).
        alpha: Coefficient for the velocity high-pass filter.
        beta: Coefficient for the acceleration low-pass filter.
        
    Returns:
        A dictionary containing processed IMU data including orientation, velocity,
        timestamp, and battery level.
    """
    parsed_data = parse_imu_string(raw_imu_string)
    
    # Prepare the 'sample' list for imu_kalman_processing in the required order:
    # [accZ, accY, accX, gyrZ, gyrY, gyrX, magX, magY, magZ]
    kalman_input_sample = [
        parsed_data.get('accZ', 0.0),
        parsed_data.get('accY', 0.0),
        parsed_data.get('accX', 0.0),
        parsed_data.get('gyrZ', 0.0), # These are in deg/s, process_imu_sample will convert to rad/s
        parsed_data.get('gyrY', 0.0),
        parsed_data.get('gyrX', 0.0),
        parsed_data.get('magX', 0.0),
        parsed_data.get('magY', 0.0),
        parsed_data.get('magZ', 0.0)
    ]
    
    processed_results = imu_kalman_processing(
        sample=kalman_input_sample,
        dt=dt,
        alpha=alpha,
        beta=beta
    )
    
    # Add timestamp and battery from parsed_data to the final results
    processed_results['timestamp'] = datetime.now().isoformat()
    processed_results['battery_percent'] = parsed_data.get('Battery', 0)
    
    return processed_results

# --- Example Usage --- 
# if __name__ == "__main__":
#     # Example raw IMU string (adjust values as needed for realistic data)
#     sample_raw_data_str = "AX:0.12AY:0.05AZ:9.81GX:1.5GY:-0.8GZ:0.2MX:25.0MY:-15.5MZ:50.2Battery:75%"
#     
#     # Time delta (e.g., for 50 Hz sample rate, dt = 1/50 = 0.02 seconds)
#     dt_value = 0.02 
#     
#     print(f"Raw IMU String: {sample_raw_data_str}")
#     
#     # Process the data using the pipeline
#     # Note: The imu_kalman_processing function as structured is stateless for acc_prev, vel_prev etc.
#     # Each call processes the sample independently based on those internal initializations.
#     # For a stateful filter that carries over acc_prev, etc., across calls,
#     # imu_kalman_processing would need to be refactored (e.g., into a class).
#     final_data = main_imu_processing_pipeline(sample_raw_data_str, dt=dt_value)
#     
#     print("\nProcessed Data:")
#     for key, value in final_data.items():
#         if isinstance(value, float):
#             print(f"  {key}: {value:.4f}")
#         else:
#             print(f"  {key}: {value}")
#
#     # Example of how you might use it in a loop if you were getting continuous data:
#     # my_kalman_state = None # If imu_kalman_processing were stateful
#     # for raw_string_from_sensor in stream_of_data:
#     #     processed_data, my_kalman_state = main_imu_processing_pipeline_stateful(raw_string_from_sensor, my_kalman_state)
#     #     print(processed_data)
