# AegisHealth API Service Architecture & Developer Guide

> **Audience**: Frontend Engineers, Full-Stack Developers, QA Engineers, and Technical Onboardees  
> **Source Location**: `src/services/apiService.ts`  
> **Core Module**: `HealthDataService` (instantiated as singleton `apiService`)  

---

## 1. Architectural Overview

The `apiService` serves as the central data access and network simulation layer for AegisHealth. It encapsulates all interactions with wearable telemetry streams, clinical health logs, autonomic recovery scoring, and threshold alert rules.

In development and client-side demonstration modes, `apiService` operates as an **In-Memory & LocalStorage Hybrid Store** with realistic asynchronous latencies and cache metrics, providing an immediate developer experience with zero local backend setup dependencies.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT APPLICATION LAYER                                │
│          React 19 Components (DashboardView, BiometricsAnalyticsView, etc.)           │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Calls API methods (Promises)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        apiService (HealthDataService Singleton)                        │
│                                                                                        │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌──────────────────────────┐  │
│  │ Asynchronous Delay     │  │ In-Memory Ingestion    │  │ Cache Metric Tracker     │  │
│  │ (Simulated 60-600ms)   │  │ (24h/7d/30d Buffers)   │  │ (Redis Hits/Misses)      │  │
│  └───────────┬────────────┘  └───────────┬────────────┘  └────────────┬─────────────┘  │
└──────────────┼───────────────────────────┼────────────────────────────┼────────────────┘
               │                           │                            │
               ▼                           ▼                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         PERSISTENCE & REHYDRATION ENGINE                               │
│  • Browser localStorage (aegis_health_logs_v1, aegis_wearables_v1, etc.)               │
│  • Deterministic Mock Generators (generate24HourTelemetry, latestSleepRecord)          │
│  • RFC 4180 CSV Serializer (exportToCsv)                                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Service Methods & API Contracts

### 2.1 Telemetry & Sleep Polysomnography

| Method | Signature | Description |
| :--- | :--- | :--- |
| `getTelemetry` | `(range: '24h' \| '7d' \| '30d') => Promise<{ data: BiometricPoint[]; cached: boolean; latencyMs: number }>` | Retrieves time-series points including heart rate, HRV rMSSD, SpO2, blood pressure, and glucose. Simulates 120ms Spring Boot round-trip. |
| `getSleepRecord` | `() => Promise<SleepRecord>` | Returns nocturnal polysomnographic record, stage proportions (Awake, REM, Light, Deep), and efficiency scores. |

### 2.2 Health Logs & Biomarker Labs

| Method | Signature | Description |
| :--- | :--- | :--- |
| `getHealthLogs` | `() => Promise<HealthLogEntry[]>` | Retrieves user and clinician recorded biomarker entries (e.g. lipid panels, glucose spot checks). |
| `addHealthLog` | `(entry: Omit<HealthLogEntry, 'id' \| 'timestamp'>) => Promise<HealthLogEntry>` | Appends new log, assigns unique ID, updates `localStorage`, records cache bypass. |
| `deleteHealthLog` | `(id: string) => Promise<boolean>` | Removes entry by ID and synchronizes storage. |

### 2.3 Wearable Synchronizations

| Method | Signature | Description |
| :--- | :--- | :--- |
| `getWearableDevices` | `() => Promise<WearableDevice[]>` | Returns status, battery level, protocol, and record counts for all connected hardware. |
| `syncWearable` | `(deviceId: string) => Promise<{ device: WearableDevice; samplesSynced: number }>` | Simulates Bluetooth/Cloud sync (600ms latency) and ingests 120-570 samples. |
| `syncAllWearables` | `() => Promise<{ totalSamples: number; updatedDevices: WearableDevice[] }>` | Concurrently synchronizes all connected sensors (900ms latency). |

### 2.4 Biometric Anomalies

| Method | Signature | Description |
| :--- | :--- | :--- |
| `getAnomalies` | `() => Promise<BiometricAnomaly[]>` | Retrieves detected tachycardia, hypoxemia, or PVC arrhythmia alerts. |
| `resolveAnomaly` | `(id: string) => Promise<boolean>` | Marks anomaly status as `'resolved'` with persistent audit trail. |

### 2.5 Data Export

| Method | Signature | Description |
| :--- | :--- | :--- |
| `exportToCsv` | `(type: 'logs' \| 'telemetry') => string` | Serializes in-memory datasets into standard RFC 4180 comma-separated values. |
| `executeApiCall` | `(method: 'GET' \| 'POST' \| 'DELETE', endpoint: string, body?: any) => Promise<ApiResponse>` | Simulates low-level HTTP network calls with status codes, headers, and payload schemas. |

---

## 3. How to Extend `apiService` With New Endpoints

Follow this step-by-step recipe to add new domain capabilities (e.g., continuous blood pressure monitoring, medication logs, or doctor consultation notes).

### Step 1: Define TypeScript Types

Open `src/types/health.ts` and define the data model:

```typescript
// src/types/health.ts
export interface MedicationDoseLog {
  id: string;
  medicationName: string;
  dosageMg: number;
  scheduledTime: string;
  takenAt?: string;
  status: 'pending' | 'taken' | 'skipped';
  prescribedBy: string;
}
```

### Step 2: Add Storage Key & Initial Mock State

Open `src/services/apiService.ts`:

```typescript
// 1. Add storage key constant
const STORAGE_KEYS = {
  // ... existing keys
  MEDICATIONS: 'aegis_medications_v1',
};

// 2. Add private state variable in HealthDataService class
class HealthDataService {
  private medications: MedicationDoseLog[] = getStored(STORAGE_KEYS.MEDICATIONS, [
    {
      id: 'med_001',
      medicationName: 'Metoprolol Tartrate',
      dosageMg: 25,
      scheduledTime: '08:00',
      takenAt: 'Today, 08:05',
      status: 'taken',
      prescribedBy: 'Dr. Sarah Jenkins'
    }
  ]);

  // ...
```

### Step 3: Implement CRUD Methods With Latency Simulation

Add public asynchronous methods with realistic latency models:

```typescript
  // Retrieve medications
  async getMedications(): Promise<MedicationDoseLog[]> {
    await new Promise(r => setTimeout(r, 80)); // 80ms network latency
    this.recordCacheHit();
    return [...this.medications];
  }

  // Record medication taken
  async markMedicationTaken(id: string): Promise<MedicationDoseLog> {
    await new Promise(r => setTimeout(r, 120));
    const index = this.medications.findIndex(m => m.id === id);
    if (index === -1) throw new Error(`Medication ${id} not found`);

    const now = new Date();
    const updated: MedicationDoseLog = {
      ...this.medications[index],
      status: 'taken',
      takenAt: `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    this.medications[index] = updated;
    setStored(STORAGE_KEYS.MEDICATIONS, this.medications);
    this.recordCacheMiss();
    return updated;
  }
```

### Step 4: Register in `executeApiCall` (API Playground Dispatcher)

If the endpoint should be discoverable via the REST sandbox:

```typescript
    if (method === 'GET' && endpoint.startsWith('/api/v1/medications')) {
      return {
        statusCode: 200,
        latencyMs: latency,
        headers,
        responseBody: {
          status: 'success',
          count: this.medications.length,
          data: this.medications
        }
      };
    }
```

---

## 4. Mocking Strategies for New Team Members

When creating mocks for high-frequency biometrics, avoid simplistic static arrays. Follow these guidelines:

### 4.1 Physiological Realism & Continuity
- **Normal ranges**: Resting HR should fluctuate naturally between 48–78 BPM; SpO2 between 96–99%.
- **Autonomic correlation**: As heart rate increases, HRV rMSSD should inversely decrease.
- **Diurnal circadian cycles**: Nocturnal hours (00:00–06:00) must demonstrate lower metabolic demand (lower HR, lower body temperature, higher rMSSD).

```typescript
// Example: Correlated Point Generator
export function generateRealisticPoint(hour: number): BiometricPoint {
  const isNight = hour >= 23 || hour <= 6;
  const baseHr = isNight ? 50 : 68;
  const jitter = (Math.random() - 0.5) * 6;
  const heartRate = Math.round(baseHr + jitter);
  
  // Inverse autonomic correlation: Higher HR -> Lower HRV
  const hrv = Math.round(Math.max(25, 110 - (heartRate * 0.7) + (Math.random() * 8)));

  return {
    timestamp: new Date(Date.now() - (24 - hour) * 3600000).toISOString(),
    timeLabel: `${String(hour).padStart(2, '0')}:00`,
    heartRate,
    restingHeartRate: isNight ? 48 : 52,
    hrv,
    systolic: isNight ? 108 : 118,
    diastolic: isNight ? 66 : 74,
    spo2: isNight ? 98.6 : 98.2,
    glucose: isNight ? 82 : 94,
    respiratoryRate: isNight ? 13.2 : 15.0,
    steps: isNight ? 0 : Math.floor(Math.random() * 800) + 150,
    activeCalories: isNight ? 0 : Math.floor(Math.random() * 60) + 10,
    strain: isNight ? 0 : Number((hour * 0.55).toFixed(1)),
    recoveryScore: 84
  };
}
```

### 4.2 Error Simulation & Chaos Testing

To test application resilience against network failures, transient timeouts, or 500 errors, instantiate an optional chaos mode in `apiService`:

```typescript
class HealthDataService {
  private failureRate = 0.0; // Set to 0.05 for 5% simulated dropped packets

  setFailureRate(rate: number) {
    this.failureRate = rate;
  }

  private checkChaos() {
    if (this.failureRate > 0 && Math.random() < this.failureRate) {
      throw new Error('HTTP 503: Wearable Ingestion Gateway temporarily unavailable.');
    }
  }
}
```

---

## 5. Bridging Mocks to Production APIs

When transitioning from the mock `apiService` to a live production backend (e.g., Express, Spring Boot, or Firebase Cloud Functions):

1. **Keep the Interface Identical**: Ensure production network clients implement the exact same TypeScript method signatures.
2. **Environment Toggle**:
   ```typescript
   const IS_LIVE_API = import.meta.env.VITE_USE_LIVE_API === 'true';

   export const apiService: IHealthDataService = IS_LIVE_API 
     ? new RemoteHealthDataService(import.meta.env.VITE_API_BASE_URL)
     : new LocalMockHealthDataService();
   ```
3. **Authentication Token Injection**: Attach Bearer JWT headers transparently via an Axios / Fetch interceptor in `RemoteHealthDataService`.
