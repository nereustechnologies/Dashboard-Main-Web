import numpy as np
from imu_kalman_processing import imu_kalman_processing

# Default Kalman filter parameters (can be overridden)
DEFAULT_DT = 0.2
DEFAULT_ALPHA = 0.95
DEFAULT_BETA = 0.1

def _make_sample_from_data(data, prefix):
    """
    Helper function to extract a 9-axis sample from the raw data dictionary.
    Input order: AccZ, AccY, AccX, GyroZ, GyroY, GyroX, MagX, MagY, MagZ
    """
    try:
        return [
            data[f'{prefix}_AZ'], data[f'{prefix}_AY'], data[f'{prefix}_AX'],
            data[f'{prefix}_GZ'], data[f'{prefix}_GY'], data[f'{prefix}_GX'],
            data[f'{prefix}_MX'], data[f'{prefix}_MY'], data[f'{prefix}_MZ']
        ]
    except KeyError as e:
        raise KeyError(f"Missing data for sensor prefix {prefix}: {str(e)}")

def process_sensor_data(raw_sensor_data, dt=DEFAULT_DT, alpha=DEFAULT_ALPHA, beta=DEFAULT_BETA):
    """
    Processes a single IMU sensor's data using Kalman filter.

    Args:
        raw_sensor_data (list): A list of 9 sensor readings 
                                (AccZ, AccY, AccX, GyroZ, GyroY, GyroX, MagX, MagY, MagZ).
        dt (float): Time step for Kalman filter.
        alpha (float): Alpha parameter for Kalman filter.
        beta (float): Beta parameter for Kalman filter.

    Returns:
        dict: Processed data including pitch, velocity, and acceleration.
    """
    if len(raw_sensor_data) != 9:
        raise ValueError("Raw sensor data must contain 9 values.")
    
    processed_data = imu_kalman_processing(raw_sensor_data, dt=dt, alpha=alpha, beta=beta)
    return {
        'pitch_deg': processed_data['pitch_deg'],
        'velocity': np.array(processed_data.get('velocity', [0.0, 0.0, 0.0])),
        'acceleration': np.array(processed_data.get('acceleration', [0.0, 0.0, 0.0]))
    }

def calculate_joint_angles_and_kinematics(all_sensor_data, dt=DEFAULT_DT, alpha=DEFAULT_ALPHA, beta=DEFAULT_BETA):
    """
    Calculates knee angles, hip angles (thigh pitch), velocities, and accelerations
    from the data of four IMU sensors.

    Args:
        all_sensor_data (dict): A dictionary containing the raw data from all sensors.
                                Expected keys like 'left_thigh_AX', 'right_shin_MZ', etc.
        dt (float): Time step for Kalman filter.
        alpha (float): Alpha parameter for Kalman filter.
        beta (float): Beta parameter for Kalman filter.

    Returns:
        dict: A dictionary containing calculated angles and kinematics.
              Example:
              {
                  'left_knee_angle': 10.5,
                  'right_knee_angle': 12.3,
                  'left_hip_angle': 30.2,  // This is left_thigh_pitch
                  'right_hip_angle': 33.0, // This is right_thigh_pitch
                  'sensors': {
                      'left_thigh': {'pitch_deg': ..., 'velocity': ..., 'acceleration': ...},
                      'left_shin': {'pitch_deg': ..., 'velocity': ..., 'acceleration': ...},
                      'right_thigh': {'pitch_deg': ..., 'velocity': ..., 'acceleration': ...},
                      'right_shin': {'pitch_deg': ..., 'velocity': ..., 'acceleration': ...}
                  }
              }
    """
    results = {
        'left_knee_angle': None,
        'right_knee_angle': None,
        'left_hip_angle': None,
        'right_hip_angle': None,
        'sensors': {
            'left_thigh': {},
            'left_shin': {},
            'right_thigh': {},
            'right_shin': {}
        }
    }

    sensor_prefixes = {
        'left_thigh': 'left_thigh',
        'left_shin': 'left_shin',
        'right_thigh': 'right_thigh',
        'right_shin': 'right_shin'
    }

    processed_sensor_outputs = {}

    # Process each sensor
    for key, prefix in sensor_prefixes.items():
        try:
            raw_data = _make_sample_from_data(all_sensor_data, prefix)
            processed_data = process_sensor_data(raw_data, dt, alpha, beta)
            results['sensors'][key] = processed_data
            processed_sensor_outputs[key] = processed_data
        except KeyError:
            # If a sensor's data is missing, its specific results will remain None or empty
            print(f"Warning: Data for {key} sensor ({prefix}) not found. Skipping.")
            results['sensors'][key] = {'pitch_deg': None, 'velocity': np.array([0.0,0.0,0.0]), 'acceleration': np.array([0.0,0.0,0.0])}


    # Calculate knee angles
    if processed_sensor_outputs.get('left_thigh') and processed_sensor_outputs.get('left_shin'):
        if processed_sensor_outputs['left_thigh'].get('pitch_deg') is not None and \
           processed_sensor_outputs['left_shin'].get('pitch_deg') is not None:
            results['left_knee_angle'] = processed_sensor_outputs['left_thigh']['pitch_deg'] - processed_sensor_outputs['left_shin']['pitch_deg']

    if processed_sensor_outputs.get('right_thigh') and processed_sensor_outputs.get('right_shin'):
        if processed_sensor_outputs['right_thigh'].get('pitch_deg') is not None and \
           processed_sensor_outputs['right_shin'].get('pitch_deg') is not None:
            results['right_knee_angle'] = processed_sensor_outputs['right_thigh']['pitch_deg'] - processed_sensor_outputs['right_shin']['pitch_deg']

    # Assign hip angles (thigh pitch)
    if processed_sensor_outputs.get('left_thigh') and processed_sensor_outputs['left_thigh'].get('pitch_deg') is not None:
        results['left_hip_angle'] = processed_sensor_outputs['left_thigh']['pitch_deg']
    
    if processed_sensor_outputs.get('right_thigh') and processed_sensor_outputs['right_thigh'].get('pitch_deg') is not None:
        results['right_hip_angle'] = processed_sensor_outputs['right_thigh']['pitch_deg']

    return results

if __name__ == '__main__':
    # Example usage:
    # This example assumes you have a way to get 'sample_data_frame'
    # which is a dictionary similar to the 'data' object in your app.py
    
    # Mock sample_data_frame for demonstration
    sample_data_frame = {
        # Left Thigh Data (AccZ, AccY, AccX, GyroZ, GyroY, GyroX, MagX, MagY, MagZ)
        'left_thigh_AX': 0.1, 'left_thigh_AY': 0.2, 'left_thigh_AZ': 9.8,
        'left_thigh_GX': 0.01, 'left_thigh_GY': 0.02, 'left_thigh_GZ': 0.03,
        'left_thigh_MX': 0.5, 'left_thigh_MY': 0.6, 'left_thigh_MZ': 0.7,

        # Left Shin Data
        'left_shin_AX': 0.15, 'left_shin_AY': 0.25, 'left_shin_AZ': 9.7,
        'left_shin_GX': 0.015, 'left_shin_GY': 0.025, 'left_shin_GZ': 0.035,
        'left_shin_MX': 0.55, 'left_shin_MY': 0.65, 'left_shin_MZ': 0.75,

        # Right Thigh Data
        'right_thigh_AX': -0.1, 'right_thigh_AY': -0.2, 'right_thigh_AZ': 9.9,
        'right_thigh_GX': -0.01, 'right_thigh_GY': -0.02, 'right_thigh_GZ': -0.03,
        'right_thigh_MX': -0.5, 'right_thigh_MY': -0.6, 'right_thigh_MZ': -0.7,

        # Right Shin Data
        'right_shin_AX': -0.15, 'right_shin_AY': -0.25, 'right_shin_AZ': 9.6,
        'right_shin_GX': -0.015, 'right_shin_GY': -0.025, 'right_shin_GZ': -0.035,
        'right_shin_MX': -0.55, 'right_shin_MY': -0.65, 'right_shin_MZ': -0.75,
    }

    print("Processing sample data frame with all sensors:")
    processed_kinematics = calculate_joint_angles_and_kinematics(sample_data_frame)
    
    print(f"Left Knee Angle: {processed_kinematics['left_knee_angle']:.2f}°" if processed_kinematics['left_knee_angle'] is not None else "Left Knee Angle: -")
    print(f"Right Knee Angle: {processed_kinematics['right_knee_angle']:.2f}°" if processed_kinematics['right_knee_angle'] is not None else "Right Knee Angle: -")
    print(f"Left Hip Angle (Thigh Pitch): {processed_kinematics['left_hip_angle']:.2f}°" if processed_kinematics['left_hip_angle'] is not None else "Left Hip Angle: -")
    print(f"Right Hip Angle (Thigh Pitch): {processed_kinematics['right_hip_angle']:.2f}°" if processed_kinematics['right_hip_angle'] is not None else "Right Hip Angle: -")
    
    for sensor_name, data in processed_kinematics['sensors'].items():
        if data and data.get('pitch_deg') is not None:
            print(f"\\nSensor: {sensor_name}")
            print(f"  Pitch: {data['pitch_deg']:.2f}°")
            print(f"  Velocity: {np.round(data['velocity'], 3).tolist()}")
            print(f"  Acceleration: {np.round(data['acceleration'], 3).tolist()}")
        else:
            print(f"\\nSensor: {sensor_name} - No data processed.")

    # Example with missing sensor data (e.g., only left leg)
    sample_left_leg_only = {
        'left_thigh_AX': 0.1, 'left_thigh_AY': 0.2, 'left_thigh_AZ': 9.8,
        'left_thigh_GX': 0.01, 'left_thigh_GY': 0.02, 'left_thigh_GZ': 0.03,
        'left_thigh_MX': 0.5, 'left_thigh_MY': 0.6, 'left_thigh_MZ': 0.7,

        'left_shin_AX': 0.15, 'left_shin_AY': 0.25, 'left_shin_AZ': 9.7,
        'left_shin_GX': 0.015, 'left_shin_GY': 0.025, 'left_shin_GZ': 0.035,
        'left_shin_MX': 0.55, 'left_shin_MY': 0.65, 'left_shin_MZ': 0.75,
    }
    print("\\n\\nProcessing sample data frame with only left leg sensors:")
    processed_left_kinematics = calculate_joint_angles_and_kinematics(sample_left_leg_only)
    print(f"Left Knee Angle: {processed_left_kinematics['left_knee_angle']:.2f}°" if processed_left_kinematics['left_knee_angle'] is not None else "Left Knee Angle: -")
    print(f"Right Knee Angle: {processed_left_kinematics['right_knee_angle']:.2f}°" if processed_left_kinematics['right_knee_angle'] is not None else "Right Knee Angle: -")
    # ... and so on for other values
    for sensor_name, data in processed_left_kinematics['sensors'].items():
        if data and data.get('pitch_deg') is not None:
            print(f"\\nSensor: {sensor_name}")
            print(f"  Pitch: {data['pitch_deg']:.2f}°")
            print(f"  Velocity: {np.round(data['velocity'], 3).tolist()}")
            print(f"  Acceleration: {np.round(data['acceleration'], 3).tolist()}")
        else:
            print(f"\\nSensor: {sensor_name} - No data processed.")
            
    # Example with custom dt, alpha, beta
    print("\\n\\nProcessing with custom parameters:")
    custom_params_kinematics = calculate_joint_angles_and_kinematics(
        sample_data_frame, 
        dt=0.1, 
        alpha=0.9, 
        beta=0.2
    )
    print(f"Left Knee Angle (custom params): {custom_params_kinematics['left_knee_angle']:.2f}°" if custom_params_kinematics['left_knee_angle'] is not None else "Left Knee Angle: -")


</rewritten_file> 