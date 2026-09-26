import React, { useState } from 'react';
import { BiometricPoint, SleepRecord, HealthLogEntry, UserProfile } from '../../types/health';
import { InteractiveTimeSeriesChart } from '../charts/InteractiveTimeSeriesChart';
import { SleepHypnogramChart } from '../charts/SleepHypnogramChart';
import { BloodPressureZoneChart } from '../charts/BloodPressureZoneChart';
import { CorrelationScatterChart } from '../charts/CorrelationScatterChart';
import { PersonalGoalsWidget, UserPersonalGoals } from '../widgets/PersonalGoalsWidget';
import { ConfigureGoalsModal, loadStoredGoals } from '../ConfigureGoalsModal';
import { 
  Heart, 
  Activity, 
  Zap, 
  Moon, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight,
  Flame,
  Footprints,
  SlidersHorizontal,
  Target
} from 'lucide-react';

interface Props {
  user: UserProfile;
  telemetry: BiometricPoint[];
  range: '24h' | '7d' | '30d';
  onRangeChange: (r: '24h' | '7d' | '30d') => void;
  sleepRecord: SleepRecord;
  logs: HealthLogEntry[];
  onOpenQuickLog: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<Props> = ({
  user,
  telemetry,
  range,
  onRangeChange,
  sleepRecord,
  logs,
  onOpenQuickLog,
  onNavigateTab
}) => {
  const fallbackPoint: BiometricPoint = {
    timestamp: new Date().toISOString(),
    timeLabel: '08:00',
    dateLabel: 'Today',
    heartRate: 52,
    restingHeartRate: 51,
    hrv: 78,
    systolic: 116,
    diastolic: 72,
    spo2: 98.4,
    glucose: 88,
    respiratoryRate: 14.2,
    steps: 12450,
    activeCalories: 540,
    strain: 14.8,
    recoveryScore: 84
  };
  const latest = (telemetry && telemetry.length > 0) ? (telemetry[telemetry.length - 1] || telemetry[0]) : fallbackPoint;

  // Persisted Personal Goals State & Modal Visibility
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);
  const [persistedGoals, setPersistedGoals] = useState<UserPersonalGoals>(() => loadStoredGoals());

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Patient/User Summary & Cohort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full object-cover border-2 border-teal-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">{user.name}</h2>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-teal-400">{user.profileType}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
              <span>Age: {user.age} yrs</span>
              <span>·</span>
              <span>VO2 Max: <strong className="text-slate-200">{user.vo2Max} mL/kg/min</strong></span>
              <span>·</span>
              <span>Weight: {user.weightKg} kg</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setGoalsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-teal-300 hover:text-teal-200 transition-colors cursor-pointer"
            title="Configure Daily Goals & Thresholds"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Configure Goals</span>
          </button>

          <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-right">
            <span className="text-[10px] text-slate-400 block font-mono">AUTONOMIC READINESS</span>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-base font-bold text-slate-100 font-mono tabular-nums">{latest.recoveryScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Tabular Numerals, 60-30-10 discipline) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Resting HR */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Resting HR</span>
            <Heart className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {latest.restingHeartRate} <span className="text-xs font-normal text-slate-400">bpm</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-400 font-mono">
            <TrendingDown className="w-3 h-3" />
            <span>-2 bpm vs 30d</span>
          </div>
        </div>

        {/* Metric 2: HRV (rMSSD) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>HRV (rMSSD)</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {latest.hrv} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-teal-400 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>+6 ms vs baseline</span>
          </div>
        </div>

        {/* Metric 3: Blood Pressure */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Blood Pressure</span>
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {latest.systolic}/{latest.diastolic}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Normal (&lt;120/80)
          </div>
        </div>

        {/* Metric 4: SpO2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Blood SpO2</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {latest.spo2}%
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-mono">
            Optimal saturation
          </div>
        </div>

        {/* Metric 5: Glucose */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Fasting Glucose</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {latest.glucose} <span className="text-xs font-normal text-slate-400">mg/dL</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Target 70–99
          </div>
        </div>

        {/* Metric 6: Daily Strain */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Daily Strain</span>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {latest.strain} <span className="text-xs font-normal text-slate-400">/ 21</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            {latest.steps.toLocaleString()} steps
          </div>
        </div>
      </div>

      {/* Personal Goals & Daily Targets Widget */}
      <PersonalGoalsWidget
        currentSteps={latest.steps}
        currentSleepHours={sleepRecord.totalDurationHours}
        currentRestingHeartRate={latest.restingHeartRate || latest.heartRate}
        goals={persistedGoals}
        onOpenConfigureModal={() => setGoalsModalOpen(true)}
        onSaveGoals={(newGoals) => setPersistedGoals(newGoals)}
      />

      {/* Main Interactive Time Series Chart (Replaces JFreeChart) */}
      <InteractiveTimeSeriesChart
        data={telemetry}
        range={range}
        onRangeChange={onRangeChange}
      />

      {/* Sleep Architecture Polysomnography */}
      <SleepHypnogramChart sleepRecord={sleepRecord} />

      {/* Two-Column Grid: Blood Pressure Zone Grid & Recent Health Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BloodPressureZoneChart />

        {/* Recent Health Logs Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-slate-100">Recent Health Logs</h3>
                <p className="text-xs text-slate-400 font-mono">Clinician & Wearable Verified Entries</p>
              </div>
              <button
                onClick={onOpenQuickLog}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium cursor-pointer"
              >
                + Add Log
              </button>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-200 truncate">{log.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {log.timestamp} · {log.source}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-semibold text-slate-100 tabular-nums">
                      {log.value} {log.unit}
                    </div>
                    <div className="text-[10px] font-mono capitalize text-emerald-400">
                      {log.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Total {logs.length} biomarker records in PostgreSQL database
            </span>
            <button
              onClick={() => onNavigateTab('health_logs')}
              className="text-xs text-slate-300 hover:text-teal-300 font-medium cursor-pointer"
            >
              View All Logs →
            </button>
          </div>
        </div>
      </div>

      {/* Configure Goals Modal */}
      <ConfigureGoalsModal
        isOpen={goalsModalOpen}
        onClose={() => setGoalsModalOpen(false)}
        currentGoals={persistedGoals}
        onSaveGoals={(newGoals) => setPersistedGoals(newGoals)}
      />
    </div>
  );
};
