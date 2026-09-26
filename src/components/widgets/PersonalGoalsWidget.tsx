import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Footprints, 
  Moon, 
  Heart, 
  Edit3, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Trophy,
  ChevronUp,
  ChevronDown,
  Info,
  SlidersHorizontal,
  Settings2
} from 'lucide-react';

export interface UserPersonalGoals {
  dailySteps: number;
  sleepHours: number;
  maxRestingHeartRate: number;
}

const DEFAULT_GOALS: UserPersonalGoals = {
  dailySteps: 10000,
  sleepHours: 8.0,
  maxRestingHeartRate: 54
};

const STORAGE_KEY = 'aegis_personal_goals_v1';

interface Props {
  currentSteps: number;
  currentSleepHours: number;
  currentRestingHeartRate: number;
  goals?: UserPersonalGoals;
  onOpenConfigureModal?: () => void;
  onSaveGoals?: (newGoals: UserPersonalGoals) => void;
}

export const PersonalGoalsWidget: React.FC<Props> = ({
  currentSteps,
  currentSleepHours,
  currentRestingHeartRate,
  goals: propGoals,
  onOpenConfigureModal,
  onSaveGoals
}) => {
  // Load saved goals from localStorage or fallback to defaults
  const [internalGoals, setInternalGoals] = useState<UserPersonalGoals>(() => {
    if (propGoals) return propGoals;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_GOALS;
  });

  const goals = propGoals || internalGoals;

  const [isEditing, setIsEditing] = useState(false);
  const [tempGoals, setTempGoals] = useState<UserPersonalGoals>(goals);
  const [savedNotice, setSavedNotice] = useState(false);

  // Sync temp goals when goals change
  useEffect(() => {
    setTempGoals(goals);
  }, [goals, isEditing]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setInternalGoals(tempGoals);
    if (onSaveGoals) onSaveGoals(tempGoals);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tempGoals));
    } catch {
      // ignore
    }
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleResetDefaults = () => {
    setTempGoals(DEFAULT_GOALS);
    setInternalGoals(DEFAULT_GOALS);
    if (onSaveGoals) onSaveGoals(DEFAULT_GOALS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GOALS));
    } catch {
      // ignore
    }
    setIsEditing(false);
  };

  // Calculations
  // 1. Steps progress
  const stepsRatio = currentSteps / (goals.dailySteps || 10000);
  const stepsPercent = Math.min(100, Math.round(stepsRatio * 100));
  const stepsMet = currentSteps >= goals.dailySteps;
  const stepsRemaining = Math.max(0, goals.dailySteps - currentSteps);

  // 2. Sleep progress
  const sleepRatio = currentSleepHours / (goals.sleepHours || 8.0);
  const sleepPercent = Math.min(100, Math.round(sleepRatio * 100));
  const sleepMet = currentSleepHours >= goals.sleepHours;
  const sleepRemainingMinutes = Math.max(0, Math.round((goals.sleepHours - currentSleepHours) * 60));

  // 3. Resting HR goal: achieving <= maxRestingHeartRate is the target!
  const hrMet = currentRestingHeartRate <= goals.maxRestingHeartRate;
  // Progress visualization: 100% if met, otherwise proportional to proximity
  const hrPercent = hrMet 
    ? 100 
    : Math.max(30, Math.round((goals.maxRestingHeartRate / currentRestingHeartRate) * 100));

  // Overall targets achieved counter
  const targetsMetCount = (stepsMet ? 1 : 0) + (sleepMet ? 1 : 0) + (hrMet ? 1 : 0);
  const allMet = targetsMetCount === 3;

  const formatHoursMinutes = (hoursDecimal: number) => {
    const h = Math.floor(hoursDecimal);
    const m = Math.round((hoursDecimal - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">Personal Health Goals</h3>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                allMet 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
              }`}>
                {allMet ? (
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-emerald-400" />
                    All 3 Targets Achieved
                  </span>
                ) : (
                  `${targetsMetCount} / 3 Targets Met Today`
                )}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Personalized daily physiological thresholds and behavioral benchmarks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {savedNotice && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 animate-in fade-in duration-200">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}

          {onOpenConfigureModal ? (
            <button
              onClick={onOpenConfigureModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-950/40 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Configure Goals</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isEditing 
                  ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                  : 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Close Target Editor' : 'Adjust Targets'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Edit Form Drawer */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs font-bold font-mono text-slate-200">CONFIGURE DAILY TARGETS</span>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step Target Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-teal-400" />
                <span>Daily Steps Target</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="2000"
                  max="40000"
                  step="500"
                  value={tempGoals.dailySteps}
                  onChange={(e) => setTempGoals(prev => ({ ...prev, dailySteps: Number(e.target.value) }))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-teal-500"
                  required
                />
                <span className="text-xs font-mono text-slate-400 shrink-0">steps</span>
              </div>
            </div>

            {/* Sleep Target Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-violet-400" />
                <span>Daily Sleep Target</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="4.0"
                  max="12.0"
                  step="0.25"
                  value={tempGoals.sleepHours}
                  onChange={(e) => setTempGoals(prev => ({ ...prev, sleepHours: Number(e.target.value) }))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-teal-500"
                  required
                />
                <span className="text-xs font-mono text-slate-400 shrink-0">hours</span>
              </div>
            </div>

            {/* Resting Heart Rate Ceiling Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Resting HR Ceiling</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="40"
                  max="90"
                  step="1"
                  value={tempGoals.maxRestingHeartRate}
                  onChange={(e) => setTempGoals(prev => ({ ...prev, maxRestingHeartRate: Number(e.target.value) }))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-teal-500"
                  required
                />
                <span className="text-xs font-mono text-slate-400 shrink-0">bpm</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Goal Targets</span>
            </button>
          </div>
        </form>
      )}

      {/* Progress Bars Grid (Steps, Sleep, Resting Heart Rate) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Goal 1: Daily Steps */}
        <div className={`p-4 rounded-xl border transition-all ${
          stepsMet 
            ? 'bg-slate-950/40 border-teal-500/30' 
            : 'bg-slate-950/20 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-teal-500/10 text-teal-400">
                <Footprints className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Daily Step Count</span>
                <span className="text-[11px] font-mono text-slate-400">Target: {goals.dailySteps.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-base font-bold font-mono tabular-nums ${
                stepsMet ? 'text-teal-300' : 'text-slate-100'
              }`}>
                {currentSteps.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {stepsMet ? `${Math.round(stepsRatio * 100)}% met` : `${stepsPercent}%`}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 space-y-1.5">
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  stepsMet 
                    ? 'bg-linear-to-r from-teal-500 to-emerald-400' 
                    : 'bg-teal-500'
                }`}
                style={{ width: `${stepsPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className={stepsMet ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                {stepsMet ? '✓ Daily Target Exceeded' : `${stepsRemaining.toLocaleString()} steps remaining`}
              </span>
              <span className="text-slate-400">{goals.dailySteps.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Goal 2: Sleep Duration */}
        <div className={`p-4 rounded-xl border transition-all ${
          sleepMet 
            ? 'bg-slate-950/40 border-violet-500/30' 
            : 'bg-slate-950/20 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-400">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Restorative Sleep</span>
                <span className="text-[11px] font-mono text-slate-400">Target: {goals.sleepHours.toFixed(1)} hrs</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-base font-bold font-mono tabular-nums ${
                sleepMet ? 'text-violet-300' : 'text-slate-100'
              }`}>
                {formatHoursMinutes(currentSleepHours)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {sleepMet ? `${Math.round(sleepRatio * 100)}% met` : `${sleepPercent}%`}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 space-y-1.5">
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  sleepMet 
                    ? 'bg-linear-to-r from-violet-500 to-indigo-400' 
                    : 'bg-violet-500'
                }`}
                style={{ width: `${sleepPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className={sleepMet ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                {sleepMet ? '✓ Sleep Architecture Achieved' : `${sleepRemainingMinutes} min below target`}
              </span>
              <span className="text-slate-400">{goals.sleepHours.toFixed(1)}h</span>
            </div>
          </div>
        </div>

        {/* Goal 3: Resting Heart Rate Ceiling */}
        <div className={`p-4 rounded-xl border transition-all ${
          hrMet 
            ? 'bg-slate-950/40 border-rose-500/30' 
            : 'bg-slate-950/20 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Resting Heart Rate</span>
                <span className="text-[11px] font-mono text-slate-400">Target: ≤ {goals.maxRestingHeartRate} bpm</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-base font-bold font-mono tabular-nums ${
                hrMet ? 'text-rose-300' : 'text-amber-400'
              }`}>
                {currentRestingHeartRate} <span className="text-xs font-normal text-slate-400">bpm</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {hrMet ? 'Under Ceiling (Met)' : 'Above Target'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 space-y-1.5">
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  hrMet 
                    ? 'bg-linear-to-r from-emerald-500 to-teal-400' 
                    : 'bg-amber-500'
                }`}
                style={{ width: `${hrPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className={hrMet ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                {hrMet ? `✓ ${goals.maxRestingHeartRate - currentRestingHeartRate} bpm below ceiling` : `${currentRestingHeartRate - goals.maxRestingHeartRate} bpm above target`}
              </span>
              <span className="text-slate-400">≤ {goals.maxRestingHeartRate} bpm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
