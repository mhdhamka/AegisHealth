/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { BiometricsAnalyticsView } from './components/views/BiometricsAnalyticsView';
import { BiometricAlertsView } from './components/views/BiometricAlertsView';
import { WearablesSyncView } from './components/views/WearablesSyncView';
import { HealthLogsView } from './components/views/HealthLogsView';
import { AnomaliesInsightsView } from './components/views/AnomaliesInsightsView';
import { QuickLogModal } from './components/QuickLogModal';
import { ReportExportModal } from './components/ReportExportModal';

import { 
  UserProfile, 
  BiometricPoint, 
  SleepRecord, 
  HealthLogEntry, 
  WearableDevice, 
  BiometricAnomaly 
} from './types/health';
import { 
  currentUser as defaultUser, 
  alternateProfiles, 
  latestSleepRecord,
  generate24HourTelemetry,
  initialHealthLogs,
  initialWearableDevices,
  initialAnomalies
} from './data/mockData';
import { apiService } from './services/apiService';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [currentUser, setCurrentUser] = useState<UserProfile>(defaultUser);
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');
  
  // Data states - initialize with immediate synchronous data
  const [telemetry, setTelemetry] = useState<BiometricPoint[]>(() => generate24HourTelemetry());
  const [sleepRecord, setSleepRecord] = useState<SleepRecord>(latestSleepRecord);
  const [logs, setLogs] = useState<HealthLogEntry[]>(() => initialHealthLogs);
  const [devices, setDevices] = useState<WearableDevice[]>(() => initialWearableDevices);
  const [anomalies, setAnomalies] = useState<BiometricAnomaly[]>(() => initialAnomalies);
  const [loading, setLoading] = useState(false);

  // Modals & UI States
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [telemRes, sleepRes, logsRes, devRes, anomRes] = await Promise.all([
          apiService.getTelemetry(range),
          apiService.getSleepRecord(),
          apiService.getHealthLogs(),
          apiService.getWearableDevices(),
          apiService.getAnomalies()
        ]);

        setTelemetry(telemRes.data);
        setSleepRecord(sleepRes);
        setLogs(logsRes);
        setDevices(devRes);
        setAnomalies(anomRes);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [range]);

  // Range change handler
  const handleRangeChange = async (newRange: '24h' | '7d' | '30d') => {
    setRange(newRange);
    const telemRes = await apiService.getTelemetry(newRange);
    setTelemetry(telemRes.data);
  };

  // Sync All Devices
  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await apiService.syncAllWearables();
      setDevices(res.updatedDevices);
      setSyncNotice(`Synced ${res.totalSamples} packets across ${res.updatedDevices.length} wearables`);
      setTimeout(() => setSyncNotice(null), 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync Single Device
  const handleSyncDevice = async (id: string) => {
    const res = await apiService.syncWearable(id);
    setDevices(prev => prev.map(d => d.id === id ? res.device : d));
    setSyncNotice(`Synced ${res.samplesSynced} samples from ${res.device.name}`);
    setTimeout(() => setSyncNotice(null), 3500);
  };

  // Delete Log
  const handleDeleteLog = async (id: string) => {
    await apiService.deleteHealthLog(id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  // Add Log callback
  const handleLogAdded = (newEntry: HealthLogEntry) => {
    setLogs(prev => [newEntry, ...prev]);
  };

  // Resolve Anomaly callback
  const handleResolveAnomaly = async (id: string) => {
    await apiService.resolveAnomaly(id);
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
  };

  const activeAnomaliesCount = anomalies.filter(a => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        alternateProfiles={alternateProfiles}
        onSelectProfile={setCurrentUser}
        activeAnomaliesCount={activeAnomaliesCount}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenQuickLog={() => setQuickLogOpen(true)}
          onOpenExport={() => setExportModalOpen(true)}
          onSyncAll={handleSyncAll}
          isSyncing={isSyncing}
          syncNotice={syncNotice}
        />

        {/* Content Body */}
        <main className="flex-1 pb-16">
          {activeTab === 'overview' && (
            <DashboardView
              user={currentUser}
              telemetry={telemetry}
              range={range}
              onRangeChange={handleRangeChange}
              sleepRecord={sleepRecord}
              logs={logs}
              onOpenQuickLog={() => setQuickLogOpen(true)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'analytics' && (
            <BiometricsAnalyticsView
              telemetry={telemetry}
              range={range}
              onRangeChange={handleRangeChange}
              sleepRecord={sleepRecord}
            />
          )}

          {activeTab === 'alerts' && (
            <BiometricAlertsView
              telemetry={telemetry}
            />
          )}

          {activeTab === 'wearables' && (
            <WearablesSyncView
              devices={devices}
              onSyncDevice={handleSyncDevice}
              onSyncAll={handleSyncAll}
              isSyncing={isSyncing}
              syncNotice={syncNotice}
            />
          )}

          {activeTab === 'health_logs' && (
            <HealthLogsView
              logs={logs}
              onDeleteLog={handleDeleteLog}
              onOpenQuickLog={() => setQuickLogOpen(true)}
              onOpenExport={() => setExportModalOpen(true)}
            />
          )}

          {activeTab === 'anomalies' && (
            <AnomaliesInsightsView
              anomalies={anomalies}
              onResolveAnomaly={handleResolveAnomaly}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <QuickLogModal
        isOpen={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
        onLogAdded={handleLogAdded}
        apiService={apiService}
      />

      <ReportExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        user={currentUser}
        logs={logs}
        apiService={apiService}
      />
    </div>
  );
}
