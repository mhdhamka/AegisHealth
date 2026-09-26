import React, { useState } from 'react';
import { SleepRecord } from '../../types/health';
import { Moon, Sparkles, Activity, Clock, ShieldCheck } from 'lucide-react';

interface Props {
  sleepRecord: SleepRecord;
}

export const SleepHypnogramChart: React.FC<Props> = ({ sleepRecord }) => {
  const [hoverStageIdx, setHoverStageIdx] = useState<number | null>(null);

  const stages = sleepRecord.stages;
  const stageLabels = [
    { name: 'Awake', score: 3, color: '#f59e0b', desc: 'Brief micro-arousals' },
    { name: 'REM', score: 2, color: '#14b8a6', desc: 'Cognitive consolidation' },
    { name: 'Light', score: 1, color: '#38bdf8', desc: 'Motor memory & relaxation' },
    { name: 'Deep (N3)', score: 0, color: '#6366f1', desc: 'Cellular & physical restoration' },
  ];

  const svgWidth = 840;
  const svgHeight = 180;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const xStep = stages.length > 1 ? plotWidth / (stages.length - 1) : plotWidth;

  // Build step line for hypnogram
  const stepPoints = stages.map((st, i) => {
    const x = paddingLeft + i * xStep;
    // score 3 is top (awake), score 0 is bottom (deep)
    const y = paddingTop + (3 - st.stageScore) * (plotHeight / 3);
    return { x, y, stage: st };
  });

  let hypnogramPath = '';
  stepPoints.forEach((p, i) => {
    if (i === 0) {
      hypnogramPath = `M ${p.x} ${p.y}`;
    } else {
      const prev = stepPoints[i - 1];
      hypnogramPath += ` H ${p.x} V ${p.y}`;
    }
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">Polysomnographic Sleep Hypnogram</h3>
            <p className="text-xs text-slate-400 font-mono">
              Oura & Whoop Sensor Fusion · {sleepRecord.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Total Sleep:</span>
            <span className="text-slate-100 font-semibold">{sleepRecord.totalDurationHours} hrs</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Sleep Score:</span>
            <span className="text-teal-400 font-semibold">{sleepRecord.score} / 100</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Efficiency:</span>
            <span className="text-emerald-400 font-semibold">{sleepRecord.efficiency}%</span>
          </div>
        </div>
      </div>

      {/* Stage Breakdown Metric Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Deep Sleep (N3)</span>
            <span className="text-indigo-400 font-semibold font-mono">{sleepRecord.deepPercent}%</span>
          </div>
          <div className="mt-1.5 text-sm font-semibold text-slate-100 font-mono">
            {sleepRecord.deepSleepHours}h
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${sleepRecord.deepPercent}%` }} />
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>REM Stage</span>
            <span className="text-teal-400 font-semibold font-mono">{sleepRecord.remPercent}%</span>
          </div>
          <div className="mt-1.5 text-sm font-semibold text-slate-100 font-mono">
            {sleepRecord.remSleepHours}h
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-teal-400 h-full rounded-full" style={{ width: `${sleepRecord.remPercent}%` }} />
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Light Stage</span>
            <span className="text-sky-400 font-semibold font-mono">{sleepRecord.lightPercent}%</span>
          </div>
          <div className="mt-1.5 text-sm font-semibold text-slate-100 font-mono">
            {sleepRecord.lightSleepHours}h
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-sky-400 h-full rounded-full" style={{ width: `${sleepRecord.lightPercent}%` }} />
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Awake Time</span>
            <span className="text-amber-400 font-semibold font-mono">{sleepRecord.awakeDurationMinutes}m</span>
          </div>
          <div className="mt-1.5 text-sm font-semibold text-slate-100 font-mono">
            8% of night
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: '8%' }} />
          </div>
        </div>
      </div>

      {/* Interactive Hypnogram SVG */}
      <div className="relative select-none mt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Y Stage Labels and reference lines */}
          {stageLabels.map((st, i) => {
            const y = paddingTop + (3 - st.score) * (plotHeight / 3);
            return (
              <g key={st.name}>
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-slate-400 font-mono"
                >
                  {st.name}
                </text>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="rgba(51, 65, 85, 0.3)"
                  strokeDasharray="2 2"
                />
              </g>
            );
          })}

          {/* Stepped Hypnogram Outline */}
          <path
            d={hypnogramPath}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Stage Blocks & Circles */}
          {stepPoints.map((p, idx) => {
            const isHovered = hoverStageIdx === idx;
            const stageColor = 
              p.stage.stage === 'deep' ? '#6366f1' :
              p.stage.stage === 'rem' ? '#14b8a6' :
              p.stage.stage === 'light' ? '#38bdf8' : '#f59e0b';

            return (
              <g 
                key={idx} 
                className="cursor-pointer"
                onMouseEnter={() => setHoverStageIdx(idx)}
                onMouseLeave={() => setHoverStageIdx(null)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 3.5}
                  fill={stageColor}
                  stroke="#0f172a"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all"
                />
              </g>
            );
          })}

          {/* X Axis Time Marks */}
          {stepPoints.map((p, idx) => {
            if (idx % 2 !== 0 && idx !== stepPoints.length - 1) return null;
            return (
              <text
                key={`time-${idx}`}
                x={p.x}
                y={svgHeight - 8}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {p.stage.time}
              </text>
            );
          })}
        </svg>

        {/* Hover Stage Tooltip */}
        {hoverStageIdx !== null && (
          <div className="mt-2 p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Time: <strong className="text-slate-100">{stages[hoverStageIdx].time}</strong></span>
            <span className="text-slate-300">Stage: <strong className="text-sky-400 uppercase">{stages[hoverStageIdx].stage}</strong></span>
            <span className="text-slate-300">Heart Rate: <strong className="text-rose-400">{stages[hoverStageIdx].heartRate} bpm</strong></span>
            <span className="text-slate-300">HRV: <strong className="text-teal-400">{stages[hoverStageIdx].hrv} ms</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
