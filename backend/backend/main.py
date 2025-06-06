import pandas as pd
import numpy as np
from scipy.spatial.transform import Rotation as R
from imu_kalman_processing import imu_kalman_processing

def time_to_seconds(time_str):
    """Convert time string to seconds"""
    if pd.isna(time_str) or time_str == '-':
        return None
    try:
        if ':' in str(time_str):
            parts = str(time_str).split(':')
            return int(parts[0]) * 60 + int(parts[1])
        else:
            return float(time_str)
    except:
        return None

def process_imu_csv_data():
    """Load and process all CSV files"""
    main_df = pd.read_csv('exercise_events.csv')
    
    # Load IMU sensor data
    right_shin_df = pd.read_csv('right-shin_raw_sensor_data.csv')
    right_thigh_df = pd.read_csv('right-thigh_raw_sensor_data.csv')
    left_shin_df = pd.read_csv('left-shin_raw_sensor_data.csv')
    left_thigh_df = pd.read_csv('left-thigh_raw_sensor_data.csv')
    
    def process_sensor_data(df):
        """Process sensor data through Kalman filter"""
        orientations = []
        state = None
        
        for _, row in df.iterrows():
            sample = [row['AX'], row['AY'], row['AZ'], 
                     row['GX'], row['GY'], row['GZ'],
                     row['MX'], row['MY'], row['MZ']]
            
            result, state = imu_kalman_processing(sample, state=state)
            
            # Convert timestamp to seconds
            timestamp_seconds = time_to_seconds(row['Timestamp'])
            if timestamp_seconds is None:
                timestamp_seconds = 0
            
            orientations.append({
                'timestamp': timestamp_seconds,  # Store as numeric seconds
                'roll': result['roll_deg'],
                'pitch': result['pitch_deg'], 
                'yaw': result['yaw_deg']
            })
        
        return pd.DataFrame(orientations)
    
    # Process all sensors
    right_shin_orient = process_sensor_data(right_shin_df)
    right_thigh_orient = process_sensor_data(right_thigh_df)
    left_shin_orient = process_sensor_data(left_shin_df)
    left_thigh_orient = process_sensor_data(left_thigh_df)
    
    return main_df, right_shin_orient, right_thigh_orient, left_shin_orient, left_thigh_orient

def calculate_knee_angle(thigh_orient, shin_orient):
    """Calculate knee flexion angle from thigh and shin orientations"""
    thigh_rot = R.from_euler('xyz', [thigh_orient['roll'], 
                                    thigh_orient['pitch'], 
                                    thigh_orient['yaw']], degrees=True)
    shin_rot = R.from_euler('xyz', [shin_orient['roll'], 
                                   shin_orient['pitch'], 
                                   shin_orient['yaw']], degrees=True)
    
    relative_rot = shin_rot * thigh_rot.inv()
    angles = relative_rot.as_euler('xyz', degrees=True)
    knee_flexion = abs(angles[1])  # Pitch component for knee flexion
    
    return knee_flexion

def calculate_hip_angle(thigh_orient):
    """Calculate hip flexion angle from thigh orientation relative to vertical"""
    # Create rotation from thigh orientation
    thigh_rot = R.from_euler('xyz', [thigh_orient['roll'], 
                                    thigh_orient['pitch'], 
                                    thigh_orient['yaw']], degrees=True)
    
    # Define vertical reference (pointing up in world frame)
    vertical_ref = np.array([0, 0, 1])
    
    # Transform vertical reference to thigh coordinate system
    thigh_z_axis = thigh_rot.apply([0, 0, 1])
    
    # Calculate angle between thigh's z-axis and vertical
    dot_product = np.dot(thigh_z_axis, vertical_ref)
    # Clamp to avoid numerical errors in arccos
    dot_product = np.clip(dot_product, -1.0, 1.0)
    hip_flexion = np.degrees(np.arccos(abs(dot_product)))
    
    return hip_flexion

def interpolate_orientation(orient_df, target_timestamp):
    """Interpolate orientation data for a specific timestamp"""
    # Check if DataFrame is empty
    if orient_df.empty:
        return None
        
    # Check if target timestamp is within range
    min_ts = orient_df['timestamp'].min()
    max_ts = orient_df['timestamp'].max()
    
    if target_timestamp < min_ts or target_timestamp > max_ts:
        return None
    
    # Sort by timestamp to ensure proper ordering
    orient_df_sorted = orient_df.sort_values('timestamp')
    
    idx = np.searchsorted(orient_df_sorted['timestamp'].values, target_timestamp)
    
    if idx == 0:
        return orient_df_sorted.iloc[0].to_dict()
    elif idx >= len(orient_df_sorted):
        return orient_df_sorted.iloc[-1].to_dict()
    
    # Linear interpolation
    row_before = orient_df_sorted.iloc[idx-1]
    row_after = orient_df_sorted.iloc[idx]
    
    t1, t2 = row_before['timestamp'], row_after['timestamp']
    
    # Avoid division by zero
    if t2 == t1:
        return row_before.to_dict()
        
    alpha = (target_timestamp - t1) / (t2 - t1)
    
    result = {}
    for col in ['roll', 'pitch', 'yaw']:
        v1, v2 = row_before[col], row_after[col]
        result[col] = v1 + alpha * (v2 - v1)
    
    return result

def create_target_format_output():
    """Main function to create output in target format"""
    # Process all IMU data
    main_df, right_shin_orient, right_thigh_orient, left_shin_orient, left_thigh_orient = process_imu_csv_data()
    
    # Create output data in target format
    output_data = []
    
    for idx, row in main_df.iterrows():
        # Convert timestamp to seconds
        timestamp = time_to_seconds(row.get('time', row.get('Timestamp', '00:00')))
        
        if timestamp is None:
            timestamp = idx * 0.2  # Default 5Hz sampling if no timestamp
        
        # Get phase information from main dataframe
        leg_used = row.get('leg_used', row.get('Leg Used', '-'))
        phase_label = row.get('phase_label', row.get('Phase Label', '-'))
        rep_count = row.get('rep_count', row.get('Rep Count', 0))
        
        # Initialize knee and hip angles
        left_knee_angle = "-"
        right_knee_angle = "-"
        left_hip_angle = "-"
        right_hip_angle = "-"
        
        # Calculate right knee and hip angles
        right_thigh = interpolate_orientation(right_thigh_orient, timestamp)
        right_shin = interpolate_orientation(right_shin_orient, timestamp)
        
        if right_thigh and right_shin:
            right_knee_angle = round(calculate_knee_angle(right_thigh, right_shin), 1)
        
        if right_thigh:
            right_hip_angle = round(calculate_hip_angle(right_thigh), 1)
        
        # Calculate left knee and hip angles
        left_thigh = interpolate_orientation(left_thigh_orient, timestamp)
        left_shin = interpolate_orientation(left_shin_orient, timestamp)
        
        if left_thigh and left_shin:
            left_knee_angle = round(calculate_knee_angle(left_thigh, left_shin), 1)
        
        if left_thigh:
            left_hip_angle = round(calculate_hip_angle(left_thigh), 1)
        
        # Override with "-" if leg is not being used
        if leg_used == 'right':
            left_knee_angle = "-"
            left_hip_angle = "-"
        elif leg_used == 'left':
            right_knee_angle = "-"
            right_hip_angle = "-"
        
        # Create output row in target format
        output_row = {
            'Timestamp': f"{int(timestamp//60):02d}:{int(timestamp%60):02d}",  # Convert back to MM:SS format
            'Knee Angle Left': left_knee_angle,
            'Knee Angle Right': right_knee_angle,
            'Hip Angle Left': left_hip_angle,
            'Hip Angle Right': right_hip_angle,
            'Leg Used': leg_used,
            'Phase Label': phase_label,
            'Rep Count': rep_count
        }
        
        output_data.append(output_row)
    
    # Create final DataFrame
    result_df = pd.DataFrame(output_data)
    
    # Save to CSV
    output_filename = 'updated_knee_hip_flexion_exercise_events_target_format.csv'
    result_df.to_csv(output_filename, index=False)
    
    print(f"Processing complete! Output saved to {output_filename}")
    print(f"Processed {len(result_df)} rows with calculated knee and hip angles")
    
    # Display sample output
    print("\nSample output:")
    print(result_df.head(10).to_string(index=False))
    
    return result_df

def generate_summary_stats(df):
    """Generate summary statistics for the processed data"""
    print("\n=== Processing Summary ===")
    print(f"Total rows processed: {len(df)}")
    
    # Count valid knee angle measurements
    left_knee_valid = df[df['Knee Angle Left'] != '-']['Knee Angle Left'].count()
    right_knee_valid = df[df['Knee Angle Right'] != '-']['Knee Angle Right'].count()
    
    # Count valid hip angle measurements
    left_hip_valid = df[df['Hip Angle Left'] != '-']['Hip Angle Left'].count()
    right_hip_valid = df[df['Hip Angle Right'] != '-']['Hip Angle Right'].count()
    
    print(f"Valid left knee measurements: {left_knee_valid}")
    print(f"Valid right knee measurements: {right_knee_valid}")
    print(f"Valid left hip measurements: {left_hip_valid}")
    print(f"Valid right hip measurements: {right_hip_valid}")
    
    # Phase distribution
    print("\nPhase distribution:")
    print(df['Phase Label'].value_counts())
    
    # Rep count range
    rep_counts = df[df['Rep Count'] != 0]['Rep Count']
    if not rep_counts.empty:
        print(f"\nRep count range: {rep_counts.min()} to {rep_counts.max()}")
    
    # Hip angle statistics
    if left_hip_valid > 0:
        left_hip_angles = pd.to_numeric(df[df['Hip Angle Left'] != '-']['Hip Angle Left'])
        print(f"\nLeft hip angle range: {left_hip_angles.min():.1f}° to {left_hip_angles.max():.1f}°")
        print(f"Left hip angle mean: {left_hip_angles.mean():.1f}°")
    
    if right_hip_valid > 0:
        right_hip_angles = pd.to_numeric(df[df['Hip Angle Right'] != '-']['Hip Angle Right'])
        print(f"Right hip angle range: {right_hip_angles.min():.1f}° to {right_hip_angles.max():.1f}°")
        print(f"Right hip angle mean: {right_hip_angles.mean():.1f}°")

# Run the processing
if __name__ == "__main__":
    updated_df = create_target_format_output()
    generate_summary_stats(updated_df)
