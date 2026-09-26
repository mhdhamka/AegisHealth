import React, { useState } from 'react';
import { Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

interface CorrelationPair {
  id: string;
  title: string;
  xLabel: string;
  yLabel: string;
  xUnit: string;
  yUnit: string;
  rValue: number;
  significance: string;
  interpretation: string;
  points: { x: number; y: number; label: string }[];
}

const CORRELATION_PAIRS: CorrelationPair[] = [
  {
    id: 'sleep_vs_hrv',
    title: 'Sleep Duration vs. Next-Day HRV',
    xLabel: 'Sleep Duration',
    yLabel: 'Morning HRV (rMSSD)',
    xUnit: 'hours',
    yUnit: 'ms',
    rValue: 0.78,
    significance: 'p < 0.001 (Strong Positive)',
    interpretation: 'Each additional 45 minutes of sleep past 7.0h correlates with a +9.2 ms increase in morning parasympathetic tone.',
    points: [
      { x: 6.2, y: 54, label: 'Oct 14 · Post late shift' },
      { x: 6.5, y: 58, label: 'Oct 17 · Travel day' },
      { x: 7.0, y: 68, label: 'Oct 20 · Standard' },
      { x: 7.2, y: 72, label: 'Oct 21 · Standard' },
      { x: 7.5, y: 78, label: 'Oct 22 · High quality' },
      { x: 7.8, y: 84, label: 'Oct 23 · Extended rest' },
      { x: 8.1, y: 88, label: 'Oct 24 · Deep recovery sleep' },
      { x: 8.4, y: 92, label: 'Oct 25 · Peak recovery' },
    ]
  },
  {
    id: 'strain_vs_rhr',
    title: 'Daily Exertion Strain vs. Resting HR',
    xLabel: 'Whoop/Garmin Strain',
    yLabel: 'Nocturnal Resting HR',
    xUnit: 'Score (0-21)',
    yUnit: 'bpm',
    rValue: 0.71,
    significance: 'p < 0.005 (Moderate Positive)',
    interpretation: 'Exertion strains exceeding 16.5 produce a 3.4 bpm elevation in minimum nocturnal heart rate due to sustained metabolic repair.',
    points: [
      { x: 8.4, y: 48, label: 'Active recovery day' },
      { x: 11.2, y: 50, label: 'Zone 2 base ride' },
      { x: 13.5, y: 51, label: 'Gym strength circuit' },
      { x: 14.8, y: 52, label: 'Tempo threshold run' },
      { x: 16.5, y: 54, label: 'Long brick endurance' },
      { x: 18.2, y: 57, label: 'Half marathon race sim' },
      { x: 19.4, y: 60, label: 'Peak volume double session' },
    ]
  },
  {
    id: 'glucose_vs_hrv',
    title: 'Postprandial Glucose vs. Nocturnal HRV',
    xLabel: '2-Hr Peak Glucose',
    yLabel: 'Overnight Avg HRV',
    xUnit: 'mg/dL',
    yUnit: 'ms',
    rValue: -0.64,
    significance: 'p < 0.01 (Moderate Inverse)',
    interpretation: 'Elevated late dinners (>140 mg/dL peak glucose within 3h of bed) significantly depress overnight heart rate variability.',
    points: [
      { x: 98, y: 86, label: 'Early protein-fiber dinner' },
      { x: 108, y: 82, label: 'Balanced Mediterranean bowl' },
      { x: 118, y: 76, label: 'Standard complex carbs' },
      { x: 132, y: 66, label: 'Late restaurant dinner' },
      { x: 148, y: 56, label: 'Dessert within 90 min of bed' },
      { x: 162, y: 49, label: 'High glycemic evening intake' },
    ]
  }
];

export const CorrelationScatterChart: React.FC = () => {
  const [activePairId, setActivePairId] = useState<string>('sleep_vs_hrv');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string } | null>(null);

  const currentPair = CORRELATION_PAIRS.find(p => p.id === activePairId) || CORRELATION_PAIRS[0];

  // SVG Geometry
  const width = 540;
  const height = 280;
  const padLeft = 50;
  const padBottom = 40;
  const padRight = 25;
  const padTop = 25;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const xVals = currentPair.points.map(p => p.x);
  const yVals = currentPair.points.map(p => p.y);

  const minX = Math.min(...xVals) * 0.9;
  const maxX = Math.max(...xVals) * 1.08;
  const minY = Math.min(...yVals) * 0.9;
  const maxY = Math.max(...yVals) * 1.08;

  const getX = (x: number) => padLeft + ((x - minX) / (maxX - minX)) * plotW;
  const getY = (y: number) => padTop + plotH - ((y - minY) / (maxY - minY)) * plotH;

  // Linear Regression Trendline (y = mx + b)
  const n = currentPair.points.length;
  const sumX = xVals.reduce((a, b) => a + b, 0);
  const sumY = yVals.reduce((a, b) => a + b, 0);
  const sumXY = currentPair.points.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumX2 = xVals.reduce((acc, x) => acc + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  const lineStart = { x: minX, y: slope * minX + intercept };
  const lineEnd = { x: maxX, y: slope * maxX + intercept };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Bivariate Biomarker Correlation</h3>
            <p className="text-xs text-slate-400 font-mono">
              Empirical Pearson Correlation Coefficient
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {CORRELATION_PAIRS.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePairId(p.id);
                  setHoveredPoint(null);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activePairId === p.id 
                    ? 'bg-slate-800 text-teal-300' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.title.split(' vs.')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Statistical Metrics Strip */}
        <div className="flex items-center justify-between py-2 text-xs font-mono">
          <span className="text-slate-400">
            r = <strong className="text-teal-400 text-sm font-semibold">{currentPair.rValue > 0 ? `+${currentPair.rValue}` : currentPair.rValue}</strong>
            <span className="text-slate-400 text-[11px] ml-1.5">({currentPair.significance})</span>
          </span>
          <span className="text-slate-400 text-[11px]">Linear Fit (Ordinary Least Squares)</span>
        </div>

        {/* Scatter Canvas */}
        <div className="relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Grid lines */}
            {[0, 0.33, 0.66, 1].map((ratio, i) => (
              <line
                key={i}
                x1={padLeft}
                y1={padTop + ratio * plotH}
                x2={width - padRight}
                y2={padTop + ratio * plotH}
                stroke="rgba(51, 65, 85, 0.3)"
                strokeDasharray="2 2"
              />
            ))}

            {/* Regression line */}
            <line
              x1={getX(lineStart.x)}
              y1={getY(lineStart.y)}
              x2={getX(lineEnd.x)}
              y2={getY(lineEnd.y)}
              stroke="#14b8a6"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Scatter points */}
            {currentPair.points.map((p, idx) => {
              const cx = getX(p.x);
              const cy = getY(p.y);
              const isHovered = hoveredPoint?.label === p.label;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 7 : 5}
                    fill="#38bdf8"
                    stroke="#0f172a"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="transition-all"
                  />
                </g>
              );
            })}

            {/* Axes */}
            <line x1={padLeft} y1={padTop + plotH} x2={width - padRight} y2={padTop + plotH} stroke="#334155" />
            <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#334155" />

            {/* Axis Titles */}
            <text
              x={padLeft + plotW / 2}
              y={height - 6}
              textAnchor="middle"
              className="text-[10px] fill-slate-400 font-mono"
            >
              {currentPair.xLabel} ({currentPair.xUnit})
            </text>
            <text
              x={14}
              y={padTop + plotH / 2}
              textAnchor="middle"
              transform={`rotate(-90 14 ${padTop + plotH / 2})`}
              className="text-[10px] fill-slate-400 font-mono"
            >
              {currentPair.yLabel} ({currentPair.yUnit})
            </text>
          </svg>
        </div>
      </div>

      {/* Clinical Interpretation & Point Hover Callout */}
      <div className="mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
        {hoveredPoint ? (
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-100 font-semibold">{hoveredPoint.label}</span>
            <span className="text-teal-300">
              {hoveredPoint.x} {currentPair.xUnit} → {hoveredPoint.y} {currentPair.yUnit}
            </span>
          </div>
        ) : (
          <p className="text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-100">Physiological Finding: </span>
            {currentPair.interpretation}
          </p>
        )}
      </div>
    </div>
  );
};
