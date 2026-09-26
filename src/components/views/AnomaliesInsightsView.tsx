import React, { useState, useMemo } from 'react';
import { BiometricAnomaly } from '../../types/health';
import { AnomalyCalendarHeatmap } from '../charts/AnomalyCalendarHeatmap';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Heart,
  Activity,
  Zap,
  Check,
  Calendar,
  Filter,
  RotateCcw
} from 'lucide-react';

interface Props {
  anomalies: BiometricAnomaly[];
  onResolveAnomaly: (id: string) => Promise<void>;
}

// Master set of past month anomalies combining prop data and September records
const SEPTEMBER_ANOMALIES: BiometricAnomaly[] = [
  {
    id: 'anom_sep22_01',
    timestamp: 'Sep 22, 2026, 03:15 PM',
    metric: 'heart_rate',
    title: 'Sustained Sinus Tachycardia During Shift',
    severity: 'high',
    observedValue: '124 bpm (4.5 min)',
    expectedBaseline: '62 ± 6 bpm',
    clinicalContext: 'Acute adrenergic surge with resting heart rate sustained above 120 bpm for >4 minutes without concurrent accelerometer step cadence.',
    suggestedAction: 'Review 12-lead ambulatory telemetry strip; evaluate hydration and systemic caffeine load.',
    status: 'active'
  },
  {
    id: 'anom_001',
    timestamp: 'Sep 20, 2026, 07:15 AM',
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
    timestamp: 'Sep 18, 2026, 08:30 PM',
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
    timestamp: 'Sep 14, 2026, 02:40 AM',
    metric: 'spo2',
    title: 'Brief Nocturnal Desaturation Event',
    severity: 'low',
    observedValue: '93% SpO2 (4 min)',
    expectedBaseline: '97 - 99%',
    clinicalContext: 'Single transient dip during REM stage transition. No snoring audio triggers or sleep fragmentation detected by Oura or Whoop.',
    suggestedAction: 'Continue passive nocturnal pulse oximetry monitoring. No clinical apnea indication at this time.',
    status: 'resolved'
  },
  {
    id: 'anom_sep11_01',
    timestamp: 'Sep 11, 2026, 04:10 AM',
    metric: 'heart_rate',
    title: 'Nocturnal Bradycardia Nadir Breach',
    severity: 'high',
    observedValue: '41 bpm (6 min)',
    expectedBaseline: '48 - 56 bpm',
    clinicalContext: 'Profound vagal hypertonia during slow-wave sleep. Asymptomatic in well-trained endurance athletes, but triggered the sustained bradycardia guard (<44 bpm).',
    suggestedAction: 'Confirm non-pathological sinus rhythm; calibrate threshold lower bound for athletic profile.',
    status: 'resolved'
  },
  {
    id: 'anom_sep07_01',
    timestamp: 'Sep 07, 2026, 01:20 PM',
    metric: 'glucose',
    title: 'Post-Prandial Glycemic Spike',
    severity: 'medium',
    observedValue: '148 mg/dL',
    expectedBaseline: '80 - 110 mg/dL',
    clinicalContext: 'Rapid carbohydrate absorption post high-glycemic lunch with velocity exceeding +3.2 mg/dL/min.',
    suggestedAction: 'Incorporate 15-minute post-meal light walk to accelerate GLUT4 non-insulin-mediated glucose uptake.',
    status: 'resolved'
  },
  {
    id: 'anom_sep03_01',
    timestamp: 'Sep 03, 2026, 06:45 AM',
    metric: 'hrv',
    title: 'Mild Vagal Tone Blunting',
    severity: 'low',
    observedValue: '54 ms rMSSD',
    expectedBaseline: '72 ± 6 ms',
    clinicalContext: 'Mild autonomic recovery deficit following travel and sleep phase disruption.',
    suggestedAction: 'Ensure 8 hours of sleep opportunity and optimize sleep hygiene.',
    status: 'resolved'
  }
];

export const AnomaliesInsightsView: React.FC<Props> = ({
  anomalies,
  onResolveAnomaly
}) => {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [metricFilter, setMetricFilter] = useState<string>('all');
  const [resolvedOverrides, setResolvedOverrides] = useState<Record<string, boolean>>({});

  // Merge prop anomalies with September dataset
  const allAnomalies = useMemo(() => {
    const map = new Map<string, BiometricAnomaly>();
    SEPTEMBER_ANOMALIES.forEach(a => map.set(a.id, a));
    anomalies.forEach(a => map.set(a.id, a));

    return Array.from(map.values()).map(a => ({
      ...a,
      status: resolvedOverrides[a.id] ? 'resolved' : a.status
    }));
  }, [anomalies, resolvedOverrides]);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await onResolveAnomaly(id);
      setResolvedOverrides(prev => ({ ...prev, [id]: true }));
    } finally {
      setResolvingId(null);
    }
  };

  // Filtered anomalies for display
  const displayedAnomalies = useMemo(() => {
    let list = allAnomalies;

    // Filter by selected calendar date (e.g. "2026-09-22")
    if (selectedDate) {
      const dayNum = parseInt(selectedDate.split('-')[2], 10);
      const dayPattern = `Sep ${dayNum < 10 ? '0' + dayNum : dayNum}` ;
      const altDayPattern = `Sep ${dayNum}`;
      list = list.filter(a => a.timestamp.includes(dayPattern) || a.timestamp.includes(altDayPattern));
    }

    // Filter by metric
    if (metricFilter !== 'all') {
      list = list.filter(a => a.metric === metricFilter);
    }

    return list;
  }, [allAnomalies, selectedDate, metricFilter]);

  const activeCount = allAnomalies.filter(a => a.status === 'active').length;
  const resolvedCount = allAnomalies.filter(a => a.status === 'resolved').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">Automated Biomarker Anomaly Detection</h2>
            <span className="text-xs font-mono text-amber-400">· Physiological Heuristics</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time multi-signal correlation detecting autonomic fatigue, cardiovascular strain, and sleep debt
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-slate-400">Active Incidents:</span>
            <span className="font-bold text-amber-400">{activeCount}</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-slate-400">Resolved:</span>
            <span className="font-bold text-emerald-400">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Calendar Heatmap Visualization of Past Month */}
      <AnomalyCalendarHeatmap
        anomalies={allAnomalies}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Incident List Header & Metric Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-100">
            {selectedDate ? `Incident Details for ${selectedDate}` : 'Comprehensive Incident Log'}
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {displayedAnomalies.length} {displayedAnomalies.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-mono bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <span className="text-slate-400 px-1 text-[11px]">Filter:</span>
            {['all', 'heart_rate', 'hrv', 'blood_pressure', 'spo2', 'glucose'].map((m) => (
              <button
                key={m}
                onClick={() => setMetricFilter(m)}
                className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer text-[11px] ${
                  metricFilter === m
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'all' ? 'All' : m.replace('_', ' ')}
              </button>
            ))}
          </div>

          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="px-2.5 py-1 text-xs font-mono text-teal-400 hover:text-teal-300 border border-teal-500/20 rounded-lg bg-teal-500/10 cursor-pointer transition-colors"
            >
              Clear Filter ✕
            </button>
          )}
        </div>
      </div>

      {/* Anomalies List */}
      {displayedAnomalies.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-200">Zero Anomalies for Selected Criteria</h4>
            <p className="text-xs text-slate-400 font-mono mt-1 max-w-md mx-auto">
              All physiological vitals and autonomic markers remained within the verified 30-day baseline corridor.
            </p>
          </div>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              Reset to Full 30-Day Log
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedAnomalies.map((anomaly) => {
            const isResolving = resolvingId === anomaly.id;
            const isResolved = anomaly.status === 'resolved';

            return (
              <div
                key={anomaly.id}
                className={`bg-slate-900 border rounded-xl p-5 transition-all shadow-sm ${
                  isResolved 
                    ? 'border-slate-800/60 opacity-75' 
                    : anomaly.severity === 'high' 
                      ? 'border-rose-500/40 bg-slate-900/90' 
                      : 'border-amber-500/30'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                        anomaly.severity === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : anomaly.severity === 'medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      }`}>
                        {anomaly.severity.toUpperCase()} SEVERITY
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Timestamp: {anomaly.timestamp}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-slate-400 font-mono">
                        Metric: <strong className="text-slate-200">{anomaly.metric.toUpperCase()}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-100">{anomaly.title}</h3>

                    {/* Quantitative delta comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 max-w-xl">
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-400 font-mono block">OBSERVED VALUE</span>
                        <span className={`text-sm font-bold font-mono tabular-nums ${
                          anomaly.severity === 'high' ? 'text-rose-300' : 'text-amber-300'
                        }`}>
                          {anomaly.observedValue}
                        </span>
                      </div>
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-400 font-mono block">EXPECTED 30D BASELINE</span>
                        <span className="text-sm font-semibold text-slate-200 font-mono tabular-nums">
                          {anomaly.expectedBaseline}
                        </span>
                      </div>
                    </div>

                    {/* Clinical Context */}
                    <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                      <strong className="text-slate-100">Clinical Mechanism: </strong>
                      {anomaly.clinicalContext}
                    </div>

                    {/* Suggested Protocol */}
                    <div className="text-xs text-teal-300 leading-relaxed bg-teal-950/20 p-3 rounded-lg border border-teal-500/20">
                      <strong className="text-teal-200">Recommended Recovery Protocol: </strong>
                      {anomaly.suggestedAction}
                    </div>
                  </div>

                  {/* Right Action */}
                  <div className="shrink-0 flex flex-col items-end gap-3">
                    <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-md capitalize ${
                      isResolved 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : anomaly.severity === 'high'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      Status: {anomaly.status}
                    </span>

                    {!isResolved && (
                      <button
                        onClick={() => handleResolve(anomaly.id)}
                        disabled={isResolving}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 text-teal-400" />
                        <span>{isResolving ? 'Updating State...' : 'Resolve Anomaly'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

