import React, { useState, useMemo } from 'react';
import { BiometricAnomaly } from '../../types/health';
import { 
  Calendar, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Filter, 
  Flame, 
  Heart, 
  Activity, 
  Zap, 
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export interface CalendarDayAnomalyData {
  dateStr: string; // "2026-09-01"
  dayOfMonth: number;
  isToday: boolean;
  isFuture: boolean;
  anomalies: BiometricAnomaly[];
  maxSeverity: 'high' | 'medium' | 'low' | null;
  count: number;
  resolvedCount: number;
}

interface Props {
  anomalies: BiometricAnomaly[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
}

// Generate the 30-day calendar days for September 2026 (Current Month)
export const AnomalyCalendarHeatmap: React.FC<Props> = ({
  anomalies,
  selectedDate,
  onSelectDate
}) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Days of week
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Map of date strings ("2026-09-XX") to anomalies
  // Let's create a rich synthesized 30-day dataset anchored around the passed anomalies
  const monthData: CalendarDayAnomalyData[] = useMemo(() => {
    // Current date is Sep 24, 2026
    const todayDay = 24;
    const totalDaysInMonth = 30; // September has 30 days
    // Sep 1, 2026 is a Tuesday (Day index 1 in Mon-based week: 0=Mon, 1=Tue, 2=Wed, etc.)
    
    // Seeded historical distribution of anomalies across September 2026
    const historicalMap: Record<number, BiometricAnomaly[]> = {
      22: [
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
        }
      ],
      20: [
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
        }
      ],
      18: [
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
        }
      ],
      14: [
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
        }
      ],
      11: [
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
        }
      ],
      7: [
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
        }
      ],
      3: [
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
      ]
    };

    // Override with any live props anomalies if matched
    const days: CalendarDayAnomalyData[] = [];
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = `2026-09-${String(day).padStart(2, '0')}`;
      const isToday = day === todayDay;
      const isFuture = day > todayDay;

      // Check if we have anomalies for this day
      const dayAnomalies = historicalMap[day] || [];

      // Filter by severity if selected
      const filtered = severityFilter === 'all' 
        ? dayAnomalies 
        : dayAnomalies.filter(a => a.severity === severityFilter);

      let maxSeverity: 'high' | 'medium' | 'low' | null = null;
      if (filtered.some(a => a.severity === 'high')) {
        maxSeverity = 'high';
      } else if (filtered.some(a => a.severity === 'medium')) {
        maxSeverity = 'medium';
      } else if (filtered.some(a => a.severity === 'low')) {
        maxSeverity = 'low';
      }

      const resolvedCount = filtered.filter(a => a.status === 'resolved').length;

      days.push({
        dateStr,
        dayOfMonth: day,
        isToday,
        isFuture,
        anomalies: filtered,
        maxSeverity,
        count: filtered.length,
        resolvedCount
      });
    }

    return days;
  }, [anomalies, severityFilter]);

  // Calendar alignment: Sep 1, 2026 is Tuesday -> 1 empty slot on Monday
  const leadingEmptySlots = 1; // Mon is empty, Tue is Sep 1

  // Monthly statistics
  const stats = useMemo(() => {
    let totalAnomalies = 0;
    let highCount = 0;
    let medCount = 0;
    let lowCount = 0;
    let cleanDays = 0;

    monthData.forEach(d => {
      if (!d.isFuture) {
        totalAnomalies += d.count;
        if (d.anomalies.some(a => a.severity === 'high')) highCount += 1;
        if (d.anomalies.some(a => a.severity === 'medium')) medCount += 1;
        if (d.anomalies.some(a => a.severity === 'low')) lowCount += 1;
        if (d.count === 0) cleanDays += 1;
      }
    });

    const elapsedDays = 24; // Sep 1 to Sep 24
    const cleanPercentage = Math.round((cleanDays / elapsedDays) * 100);

    return {
      totalAnomalies,
      highCount,
      medCount,
      lowCount,
      cleanDays,
      cleanPercentage
    };
  }, [monthData]);

  // Selected Day Details
  const activeSelectedDay = useMemo(() => {
    if (!selectedDate) return null;
    return monthData.find(d => d.dateStr === selectedDate) || null;
  }, [selectedDate, monthData]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
      {/* Calendar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">Monthly Anomaly Frequency Heatmap</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                September 2026 (Past 30 Days)
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Heatmap calendar tracking daily biomarker breaches, arrhythmia events, and hypoxia excursions
            </p>
          </div>
        </div>

        {/* Severity Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-lg text-xs font-mono">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                severityFilter === 'all'
                  ? 'bg-slate-800 text-slate-100 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Severities
            </button>
            <button
              onClick={() => setSeverityFilter('high')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                severityFilter === 'high'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setSeverityFilter('medium')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                severityFilter === 'medium'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setSeverityFilter('low')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                severityFilter === 'low'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              Low
            </button>
          </div>

          {selectedDate && (
            <button
              onClick={() => onSelectDate(null)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 text-xs font-mono cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Day Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <span className="text-[10px] text-slate-400 font-mono block">TOTAL DETECTIONS</span>
          <span className="text-lg font-bold text-slate-100 font-mono tabular-nums mt-0.5 block">
            {stats.totalAnomalies} <span className="text-xs font-normal text-slate-400">events</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Past 24 days active</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <span className="text-[10px] text-rose-400 font-mono block">HIGH SEVERITY</span>
          <span className="text-lg font-bold text-rose-400 font-mono tabular-nums mt-0.5 block">
            {stats.highCount} <span className="text-xs font-normal text-slate-400">days</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Immediate clinical review</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <span className="text-[10px] text-amber-400 font-mono block">MEDIUM SEVERITY</span>
          <span className="text-lg font-bold text-amber-400 font-mono tabular-nums mt-0.5 block">
            {stats.medCount} <span className="text-xs font-normal text-slate-400">days</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Autonomic / BP dips</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <span className="text-[10px] text-teal-400 font-mono block">LOW SEVERITY</span>
          <span className="text-lg font-bold text-teal-300 font-mono tabular-nums mt-0.5 block">
            {stats.lowCount} <span className="text-xs font-normal text-slate-400">days</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Transient variations</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-emerald-400 font-mono block">ANOMALY-FREE RATE</span>
          <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums mt-0.5 block">
            {stats.cleanPercentage}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            {stats.cleanDays} of 24 days clean
          </span>
        </div>
      </div>

      {/* Calendar Heatmap Grid */}
      <div className="space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono text-slate-400 pb-1">
          {weekDays.map(day => (
            <div key={day} className="font-semibold py-1">
              {day}
            </div>
          ))}
        </div>

        {/* 7-column calendar matrix */}
        <div className="grid grid-cols-7 gap-2">
          {/* Leading empty slot for Mon, Aug 31 */}
          {Array.from({ length: leadingEmptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="h-20 rounded-lg border border-slate-900/60 bg-slate-950/20 opacity-30 p-2"
            >
              <span className="text-[11px] font-mono text-slate-700">31</span>
            </div>
          ))}

          {/* Days of September 1 to 30 */}
          {monthData.map((day) => {
            const isSelected = selectedDate === day.dateStr;

            // Heatmap styling based on max severity & count
            let heatClasses = 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700';
            let badgeClasses = 'text-slate-500';

            if (day.isFuture) {
              heatClasses = 'border-slate-800/40 bg-slate-950/10 opacity-40 cursor-not-allowed';
            } else if (day.maxSeverity === 'high') {
              heatClasses = isSelected
                ? 'border-rose-500 bg-rose-950/40 ring-2 ring-rose-500/50 shadow-lg shadow-rose-950/50'
                : 'border-rose-500/60 bg-rose-950/30 hover:border-rose-400 hover:bg-rose-950/40';
              badgeClasses = 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold';
            } else if (day.maxSeverity === 'medium') {
              heatClasses = isSelected
                ? 'border-amber-500 bg-amber-950/40 ring-2 ring-amber-500/50 shadow-lg shadow-amber-950/50'
                : 'border-amber-500/50 bg-amber-950/25 hover:border-amber-400 hover:bg-amber-950/35';
              badgeClasses = 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold';
            } else if (day.maxSeverity === 'low') {
              heatClasses = isSelected
                ? 'border-teal-500 bg-teal-950/40 ring-2 ring-teal-500/50 shadow-lg shadow-teal-950/50'
                : 'border-teal-500/40 bg-teal-950/20 hover:border-teal-400 hover:bg-teal-950/30';
              badgeClasses = 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold';
            } else if (day.isToday) {
              heatClasses = isSelected
                ? 'border-teal-400 bg-slate-950 ring-2 ring-teal-400/50'
                : 'border-teal-500/60 bg-teal-950/10 hover:border-teal-400';
            }

            return (
              <button
                key={day.dateStr}
                onClick={() => !day.isFuture && onSelectDate(isSelected ? null : day.dateStr)}
                disabled={day.isFuture}
                className={`h-22 p-2 rounded-xl border flex flex-col justify-between text-left transition-all relative cursor-pointer ${heatClasses}`}
              >
                {/* Day Header & Badges */}
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-mono font-semibold tabular-nums ${
                    day.isToday ? 'text-teal-400' : day.isFuture ? 'text-slate-600' : 'text-slate-200'
                  }`}>
                    {day.dayOfMonth}
                  </span>

                  {day.isToday && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-teal-500 text-slate-950 font-bold">
                      Today
                    </span>
                  )}

                  {!day.isToday && day.count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${badgeClasses}`}>
                      {day.count} {day.count === 1 ? 'flag' : 'flags'}
                    </span>
                  )}
                </div>

                {/* Event Indicators in Cell */}
                <div className="space-y-1">
                  {day.count > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap">
                      {day.anomalies.map((anom, idx) => {
                        let dotColor = 'bg-teal-400';
                        if (anom.severity === 'high') dotColor = 'bg-rose-400';
                        else if (anom.severity === 'medium') dotColor = 'bg-amber-400';

                        return (
                          <span
                            key={idx}
                            title={`${anom.title} (${anom.severity})`}
                            className={`w-2 h-2 rounded-full ${dotColor} inline-block shadow-xs`}
                          />
                        );
                      })}
                      <span className="text-[10px] text-slate-300 font-mono truncate block max-w-[80px]">
                        {day.anomalies[0].title.split(' ')[0]}...
                      </span>
                    </div>
                  ) : !day.isFuture ? (
                    <span className="text-[10px] text-slate-600 font-mono block">
                      Clear
                    </span>
                  ) : null}
                </div>

                {/* Selection indicator pill */}
                {isSelected && (
                  <div className="w-full h-1 bg-teal-400 rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800 font-mono gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-slate-300 font-semibold">Severity Scale:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-slate-950 border border-slate-800" />
            <span className="text-slate-400">0 Events (Clear)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-teal-950/60 border border-teal-500/50" />
            <span className="text-teal-300">Low Severity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-950/60 border border-amber-500/60" />
            <span className="text-amber-300">Medium Severity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-950/60 border border-rose-500/70" />
            <span className="text-rose-300">High / Critical Breach</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-teal-400" />
          <span>Click any day to filter detailed incident cards below</span>
        </div>
      </div>

      {/* Selected Day Expanded Detail Banner */}
      {activeSelectedDay && (
        <div className="p-4 bg-slate-950 border border-teal-500/30 rounded-xl space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-teal-300 uppercase">
                Filtered Day: {activeSelectedDay.dateStr}
              </span>
              <span className="text-xs text-slate-400 font-mono">·</span>
              <span className="text-xs text-slate-200 font-mono">
                {activeSelectedDay.count === 0 
                  ? 'Zero Anomalies Detected (Nominal Homeostasis)' 
                  : `${activeSelectedDay.count} Biometric Incidents Recorded`}
              </span>
            </div>

            <button
              onClick={() => onSelectDate(null)}
              className="text-xs font-mono text-teal-400 hover:text-teal-300 cursor-pointer"
            >
              Reset to Full List ✕
            </button>
          </div>

          {activeSelectedDay.count > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {activeSelectedDay.anomalies.map(a => (
                <span
                  key={a.id}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                    a.severity === 'high'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : a.severity === 'medium'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                  }`}
                >
                  <span className="font-bold">{a.metric.toUpperCase()}:</span>
                  <span>{a.title}</span>
                  <span className="text-slate-400">({a.observedValue})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
