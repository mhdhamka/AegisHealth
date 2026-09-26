/**
 * AegisHealth Biometrics SaaS - Core Type Definitions
 */

export type MetricType = 
  | 'heart_rate'
  | 'hrv'
  | 'blood_pressure'
  | 'spo2'
  | 'glucose'
  | 'sleep'
  | 'respiratory_rate'
  | 'steps'
  | 'vo2_max';

export interface BiometricPoint {
  timestamp: string; // ISO string
  timeLabel: string; // formatted time e.g. "08:00"
  dateLabel: string; // formatted date e.g. "Oct 24"
  heartRate: number; // bpm
  restingHeartRate: number; // bpm
  hrv: number; // ms (rMSSD)
  systolic: number; // mmHg
  diastolic: number; // mmHg
  spo2: number; // percentage
  glucose: number; // mg/dL
  respiratoryRate: number; // breaths/min
  steps: number;
  activeCalories: number;
  strain: number; // 0 - 21 scale
  recoveryScore: number; // 0 - 100%
  hasAnomaly?: boolean;
  anomalyNote?: string;
}

export interface SleepStagePoint {
  time: string; // "23:00", "01:30", etc.
  stage: 'awake' | 'rem' | 'light' | 'deep';
  stageScore: number; // 3: awake, 2: rem, 1: light, 0: deep
  heartRate: number;
  hrv: number;
}

export interface SleepRecord {
  date: string;
  totalDurationHours: number;
  efficiency: number; // percentage
  score: number; // 0 - 100
  deepSleepHours: number;
  deepPercent: number;
  remSleepHours: number;
  remPercent: number;
  lightSleepHours: number;
  lightPercent: number;
  awakeDurationMinutes: number;
  respiratoryRate: number;
  stages: SleepStagePoint[];
}

export type HealthLogCategory = 
  | 'vitals'
  | 'labs'
  | 'medication'
  | 'activity'
  | 'symptoms'
  | 'nutrition';

export type LogStatus = 'nominal' | 'elevated' | 'abnormal' | 'optimal';

export interface HealthLogEntry {
  id: string;
  timestamp: string;
  category: HealthLogCategory;
  title: string;
  metric: string;
  value: string | number;
  unit: string;
  referenceRange?: string;
  status: LogStatus;
  source: string; // e.g. "Garmin Epix Gen2", "Manual Entry", "Quest Diagnostics"
  notes?: string;
}

export interface WearableDevice {
  id: string;
  name: string;
  brand: 'Apple' | 'Garmin' | 'Whoop' | 'Oura' | 'Fitbit';
  model: string;
  status: 'connected' | 'syncing' | 'disconnected' | 'error';
  batteryPercent: number;
  lastSync: string;
  metricsSupported: MetricType[];
  autoSyncIntervalMinutes: number;
  totalRecordsSynced: number;
  firmwareVersion: string;
}

export interface BiometricAnomaly {
  id: string;
  timestamp: string;
  metric: MetricType;
  title: string;
  severity: 'low' | 'medium' | 'high';
  observedValue: string;
  expectedBaseline: string;
  clinicalContext: string;
  suggestedAction: string;
  status: 'active' | 'investigated' | 'resolved';
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  heightCm: number;
  weightKg: number;
  vo2Max: number;
  profileType: 'Athletic Performance' | 'Metabolic Health' | 'Cardiac Monitoring';
  avatarUrl: string;
}

export interface ApiEndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  springControllerMethod: string;
  sampleRequestPayload?: Record<string, any>;
  sampleResponsePayload: Record<string, any>;
}

export interface BiometricAlertRule {
  id: string;
  name: string;
  metric: 'heart_rate' | 'resting_heart_rate' | 'spo2' | 'systolic_bp' | 'glucose';
  operator: 'greater_than' | 'less_than';
  threshold: number;
  unit: string;
  severity: 'low' | 'medium' | 'critical';
  sustainedDurationMinutes: number; // 0 = instantaneous
  isEnabled: boolean;
  notifyChannels: ('in_app' | 'push' | 'sms' | 'clinician')[];
  description: string;
}

export interface AlertIncident {
  id: string;
  ruleId: string;
  metric: string;
  ruleName: string;
  timestamp: string;
  triggerValue: number;
  thresholdValue: number;
  unit: string;
  severity: 'low' | 'medium' | 'critical';
  status: 'active' | 'acknowledged' | 'dismissed';
}
