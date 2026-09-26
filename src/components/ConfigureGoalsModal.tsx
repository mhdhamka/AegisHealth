import React, { useState, useEffect } from 'react';
import { 
  X, 
  Target, 
  Footprints, 
  Moon, 
  Heart, 
  Check, 
  RotateCcw, 
  Sparkles, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { UserPersonalGoals } from './widgets/PersonalGoalsWidget';

export const DEFAULT_GOALS: UserPersonalGoals = {
  dailySteps: 10000,
  sleepHours: 8.0,
  maxRestingHeartRate: 54
};

export const GOALS_STORAGE_KEY = 'aegis_personal_goals_v1';

export const loadStoredGoals = (): UserPersonalGoals => {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        dailySteps: Number(parsed.dailySteps) || DEFAULT_GOALS.dailySteps,
        sleepHours: Number(parsed.sleepHours) || DEFAULT_GOALS.sleepHours,
        maxRestingHeartRate: Number(parsed.maxRestingHeartRate) || DEFAULT_GOALS.maxRestingHeartRate
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_GOALS;
};

export const persistGoals = (goals: UserPersonalGoals) => {
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch {
    // ignore
  }
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentGoals: UserPersonalGoals;
  onSaveGoals: (goals: UserPersonalGoals) => void;
}

export const ConfigureGoalsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentGoals,
  onSaveGoals
}) => {
  const [formData, setFormData] = useState<UserPersonalGoals>(currentGoals);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(currentGoals);
      setSavedSuccess(false);
    }
  }, [isOpen, currentGoals]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    persistGoals(formData);
    onSaveGoals(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_GOALS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Configure Personal Health Goals</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  Target Settings
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Customize daily behavioral targets and cardiovascular threshold guards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {savedSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs font-mono text-emerald-300 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Personal goals successfully persisted to clinical profile and storage!</span>
            </div>
          )}

          {/* Goal 1: Daily Steps Target */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Footprints className="w-4 h-4 text-teal-400" />
                <span>Daily Steps Target</span>
              </label>
              <span className="text-xs font-mono font-bold text-teal-300 tabular-nums">
                {formData.dailySteps.toLocaleString()} steps
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              Recommended by American Heart Association: 8,000–12,000 daily steps for cardiovascular risk reduction.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="3000"
                max="30000"
                step="500"
                value={formData.dailySteps}
                onChange={(e) => setFormData(prev => ({ ...prev, dailySteps: Number(e.target.value) }))}
                className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <input
                type="number"
                min="2000"
                max="40000"
                step="500"
                value={formData.dailySteps}
                onChange={(e) => setFormData(prev => ({ ...prev, dailySteps: Number(e.target.value) }))}
                className="w-28 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 text-right focus:outline-hidden focus:border-teal-500"
              />
            </div>

            {/* Step Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-500 mr-1">Presets:</span>
              {[
                { label: '8,000 (Baseline)', val: 8000 },
                { label: '10,000 (AHA Target)', val: 10000 },
                { label: '12,500 (Active)', val: 12500 },
                { label: '15,000 (Athletic)', val: 15000 }
              ].map(p => (
                <button
                  type="button"
                  key={p.val}
                  onClick={() => setFormData(prev => ({ ...prev, dailySteps: p.val }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer border ${
                    formData.dailySteps === p.val
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal 2: Sleep Duration Target */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Moon className="w-4 h-4 text-violet-400" />
                <span>Restorative Sleep Duration Target</span>
              </label>
              <span className="text-xs font-mono font-bold text-violet-300 tabular-nums">
                {formData.sleepHours.toFixed(1)} hours
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              National Sleep Foundation standard: 7.0–9.0 hours for glymphatic clearance and growth hormone release.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5.0"
                max="11.0"
                step="0.25"
                value={formData.sleepHours}
                onChange={(e) => setFormData(prev => ({ ...prev, sleepHours: Number(e.target.value) }))}
                className="w-full accent-violet-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <input
                type="number"
                min="4.0"
                max="12.0"
                step="0.25"
                value={formData.sleepHours}
                onChange={(e) => setFormData(prev => ({ ...prev, sleepHours: Number(e.target.value) }))}
                className="w-28 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 text-right focus:outline-hidden focus:border-violet-500"
              />
            </div>

            {/* Sleep Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-500 mr-1">Presets:</span>
              {[
                { label: '7.0h (Minimum)', val: 7.0 },
                { label: '7.5h (Balanced)', val: 7.5 },
                { label: '8.0h (Optimal)', val: 8.0 },
                { label: '8.5h (Recovery Rebuild)', val: 8.5 }
              ].map(p => (
                <button
                  type="button"
                  key={p.val}
                  onClick={() => setFormData(prev => ({ ...prev, sleepHours: p.val }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer border ${
                    formData.sleepHours === p.val
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal 3: Resting Heart Rate Ceiling */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Resting Heart Rate Ceiling Boundary</span>
              </label>
              <span className="text-xs font-mono font-bold text-rose-300 tabular-nums">
                ≤ {formData.maxRestingHeartRate} bpm
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              Resting heart rate remains at or below this boundary to confirm absent sympathetic overdrive or systemic fatigue.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="42"
                max="80"
                step="1"
                value={formData.maxRestingHeartRate}
                onChange={(e) => setFormData(prev => ({ ...prev, maxRestingHeartRate: Number(e.target.value) }))}
                className="w-full accent-rose-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <input
                type="number"
                min="40"
                max="90"
                step="1"
                value={formData.maxRestingHeartRate}
                onChange={(e) => setFormData(prev => ({ ...prev, maxRestingHeartRate: Number(e.target.value) }))}
                className="w-28 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 text-right focus:outline-hidden focus:border-rose-500"
              />
            </div>

            {/* HR Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-500 mr-1">Presets:</span>
              {[
                { label: '≤ 48 bpm (Athletic Sinus)', val: 48 },
                { label: '≤ 52 bpm (Conditioned)', val: 52 },
                { label: '≤ 56 bpm (Active Adult)', val: 56 },
                { label: '≤ 62 bpm (Standard)', val: 62 }
              ].map(p => (
                <button
                  type="button"
                  key={p.val}
                  onClick={() => setFormData(prev => ({ ...prev, maxRestingHeartRate: p.val }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer border ${
                    formData.maxRestingHeartRate === p.val
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-teal-950/40"
              >
                <Check className="w-4 h-4" />
                <span>Save Goal Targets</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
