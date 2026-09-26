/**
 * AegisHealth Biometrics SaaS - Realistic Mock Dataset
 * Contains 24h, 7d, 30d, and 90d telemetry, sleep hypnograms, lab panels, and wearable devices.
 */
import { BiometricPoint, SleepRecord, HealthLogEntry, WearableDevice, BiometricAnomaly, UserProfile } from '../types/health';
import avatarImg from '../assets/images/avatar_health_analyst_1790264973860.jpg';

export const currentUser: UserProfile = {
  id: 'usr_elena_894',
  name: 'Dr. Elena Vance, MD',
  role: 'Clinical Investigator & Triathlete',
  age: 34,
  gender: 'Female',
  heightCm: 172,
  weightKg: 64.2,
  vo2Max: 54.8,
  profileType: 'Athletic Performance',
  avatarUrl: avatarImg,
};

export const alternateProfiles: UserProfile[] = [
  currentUser,
  {
    id: 'usr_marcus_212',
    name: 'Marcus Chen',
    role: 'Metabolic Syndrome Protocol',
    age: 48,
    gender: 'Male',
    heightCm: 180,
    weightKg: 89.5,
    vo2Max: 38.2,
    profileType: 'Metabolic Health',
    avatarUrl: avatarImg,
  },
  {
    id: 'usr_sarah_419',
    name: 'Sarah Jenkins',
    role: 'Arrhythmia & Cardiac Monitoring',
    age: 61,
    gender: 'Female',
    heightCm: 165,
    weightKg: 71.0,
    vo2Max: 31.4,
    profileType: 'Cardiac Monitoring',
    avatarUrl: avatarImg,
  }
];

// Generate 24-hour telemetry points (hourly)
export const generate24HourTelemetry = (): BiometricPoint[] => {
  const points: BiometricPoint[] = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    // Circadian rhythms: HR lower during sleep (23:00 - 07:00), higher during afternoon workout (17:00 - 18:00)
    let isSleeping = hour >= 23 || hour <= 6;
    let isWorkout = hour === 17;
    
    let hr = isSleeping ? Math.round(52 + Math.sin(hour) * 4) : isWorkout ? 158 : Math.round(68 + Math.sin(hour) * 9);
    let hrv = isSleeping ? Math.round(78 + Math.cos(hour) * 12) : isWorkout ? 26 : Math.round(62 + Math.sin(hour) * 8);
    let sys = isSleeping ? 108 : isWorkout ? 142 : 118;
    let dia = isSleeping ? 68 : isWorkout ? 82 : 74;
    let spo2 = isSleeping ? 97 : 99;
    let glucose = (hour === 8 || hour === 13 || hour === 19) ? 134 : 92 + Math.round(Math.sin(hour) * 6);
    let steps = isSleeping ? 0 : isWorkout ? 4200 : Math.round(450 + Math.random() * 300);

    const isMiddaySpike = hour === 14;
    const isNocturnalDip = hour === 4;
    const hasAnomaly = isMiddaySpike || isNocturnalDip;

    if (isMiddaySpike) {
      hr = 98;
      hrv = 41;
      sys = 132;
    } else if (isNocturnalDip) {
      hr = 42;
      hrv = 98;
      spo2 = 93.8;
    }

    points.push({
      timestamp: time.toISOString(),
      timeLabel: `${String(hour).padStart(2, '0')}:00`,
      dateLabel: time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      heartRate: hr,
      restingHeartRate: 51,
      hrv: hrv,
      systolic: sys,
      diastolic: dia,
      spo2: spo2,
      glucose: glucose,
      respiratoryRate: isSleeping ? 13.8 : 15.2,
      steps: steps,
      activeCalories: isWorkout ? 540 : 45,
      strain: 14.8,
      recoveryScore: 84,
      hasAnomaly,
      anomalyNote: isMiddaySpike 
        ? 'Midday sympathetic surge (HR 98 bpm, HRV 41 ms) during clinical ICU rounds' 
        : isNocturnalDip 
          ? 'Transient nocturnal SpO2 dip (93.8%) and bradycardia (42 bpm) during REM cycle' 
          : undefined
    });
  }
  return points;
};

// Generate 7-day daily summary points
export const generate7DayTelemetry = (): BiometricPoint[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseHr = [53, 52, 55, 51, 50, 54, 51];
  const baseHrv = [72, 79, 64, 85, 88, 70, 82];
  const baseSys = [118, 116, 122, 114, 115, 120, 115];
  const baseDia = [74, 72, 78, 71, 70, 75, 72];
  const baseSteps = [11200, 12450, 8900, 14200, 15800, 18900, 9300];
  const baseRecovery = [76, 84, 58, 92, 95, 68, 88];
  const baseStrain = [13.2, 14.5, 11.0, 16.8, 17.5, 19.2, 8.4];

  return days.map((day, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - idx));
    const isWedAnomaly = idx === 2; // Wednesday recovery dip
    const isSatAnomaly = idx === 5; // Saturday strain spike
    const isAnomaly = isWedAnomaly || isSatAnomaly;

    const note = isWedAnomaly
      ? 'Autonomic recovery dip (-36% HRV rMSSD) triggered by back-to-back ICU night shifts'
      : isSatAnomaly
        ? 'High cardiovascular strain (19.2/21) with acute resting HR elevation (+8 bpm)'
        : undefined;

    return {
      timestamp: date.toISOString(),
      timeLabel: day,
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      heartRate: baseHr[idx],
      restingHeartRate: baseHr[idx],
      hrv: baseHrv[idx],
      systolic: baseSys[idx],
      diastolic: baseDia[idx],
      spo2: 98.4,
      glucose: 94,
      respiratoryRate: 14.1,
      steps: baseSteps[idx],
      activeCalories: Math.round(baseSteps[idx] * 0.045),
      strain: baseStrain[idx],
      recoveryScore: baseRecovery[idx],
      hasAnomaly: isAnomaly,
      anomalyNote: note
    };
  });
};

// Generate 30-day points
export const generate30DayTelemetry = (): BiometricPoint[] => {
  const points: BiometricPoint[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const wave = Math.sin(i * 0.4);
    const rhr = Math.round(51 + wave * 3.5);
    const hrv = Math.round(76 - wave * 14 + (Math.random() * 6 - 3));
    const sys = Math.round(116 + wave * 4);
    const dia = Math.round(73 + wave * 2.5);
    const steps = Math.round(11500 + wave * 2500 + (Math.random() * 1500));
    const recovery = Math.round(80 - wave * 18);
    const strain = Math.round((13.5 + wave * 3.8) * 10) / 10;
    
    const isAnomaly1 = i === 12;
    const isAnomaly2 = i === 22;
    const isAnomaly3 = i === 4;
    const isAnomaly = isAnomaly1 || isAnomaly2 || isAnomaly3;

    const note = isAnomaly1
      ? 'Systemic parasympathetic fatigue: HRV nadir (48ms) and delayed recovery index'
      : isAnomaly2
        ? 'Hypertensive Stage 1 excursion (136/88 mmHg) post extended work shift'
        : isAnomaly3
          ? 'Post-prandial glycemic surge (148 mg/dL) following high-carbohydrate lunch'
          : undefined;

    points.push({
      timestamp: d.toISOString(),
      timeLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      heartRate: rhr,
      restingHeartRate: rhr,
      hrv: hrv,
      systolic: sys,
      diastolic: dia,
      spo2: 98.2,
      glucose: 93 + Math.round(wave * 5),
      respiratoryRate: 14.0,
      steps: steps,
      activeCalories: Math.round(steps * 0.042),
      strain: strain,
      recoveryScore: Math.min(99, Math.max(35, recovery)),
      hasAnomaly: isAnomaly,
      anomalyNote: isAnomaly ? 'Significant nocturnal HRV drop (48ms) indicating systemic fatigue' : undefined
    });
  }
  return points;
};

// Realistic sleep stages for last night
export const latestSleepRecord: SleepRecord = {
  date: 'Last Night (22:45 - 06:40)',
  totalDurationHours: 7.9,
  efficiency: 92,
  score: 88,
  deepSleepHours: 1.85,
  deepPercent: 23,
  remSleepHours: 1.95,
  remPercent: 25,
  lightSleepHours: 3.5,
  lightPercent: 44,
  awakeDurationMinutes: 38,
  respiratoryRate: 13.9,
  stages: [
    { time: '22:45', stage: 'awake', stageScore: 3, heartRate: 66, hrv: 58 },
    { time: '23:15', stage: 'light', stageScore: 1, heartRate: 58, hrv: 70 },
    { time: '23:45', stage: 'deep', stageScore: 0, heartRate: 49, hrv: 92 },
    { time: '00:30', stage: 'deep', stageScore: 0, heartRate: 48, hrv: 96 },
    { time: '01:15', stage: 'light', stageScore: 1, heartRate: 53, hrv: 82 },
    { time: '01:45', stage: 'rem', stageScore: 2, heartRate: 61, hrv: 68 },
    { time: '02:30', stage: 'deep', stageScore: 0, heartRate: 47, hrv: 98 },
    { time: '03:15', stage: 'light', stageScore: 1, heartRate: 52, hrv: 84 },
    { time: '03:45', stage: 'rem', stageScore: 2, heartRate: 63, hrv: 64 },
    { time: '04:30', stage: 'light', stageScore: 1, heartRate: 54, hrv: 76 },
    { time: '05:15', stage: 'rem', stageScore: 2, heartRate: 64, hrv: 62 },
    { time: '06:00', stage: 'light', stageScore: 1, heartRate: 56, hrv: 72 },
    { time: '06:25', stage: 'awake', stageScore: 3, heartRate: 68, hrv: 60 },
    { time: '06:40', stage: 'awake', stageScore: 3, heartRate: 72, hrv: 58 },
  ]
};

// Wearable Devices connected to the SaaS hub
export const initialWearableDevices: WearableDevice[] = [
  {
    id: 'dev_garmin_01',
    name: 'Garmin Epix Gen 2 Pro',
    brand: 'Garmin',
    model: 'Sapphire Edition 47mm',
    status: 'connected',
    batteryPercent: 78,
    lastSync: '2 minutes ago',
    metricsSupported: ['heart_rate', 'hrv', 'spo2', 'respiratory_rate', 'steps', 'vo2_max'],
    autoSyncIntervalMinutes: 5,
    totalRecordsSynced: 248190,
    firmwareVersion: '16.22'
  },
  {
    id: 'dev_whoop_02',
    name: 'Whoop 4.0 Sensor',
    brand: 'Whoop',
    model: 'Bicep Sleeve / Wrist Band',
    status: 'connected',
    batteryPercent: 88,
    lastSync: '6 minutes ago',
    metricsSupported: ['heart_rate', 'hrv', 'sleep', 'spo2'],
    autoSyncIntervalMinutes: 5,
    totalRecordsSynced: 894200,
    firmwareVersion: '4.1.09-rc'
  },
  {
    id: 'dev_oura_03',
    name: 'Oura Ring Horizon',
    brand: 'Oura',
    model: 'Heritage Stealth Gen 3',
    status: 'connected',
    batteryPercent: 62,
    lastSync: '14 minutes ago',
    metricsSupported: ['sleep', 'hrv', 'heart_rate', 'spo2'],
    autoSyncIntervalMinutes: 15,
    totalRecordsSynced: 124500,
    firmwareVersion: '2.9.22'
  },
  {
    id: 'dev_apple_04',
    name: 'Apple Watch Ultra 2',
    brand: 'Apple',
    model: 'Titanium Cellular 49mm',
    status: 'idle' as any,
    batteryPercent: 91,
    lastSync: '1 hour ago',
    metricsSupported: ['heart_rate', 'blood_pressure', 'spo2', 'steps', 'vo2_max'],
    autoSyncIntervalMinutes: 30,
    totalRecordsSynced: 642100,
    firmwareVersion: 'watchOS 11.2'
  },
  {
    id: 'dev_dexcom_05',
    name: 'Dexcom G7 Continuous Glucose',
    brand: 'Fitbit',
    model: 'CGM Subcutaneous Sensor',
    status: 'connected',
    batteryPercent: 100,
    lastSync: '5 minutes ago',
    metricsSupported: ['glucose'],
    autoSyncIntervalMinutes: 5,
    totalRecordsSynced: 43200,
    firmwareVersion: '2.4.1'
  }
];

// Health Logs & Clinical Biomarkers
export const initialHealthLogs: HealthLogEntry[] = [
  {
    id: 'log_901',
    timestamp: 'Today, 07:15 AM',
    category: 'vitals',
    title: 'Morning Resting Blood Pressure',
    metric: 'Blood Pressure',
    value: '116 / 72',
    unit: 'mmHg',
    referenceRange: '< 120/80',
    status: 'optimal',
    source: 'Omron Evolv BLE',
    notes: 'Taken seated after 5 min quiet rest. Posture relaxed, bilateral check nominal.'
  },
  {
    id: 'log_902',
    timestamp: 'Today, 06:45 AM',
    category: 'vitals',
    title: 'Fasting Blood Glucose',
    metric: 'Blood Glucose',
    value: 88,
    unit: 'mg/dL',
    referenceRange: '70 - 99',
    status: 'optimal',
    source: 'Dexcom G7 CGM',
    notes: '12-hour overnight fast verified. Dawn phenomenon minimal (+4 mg/dL).'
  },
  {
    id: 'log_903',
    timestamp: 'Yesterday, 08:30 PM',
    category: 'activity',
    title: 'Threshold Interval Session',
    metric: 'Peak HR & Lactate Estimate',
    value: 174,
    unit: 'bpm',
    referenceRange: 'Zone 4/5',
    status: 'nominal',
    source: 'Garmin Epix Gen 2',
    notes: '5x 1km repeats @ 3:45/km pace. Aerobic decoupling 2.8% (very stable).'
  },
  {
    id: 'log_904',
    timestamp: 'Sep 22, 2026, 09:00 AM',
    category: 'labs',
    title: 'Apolipoprotein B (ApoB)',
    metric: 'ApoB Concentration',
    value: 64,
    unit: 'mg/dL',
    referenceRange: '< 80',
    status: 'optimal',
    source: 'Labcorp Comprehensive Panel',
    notes: 'Optimal cardiovascular longevity target achieved (<70 mg/dL).'
  },
  {
    id: 'log_905',
    timestamp: 'Sep 22, 2026, 09:00 AM',
    category: 'labs',
    title: 'High-Sensitivity C-Reactive Protein (hs-CRP)',
    metric: 'hs-CRP',
    value: 0.42,
    unit: 'mg/L',
    referenceRange: '< 1.0',
    status: 'optimal',
    source: 'Labcorp Comprehensive Panel',
    notes: 'Low systemic inflammatory state.'
  },
  {
    id: 'log_906',
    timestamp: 'Sep 20, 2026, 11:30 PM',
    category: 'vitals',
    title: 'Elevated Evening Systolic',
    metric: 'Blood Pressure',
    value: '136 / 88',
    unit: 'mmHg',
    referenceRange: '< 120/80',
    status: 'elevated',
    source: 'Manual Cuff Check',
    notes: 'Occurred following 28-hour on-call ICU shift and acute caffeine intake.'
  },
  {
    id: 'log_907',
    timestamp: 'Sep 18, 2026, 07:00 AM',
    category: 'labs',
    title: 'Fasting Serum Ferritin',
    metric: 'Ferritin',
    value: 78,
    unit: 'ng/mL',
    referenceRange: '30 - 200',
    status: 'nominal',
    source: 'Quest Diagnostics',
    notes: 'Iron stores adequate for endurance volume training.'
  },
  {
    id: 'log_908',
    timestamp: 'Sep 15, 2026, 08:00 AM',
    category: 'labs',
    title: 'Vitamin D 25-Hydroxy',
    metric: '25-OH Vitamin D',
    value: 58.4,
    unit: 'ng/mL',
    referenceRange: '40 - 70',
    status: 'optimal',
    source: 'Quest Diagnostics',
    notes: 'Supplemental 4000 IU D3 + K2 maintaining optimal tissue concentration.'
  },
  {
    id: 'log_909',
    timestamp: 'Sep 12, 2026, 02:15 PM',
    category: 'symptoms',
    title: 'Post-Exertional Autonomic Fatigue',
    metric: 'Subjective Fatigue Score',
    value: '6 / 10',
    unit: 'Scale',
    referenceRange: '< 3',
    status: 'abnormal',
    source: 'Subjective Patient Log',
    notes: 'Reported heavy legs and lethargy after back-to-back 20km long runs.'
  }
];

// Algorithmic Anomalies and Insights
export const initialAnomalies: BiometricAnomaly[] = [
  {
    id: 'anom_001',
    timestamp: '3 days ago',
    metric: 'hrv',
    title: 'Significant Parasympathetic Withdrawal (HRV Dip)',
    severity: 'medium',
    observedValue: '48 ms rMSSD',
    expectedBaseline: '76 ± 8 ms',
    clinicalContext: 'Autonomic nervous system recovery suppressed by 36% below 30-day baseline. Preceded by nocturnal resting heart rate elevation of +4 bpm.',
    suggestedAction: 'Program active recovery or zone 1 spin; postpone high-intensity interval training until autonomic baseline stabilizes.',
    status: 'active'
  },
  {
    id: 'anom_002',
    timestamp: '4 days ago',
    metric: 'blood_pressure',
    title: 'Stage 1 Systolic Excursion Post-Shift',
    severity: 'medium',
    observedValue: '136 / 88 mmHg',
    expectedBaseline: '116 / 72 mmHg',
    clinicalContext: 'Transient vascular resistance spike observed post-strenuous work shift and excessive caffeine consumption. Morning re-tests returned to baseline (115/71 mmHg).',
    suggestedAction: 'Limit stimulant intake past 14:00; monitor with 24-hour ambulatory protocol if recurrent.',
    status: 'investigated'
  },
  {
    id: 'anom_003',
    timestamp: '1 week ago',
    metric: 'spo2',
    title: 'Brief Nocturnal Desaturation Event',
    severity: 'low',
    observedValue: '93% SpO2 (4 min)',
    expectedBaseline: '97 - 99%',
    clinicalContext: 'Single transient dip during REM stage transition. No snoring audio triggers or sleep fragmentation detected by Oura or Whoop.',
    suggestedAction: 'Continue passive nocturnal pulse oximetry monitoring. No clinical apnea indication at this time.',
    status: 'resolved'
  }
];
