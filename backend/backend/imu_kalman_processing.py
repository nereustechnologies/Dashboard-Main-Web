import numpy as np
from scipy.spatial.transform import Rotation as R

def imu_kalman_processing(sample, dt=0.2, alpha=0.95, beta=0.1):
    Q = 0.01 * np.eye(6)
    R_ = 0.1 * np.eye(3)

    acc_prev = None
    vel_prev = None
    vel_prev_hp = None

    imu = process_imu_sample(sample)
    roll_acc, pitch_acc, yaw_mag = compute_orientation_from_sample(imu)
    filtered_roll, filtered_pitch, filtered_yaw = kalman_orientation_filter(
        roll_acc, pitch_acc, yaw_mag, imu['gyro'], dt, Q, R_
    )
    acc_filtered, vel = transform_acceleration_step(
        imu['accel'], filtered_roll, filtered_pitch, filtered_yaw, acc_prev, vel_prev, beta, dt
    )
    vel_hp, vel_prev_hp = high_pass_filter_velocity_step(vel, vel_prev, vel_prev_hp, alpha)

    acc_prev = acc_filtered
    vel_prev = vel

    return {
        "roll_deg": np.degrees(filtered_roll),
        "pitch_deg": np.degrees(filtered_pitch),
        "yaw_deg": np.degrees(filtered_yaw),
        "velocity": vel,
        "velocity_highpass": vel_hp
    }

def process_imu_sample(data):
    return {
        'accel': np.array([data[2], data[1], data[0]]),
        'gyro': np.radians([data[5], data[4], data[3]]),
        'mag': np.array([data[6], data[7], data[8]])
    }

def compute_orientation_from_sample(imu):
    ax, ay, az = imu['accel']
    mx, my, mz = imu['mag']

    roll_acc = np.arctan2(ay, np.sqrt(ax**2 + az**2))
    pitch_acc = np.arctan2(-ax, np.sqrt(ay**2 + az**2))

    mx_c = mx * np.cos(pitch_acc) + mz * np.sin(pitch_acc)
    my_c = (mx * np.sin(roll_acc) * np.sin(pitch_acc) +
            my * np.cos(roll_acc) -
            mz * np.sin(roll_acc) * np.cos(pitch_acc))

    yaw_mag = np.arctan2(-my_c, mx_c)
    return roll_acc, pitch_acc, yaw_mag

def kalman_orientation_filter(roll_acc, pitch_acc, yaw_acc, gyro, dt, Q, R):
    X_k = np.zeros((6, 1))
    P_k = np.eye(6)

    A = np.block([[np.eye(3), dt * np.eye(3)],
                  [np.zeros((3, 3)), np.eye(3)]])
    B = np.vstack([np.zeros((3, 3)), dt * np.eye(3)])
    H = np.hstack([np.eye(3), np.zeros((3, 3))])

    Z_k = np.array([[roll_acc], [pitch_acc], [yaw_acc]])
    u = gyro.reshape(3, 1)

    X_pred = A @ X_k + B @ u
    P_pred = A @ P_k @ A.T + Q

    K_k = P_pred @ H.T @ np.linalg.inv(H @ P_pred @ H.T + R)
    X_k = X_pred + K_k @ (Z_k - H @ X_pred)
    P_k = (np.eye(6) - K_k @ H) @ P_pred

    return X_k[0, 0], X_k[1, 0], X_k[2, 0]

def transform_acceleration_step(acc_body, roll, pitch, yaw, acc_prev, vel_prev, beta, dt):
    R_bw = R.from_euler('ZYX', [yaw, pitch, roll]).as_matrix()
    acc_body = acc_body.reshape(3, 1)
    acc_w = R_bw @ acc_body
    acc_w[2, 0] -= 9.81
    acc_raw = acc_w.flatten()

    if acc_prev is None:
        acc_filtered = acc_raw
    else:
        acc_filtered = beta * acc_raw + (1 - beta) * acc_prev

    if vel_prev is None:
        vel = np.zeros(3)
    else:
        vel = vel_prev + acc_filtered * dt

    return acc_filtered, vel

def high_pass_filter_velocity_step(vel_curr, vel_prev, vel_prev_hp, alpha):
    if vel_prev_hp is None:
        vel_hp = np.zeros(3)
    else:
        vel_hp = alpha * (vel_prev_hp + vel_curr - vel_prev)
    return vel_hp, vel_hp
