function imu_kalman_processing()
%% Load IMU Dataset
imu_data = [... 
    % Replace this with your 9-column dataset (ax ay az gx gy gz mx my mz)
];

dt = 0.2; % Time step
Q = 0.01 * eye(6); % Parameters for the kalman filter
R = 0.1 * eye(3); % Parameters for the kalman filter
alpha = 0.95; % Parameters for Velocity
beta = 0.1; % Parameters for acceleration

acc_prev = []; % Empty vectors to store acceleration data
vel_prev = []; % Empty vectors to store Velocity data
vel_prev_hp = []; %Empty vectors to store Previous time step velocity data

% Step 1: Process IMU Data
imu = processIMUData(imu_data);

% Step 2: Compute Orientation
[roll_acc, pitch_acc, yaw_mag] = computeOrientationFromIMU(imu);

% Step 3: Kalman Filter Orientation
[filtered_roll, filtered_pitch, filtered_yaw] = kalmanOrientationFilter(...
    roll_acc, pitch_acc, yaw_mag, imu.gyro, dt, Q, R);

% Step 4: Transform Acceleration to Global Frame
[acc_filtered, vel] = transformAccelerationStep(...
    imu.accel, filtered_roll, filtered_pitch, filtered_yaw, acc_prev, vel_prev, beta, dt);
% Step 5: High-Pass Filter Velocity
[vel_hp, vel_prev_hp] = highPassFilterVelocityStep(...
    vel, vel_prev, vel_prev_hp, alpha);


% Update state
acc_prev = acc_filtered;
vel_prev = vel;

end

%% -------- Local Functions --------

%% Data extraction

function imu = processIMUData(data)
    imu.accel = data([3, 2, 1]);            % ax, ay, az
    imu.gyro  = deg2rad(data([6, 5, 4]));   % gx, gy, gz in radians
    imu.mag   = data([7, 8, 9]);            % mx, my, mz

end
%% Orientation 
% The accelerometer is used to calculate roll and pitch, while yaw is calculated using the magnetometer. 
% These values serve as measurement data.
function [roll_acc, pitch_acc, yaw_mag] = computeOrientationFromIMU(imu)
    
    ax = imu.accel(1); ay = imu.accel(2); az = imu.accel(3);
    mx = imu.mag(1);   my = imu.mag(2);   mz = imu.mag(3);    

    
    roll_acc = atan2(ay, sqrt(ax.^2 + az.^2));
    pitch_acc = atan2(-ax, sqrt(ay.^2 + az.^2));
    

    roll = roll_acc; 
    pitch = pitch_acc;
    mx_c = mx*cos(pitch) + mz*sin(pitch);
    my_c = mx*sin(roll)*sin(pitch) + my*cos(roll) - mz*sin(roll)*cos(pitch);
    yaw_mag = atan2(-my_c, mx_c);
    
end

%% Kalman filter for imu angle

function [filtered_roll_deg, filtered_pitch_deg, filtered_yaw_deg] = kalmanOrientationFilter(roll_acc, pitch_acc, yaw_acc, gyro, dt, Q, R)
    
    
    
    X_k = zeros(6,1); P_k = eye(6);


    A = [eye(3), dt*eye(3); zeros(3), eye(3)];
    B = [zeros(3); dt * eye(3)];
    H = [eye(3), zeros(3)];

    
    u = gyro(:);
    
    % Prediction step

    X_pred = A * X_k + B * u;
    P_pred = A * P_k * A' + Q;
    
    % Update step

    Z_k = [roll_acc; pitch_acc; yaw_acc];
    K_k = P_pred * H' / (H * P_pred * H' + R);
    X_k = X_pred + K_k * (Z_k - H * X_pred);
    P_k = (eye(6) - K_k * H) * P_pred;
        
    roll = X_k(1);
    pitch = X_k(2);
    yaw = X_k(3);
    
    % Convert to degrees

    filtered_roll_deg = rad2deg(roll);
    filtered_pitch_deg = rad2deg(pitch);
    filtered_yaw_deg = rad2deg(yaw);

end

%% Acceleration

function [acc_filtered, vel] = transformAccelerationStep(acc_body, ...
        roll, pitch, yaw, acc_prev, vel_prev, beta, dt)

    R_bw = angle2dcm(yaw, pitch, roll, 'ZYX');
    acc_body = acc_body(:);  % 3x1
    acc_w = R_bw * acc_body;

    % Gravity compensation
    acc_w(3) = acc_w(3) - 9.81;
    acc_raw = acc_w'; % 1x3

    % Low-pass filter
    if isempty(acc_prev)
        acc_filtered = acc_raw;
    else
        acc_filtered = beta * acc_raw + (1 - beta) * acc_prev;
    end

    % Integrate velocity
    if isempty(vel_prev)
        vel = [0 0 0];
    else
        vel = vel_prev + acc_filtered * dt;
    end
end

%% Velocity

function [vel_hp, vel_prev_hp] = highPassFilterVelocityStep(...
    vel_curr, vel_prev, vel_prev_hp, alpha)

    if isempty(vel_prev_hp)
        vel_hp = [0 0 0];
    else
        vel_hp = alpha * (vel_prev_hp + vel_curr - vel_prev);
    end

    vel_prev_hp = vel_hp;
end