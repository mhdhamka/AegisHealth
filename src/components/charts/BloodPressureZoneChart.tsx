import React, { useState } from 'react';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

interface Reading {
  id: string;
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  label: string;
}

const mockBpReadings: Reading[] = [
  { id: '1', date: 'Today 07:15 AM', systolic: 116, diastolic: 72, heartRate: 52, label: 'Optimal morning baseline' },
  { id: '2', date: 'Yesterday 07:30 AM', systolic: 118, diastolic: 74, heartRate: 54, label: 'Post-recovery reading' },
  { id: '3', date: 'Sep 22 08:00 AM', systolic: 114, diastolic: 70, heartRate: 50, label: 'Rest day baseline' },
  { id: '4', date: 'Sep 20 11:30 PM', systolic: 136, diastolic: 88, heartRate: 84, label: 'Post-shift acute stress spike' },
  { id: '5', date: 'Sep 18 07:20 AM', systolic: 115, diastolic: 72, heartRate: 51, label: 'Nominal morning reading' },
  { id: '6', date: 'Sep 16 02:00 PM', systolic: 124, diastolic: 78, heartRate: 68, label: 'Midday postprandial check' },
  { id: '7', date: 'Sep 14 07:10 AM', systolic: 119, diastolic: 75, heartRate: 53, label: 'Standard baseline' },
];

export const BloodPressureZoneChart: React.FC = () => {
  const [activeReading, setActiveReading] = useState<Reading | null>(mockBpReadings[0]);

  // Dimensions
  const width = 540;
  const height = 280;
  const padLeft = 45;
  const padBottom = 40;
  const padRight = 20;
  const padTop = 20;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Domain: Systolic (Y) 90 to 160, Diastolic (X) 55 to 105
  const minSys = 90, maxSys = 160;
  const minDia = 55, maxDia = 105;

  const getX = (dia: number) => padLeft + ((dia - minDia) / (maxDia - minDia)) * plotW;
  const getY = (sys: number) => padTop + plotH - ((sys - minSys) / (maxSys - minSys)) * plotH;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Blood Pressure Zone Classification</h3>
            <p className="text-xs text-slate-400 font-mono">
              AHA/ACC 2026 Clinical Staging Grid
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-slate-400">Latest:</span>{' '}
            <strong className="text-emerald-400">116/72 mmHg</strong>
          </div>
        </div>

        {/* Scatter SVG */}
        <div className="relative mt-3">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Zones: Normal (<120 & <80) */}
            <rect
              x={padLeft}
              y={getY(120)}
              width={getX(80) - padLeft}
              height={padTop + plotH - getY(120)}
              fill="rgba(16, 185, 129, 0.12)"
              stroke="rgba(16, 185, 129, 0.25)"
              strokeWidth="1"
            />
            {/* Elevated (120-129 & <80) */}
            <rect
              x={padLeft}
              y={getY(130)}
              width={getX(80) - padLeft}
              height={getY(120) - getY(130)}
              fill="rgba(245, 158, 11, 0.12)"
              stroke="rgba(245, 158, 11, 0.25)"
              strokeWidth="1"
            />
            {/* Stage 1 HTN (130-139 or 80-89) */}
            <rect
              x={getX(80)}
              y={getY(140)}
              width={getX(90) - getX(80)}
              height={padTop + plotH - getY(140)}
              fill="rgba(249, 115, 22, 0.10)"
              stroke="rgba(249, 115, 22, 0.2)"
            />
            {/* Stage 2 HTN (>=140 or >=90) */}
            <rect
              x={padLeft}
              y={padTop}
              width={plotW}
              height={getY(140) - padTop}
              fill="rgba(239, 68, 68, 0.08)"
            />

            {/* Grid labels */}
            <text x={padLeft + 8} y={padTop + plotH - 8} className="text-[10px] fill-emerald-400/80 font-mono">
              NORMAL ZONE (&lt;120/&lt;80)
            </text>
            <text x={padLeft + 8} y={getY(125)} className="text-[10px] fill-amber-400/80 font-mono">
              ELEVATED
            </text>
            <text x={getX(82)} y={getY(135)} className="text-[10px] fill-orange-400/80 font-mono">
              STAGE 1
            </text>
            <text x={plotW - 30} y={padTop + 14} className="text-[10px] fill-rose-400/80 font-mono">
              STAGE 2
            </text>

            {/* Axes */}
            <line x1={padLeft} y1={padTop + plotH} x2={width - padRight} y2={padTop + plotH} stroke="#334155" />
            <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#334155" />

            {/* Y Ticks (Systolic) */}
            {[100, 120, 140, 160].map(sys => (
              <g key={sys}>
                <text x={padLeft - 6} y={getY(sys) + 3} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                  {sys}
                </text>
                <line x1={padLeft - 3} y1={getY(sys)} x2={padLeft} y2={getY(sys)} stroke="#64748b" />
              </g>
            ))}

            {/* X Ticks (Diastolic) */}
            {[60, 70, 80, 90, 100].map(dia => (
              <g key={dia}>
                <text x={getX(dia)} y={padTop + plotH + 15} textAnchor="middle" className="text-[10px] fill-slate-400 font-mono">
                  {dia}
                </text>
                <line x1={getX(dia)} y1={padTop + plotH} x2={getX(dia)} y2={padTop + plotH + 3} stroke="#64748b" />
              </g>
            ))}

            {/* Data points */}
            {mockBpReadings.map((r) => {
              const cx = getX(r.diastolic);
              const cy = getY(r.systolic);
              const isSelected = activeReading?.id === r.id;
              const isStage1 = r.systolic >= 130 || r.diastolic >= 80;

              return (
                <g 
                  key={r.id} 
                  className="cursor-pointer" 
                  onClick={() => setActiveReading(r)}
                  onMouseEnter={() => setActiveReading(r)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 7 : 4.5}
                    fill={isStage1 ? '#f97316' : '#10b981'}
                    stroke="#0f172a"
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    className="transition-all hover:scale-125"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Reading Info Box */}
      {activeReading && (
        <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 font-mono tabular-nums">
                {activeReading.systolic} / {activeReading.diastolic} mmHg
              </span>
              <span className="text-slate-400">· HR {activeReading.heartRate} bpm</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{activeReading.label}</p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{activeReading.date}</span>
        </div>
      )}
    </div>
  );
};
