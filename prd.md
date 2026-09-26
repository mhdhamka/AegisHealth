# Product Requirements Document (PRD)

# Project: AegisHealth Longitudinal Biometrics Intelligence Platform
**Document Version**: 2.0.0  
**Status**: Approved / Active Engineering Specification  
**Classification**: Healthcare Technology SaaS / Clinical Decision Support  
**Primary Author**: Principal Medical Informatics & Software Architecture Team  
**Last Updated**: September 2026  

---

## 1. Core Product Vision & Problem Space

### 1.1 Vision Statement
AegisHealth is an enterprise-grade longitudinal biometrics SaaS and clinical decision support system. It bridges the critical divide between consumer and medical-grade biosensors (continuous optical PPG/ECG, continuous glucose monitors, nocturnal polysomnography) and clinical healthcare delivery. By synthesizing high-frequency ambulatory telemetry into synchronized, clinically calibrated visual intelligence, AegisHealth enables proactive cardiometabolic intervention, accurate autonomic recovery modeling, and continuous patient safety monitoring.

### 1.2 The Healthcare Problem Space
Modern clinical cardiology, endocrinology, and preventive medicine are severely hampered by the **Episodic Examination Paradigm**:
1. **White-Coat Hypertension & Situational Distortion**: Between 15% and 30% of patients diagnosed with Stage 1 or Stage 2 hypertension in-clinic suffer from transient white-coat response, leading to inappropriate pharmacotherapy. Conversely, *masked hypertension* escapes detection entirely.
2. **Occult Arrhythmias & Intermittent Desaturations**: Paroxysmal Atrial Fibrillation (AFib), premature ventricular contractions (PVCs), and nocturnal sleep apnea-induced hypoxemia rarely occur during a brief 10-second in-clinic resting 12-lead ECG.
3. **Proprietary Biosensor Silos**: Patients wear heterogeneous devices (Garmin watches, Whoop straps, Oura rings, Dexcom CGMs, Apple Watches), yet their data remains trapped in isolated mobile applications with incompatible proprietary metrics and zero cross-sensor correlation.
4. **Lack of Sustained Threshold Filtering**: Standard wearable alerts overwhelm users and providers with false positives from motion artifacts, transient stress, or postural tachycardia, leading to catastrophic *alarm fatigue*.

### 1.3 Core Value Propositions
* **Unified Biosensor Fusion**: Harmonizes optical photoplethysmography (PPG), lead-I electrocardiography (ECG), subcutaneous interstitial glucose (CGM), dual-wavelength pulse oximetry ($SpO_2$), and multi-stage sleep architecture into a unified timeline.
* **Autonomic Tone & Resilience Quantification**: Quantifies physiological strain and vagal parasympathetic modulation using continuous time-domain Heart Rate Variability ($rMSSD$) and nocturnal resting heart rate depression.
* **Intelligent Clinical Threshold Guards**: Enforces sustained-duration filters (e.g., heart rate must exceed 100 BPM for $\ge 3$ consecutive minutes) before triggering high-priority clinician notifications, eliminating transient noise.
* **Dual-Track Healthcare Architecture**: Delivers an immediate, zero-friction client-side experience for researchers and athletes while backing clinical deployments with a Java 21 Spring Boot 3 enterprise microservice, PostgreSQL 16 persistence, and Redis 7.2 sub-millisecond caching.

---

## 2. Target User Personas & Clinical Scenarios

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 TARGET PERSONA MATRIX                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

   [ CLINICAL MEDICINE ]                   [ PERFORMANCE & LONGEVITY ]           [ RESEARCH & DEV ]
   • Dr. Elena Vance                       • Marcus Vance                        • Dr. Sarah Jenkins
     Electrophysiologist / Cardiologist      Olympic Endurance Coach               Clinical Informatics Researcher
   • Dr. Aris Thorne                       • Alex Mercer                         • David Miller
     Preventive Longevity Physician          Metabolic Health Self-Quantifier      Biomedical Hardware Engineer
```

### 2.1 Persona 1: Dr. Elena Vance — Clinical Cardiologist & Electrophysiologist
* **Clinical Context**: Evaluates patients with palpitations, suspected paroxysmal arrhythmias, nocturnal dyspnea, and labile blood pressure.
* **Core Objectives**:
  * Review 24-hour and 7-day ambulatory ECG/PPG traces without sifting through gigabytes of raw, unstructured data.
  * Rapidly correlate nocturnal $SpO_2$ desaturation nadirs ($<90\%$) with concurrent tachycardic arousals to confirm obstructive sleep apnea.
  * Adjust hemodynamic safety thresholds per patient (e.g., nocturnal bradycardia alert set to $<44\text{ BPM}$ for athletic sinus vs. $<50\text{ BPM}$ for elderly patients on beta-blockers).
* **Critical Workflows**: Navigates to **Biometric Alerts**, configures sustained duration filters, inspects the **Evaluated Incident Log**, and acknowledges clinical alarms with audit trail timestamps.

### 2.2 Persona 2: Marcus Vance — High-Performance Endurance Coach & Sports Physiologist
* **Operational Context**: Directs elite marathon and triathlon athletes balancing intensive cardiovascular training blocks with autonomic recovery.
* **Core Objectives**:
  * Track daily **Autonomic Recovery Score** ($0-100\%$) derived from nocturnal $rMSSD$ baseline shifts, resting heart rate, and slow-wave sleep volume.
  * Identify central nervous system overreaching before systemic overtraining syndrome (OTS) or musculoskeletal injury occurs.
  * Evaluate bivariate correlations between workout cardiac strain and next-day glucose stability.
* **Critical Workflows**: Inspects the **Biometrics & Trends** interactive canvas, switches time horizons to `30d`, and downloads standardized telemetry CSV files for biomechanical modeling.

### 2.3 Persona 3: Dr. Sarah Jenkins — Clinical Informatics Researcher
* **Research Context**: Investigates continuous cardiometabolic health, post-prandial glycemic variability, and autonomic tone across longitudinal patient cohorts.
* **Core Objectives**:
  * Contrast continuous ambulatory biometrics against episodic laboratory blood panels (CMP, lipid subfractions, HbA1c).
  * Seamlessly toggle across synthetic de-identified clinical cohorts (Cardiometabolic, Elite Endurance, High-Stress Sedentary).
  * Export RFC 4180-compliant CSV datasets containing timestamps, scalar vitals, and anomaly annotations for R, SAS, and Python pandas pipelines.
* **Critical Workflows**: Uses the **Cohort Switcher**, accesses the **Bivariate Correlation Scatter Matrix**, and triggers client-side **Download CSV** generation.

### 2.4 Persona 4: Dr. Aris Thorne — Preventive Longevity Physician
* **Clinical Context**: Manages preventive longevity programs focusing on metabolic flexibility, visceral adiposity reduction, and cardiovascular healthspan.
* **Core Objectives**:
  * Monitor glycemic excursions following refined carbohydrate intake using interstitial CGM sensors.
  * Audit nocturnal blood pressure dipping status (classifying patients as dippers, non-dippers, or reverse dippers) to forecast 10-year major adverse cardiovascular event (MACE) risk.
* **Critical Workflows**: Reviews **Health Logs & Labs**, inputs ambulatory blood pressure observations with automated 2017 AHA/ACC classification, and generates clinical PDF/JSON audit reports.

---

## 3. Functional Requirements: Time-Series Visualization

The visualization engine is the operational heart of AegisHealth. It must provide fluid, sub-second exploratory analytics across dense biometric streams without visual degradation or frame stutter.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       TIME-SERIES VISUALIZATION INTERFACE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [Temporal Selector]  ( • 24 Hours   |   • 7 Days   |   • 30 Days )      [Download CSV Button]  │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [Metric Toggles]     [✓] Heart Rate  [✓] HRV rMSSD  [✓] SpO2  [✓] Blood Pressure  [✓] Glucose  │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                 │
│   BPM / ms                                                                                      │
│   120 ┼┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ [Threshold: 100 bpm]     │
│       │                 ╭──────╮              ▲ Hover Crosshair                                 │
│    80 ┼──╭──────────────╯      ╰──────────────┼──────────────────────────────                   │
│       │  │                                    │  Time: 14:15 | HR: 106 bpm (Tachycardia Flag)   │
│    40 ┼──╯                                    ▼  HRV: 42 ms  | SpO2: 97.5%                      │
│       └──┴───────┬───────┬───────┬───────┬────┴──┬───────┬───────┬───────┬────────► Time        │
│        00:00   03:00   06:00   09:00   12:00   15:00   18:00   21:00   24:00                    │
│                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [Polysomnography]    [  AWAKE  ][   REM   ][      LIGHT      ][   DEEP / SLOW-WAVE   ]         │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Multi-Metric Synchronized Canvas
* **FR-TS-01**: The system shall render time-series biometric streams on an interactive high-DPI canvas supporting continuous line plots, reference bands, and anomaly markers.
* **FR-TS-02**: Supported metrics shall include:
  * **Heart Rate**: Instantaneous and resting pulse in Beats Per Minute (BPM) ($30 - 220\text{ BPM}$).
  * **Heart Rate Variability**: Root Mean Square of Successive Differences ($rMSSD$) in milliseconds ($5 - 200\text{ ms}$).
  * **Pulse Oximetry ($SpO_2$)**: Arterial oxygen saturation percentage ($70 - 100\%$).
  * **Ambulatory Blood Pressure**: Systolic and Diastolic pressure in millimeters of mercury ($60 - 240\text{ mmHg}$).
  * **Continuous Interstitial Glucose**: Subcutaneous glycemic concentration ($40 - 400\text{ mg/dL}$).
  * **Respiratory Rate**: Breaths per minute ($6 - 35\text{ br/min}$).
  * **Daily Strain & Active Energy**: Cumulative cardiovascular load score ($0.0 - 21.0$) and active kilocalories.
* **FR-TS-03**: Users shall be able to toggle each metric trace on or off independently using accessible toggle pills without re-fetching or reloading page state.

### 3.2 Granular Temporal Horizons & Windowing
* **FR-TS-04**: The visualization engine shall support three discrete temporal window modes:
  * **24-Hour Micro Horizon**: 1-hour to 15-minute bucketed resolution showing circadian fluctuations, post-prandial glycemic surges, and exercise spikes.
  * **7-Day Meso Horizon**: Daily aggregated averages with min/max envelopes illustrating work-week strain and recovery cycles.
  * **30-Day Macro Horizon**: Longitudinal 30-day baseline trend line showing physiological adaptations, chronic baseline shifts, and long-term health trajectory.
* **FR-TS-05**: When switching temporal horizons, the canvas shall transition smoothly with animated SVG path interpolation within $< 150\text{ms}$.

### 3.3 Interactive Scrubbing, Crosshairs & Tooltip Telemetry
* **FR-TS-06**: When hovering over the canvas, a vertical crosshair indicator line shall snap to the nearest temporal coordinate with $< 16\text{ms}$ latency (60 FPS).
* **FR-TS-07**: The synchronized hover overlay shall display a formatted card listing:
  * Exact sample timestamp (`YYYY-MM-DD HH:mm:ss UTC` and localized time).
  * Scalar values for all currently enabled metric traces with their clinical units.
  * Contextual clinical tags (e.g., `Resting Tachycardia Warning`, `Post-Prandial Glycemic Surge`, `Nocturnal SpO2 Dip`).
  * Autonomic recovery score at that temporal index.

### 3.4 Clinical Threshold Overlays & Anomaly Annotation
* **FR-TS-08**: The system shall render customizable horizontal threshold reference lines:
  * Critical Upper Boundary (e.g. Heart Rate $>100\text{ BPM}$ resting, Systolic BP $>130\text{ mmHg}$).
  * Critical Lower Boundary (e.g. Heart Rate $<44\text{ BPM}$ nocturnal, $SpO_2 <94\%$).
  * Shaded safe target corridors between clinical upper and lower bounds.
* **FR-TS-09**: Data points that violate active alert rules shall be highlighted with pulsing warning badges and interactive popovers detailing observed values, threshold deltas, and duration sustained.

### 3.5 Polysomnographic Sleep Hypnogram Breakdown
* **FR-TS-10**: The visualization shall include a synchronized sleep stage hypnogram mapped directly beneath the nocturnal cardiac time series.
* **FR-TS-11**: The hypnogram shall categorize sleep into four clinical stages:
  * **Awake / Arousals** (Amber): Number of awakenings and total WASO (Wake After Sleep Onset).
  * **REM Sleep** (Purple): Rapid Eye Movement sleep percentage (cognitive restoration and memory consolidation).
  * **Light Sleep / Stage N1-N2** (Blue): Baseline non-REM restorative sleep.
  * **Deep / Slow-Wave Sleep Stage N3** (Teal): Delta-wave physical repair, human growth hormone (HGH) secretion, and glymphatic clearance.
* **FR-TS-12**: Total sleep duration, sleep latency, sleep efficiency percentage, and respiratory disturbance index (RDI) shall be calculated and displayed alongside the hypnogram.

### 3.6 Downsampling & Level-of-Detail (LOD) Management
* **FR-TS-13**: When handling datasets exceeding 5,000 raw samples, the visualization engine shall apply the **Largest-Triangle-Three-Buckets (LTTB)** downsampling algorithm to preserve visual peaks, troughs, and outliers while reducing DOM node pressure.

---

## 4. Non-Functional Requirements: HIPAA-Compliant Data Handling

To operate in regulated US healthcare environments, AegisHealth must comply strictly with the **Health Insurance Portability and Accountability Act of 1996 (HIPAA)**, specifically the **Security Rule (45 CFR Part 160 and Part 164, Subparts A and C)** and the **Privacy Rule (45 CFR Part 164, Subparts A and E)**.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               HIPAA COMPLIANCE ARCHITECTURE                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

   ┌────────────────────────────────┐  ┌────────────────────────────────┐  ┌────────────────────┐
   │     TECHNICAL SAFEGUARDS       │  │      PRIVACY SAFEGUARDS        │  │ ADMINISTRATIVE     │
   │      (45 CFR § 164.312)        │  │      (45 CFR § 164.514)        │  │ (45 CFR § 164.308) │
   ├────────────────────────────────┤  ├────────────────────────────────┤  ├────────────────────┤
   │ • TLS 1.3 In-Transit           │  │ • Safe Harbor De-ID (§ 164.514)│  │ • Signed BAAs      │
   │ • AES-256-GCM At-Rest          │  │ • Minimum Necessary (§ 164.502)│  │ • Access Auditing  │
   │ • Role-Based Access Control    │  │ • Zero-Knowledge Hash Chains   │  │ • Disaster Recovery│
   │ • Automatic 15-min Session Lock│  │ • Patient Rights of Inspection │  │ • Breach Protocol  │
   │ • 21 CFR Part 11 Audit Logs    │  │ • Secure Client Memory Purging │  │ • Workforce Train  │
   └────────────────────────────────┘  └────────────────────────────────┘  └────────────────────┘
```

### 4.1 Technical Safeguards (§ 164.312)

#### 4.1.1 Access Control (§ 164.312(a)(1))
* **NFR-HIPAA-01 (Unique User Identification)**: Every clinician, researcher, and patient shall be assigned a unique system identifier (`UUID v4`). Generic or shared provider credentials are strictly prohibited.
* **NFR-HIPAA-02 (Emergency Access / Break-Glass Procedure)**: The system shall incorporate an auditable "Break-Glass" protocol allowing attending emergency medical personnel to bypass normal consent boundaries to view critical vital streams during acute events. Every emergency override shall trigger an immediate automated security alert and generate an immutable incident log.
* **NFR-HIPAA-03 (Automatic Session Inactivity Lockout)**: The web application shall enforce an automated session termination policy. Following **15 minutes of user inactivity**, all active charting screens shall lock immediately, requiring re-authentication before sensitive biometric data is unveiled.
* **NFR-HIPAA-04 (Role-Based Access Control - RBAC)**: Access to electronic Protected Health Information (ePHI) shall be strictly partitioned across five system roles:
  1. `Super Administrator`: System configuration, infrastructure maintenance, audit log reviews. Zero access to decrypted clinical vital streams without explicit break-glass authorization.
  2. `Attending Clinician / Physician`: Full access to assigned patient biometric feeds, alerts, logs, and clinical note authoring.
  3. `Allied Health / Nursing / Sports Staff`: Read access to telemetry trends and threshold status; write access limited to vital sign observations.
  4. `Research Analyst`: Access strictly restricted to de-identified, aggregated biometric datasets with zero direct or indirect identifiers.
  5. `Patient / Subject`: View access restricted exclusively to their own historical biosensor feeds and export tools.

#### 4.1.2 Audit Controls (§ 164.312(b))
* **NFR-HIPAA-05 (Immutable Clinical & System Audit Trails)**: The system shall record and permanently retain tamper-evident audit records for every interaction with ePHI in accordance with **21 CFR Part 11** and HIPAA guidelines.
* **NFR-HIPAA-06 (Required Audit Log Attributes)**: Each audit record shall capture:
  * Exact UTC Timestamp (`ISO 8601` with microsecond precision).
  * Unique User Identifier (`actor_id`) and Active System Role.
  * Patient Identifier (`subject_id`).
  * Action Performed (`READ`, `CREATE`, `UPDATE`, `DELETE`, `EXPORT_CSV`, `ACKNOWLEDGE_ALERT`, `DISMISS_ALERT`, `BREAK_GLASS`).
  * Source IPv4/IPv6 Address and User-Agent Fingerprint.
  * Prior State Hash and New State Hash (ensuring non-repudiation).
* **NFR-HIPAA-07 (Audit Trail Immutability)**: Audit logs shall be written to append-only, write-once-read-many (WORM) storage. Under no circumstances shall audit logs be editable, truncatable, or erasable by any system user, including database administrators.

#### 4.1.3 Data Integrity & Validation (§ 164.312(c)(1))
* **NFR-HIPAA-08 (Cryptographic Verification)**: All ingested telemetry chunks and health log entries shall compute a **SHA-256 cryptographic checksum** upon creation. Prior to rendering or clinical processing, checksums shall be verified to guarantee that biometrics have not been altered, injected, or corrupted.

#### 4.1.4 Transmission Security (§ 164.312(e)(1))
* **NFR-HIPAA-09 (Encryption in Transit)**: All data transmitted across public and private networks—including client-to-gateway HTTPS, WebSocket streaming, and inter-service Spring Boot microservice communication—shall enforce **TLS 1.3** (or minimum TLS 1.2 with approved cipher suites: `ECDHE-RSA-AES256-GCM-SHA384` or `ECDHE-ECDSA-AES256-GCM-SHA384`).
* **NFR-HIPAA-10 (Zero Insecure Fallback)**: Insecure HTTP connections shall be rejected with HTTP 301 redirection to HTTPS and strict `Strict-Transport-Security` (HSTS) headers (`max-age=63072000; includeSubDomains; preload`).

#### 4.1.5 Data Encryption at Rest (§ 164.312(a)(2)(iv))
* **NFR-HIPAA-11 (Storage Encryption Standards)**: All electronic Protected Health Information stored within relational database volumes (PostgreSQL 16), in-memory cache snapshots (Redis 7.2 RDB/AOF), cloud object storage (S3/GCS backups), and client-side offline stores shall be encrypted using **AES-256 in Galois/Counter Mode (AES-256-GCM)**.
* **NFR-HIPAA-12 (Key Management & Rotation)**: Master encryption keys shall be managed via a dedicated Hardware Security Module (HSM) or cloud Key Management Service (AWS KMS / GCP Cloud KMS) with automated annual rotation and strict key-access logging.

---

### 4.2 Privacy Rule & Data Minimization (§ 164.514)

#### 4.2.1 De-Identification & Safe Harbor Compliance
* **NFR-HIPAA-13 (18 Safe Harbor Identifiers)**: In demonstration, sandbox, and secondary research environments, the platform shall purge or cryptographically hash all 18 HIPAA Safe Harbor identifiers:
  1. Names.
  2. Geographic subdivisions smaller than state (ZIP codes truncated to first 3 digits if population exceeds 20,000).
  3. Dates directly related to individuals (birth dates, admission dates, discharge dates, dates of death; ages $>89$ grouped).
  4. Telephone numbers.
  5. Fax numbers.
  6. Email addresses.
  7. Social Security numbers.
  8. Medical record numbers (MRNs).
  9. Health plan beneficiary numbers.
  10. Account numbers.
  11. Certificate/license numbers.
  12. Vehicle identifiers and serial numbers.
  13. Device identifiers and serial numbers.
  14. Web Universal Resource Locators (URLs).
  15. Internet Protocol (IP) address numbers.
  16. Biometric identifiers including finger and voice prints (excluding approved physiological telemetry).
  17. Full face photographic images.
  18. Any other unique identifying number, characteristic, or code.

#### 4.2.2 Minimum Necessary Standard (§ 164.502(b))
* **NFR-HIPAA-14 (Field-Level Redaction)**: When presenting patient data in multidisciplinary contexts (e.g., coach viewing athletic strain), clinical medical history and medication notes shall be redacted at the API Gateway layer to enforce the minimum necessary standard.

#### 4.2.3 Client-Side Storage & Memory Hygiene
* **NFR-HIPAA-15 (Client Memory Purging)**: When a clinician logs out or a patient session times out, the browser client shall purge all decrypted telemetry buffers, Redux/Zustand store slices, and cached sensitive items from RAM and session memory.
* **NFR-HIPAA-16 (Secure Local Storage Practices)**: If offline storage is enabled in Progressive Web App (PWA) mode, data cached in IndexedDB shall be encrypted using the Web Cryptography API (`SubtleCrypto`) with an ephemeral session key derived at user login.

---

## 5. Technical Architecture & Data Models

### 5.1 Telemetry Data Model
```typescript
export interface BiometricPoint {
  timestamp: string;               // ISO 8601 UTC (e.g., "2026-09-24T14:15:00.000Z")
  timeLabel?: string;              // HH:mm format for 24h display
  dateLabel?: string;              // MMM dd format for multi-day views
  heartRate: number;               // Instantaneous optical pulse rate in BPM (30 - 220)
  restingHeartRate?: number;       // Nocturnal/basal resting heart rate in BPM
  hrv: number;                     // Root Mean Square of Successive Differences (rMSSD in ms)
  systolic?: number;               // Systolic arterial blood pressure in mmHg
  diastolic?: number;              // Diastolic arterial blood pressure in mmHg
  spo2?: number;                   // Arterial oxygen saturation percentage (70.0 - 100.0)
  glucose?: number;                // Subcutaneous interstitial glucose in mg/dL
  respiratoryRate?: number;        // Breaths per minute
  steps?: number;                  // Cumulative steps within temporal bucket
  activeCalories?: number;         // Active metabolic burn in kcal
  strain?: number;                 // Cardiovascular strain index (0.0 - 21.0)
  recoveryScore?: number;          // Autonomic readiness percentage (0 - 100)
  hasAnomaly?: boolean;            // Flag indicating active threshold violation
  anomalyNote?: string;            // Clinical descriptor of anomaly
}
```

### 5.2 Biometric Alert Rule Data Model
```typescript
export interface BiometricAlertRule {
  id: string;                      // Unique rule identifier (UUID v4)
  name: string;                    // Human-readable title
  metric: 'heart_rate' | 'resting_heart_rate' | 'spo2' | 'systolic_bp' | 'glucose';
  operator: 'greater_than' | 'less_than';
  threshold: number;               // Scalar boundary limit
  unit: string;                    // Clinical measurement unit ('bpm', '%', 'mmHg', 'mg/dL')
  severity: 'low' | 'medium' | 'critical';
  sustainedDurationMinutes: number;// 0 = instantaneous trigger, >0 = sustained breach window
  isEnabled: boolean;              // Master rule arming toggle
  notifyChannels: ('in_app' | 'push' | 'sms' | 'clinician')[];
  description: string;             // Clinical rationale and operational instruction
}
```

### 5.3 Backend Microservice Architecture
* **Language & Runtime**: Java 21 LTS (Oracle OpenJDK / Eclipse Temurin), utilizing Virtual Threads (Project Loom) for high-concurrency 1Hz biosensor ingestion without thread exhaustion.
* **Application Framework**: Spring Boot 3.3.2 with Spring Web MVC, Spring Data JPA, and Spring Security.
* **Relational Persistence**: PostgreSQL 16 with TimescaleDB extension for hypertable temporal partitioning across patient biometric histories.
* **In-Memory Cache & Stream Ingestion**: Redis 7.2 with RedisTimeSeries and sorted sets (`ZADD` / `ZRANGEBYSCORE`) enabling sub-millisecond retrieval of sliding 24h telemetry windows.

---

## 6. Verification Matrix & Release Acceptance Criteria

| Requirement ID | Verification Methodology | Target Acceptance Standard |
| :--- | :--- | :--- |
| **FR-TS-01 – 03** | End-to-End Canvas Integration Test | Multi-metric traces toggle independently with zero DOM rebuild delay; rendering completes in $<16\text{ms}$. |
| **FR-TS-06 – 07** | Automated UI Performance Test | Crosshair indicator tracking matches cursor position at 60 FPS across 10,000 continuous points. |
| **FR-TS-08 – 09** | Clinical Boundary Validation | Over-threshold values render colored badges; sustained duration filter correctly delays trigger for $N$ minutes. |
| **FR-TS-10 – 12** | Polysomnography Sync Test | Sleep hypnogram temporal timestamps align identically ($\pm 0\text{s}$) with nocturnal heart rate dip. |
| **NFR-HIPAA-01 – 04** | Security & RBAC Penetration Audit | Unauthenticated requests receive HTTP 401; users restricted strictly to authorized patient scopes; 15-min auto-lock verified. |
| **NFR-HIPAA-05 – 07** | Audit Trail Compliance Review | 100% of read, write, export, and dismiss events emit immutable JSON audit records with SHA-256 verification hashes. |
| **NFR-HIPAA-09 – 12** | Vulnerability Scan (OWASP / SSL Labs) | A+ rating on SSL Labs; TLS 1.3 enforced; all database tables and Redis dumps confirmed encrypted with AES-256-GCM. |
| **NFR-HIPAA-13 – 16** | Safe Harbor & Memory Leak Test | Zero personal identifiers found in network responses in de-identified mode; heap analysis confirms complete memory purge on logout. |
