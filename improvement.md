# Technical Improvement & Engineering Roadmap

# Project: AegisHealth Longitudinal Biometrics SaaS
**Document Status**: Proposed / Engineering Backlog  
**Target Horizon**: Q4 2026 – Q2 2027  

---

## 1. Technical Debt & Codebase Modernization

### 1.1 State Management Architecture (Prop-Drilling Remediation)
- **Current State**: Application state (telemetry, devices, logs, anomalies, alert rules) is predominantly managed at the root `App.tsx` level and passed down through multiple component tiers.
- **Proposed Enhancement**:
  - Migrate to **Zustand** or **TanStack Query (React Query)** with discrete domain slices:
    - `useTelemetryStore`: Ingestion buffer, active time window (`24h`, `7d`, `30d`), and metric filter selections.
    - `useAlertsStore`: Threshold rules, active incidents, and persistent acknowledgment states.
    - `useWearablesStore`: Hardware connection states, battery telemetry, and sync progress.
  - **Benefits**: Eliminates unnecessary re-renders in sibling chart components and simplifies cross-view navigation triggers.

### 1.2 Storage Subsystem: LocalStorage $\rightarrow$ IndexedDB / OPFS
- **Current State**: Custom health logs and alert rules are serialized as JSON strings in browser `localStorage` (limited to 5MB total capacity).
- **Proposed Enhancement**:
  - Adopt **Dexie.js (IndexedDB)** or the **Origin Private File System (OPFS)** for high-volume biosensor storage.
  - Enable continuous storage of up to **500,000 raw 1Hz PPG/ECG telemetry points** locally without degrading browser performance.
  - Implement automatic pruning policies (e.g. downsampling data older than 90 days to hourly averages).

---

## 2. Rendering & Data Visualization Enhancements

### 2.1 WebGL / Canvas Acceleration for High-DPI Waveforms
- **Current State**: Interactive charts use declarative SVG paths. While visually crisp and highly maintainable for 24-100 points, SVG DOM nodes can introduce paint lag when rendering dense multi-thousand-point ECG streams.
- **Proposed Enhancement**:
  - Implement a dual-layer rendering strategy:
    - **Base Layer (Canvas / WebGL via PixiJS or Deck.gl)**: Renders high-frequency continuous lines and density heatmaps with zero DOM overhead.
    - **Top Layer (SVG / HTML)**: Handles crosshair overlays, tooltips, and interactive threshold boundary lines.
  - Supports 60 FPS pinch-to-zoom across millions of historical samples.

### 2.2 Dynamic Telemetry Resampling & LOD (Level-of-Detail)
- **Proposed Enhancement**:
  - Implement the **Largest-Triangle-Three-Buckets (LTTB)** downsampling algorithm in a Web Worker.
  - Allows seamless transitions between macroscopic 90-day views (thousands of data points downsampled intelligently to fit pixel width) and microscopic 10-second ventricular arrhythmia zooms.

---

## 3. Real-Time Telemetry & Transport Protocols

### 3.1 WebSocket & Server-Sent Events (SSE) Live Gateway
- **Current State**: Data sync is triggered on-demand via simulated API promises and periodic interval re-renders.
- **Proposed Enhancement**:
  - Establish a WebSocket (`ws://` / `wss://`) or SSE (`/api/v1/stream`) telemetry connection to the ingestion broker.
  - Stream live heartbeat intervals ($RR$ intervals) and instantaneous pulse oximeter readings in real time.
  - Deliver instant push notifications to the browser when a clinical threshold breach is evaluated by the cloud engine.

### 3.2 Offline-First PWA & Web Bluetooth Direct Pairing
- **Proposed Enhancement**:
  - Integrate a Service Worker (`vite-plugin-pwa`) for offline capability during clinic rounds or remote athletic training.
  - Implement the **Web Bluetooth API** (`navigator.bluetooth`) to connect directly to standard Heart Rate Profile (HRP) chest straps (e.g., Polar H10) and Pulse Oximeter profiles without third-party mobile apps.

---

## 4. Clinical Intelligence & Machine Learning Integrations

### 4.1 On-Device Edge ML via ONNX Runtime Web
- **Proposed Enhancement**:
  - Run lightweight quantized ONNX models directly in the client browser using WebAssembly (Wasm) and WebGPU.
  - **Model 1: Arrhythmia Detection**: Detect premature ventricular contractions (PVCs), bigeminy, and atrial fibrillation episodes from optical PPG pulse morphology.
  - **Model 2: Glycemic Excursion Forecast**: Predict 30-to-60 minute post-prandial blood glucose peaks based on recent meal logs, current glucose trend velocity, and active daily strain.

### 4.2 Standardized Health Interoperability (HL7 / FHIR R4)
- **Proposed Enhancement**:
  - Expand data export capabilities beyond CSV to generate compliant **HL7 FHIR (Fast Healthcare Interoperability Resources) R4** JSON bundles:
    - `Observation` resources for Blood Pressure (LOINC `85354-9`), Heart Rate (LOINC `8867-4`), and Oxygen Saturation (LOINC `2708-6`).
    - `Device` resources for wearable hardware serials and firmware revisions.
  - Facilitate direct, automated export into hospital EHR systems (Epic, Cerner, AthenaHealth).

---

## 5. Security, Privacy & Regulatory Compliance

### 5.1 End-to-End Cryptographic Zero-Knowledge Storage
- **Proposed Enhancement**:
  - Encrypt all stored biometric time-series and health log entries client-side using **Web Cryptography API (AES-GCM-256)** derived from a user master passphrase.
  - Ensure cloud backend storage cannot inspect raw biometric data without authorized clinician key exchange.

### 5.2 Immutable Clinical Audit Log
- **Proposed Enhancement**:
  - Implement an append-only cryptographic hash chain (Merkle tree) for all manual health log adjustments, incident acknowledgments, and threshold edits.
  - Complies with FDA 21 CFR Part 11 and HIPAA audit trail guidelines for electronic health records.

---

## 6. Implementation Prioritization Matrix

| Initiative | Estimated Effort | Impact | Target Milestone |
| :--- | :---: | :---: | :---: |
| **Zustand State Modernization** | 1 Sprint | High | v1.3.0 |
| **IndexedDB Subsystem via Dexie.js** | 2 Sprints | High | v1.3.0 |
| **WebSocket / SSE Telemetry Stream** | 2 Sprints | High | v1.4.0 |
| **Canvas / WebGL Waveform Acceleration** | 3 Sprints | High | v1.4.0 |
| **Web Bluetooth HRP Pairing** | 2 Sprints | Medium | v1.5.0 |
| **FHIR HL7 R4 Resource Exporter** | 2 Sprints | High | v1.5.0 |
| **ONNX Runtime Edge ML Arrhythmia Classifier** | 4 Sprints | Very High | v2.0.0 |
| **Client-Side AES-GCM Encryption** | 2 Sprints | High | v2.0.0 |
