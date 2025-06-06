import { Matrix, inverse } from 'ml-matrix';

interface IMUData {
  accel: number[];
  gyro: number[];
  mag: number[];
}

export interface ProcessingResult {
  roll_deg: number;
  pitch_deg: number;
  yaw_deg: number;
  velocity: number[];
  velocity_highpass: number[];
  acceleration: number[];
}

export interface ProcessingState {
  acc_prev: number[] | null;
  vel_prev: number[] | null;
  vel_prev_hp: number[] | null;
}

export function imuKalmanProcessing(
  sample: number[],
  dt: number = 0.2,
  alpha: number = 0.95,
  beta: number = 0.1,
  state?: ProcessingState
): { result: ProcessingResult; state: ProcessingState } {
  // Initialize state if not provided
  const currentState: ProcessingState = state || {
    acc_prev: null,
    vel_prev: null,
    vel_prev_hp: null
  };

  const Q = Matrix.eye(6).mul(0.01);
  const R_ = Matrix.eye(3).mul(0.1);

  const imu = processIMUSample(sample);
  const [rollAcc, pitchAcc, yawMag] = computeOrientationFromSample(imu);
  const [filteredRoll, filteredPitch, filteredYaw] = kalmanOrientationFilter(
    rollAcc, pitchAcc, yawMag, imu.gyro, dt, Q, R_
  );
  
  const [accFiltered, vel] = transformAccelerationStep(
    imu.accel, filteredRoll, filteredPitch, filteredYaw, 
    currentState.acc_prev, currentState.vel_prev, beta, dt
  );
  
  const [velHp, velPrevHp] = highPassFilterVelocityStep(
    vel, currentState.vel_prev, currentState.vel_prev_hp, alpha
  );

  // Update state
  const newState: ProcessingState = {
    acc_prev: accFiltered,
    vel_prev: vel,
    vel_prev_hp: velPrevHp
  };

  return {
    result: {
      roll_deg: (filteredRoll * 180) / Math.PI,
      pitch_deg: (filteredPitch * 180) / Math.PI,
      yaw_deg: (filteredYaw * 180) / Math.PI,
      velocity: vel,
      velocity_highpass: velHp,
      acceleration: accFiltered
    },
    state: newState
  };
}

function processIMUSample(data: number[]): IMUData {
  return {
    accel: [data[2], data[1], data[0]],
    gyro: [
      (data[5] * Math.PI) / 180,
      (data[4] * Math.PI) / 180,
      (data[3] * Math.PI) / 180
    ],
    mag: [data[6], data[7], data[8]]
  };
}

function computeOrientationFromSample(imu: IMUData): [number, number, number] {
  const [ax, ay, az] = imu.accel;
  const [mx, my, mz] = imu.mag;

  const rollAcc = Math.atan2(ay, Math.sqrt(ax ** 2 + az ** 2));
  const pitchAcc = Math.atan2(-ax, Math.sqrt(ay ** 2 + az ** 2));

  const mxC = mx * Math.cos(pitchAcc) + mz * Math.sin(pitchAcc);
  const myC = mx * Math.sin(rollAcc) * Math.sin(pitchAcc) +
              my * Math.cos(rollAcc) -
              mz * Math.sin(rollAcc) * Math.cos(pitchAcc);

  const yawMag = Math.atan2(-myC, mxC);
  return [rollAcc, pitchAcc, yawMag];
}

function kalmanOrientationFilter(
  rollAcc: number,
  pitchAcc: number,
  yawAcc: number,
  gyro: number[],
  dt: number,
  Q: Matrix,
  R: Matrix
): [number, number, number] {
  const XK = new Matrix(6, 1);
  let PK = Matrix.eye(6);

  // State transition matrix A
  const eyeTop = Matrix.eye(3);
  const dtEyeTop = Matrix.eye(3).mul(dt);
  const zerosBottom = new Matrix(3, 3);
  const eyeBottom = Matrix.eye(3);
  
  const A = Matrix.zeros(6, 6);
  A.setSubMatrix(eyeTop, 0, 0);
  A.setSubMatrix(dtEyeTop, 0, 3);
  A.setSubMatrix(zerosBottom, 3, 0);
  A.setSubMatrix(eyeBottom, 3, 3);

  // Control input matrix B
  const B = Matrix.zeros(6, 3);
  const dtEyeB = Matrix.eye(3).mul(dt);
  B.setSubMatrix(dtEyeB, 3, 0);

  // Observation matrix H
  const H = Matrix.zeros(3, 6);
  H.setSubMatrix(Matrix.eye(3), 0, 0);

  const ZK = new Matrix([[rollAcc], [pitchAcc], [yawAcc]]);
  const u = new Matrix([[gyro[0]], [gyro[1]], [gyro[2]]]);

  // Prediction step
  const XPred = A.mmul(XK).add(B.mmul(u));
  const PPred = A.mmul(PK).mmul(A.transpose()).add(Q);

  // Update step
  const S = H.mmul(PPred).mmul(H.transpose()).add(R);
  const KK = PPred.mmul(H.transpose()).mmul(inverse(S));
  const XKNew = XPred.add(KK.mmul(ZK.sub(H.mmul(XPred))));
  PK = Matrix.eye(6).sub(KK.mmul(H)).mmul(PPred);

  return [XKNew.get(0, 0), XKNew.get(1, 0), XKNew.get(2, 0)];
}

function transformAccelerationStep(
  accBody: number[],
  roll: number,
  pitch: number,
  yaw: number,
  accPrev: number[] | null,
  velPrev: number[] | null,
  beta: number,
  dt: number
): [number[], number[]] {
  // Create rotation matrix from Euler angles (ZYX order)
  const RBW = createRotationMatrixZYX(yaw, pitch, roll);
  
  const accBodyMatrix = new Matrix([[accBody[0]], [accBody[1]], [accBody[2]]]);
  const accW = RBW.mmul(accBodyMatrix);
  
  // Remove gravity from z-axis
  accW.set(2, 0, accW.get(2, 0) - 9.81);
  
  const accRaw = [accW.get(0, 0), accW.get(1, 0), accW.get(2, 0)];

  let accFiltered: number[];
  if (accPrev === null) {
    accFiltered = [...accRaw];
  } else {
    accFiltered = accRaw.map((acc, i) => beta * acc + (1 - beta) * accPrev[i]);
  }

  let vel: number[];
  if (velPrev === null) {
    vel = [0, 0, 0];
  } else {
    vel = velPrev.map((v, i) => v + accFiltered[i] * dt);
  }

  return [accFiltered, vel];
}

function highPassFilterVelocityStep(
  velCurr: number[],
  velPrev: number[] | null,
  velPrevHp: number[] | null,
  alpha: number
): [number[], number[]] {
  let velHp: number[];
  
  if (velPrevHp === null || velPrev === null) {
    velHp = [0, 0, 0];
  } else {
    velHp = velPrevHp.map((vHp, i) => alpha * (vHp + velCurr[i] - velPrev[i]));
  }
  
  return [velHp, [...velHp]];
}

function createRotationMatrixZYX(yaw: number, pitch: number, roll: number): Matrix {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);

  // ZYX rotation matrix
  const R = new Matrix([
    [cy * cp, cy * sp * sr - sy * cr, cy * sp * cr + sy * sr],
    [sy * cp, sy * sp * sr + cy * cr, sy * sp * cr - cy * sr],
    [-sp, cp * sr, cp * cr]
  ]);

  return R;
}