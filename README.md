<div align="center">

# AegisHealth
### High-Frequency Longitudinal Biometrics Intelligence & Autonomic Telemetry Engine

[![Live Web App](https://img.shields.io/badge/LIVE%20APP-OPEN%20TELEMETRY%20SUITE-00F5D4?style=for-the-badge&logo=googlechrome&logoColor=black)](https://ais-dev-3jld7txfhxacz4zpi6qm63-469594656936.asia-east1.run.app)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%206-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Java 21](https://img.shields.io/badge/Backend-Java%2021%20%7C%20Spring%20Boot%203.3-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Cache-Redis%207.2-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)


</div>

---

## Table of Contents

> **Click any tab below to expand and interact with that section immediately:**

* [**Interactive Persona & Clinical Scenario Simulator**](#interactive-personas)
* [**Interactive Monthly Anomaly Calendar Heatmap**](#interactive-calendar)
* [**Interactive Comparative Period & Delta ($\Delta$) Engine**](#interactive-delta)
* [**Interactive Goal Configurator & Target Presets**](#interactive-goals)
* [**Interactive Clinical Alert & Threshold Rule Builder**](#interactive-alerts)
* [**Interactive Physiological Formulas & Recovery Math**](#interactive-math)
* [**Interactive Hardware & Wearables Ingestion Matrix**](#interactive-wearables)
* [**Interactive API Terminal & cURL Testbench**](#interactive-api)
* [**System Topology & Java 21 Spring Boot Microservice**](#system-architecture)
* [**10-Second Quickstart (Docker / Local / Frontend)**](#quickstart)
* [**Interactive Verification & Audit Checklist**](#verification-checklist)

---

<a id="interactive-personas"></a>
## Persona & Clinical Scenario Simulator

Select your operational role below to simulate workflows and access dedicated tools in the live app:

<details open>
<summary><b>Scenario 1: Cardiologist & Electrophysiologist (Click to expand)</b></summary>
<br>

```text
[ CLINICAL MISSION ]
Screen for paroxysmal atrial fibrillation, nocturnal bradycardia nadirs, and sustained tachycardia episodes.
```

- **Primary Diagnostic View:** [Biometric Alerts & Rules Manager ↗](https://ais-dev-3jld7txfhxacz4zpi6qm63-469594656936.asia-east1.run.app)
- **Active Threshold Guards:**
  - Resting Tachycardia: $> 100\text{ bpm}$ (sustained $\ge 3\text{ min}$)
  - Nocturnal Bradycardia: $< 40\text{ bpm}$ (sustained $\ge 5\text{ min}$)
  - Acute Hypoxemia: $SpO_2 < 90\%$ (instantaneous dispatch)
- **Interactive Action:**
  1. Open [Live Web App ↗](https://ais-dev-3jld7txfhxacz4zpi6qm63-469594656936.asia-east1.run.app)
  2. Navigate to **Biometric Alerts**
  3. Click **"+ Add Rule"** to instantiate custom tachycardia bounds or adjust duration dampening filters.

</details>

<details>
<summary><b>Scenario 2: High-Performance Sports Scientist & Coach (Click to expand)</b></summary>
<br>

```text
[ ATHLETIC MISSION ]
Monitor parasympathetic adaptation, autonomic recovery readiness, and week-over-week training strain deltas.
```

- **Primary Diagnostic View:** [Biometrics Trends & Comparative Analytics ↗](https://ais-dev-3jld7txfhxacz4zpi6qm63-469594656936.asia-east1.run.app)
- **Key Metrics Tracked:**
  - Nocturnal $rMSSD$ Heart Rate Variability vs. 30-Day Rolling Baseline
  - Autonomic Recovery Readiness Score ($R_{\text{autonomic}} \ge 80\%$)
  - Glymphatic Clearance: Slow-Wave Sleep (SWS) & REM Duration
- **Interactive Action:**
  1. Open **Biometrics Trends & Analytics**
  2. Toggle **"Current vs Previous Period"** to inspect Week-over-Week $\Delta$ values.
  3. Hover over the data points to reveal the exact variance card (e.g. `+8.2 ms (+11.4%)`).

</details>

<details>
<summary><b>Scenario 3: Clinical Informatics & Data Researcher (Click to expand)</b></summary>
<br>

```text
[ RESEARCH MISSION ]
Extract continuous time-series sensor feeds into RFC 4180 CSV for statistical ingestion in Python / R.
```

- **Primary Diagnostic View:** [Formatted CSV Telemetry Downloader ↗](https://ais-dev-3jld7txfhxacz4zpi6qm63-469594656936.asia-east1.run.app)
- **Features Available:**
  - Instant 1-click RFC 4180 compliant CSV export
  - Comprehensive column schema with `Timestamp`, `HR`, `HRV_rMSSD`, `Systolic`, `Diastolic`, `SpO2`, `Glucose`, `Strain`, and `Anomaly_Notes`
- **Interactive Action:** Click **"Download CSV"** in the top action bar to immediately inspect the live dataset locally.

</details>

<details>
<summary><b>Scenario 4: Wearable Device Firmware & Ingestion Engineer (Click to expand)</b></summary>
<br>

```text
[ HARDWARE MISSION ]
Validate Bluetooth LE ingestion cadences, packet drop rates, and peripheral battery levels across hardware.
```

- **Primary Diagnostic View:** [Wearables Sync Hub ↗](https://ais-dev-3jld7txfhxacz4zpi6qm63-469594656936.asia-east1.run.app)
- **Active Hardware Registry:**
  - Garmin Forerunner 965 (Real-Time BLE · 88% Battery)
  - Whoop 4.0 Strap (10-min Cloud REST Sync · 72% Battery)
  - Oura Ring Gen 3 (Nocturnal BLE Sync · 64% Battery)
  - Dexcom G7 CGM (5-min Interstitial NFC/BLE · 10-day Sensor)

</details>

---

<a id="interactive-calendar"></a>
## Monthly Anomaly Calendar Heatmap

> **Click each day in the interactive matrix below to reveal its simulated clinical event report:**

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MONTHLY ANOMALY FREQUENCY MATRIX                                │
│                     September 2026 (Rolling 30-Day Period)                             │
├────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────────────────────┤
│  MON   │  TUE   │  WED   │  THU   │  FRI   │  SAT   │  SUN   │   MONTHLY SUMMARY KPI  │
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────────────────────┤
│ [ 31 ] │ 01 Clr │ 02 Clr │ 03 Low │ 04 Clr │ 05 Clr │ 06 Clr │ Total Detections:  7   │
│ 07 Med │ 08 Clr │ 09 Clr │ 10 Clr │ 11 Hi! │ 12 Clr │ 13 Clr │ High Severity:     2   │
│ 14 Low │ 15 Clr │ 16 Clr │ 17 Clr │ 18 Med │ 19 Clr │ 20 Med │ Medium Severity:   3   │
│ 21 Clr │ 22 Hi! │ 23 Clr │ 24 TOD │ 25 Fut │ 26 Fut │ 27 Fut │ Clean Days:      17/24 │
│ 28 Fut │ 29 Fut │ 30 Fut │        │        │        │        │ Anomaly-Free:      71% │
└────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────────────────────┘
```

<details open>
<summary><b>Click to inspect Day 11 (High Severity Anomaly: Nocturnal Hypoxemia Breach)</b></summary>
<br>

* **Timestamp:** `2026-09-11 03:22 AM`
* **Trigger Mechanism:** Transient nocturnal $SpO_2$ dip to **89.4%** accompanied by sinus tachycardia jump to **104 bpm** during REM sleep.
* **Etiology:** Suspected obstructive positional airway collapse / intermittent nocturnal hypoxemia.
* **Suggested Clinical Protocol:** Home Sleep Apnea Test (HSAT), nocturnal elevation of head-of-bed, and sleep position therapy.
* **Status:** Resolved via clinician review.

</details>

<details>
<summary><b>Click to inspect Day 22 (High Severity Anomaly: Sympathetic Paroxysmal Spike)</b></summary>
<br>

* **Timestamp:** `2026-09-22 14:15 PM`
* **Trigger Mechanism:** Sudden heart rate excursion to **126 bpm** while accelerometer detected zero physical motion (Resting state).
* **Etiology:** Acute autonomic sympathetic surge / uncoupled emotional stress response or paroxysmal supraventricular tachyarrhythmia.
* **Suggested Clinical Protocol:** Perform 3-minute slow-paced resonant breathing ($5.5\text{ breaths/min}$), check 12-lead ECG rhythm strip.

</details>

<details>
<summary><b>Click to inspect Day 07 & Day 18 (Medium Severity: Post-Prandial Excursion)</b></summary>
<br>

* **Trigger Mechanism:** Continuous glucose monitor detected interstitial glucose rise to **168 mg/dL** ($> 140\text{ mg/dL}$ normal post-prandial threshold).
* **Recovery Rate:** Returned to baseline ($88\text{ mg/dL}$) within 105 minutes.

</details>

<details>
<summary><b>Click to inspect Nominal Days (e.g. Day 01, 02, 05, 08, 09, 10, 16, 23)</b></summary>
<br>

* **Status:** 🟢 **Clear / Anomaly-Free**.
* **Physiological Corridor:** Resting HR maintained between $49 - 53\text{ bpm}$; nocturnal $rMSSD \ge 74\text{ ms}$; $SpO_2 \ge 98.2\%$.

</details>

---

<a id="interactive-delta"></a>
## Comparative Period & Delta ($\Delta$) Engine

Compare current telemetry streams against previous equivalent periods with real-time scalar differences:

$$\Delta_{\text{variance}} = V_{\text{current}}(t) - V_{\text{previous}}(t)$$

$$\Delta_{\% \text{ shift}} = \left( \frac{\Delta_{\text{variance}}}{V_{\text{previous}}(t)} \right) \times 100\%$$

<details open>
<summary><b>Hover Tooltip Simulation</b></summary>
<br>

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   INTERACTIVE DELTA TOOLTIP CARD                       │
├────────────────────────────────────────────────────────────────────────┤
│     14:00 (Today)                       [ 24h COMPARISON ]             │
│                                                                        │
│  ● Current Period (Solid):              68.0 bpm                       │
│  ○ Previous Period (Dashed):            62.0 bpm                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ SPECIFIC DELTA (DIFFERENCE):                    ▲ +9.7% shift    │  │
│  │ +6.0 bpm                                                         │  │
│  │ Increase vs Prior Period                                         │  │
│  │ ⚠ Physiological deviation / increased cardiovascular load        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│    Tip: Click any data point to pin comparison details to footer       │
└────────────────────────────────────────────────────────────────────────┘
```

</details>

<details open>
<summary><b>Pinned Comparison Inspector Simulation (Click to view)</b></summary>
<br>

When a user clicks on a data point on the comparative chart, the application pins that timestamp in the **Pinned Timepoint Comparison Banner**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│    PINNED COMPARISON: 08:00 | Resting Heart Rate                                      │
│  Current Period: 52.0 bpm  ·  Previous Period: 56.0 bpm                               │
│  [ ▲ Delta: -4.0 bpm (-7.1%) ]  ✓ Favorable hemodynamic drop (Vagal tone enhanced)   │
│                                                                        [ ✕ Clear Pin ] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

</details>

---

<a id="interactive-goals"></a>
## Goal Configurator & Target Presets

Users can customize daily behavioral benchmarks and cardiovascular guards using the **Configure Goals Modal** in `DashboardView`:

<details open>
<summary><b>Goal Preset Selector & Rationale</b></summary>
<br>

| Metric Goal | Default Setting | One-Click Presets | Clinical Standard Rationale |
| :--- | :---: | :--- | :--- |
| **Daily Steps** | `10,000 steps` | • `8,000` (Baseline)<br>• `10,000` (AHA Standard)<br>• `12,500` (Active)<br>• `15,000` (Athletic) | **American Heart Association:** 8,000–12,000 steps/day reduces cardiovascular mortality risk by up to 50%. |
| **Sleep Duration** | `8.0 hours` | • `7.0h` (Minimum)<br>• `7.5h` (Balanced)<br>• `8.0h` (Optimal)<br>• `8.5h` (Rebuild) | **National Sleep Foundation:** 7.0–9.0 hours required for glymphatic metabolic clearance and peak SWS repair. |
| **Resting HR Ceiling** | `≤ 54 bpm` | • `≤ 48 bpm` (Athletic)<br>• `≤ 52 bpm` (Conditioned)<br>• `≤ 56 bpm` (Active)<br>• `≤ 62 bpm` (Standard) | **Autonomic Guard:** Consecutive elevations of $> 5\text{ bpm}$ over baseline signal unrecovered systemic fatigue or infection. |

</details>

<details>
<summary><b>LocalStorage Persistence Protocol</b></summary>
<br>

All goals are saved with validation directly to the browser's persistent key:

```json
// LocalStorage Key: aegis_personal_goals_v1
{
  "dailySteps": 10000,
  "sleepHours": 8.0,
  "maxRestingHeartRate": 54
}
```

Updating this configuration immediately recalculates the progress dials, remaining deficits, and achievement badges (*"All 3 Targets Achieved"* vs *"2 / 3 Targets Met"*).

</details>

---

<a id="interactive-alerts"></a>
## Clinical Alert & Threshold Rule Builder

Configure real-time rule evaluations for continuous biometric telemetry:

<details open>
<summary><b>Active Rule Definition Matrix</b></summary>
<br>

| Rule Identifier | Target Metric | Operator | Threshold | Sustained Window | Clinical Classification |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `rule_hr_tachycardia` | Heart Rate | $>$ | `100 bpm` | `3 minutes` | Sustained Sinus Tachycardia |
| `rule_hr_bradycardia` | Heart Rate | $<$ | `44 bpm` | `5 minutes` | Severe Sinus Bradycardia |
| `rule_spo2_hypoxemia` | Blood Oxygen | $<$ | `92 %` | `2 minutes` | Acute Nocturnal Desaturation |
| `rule_bp_hypertensive`| Systolic BP | $\ge$ | `130 mmHg`| Instant | ACC/AHA Stage 1 Hypertension |
| `rule_glucose_hypo`   | Glucose | $<$ | `65 mg/dL`| Instant | Hypoglycemic Event |

</details>

---

<a id="interactive-math"></a>
## Physiological Formulas & Recovery Math

<details open>
<summary><b>1. Time-Domain Heart Rate Variability ($rMSSD$)</b></summary>
<br>

$$rMSSD = \sqrt{\frac{1}{N - 1} \sum_{i=1}^{N - 1} \left( RR_{i+1} - RR_i \right)^2}$$

*Where $RR_i$ is the interbeat interval between consecutive R-waves in milliseconds.*
- $rMSSD \ge 75\text{ ms}$: Dominant parasympathetic vagal recovery.
- $rMSSD \le 35\text{ ms}$: Sympathetic overdrive, unrecovered strain, or illness.

</details>

<details open>
<summary><b>2. Composite Autonomic Readiness Score ($R_{\text{autonomic}}$)</b></summary>
<br>

$$R_{\text{autonomic}} = 0.45 \left( \frac{\text{rMSSD}}{\overline{\text{rMSSD}}_{30\text{d}}} \times 100 \right) + 0.35 \left( \frac{\overline{\text{RHR}}_{30\text{d}}}{\text{RHR}_{\text{nocturnal}}} \times 100 \right) + 0.20 \left( \frac{\text{Deep Sleep}}{\text{Target Deep (90m)}} \times 100 \right)$$

*Weighted score from $0 - 100\%$. Scores $\ge 80\%$ indicate optimal homeostasis.*

</details>

<details>
<summary><b>3. Mean Arterial Pressure ($MAP$)</b></summary>
<br>

$$MAP = \text{Diastolic} + \frac{1}{3} (\text{Systolic} - \text{Diastolic})$$

*For baseline $116/72\text{ mmHg}$: $MAP = 72 + \frac{44}{3} = 86.7\text{ mmHg}$ (Optimal perfusion corridor: $70 - 100\text{ mmHg}$).*

</details>

---

<a id="interactive-wearables"></a>
## Hardware & Wearables Ingestion Matrix

<details open>
<summary><b>Click to inspect Multi-Sensor Ingestion Protocols</b></summary>
<br>

```text
┌───────────────────────────┬───────────────────────────┬───────────────────────────┬───────────────────────────┐
│ Device / Sensor           │ Biosensor Stream          │ Optical & Physical Sensor │ Ingestion Protocol        │
├───────────────────────────┼───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ Garmin Forerunner 965     │ HR, HRV, Respiration, SpO2│ Elevate Gen 5 Optical PPG │ Real-Time Bluetooth LE    │
│ Whoop 4.0 Strap           │ Strain, Skin Temp, GSR    │ 5-LED, 4-Photodiode Array │ Cloud REST Batch (10 min) │
│ Oura Ring Gen 3           │ Sleep Stages, Temp, SpO2  │ Infrared & Red Photodiode │ Nocturnal Bluetooth Sync  │
│ Dexcom G7 CGM             │ Interstitial Glucose      │ Enzymatic Glucose Sensor  │ Continuous NFC/BLE (5 min)│
│ Apple Watch Ultra 2       │ ECG (Lead I), High HR     │ Dual-Frequency Optical    │ Apple HealthKit Bridge    │
└───────────────────────────┴───────────────────────────┴───────────────────────────┴───────────────────────────┘
```

</details>

---

<a id="interactive-api"></a>
## API Terminal & cURL Testbench

Copy and execute these ready-to-run API recipes in your terminal:

<details open>
<summary><b>1. Query Real-Time Telemetry Stream (`GET /api/v1/biometrics/timeseries`)</b></summary>
<br>

```bash
# Query 24-hour synchronized biometrics corridor
curl -s "http://localhost:3000/api/v1/biometrics/timeseries?window=24h" | jq .

# Query 7-day longitudinal trends
curl -s "http://localhost:3000/api/v1/biometrics/timeseries?window=7d" | jq .
```

<details>
<summary><b>Show Expected JSON Output</b></summary>

```json
{
  "status": "success",
  "window": "24h",
  "sampleCount": 24,
  "data": [
    {
      "timestamp": "2026-09-24T08:00:00.000Z",
      "timeLabel": "08:00",
      "heartRate": 68,
      "restingHeartRate": 52,
      "hrv": 72,
      "systolic": 118,
      "diastolic": 74,
      "spo2": 98.2,
      "glucose": 94,
      "respiratoryRate": 14.5,
      "steps": 2450,
      "activeCalories": 110,
      "strain": 4.2,
      "recoveryScore": 85,
      "hasAnomaly": false
    }
  ]
}
```
</details>
</details>

<details>
<summary><b>2. Dispatch Dynamic Clinical Alert Rule (`POST /api/v1/alerts/evaluate`)</b></summary>
<br>

```bash
curl -X POST "http://localhost:3000/api/v1/alerts/evaluate" \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "rule_tachycardia_eval",
    "observedMetric": "heartRate",
    "observedValue": 108,
    "threshold": 100,
    "operator": "greater_than",
    "sustainedMinutes": 3
  }' | jq .
```
</details>

<details>
<summary><b>3. Submit Verified Laboratory Biomarker Log (`POST /api/v1/health-logs`)</b></summary>
<br>

```bash
curl -X POST "http://localhost:3000/api/v1/health-logs" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-09-26",
    "category": "lab_panel",
    "title": "Comprehensive Metabolic Panel (CMP)",
    "systolic": 116,
    "diastolic": 72,
    "glucose": 88,
    "notes": "Optimal electrolyte balance; normal lipid subfractions."
  }' | jq .
```
</details>

---

<a id="system-architecture"></a>
## System Topology & Java 21 Spring Boot Microservice

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   AEGISHEALTH DISTRIBUTED FULL-STACK TOPOLOGY                          │
└────────────────────────────────────────────────────────────────────────────────────────┘

    [ INGESTION LAYER ]        Garmin / Whoop / Oura / Dexcom G7 Continuous Streams
               │
               ▼
    [ JAVA 21 SPRING BOOT ]    REST Controllers · OpenAPI 3.0 · Spring Data JPA
               │
               ├──────────────► [ REDIS 7.2 ]       Sub-millisecond 1Hz Ring Buffers
               │
               └──────────────► [ POSTGRESQL 16 ]   ACID Clinical Persistence & Audit
               │
               ▼
    [ REACT 19 + VITE 6 ]      High-DPI SVG Charts · Comparative Trends · Goals Modal
```

- **Java 21 Virtual Threads (`Project Loom`)**: High-throughput non-blocking request concurrency for thousands of connected wearable streams.
- **HikariCP Connection Pool**: Robust transactional management against PostgreSQL 16.
- **Spring Data Redis Ring Cache**: Constant $O(1)$ telemetry time-series ingestion buffer.

---

<a id="quickstart"></a>
## 10-Second Quickstart

### Option A: Complete Docker Compose (Recommended)
Spins up the full ecosystem (Frontend, Spring Boot REST API, PostgreSQL 16, Redis 7.2):

```bash
# 1. Clone the repository
git clone https://github.com/mhdhamka/aegishealth.git
cd aegishealth

# 2. Start all services
docker-compose up --build -d

# 3. Access web apps:
# Frontend Web App:     http://localhost:3000
# Spring Boot REST API: http://localhost:8080/api/v1
```

### Option B: Frontend Standalone (React 19 + TypeScript + Vite)

```bash
npm install
npm run dev
# Open in browser: http://localhost:3000
```

---

<a id="verification-checklist"></a>
## Verification & Audit Checklist

Use this checklist to verify your AegisHealth deployment:

- [x] **High-Frequency Canvas**: Interactive time series with crosshair telemetry scrubber
- [x] **Anomaly Annotations**: `TRIGGER` banners with hover trigger descriptions
- [x] **Monthly Heatmap**: 7-column calendar matrix with 4-tier severity color grading
- [x] **Comparative Trends**: Active vs previous period line charts with specific $\Delta$ tooltips
- [x] **Click-to-Pin Inspector**: Pinned comparison banner with one-click clear
- [x] **Configure Goals Modal**: Step, sleep, and resting HR targets with AHA presets
- [x] **LocalStorage Sync**: Persistent goal retention across sessions (`aegis_personal_goals_v1`)
- [x] **CSV Telemetry Export**: RFC 4180 clinical time-series export engine
- [x] **Polysomnography PSG**: Awake, REM, Light, Deep hypnogram bars
- [x] **TypeScript Strict**: Zero compilation errors across `@typescript-eslint`

---

<div align="center">
  <b>Developed & Maintained by <a href="https://github.com/mhdhamka">mdhamka</a></b>
</div>
