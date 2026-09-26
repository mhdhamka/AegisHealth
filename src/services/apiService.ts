/**
 * AegisHealth Biometrics RESTful Service & Data Store
 * Simulates enterprise Spring Boot REST API + Redis cache + PostgreSQL persistence.
 */

import { 
  BiometricPoint, 
  SleepRecord, 
  HealthLogEntry, 
  WearableDevice, 
  BiometricAnomaly,
  UserProfile
} from '../types/health';
import { 
  generate24HourTelemetry, 
  generate7DayTelemetry, 
  generate30DayTelemetry, 
  latestSleepRecord,
  initialWearableDevices, 
  initialHealthLogs, 
  initialAnomalies, 
  currentUser 
} from '../data/mockData';

const STORAGE_KEYS = {
  HEALTH_LOGS: 'aegis_health_logs_v1',
  WEARABLES: 'aegis_wearables_v1',
  ANOMALIES: 'aegis_anomalies_v1',
  CACHE_STATS: 'aegis_redis_stats_v1',
};

// In-memory or localStorage cache
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

export interface RedisCacheMetrics {
  hits: number;
  misses: number;
  keysCount: number;
  memoryUsedKb: number;
  uptimeSeconds: number;
}

class HealthDataService {
  private logs: HealthLogEntry[] = getStored(STORAGE_KEYS.HEALTH_LOGS, initialHealthLogs);
  private devices: WearableDevice[] = getStored(STORAGE_KEYS.WEARABLES, initialWearableDevices);
  private anomalies: BiometricAnomaly[] = getStored(STORAGE_KEYS.ANOMALIES, initialAnomalies);
  private cacheStats: RedisCacheMetrics = getStored(STORAGE_KEYS.CACHE_STATS, {
    hits: 1420,
    misses: 84,
    keysCount: 68,
    memoryUsedKb: 512,
    uptimeSeconds: 86400
  });

  private telemetryCache = {
    '24h': generate24HourTelemetry(),
    '7d': generate7DayTelemetry(),
    '30d': generate30DayTelemetry()
  };

  private recordCacheHit() {
    this.cacheStats.hits += 1;
    setStored(STORAGE_KEYS.CACHE_STATS, this.cacheStats);
  }

  private recordCacheMiss() {
    this.cacheStats.misses += 1;
    setStored(STORAGE_KEYS.CACHE_STATS, this.cacheStats);
  }

  // REST API Methods
  async getTelemetry(range: '24h' | '7d' | '30d'): Promise<{ data: BiometricPoint[]; cached: boolean; latencyMs: number }> {
    const start = performance.now();
    await new Promise(r => setTimeout(r, 120)); // simulated Spring Boot latency
    this.recordCacheHit();
    return {
      data: this.telemetryCache[range],
      cached: true,
      latencyMs: Math.round(performance.now() - start)
    };
  }

  async getSleepRecord(): Promise<SleepRecord> {
    await new Promise(r => setTimeout(r, 80));
    return latestSleepRecord;
  }

  async getHealthLogs(): Promise<HealthLogEntry[]> {
    await new Promise(r => setTimeout(r, 90));
    return [...this.logs];
  }

  async addHealthLog(entry: Omit<HealthLogEntry, 'id' | 'timestamp'>): Promise<HealthLogEntry> {
    await new Promise(r => setTimeout(r, 150));
    const now = new Date();
    const newEntry: HealthLogEntry = {
      ...entry,
      id: `log_${Date.now()}`,
      timestamp: `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };
    this.logs = [newEntry, ...this.logs];
    setStored(STORAGE_KEYS.HEALTH_LOGS, this.logs);
    this.recordCacheMiss();
    return newEntry;
  }

  async deleteHealthLog(id: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 100));
    this.logs = this.logs.filter(l => l.id !== id);
    setStored(STORAGE_KEYS.HEALTH_LOGS, this.logs);
    return true;
  }

  async getWearableDevices(): Promise<WearableDevice[]> {
    await new Promise(r => setTimeout(r, 60));
    return [...this.devices];
  }

  async syncWearable(deviceId: string): Promise<{ device: WearableDevice; samplesSynced: number }> {
    await new Promise(r => setTimeout(r, 600)); // realistic ingestion delay
    const deviceIndex = this.devices.findIndex(d => d.id === deviceId);
    if (deviceIndex === -1) throw new Error('Device not found');

    const samples = Math.floor(Math.random() * 450) + 120;
    const updated = {
      ...this.devices[deviceIndex],
      lastSync: 'Just now',
      totalRecordsSynced: this.devices[deviceIndex].totalRecordsSynced + samples
    };
    this.devices[deviceIndex] = updated;
    setStored(STORAGE_KEYS.WEARABLES, this.devices);
    return { device: updated, samplesSynced: samples };
  }

  async syncAllWearables(): Promise<{ totalSamples: number; updatedDevices: WearableDevice[] }> {
    await new Promise(r => setTimeout(r, 900));
    let totalSamples = 0;
    this.devices = this.devices.map(d => {
      const added = Math.floor(Math.random() * 300) + 80;
      totalSamples += added;
      return {
        ...d,
        lastSync: 'Just now',
        totalRecordsSynced: d.totalRecordsSynced + added
      };
    });
    setStored(STORAGE_KEYS.WEARABLES, this.devices);
    return { totalSamples, updatedDevices: this.devices };
  }

  async getAnomalies(): Promise<BiometricAnomaly[]> {
    await new Promise(r => setTimeout(r, 70));
    return [...this.anomalies];
  }

  async resolveAnomaly(id: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 80));
    this.anomalies = this.anomalies.map(a => a.id === id ? { ...a, status: 'resolved' } : a);
    setStored(STORAGE_KEYS.ANOMALIES, this.anomalies);
    return true;
  }

  getCacheMetrics(): RedisCacheMetrics {
    return { ...this.cacheStats };
  }

  // Export dataset to CSV format
  exportToCsv(type: 'logs' | 'telemetry'): string {
    if (type === 'logs') {
      const headers = ['ID', 'Timestamp', 'Category', 'Title', 'Metric', 'Value', 'Unit', 'Status', 'Source', 'Notes'];
      const rows = this.logs.map(l => [
        l.id,
        `"${l.timestamp}"`,
        l.category,
        `"${l.title}"`,
        `"${l.metric}"`,
        `"${l.value}"`,
        l.unit,
        l.status,
        `"${l.source}"`,
        `"${l.notes?.replace(/"/g, '""') || ''}"`
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else {
      const headers = ['Timestamp', 'TimeLabel', 'HeartRate', 'HRV_ms', 'Systolic', 'Diastolic', 'SpO2', 'Glucose', 'Steps', 'RecoveryScore', 'Strain'];
      const rows = this.telemetryCache['24h'].map(p => [
        p.timestamp,
        p.timeLabel,
        p.heartRate,
        p.hrv,
        p.systolic,
        p.diastolic,
        p.spo2,
        p.glucose,
        p.steps,
        p.recoveryScore,
        p.strain
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }
  }

  // REST API Playground Request Dispatcher
  async executeApiCall(method: 'GET' | 'POST' | 'DELETE', endpoint: string, body?: any): Promise<{
    statusCode: number;
    latencyMs: number;
    headers: Record<string, string>;
    responseBody: any;
  }> {
    const start = performance.now();
    await new Promise(r => setTimeout(r, 140 + Math.random() * 80));
    const latency = Math.round(performance.now() - start);

    const headers = {
      'content-type': 'application/json; charset=utf-8',
      'x-powered-by': 'Spring-Boot-3.3.2 / Undertow',
      'x-cache': 'HIT (Redis 7.2)',
      'x-rate-limit-remaining': '984/1000'
    };

    if (method === 'GET' && endpoint.startsWith('/api/v1/biometrics/summary')) {
      return {
        statusCode: 200,
        latencyMs: latency,
        headers,
        responseBody: {
          status: 'success',
          timestamp: new Date().toISOString(),
          restingHeartRate: 51,
          hrvRmssd: 78,
          bloodPressure: '116/72 mmHg',
          spo2Percent: 98.4,
          fastingGlucose: 88,
          recoveryScore: 84,
          strainScore: 14.8,
          vo2Max: 54.8
        }
      };
    }

    if (method === 'GET' && endpoint.startsWith('/api/v1/biometrics/timeseries')) {
      const url = new URL(`http://localhost${endpoint}`);
      const range = (url.searchParams.get('range') || '24h') as '24h' | '7d' | '30d';
      const data = this.telemetryCache[range] || this.telemetryCache['24h'];
      return {
        statusCode: 200,
        latencyMs: latency,
        headers,
        responseBody: {
          status: 'success',
          range,
          totalPoints: data.length,
          points: data.slice(0, 10), // truncate for preview
          note: 'Full dataset contains ' + data.length + ' synchronized samples'
        }
      };
    }

    if (method === 'GET' && endpoint.startsWith('/api/v1/health-logs')) {
      return {
        statusCode: 200,
        latencyMs: latency,
        headers,
        responseBody: {
          status: 'success',
          count: this.logs.length,
          data: this.logs
        }
      };
    }

    if (method === 'POST' && endpoint.startsWith('/api/v1/health-logs')) {
      if (!body?.metric || !body?.value) {
        return {
          statusCode: 400,
          latencyMs: latency,
          headers,
          responseBody: {
            error: 'BAD_REQUEST',
            message: 'Validation failed: metric and value fields are required.',
            timestamp: new Date().toISOString()
          }
        };
      }
      const newEntry = await this.addHealthLog(body);
      return {
        statusCode: 201,
        latencyMs: latency,
        headers: { ...headers, 'x-cache': 'BYPASS (INSERT)' },
        responseBody: {
          status: 'created',
          id: newEntry.id,
          data: newEntry
        }
      };
    }

    if (method === 'POST' && endpoint.startsWith('/api/v1/wearables/sync')) {
      const syncResult = await this.syncAllWearables();
      return {
        statusCode: 200,
        latencyMs: latency,
        headers: { ...headers, 'x-cache': 'INVALIDATED' },
        responseBody: {
          status: 'synced',
          totalSamplesIngested: syncResult.totalSamples,
          devicesSynced: syncResult.updatedDevices.length,
          ingestionTimestamp: new Date().toISOString()
        }
      };
    }

    return {
      statusCode: 404,
      latencyMs: latency,
      headers,
      responseBody: {
        error: 'NOT_FOUND',
        message: `Endpoint ${method} ${endpoint} not recognized on API Gateway.`,
        availableEndpoints: [
          'GET /api/v1/biometrics/summary',
          'GET /api/v1/biometrics/timeseries?range=24h',
          'GET /api/v1/health-logs',
          'POST /api/v1/health-logs',
          'POST /api/v1/wearables/sync'
        ]
      }
    };
  }
}

export const apiService = new HealthDataService();
