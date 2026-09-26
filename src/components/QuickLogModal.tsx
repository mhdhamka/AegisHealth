import React, { useState } from 'react';
import { HealthLogCategory, HealthLogEntry, LogStatus } from '../types/health';
import { X, Plus, Activity, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogAdded: (entry: HealthLogEntry) => void;
  apiService: any;
}

export const QuickLogModal: React.FC<Props> = ({ isOpen, onClose, onLogAdded, apiService }) => {
  const [category, setCategory] = useState<HealthLogCategory>('vitals');
  const [metric, setMetric] = useState('Blood Pressure');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('mmHg');
  const [referenceRange, setReferenceRange] = useState('< 120/80');
  const [status, setStatus] = useState<LogStatus>('nominal');
  const [source, setSource] = useState('Manual Entry');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleMetricPreset = (presetMetric: string, defaultUnit: string, defaultRef: string) => {
    setMetric(presetMetric);
    setUnit(defaultUnit);
    setReferenceRange(defaultRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setErrorMsg('Please enter a measurement value');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const created = await apiService.addHealthLog({
        category,
        title: `${metric} Log`,
        metric,
        value: value.trim(),
        unit,
        referenceRange,
        status,
        source,
        notes: notes.trim()
      });
      onLogAdded(created);
      onClose();
      // Reset
      setValue('');
      setNotes('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Log Health Biomarker</h3>
            <p className="text-xs text-slate-400 font-mono">
              Direct Clinical Entry · Enterprise PostgreSQL Ingestion
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {/* Category tabs */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {(['vitals', 'labs', 'activity', 'symptoms', 'medication', 'nutrition'] as HealthLogCategory[]).map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                    category === cat 
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-medium' 
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Quick Presets</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleMetricPreset('Blood Pressure', 'mmHg', '< 120/80')}
                className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Blood Pressure
              </button>
              <button
                type="button"
                onClick={() => handleMetricPreset('Fasting Glucose', 'mg/dL', '70 - 99')}
                className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Fasting Glucose
              </button>
              <button
                type="button"
                onClick={() => handleMetricPreset('Resting HR', 'bpm', '48 - 62')}
                className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Resting Heart Rate
              </button>
              <button
                type="button"
                onClick={() => handleMetricPreset('Serum Ferritin', 'ng/mL', '30 - 200')}
                className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Serum Ferritin
              </button>
            </div>
          </div>

          {/* Inputs Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Metric Name</label>
              <input
                type="text"
                value={metric}
                onChange={e => setMetric(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Observed Value</label>
              <input
                type="text"
                placeholder="e.g. 118 / 74 or 92"
                value={value}
                onChange={e => setValue(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Reference Range</label>
              <input
                type="text"
                value={referenceRange}
                onChange={e => setReferenceRange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as LogStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-hidden focus:border-teal-500"
              >
                <option value="optimal">Optimal</option>
                <option value="nominal">Nominal</option>
                <option value="elevated">Elevated</option>
                <option value="abnormal">Abnormal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Measurement Source</label>
            <input
              type="text"
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="e.g. Omron Evolv BLE, Quest Lab, Manual"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Clinical Context / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Fasting state, seated 5 min rest, post-workout context..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Ingesting to Database...</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Commit Health Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
