import React, { useState, useMemo, useRef } from 'react';
import { BiometricPoint } from '../../types/health';
import { Activity, Heart, ShieldAlert, Sparkles, Zap, AlertTriangle, Info } from 'lucide-react';

interface Props {
  data: BiometricPoint[];
  range: '24h' | '7d' | '30d';
  onRangeChange: (r: '24h' | '7d' | '30d') => void;
}

type ActiveMetric = 'heartRate' | 'hrv' | 'systolic' | 'spo2' | 'glucose';

interface MetricConfig {
  key: ActiveMetric;
  label: string;
  unit: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  minDomain: number;
  maxDomain: number;
  axis: 'left' | 'right';
}

const METRIC_CONFIGS: Record<ActiveMetric, MetricConfig> = {
  heartRate: {
    key: 'heartRate',
    label: 'Heart Rate',
    unit: 'bpm',
    color: '#ef4444', // red-500
    gradientFrom: 'rgba(239, 68, 68, 0.25)',
    gradientTo: 'rgba(239, 68, 68, 0.01)',
    minDomain: 40,
    maxDomain: 180,
    axis: 'left'
  },
  hrv: {
    key: 'hrv',
    label: 'HRV (rMSSD)',
    unit: 'ms',
    color: '#06b6d4', // cyan-500
    gradientFrom: 'rgba(6, 182, 212, 0.25)',
    gradientTo: 'rgba(6, 182, 212, 0.01)',
    minDomain: 20,
    maxDomain: 120,
    axis: 'left'
  },
  systolic: {
    key: 'systolic',
    label: 'Systolic BP',
    unit: 'mmHg',
    color: '#8b5cf6', // violet-500
    gradientFrom: 'rgba(139, 92, 246, 0.25)',
    gradientTo: 'rgba(139, 92, 246, 0.01)',
    minDomain: 90,
    maxDomain: 160,
    axis: 'left'
  },
  spo2: {
    key: 'spo2',
    label: 'SpO2 Oxygen',
    unit: '%',
    color: '#10b981', // emerald-500
    gradientFrom: 'rgba(16, 185, 129, 0.25)',
    gradientTo: 'rgba(16, 185, 129, 0.01)',
    minDomain: 90,
    maxDomain: 100,
    axis: 'right'
  },
  glucose: {
    key: 'glucose',
    label: 'Glucose (CGM)',
    unit: 'mg/dL',
    color: '#f59e0b', // amber-500
    gradientFrom: 'rgba(245, 158, 11, 0.25)',
    gradientTo: 'rgba(245, 158, 11, 0.01)',
    minDomain: 60,
    maxDomain: 180,
    axis: 'right'
  }
};

export const InteractiveTimeSeriesChart: React.FC<Props> = ({ data, range, onRangeChange }) => {
  const [activeMetrics, setActiveMetrics] = useState<ActiveMetric[]>(['heartRate', 'hrv']);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoveredAnomaly, setHoveredAnomaly] = useState<{
    index: number;
    xPercent: number;
    point: BiometricPoint;
  } | null>(null);
  const [showAnomalyAnnotations, setShowAnomalyAnnotations] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleMetric = (m: ActiveMetric) => {
    if (activeMetrics.includes(m)) {
      if (activeMetrics.length > 1) {
        setActiveMetrics(activeMetrics.filter(item => item !== m));
      }
    } else {
      setActiveMetrics([...activeMetrics, m]);
    }
  };

  // Dimensions
  const svgWidth = 920;
  const svgHeight = 320;
  const paddingLeft = 52;
  const paddingRight = 52;
  const paddingTop = 28;
  const paddingBottom = 40;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Scale calculations
  const xStep = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;

  const getCoordinates = (metric: ActiveMetric) => {
    const cfg = METRIC_CONFIGS[metric];
    const vals = data.map(d => d[metric] as number);
    const minVal = Math.min(...vals, cfg.minDomain);
    const maxVal = Math.max(...vals, cfg.maxDomain);
    const span = maxVal - minVal || 1;

    const points = data.map((d, i) => {
      const x = paddingLeft + i * xStep;
      const val = d[metric] as number;
      const normalizedY = (val - minVal) / span;
      const y = paddingTop + plotHeight - normalizedY * plotHeight;
      return { x, y, val, point: d };
    });

    // Build smooth bezier SVG path
    let pathD = '';
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
    }

    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`
      : '';

    return { points, pathD, areaD, minVal, maxVal, cfg };
  };

  const metricCurves = useMemo(() => {
    return activeMetrics.map(m => getCoordinates(m));
  }, [data, activeMetrics]);

  // Handle mouse move for crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgRelativeX = (mouseX / rect.width) * svgWidth;
    const clampedX = Math.max(paddingLeft, Math.min(svgWidth - paddingRight, svgRelativeX));
    const rawIndex = Math.round((clampedX - paddingLeft) / xStep);
    const clampedIndex = Math.max(0, Math.min(data.length - 1, rawIndex));
    setHoverIndex(clampedIndex);
  };

  const activePoint = (data && data.length > 0)
    ? (hoverIndex !== null ? data[hoverIndex] : data[data.length - 1])
    : null;

  // Compute summary stats for the primary active metric
  const primaryMetric = activeMetrics[0];
  const primaryValues = data.map(d => d[primaryMetric] as number);
  const primaryStats = useMemo(() => {
    if (!primaryValues.length) return { min: 0, max: 0, avg: 0, latest: 0 };
    const min = Math.min(...primaryValues);
    const max = Math.max(...primaryValues);
    const avg = Math.round(primaryValues.reduce((a, b) => a + b, 0) / primaryValues.length);
    const latest = primaryValues[primaryValues.length - 1];
    return { min, max, avg, latest };
  }, [primaryValues]);

  const anomalyCount = data.filter(d => d.hasAnomaly).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm relative">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-100">Synchronized Time-Series Biometrics</h2>
            <span className="text-xs text-slate-400 font-mono">
              Replaces legacy JFreeChart 2D · {data.length} telemetry frames
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs font-mono text-slate-400">
            <span>Current: <strong className="text-slate-100 tabular-nums">{primaryStats.latest} {METRIC_CONFIGS[primaryMetric].unit}</strong></span>
            <span>·</span>
            <span>Avg: <strong className="text-slate-200 tabular-nums">{primaryStats.avg}</strong></span>
            <span>·</span>
            <span>Range: <strong className="text-slate-200 tabular-nums">{primaryStats.min} – {primaryStats.max}</strong></span>
          </div>
        </div>

        {/* Range Selector & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Anomaly Annotation Visibility Toggle */}
          {anomalyCount > 0 && (
            <button
              onClick={() => setShowAnomalyAnnotations(!showAnomalyAnnotations)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                showAnomalyAnnotations
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
              title="Toggle custom anomaly annotations on timeline"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{anomalyCount} {anomalyCount === 1 ? 'Anomaly Point' : 'Anomaly Points'}</span>
            </button>
          )}

          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {(['24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange(r)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  range === r 
                    ? 'bg-slate-800 text-teal-300 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Toggle Stream Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-1">Data Streams:</span>
          {(Object.keys(METRIC_CONFIGS) as ActiveMetric[]).map((key) => {
            const cfg = METRIC_CONFIGS[key];
            const isSelected = activeMetrics.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleMetric(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected 
                    ? 'border-slate-700 bg-slate-800 text-slate-100' 
                    : 'border-slate-800/60 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: isSelected ? cfg.color : '#64748b' }} 
                />
                <span>{cfg.label}</span>
                <span className="text-[10px] font-mono text-slate-400">({cfg.unit})</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-slate-500 hidden sm:flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400/80" />
          <span>Hover over ⚠️ markers to inspect anomaly trigger events</span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="relative mt-2 select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {metricCurves.map(({ cfg }) => (
              <linearGradient key={`grad-${cfg.key}`} id={`gradient-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cfg.gradientFrom} />
                <stop offset="100%" stopColor={cfg.gradientTo} />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + ratio * plotHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="rgba(51, 65, 85, 0.35)"
                  strokeDasharray="3 3"
                />
              </g>
            );
          })}

          {/* X Axis Time Labels */}
          {data.map((d, i) => {
            const interval = Math.max(1, Math.floor(data.length / 6));
            if (i % interval !== 0 && i !== data.length - 1) return null;
            const x = paddingLeft + i * xStep;
            return (
              <text
                key={i}
                x={x}
                y={svgHeight - 12}
                textAnchor="middle"
                className="text-[11px] fill-slate-400 font-mono"
              >
                {d.timeLabel}
              </text>
            );
          })}

          {/* Render Area fills and Lines */}
          {metricCurves.map(({ areaD, pathD, cfg }) => (
            <g key={`curve-${cfg.key}`}>
              <path d={areaD} fill={`url(#gradient-${cfg.key})`} />
              <path
                d={pathD}
                fill="none"
                stroke={cfg.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))}

          {/* Custom Anomaly Callout Annotations & Hover Pin Triggers */}
          {showAnomalyAnnotations && data.map((d, i) => {
            if (!d.hasAnomaly) return null;
            const x = paddingLeft + i * xStep;
            const isHovered = hoveredAnomaly?.index === i;

            return (
              <g 
                key={`anom-${i}`}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => {
                  setHoveredAnomaly({
                    index: i,
                    xPercent: (x / svgWidth) * 100,
                    point: d
                  });
                }}
                onMouseLeave={() => {
                  setHoveredAnomaly(null);
                }}
              >
                {/* Vertical Anomaly Marker Line */}
                <line
                  x1={x}
                  y1={paddingTop - 12}
                  x2={x}
                  y2={paddingTop + plotHeight}
                  stroke={isHovered ? "#fbbf24" : "#f59e0b"}
                  strokeWidth={isHovered ? 2 : 1.5}
                  strokeDasharray={isHovered ? "none" : "3 3"}
                  opacity={isHovered ? 1 : 0.75}
                />

                {/* Animated Pulsing Outer Halo */}
                <circle 
                  cx={x} 
                  cy={paddingTop + 4} 
                  r={isHovered ? 11 : 7} 
                  fill="rgba(245, 158, 11, 0.25)"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  className={isHovered ? "" : "animate-pulse"}
                />

                {/* Core Warning Diamond/Pin */}
                <circle 
                  cx={x} 
                  cy={paddingTop + 4} 
                  r={isHovered ? 5.5 : 4.5} 
                  fill={isHovered ? "#fef08a" : "#f59e0b"} 
                  stroke="#0f172a" 
                  strokeWidth="2" 
                />

                {/* Custom Anomaly Annotation Tag Flag */}
                <g transform={`translate(${x}, ${paddingTop - 14})`}>
                  <rect
                    x="-34"
                    y="-15"
                    width="68"
                    height="17"
                    rx="4"
                    fill={isHovered ? "#78350f" : "#1e293b"}
                    stroke={isHovered ? "#fef08a" : "#f59e0b"}
                    strokeWidth={isHovered ? 1.5 : 1}
                    className="shadow-sm"
                  />
                  <text
                    x="0"
                    y="-3"
                    textAnchor="middle"
                    fill={isHovered ? "#fef08a" : "#fbbf24"}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    ⚠️ TRIGGER
                  </text>
                </g>
              </g>
            );
          })}

          {/* Active Hover Crosshair */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={paddingLeft + hoverIndex * xStep}
                y1={paddingTop}
                x2={paddingLeft + hoverIndex * xStep}
                y2={paddingTop + plotHeight}
                stroke="rgba(203, 213, 225, 0.6)"
                strokeWidth="1.5"
              />
              {metricCurves.map(({ points, cfg }) => {
                const p = points[hoverIndex];
                if (!p) return null;
                return (
                  <circle
                    key={`dot-${cfg.key}`}
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill={cfg.color}
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Floating Custom Anomaly Hover Popover */}
        {hoveredAnomaly && (
          <div 
            className="absolute z-30 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
            style={{
              left: `${Math.max(16, Math.min(84, hoveredAnomaly.xPercent))}%`,
              top: '4%',
              transform: 'translateX(-50%)'
            }}
          >
            <div className="bg-slate-950/95 border-2 border-amber-500/90 rounded-xl p-4 shadow-2xl backdrop-blur-md font-mono text-xs space-y-2.5 max-w-sm text-slate-100">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>ANOMALY TRIGGER EVENT</span>
                </div>
                <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {hoveredAnomaly.point.timeLabel} · {hoveredAnomaly.point.dateLabel}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Event Trigger Description:
                </span>
                <p className="text-xs text-amber-200 font-medium leading-relaxed bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/30">
                  {hoveredAnomaly.point.anomalyNote || 'Automated multi-signal divergence threshold breached.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[9px]">HEART RATE</span>
                  <span className="font-bold text-rose-400 tabular-nums">{hoveredAnomaly.point.heartRate} bpm</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[9px]">HRV (rMSSD)</span>
                  <span className="font-bold text-cyan-400 tabular-nums">{hoveredAnomaly.point.hrv} ms</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[9px]">RECOVERY</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{hoveredAnomaly.point.recoveryScore}%</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-amber-400/90">Aegis Biometric Detection Engine</span>
                <span className="text-slate-500">Continuous 1Hz Telemetry</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Telemetry Tooltip & Anomaly Banner */}
        {activePoint && (
          <div className="mt-3 p-3 bg-slate-950/90 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400">Timestamp:</span>
              <span className="font-medium text-slate-200">{activePoint.dateLabel} {activePoint.timeLabel}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {activeMetrics.map((m) => {
                const cfg = METRIC_CONFIGS[m];
                return (
                  <div key={m} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-slate-400">{cfg.label}:</span>
                    <span className="font-mono font-semibold text-slate-100 tabular-nums">
                      {activePoint[m]} {cfg.unit}
                    </span>
                  </div>
                );
              })}

              <div className="flex items-center gap-1.5 text-slate-400">
                <span>Recovery:</span>
                <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                  {activePoint.recoveryScore}%
                </span>
              </div>
            </div>

            {activePoint.hasAnomaly && (
              <div className="w-full flex items-center gap-2 pt-2 border-t border-slate-800/70 text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] font-medium font-mono">
                  <strong className="text-amber-200">Anomaly Trigger: </strong>
                  {activePoint.anomalyNote}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

