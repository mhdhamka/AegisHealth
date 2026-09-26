import React, { useState, useEffect, useMemo } from 'react';
import { BiometricAlertRule, AlertIncident, BiometricPoint } from '../../types/health';
import { 
  Bell, 
  Heart, 
  Zap, 
  ShieldAlert, 
  Plus, 
  Check, 
  AlertTriangle, 
  Sliders, 
  Volume2, 
  Smartphone, 
  UserCheck, 
  Trash2, 
  X,
  Radio,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface Props {
  telemetry: BiometricPoint[];
}

const DEFAULT_RULES: BiometricAlertRule[] = [
  {
    id: 'rule_hr_tachycardia',
    name: 'Resting Tachycardia Warning',
    metric: 'heart_rate',
    operator: 'greater_than',
    threshold: 100,
    unit: 'bpm',
    severity: 'medium',
    sustainedDurationMinutes: 3,
    isEnabled: true,
    notifyChannels: ['in_app', 'push'],
    description: 'Triggers when resting heart rate exceeds 100 bpm for over 3 consecutive minutes.'
  },
  {
    id: 'rule_hr_bradycardia',
    name: 'Nocturnal Bradycardia Alert',
    metric: 'heart_rate',
    operator: 'less_than',
    threshold: 44,
    unit: 'bpm',
    severity: 'critical',
    sustainedDurationMinutes: 5,
    isEnabled: true,
    notifyChannels: ['in_app', 'push', 'clinician'],
    description: 'Triggers when heart rate drops below 44 bpm during sleep or rest.'
  },
  {
    id: 'rule_spo2_hypoxemia',
    name: 'Moderate Hypoxemia (SpO2 Dip)',
    metric: 'spo2',
    operator: 'less_than',
    threshold: 94,
    unit: '%',
    severity: 'medium',
    sustainedDurationMinutes: 2,
    isEnabled: true,
    notifyChannels: ['in_app', 'push'],
    description: 'Notifies when arterial blood oxygen saturation drops below clinical standard of 94%.'
  },
  {
    id: 'rule_spo2_critical',
    name: 'Critical Nocturnal Desaturation',
    metric: 'spo2',
    operator: 'less_than',
    threshold: 90,
    unit: '%',
    severity: 'critical',
    sustainedDurationMinutes: 0,
    isEnabled: true,
    notifyChannels: ['in_app', 'push', 'sms', 'clinician'],
    description: 'Immediate high-priority alert when oxygen saturation plunges below 90%.'
  }
];

export const BiometricAlertsView: React.FC<Props> = ({ telemetry }) => {
  // Load rules from localStorage if available
  const [rules, setRules] = useState<BiometricAlertRule[]>(() => {
    try {
      const saved = localStorage.getItem('aegis_biometric_alert_rules');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_RULES;
  });

  const [incidents, setIncidents] = useState<AlertIncident[]>(() => [
    {
      id: 'inc_1',
      ruleId: 'rule_hr_tachycardia',
      metric: 'Heart Rate',
      ruleName: 'Resting Tachycardia Warning',
      timestamp: 'Today, 14:15',
      triggerValue: 106,
      thresholdValue: 100,
      unit: 'bpm',
      severity: 'medium',
      status: 'active'
    },
    {
      id: 'inc_2',
      ruleId: 'rule_spo2_hypoxemia',
      metric: 'SpO2 Saturation',
      ruleName: 'Moderate Hypoxemia (SpO2 Dip)',
      timestamp: 'Today, 04:30',
      triggerValue: 93.4,
      thresholdValue: 94,
      unit: '%',
      severity: 'medium',
      status: 'acknowledged'
    }
  ]);

  const [testNotice, setTestNotice] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<BiometricAlertRule | null>(null);

  // New rule form states
  const [formName, setFormName] = useState('');
  const [formMetric, setFormMetric] = useState<'heart_rate' | 'spo2' | 'resting_heart_rate'>('heart_rate');
  const [formOperator, setFormOperator] = useState<'greater_than' | 'less_than'>('greater_than');
  const [formThreshold, setFormThreshold] = useState<number>(110);
  const [formSeverity, setFormSeverity] = useState<'low' | 'medium' | 'critical'>('medium');
  const [formDuration, setFormDuration] = useState<number>(2);

  // Persist rules to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('aegis_biometric_alert_rules', JSON.stringify(rules));
    } catch {
      // ignore
    }
  }, [rules]);

  // Compute live breaches by evaluating telemetry points against active rules
  const detectedBreaches = useMemo(() => {
    const breaches: AlertIncident[] = [];
    if (!telemetry || telemetry.length === 0) return breaches;

    // Check last 5 points
    const recent = telemetry.slice(-10);

    recent.forEach((pt) => {
      rules.filter(r => r.isEnabled).forEach((rule) => {
        let val: number | undefined;
        if (rule.metric === 'heart_rate') val = pt.heartRate;
        else if (rule.metric === 'resting_heart_rate') val = pt.restingHeartRate;
        else if (rule.metric === 'spo2') val = pt.spo2;

        if (val !== undefined) {
          const isTriggered = rule.operator === 'greater_than' ? val > rule.threshold : val < rule.threshold;
          if (isTriggered) {
            breaches.push({
              id: `live_${rule.id}_${pt.timestamp}`,
              ruleId: rule.id,
              metric: rule.metric === 'spo2' ? 'SpO2 Saturation' : 'Heart Rate',
              ruleName: rule.name,
              timestamp: pt.timeLabel ? `At ${pt.timeLabel}` : pt.timestamp.substring(11, 16),
              triggerValue: val,
              thresholdValue: rule.threshold,
              unit: rule.unit,
              severity: rule.severity,
              status: 'active'
            });
          }
        }
      });
    });

    return breaches;
  }, [telemetry, rules]);

  // Combine incidents
  const allIncidents = useMemo(() => {
    // Unique by id
    const map = new Map<string, AlertIncident>();
    incidents.forEach(inc => map.set(inc.id, inc));
    detectedBreaches.forEach(b => {
      if (!map.has(b.id)) map.set(b.id, b);
    });
    return Array.from(map.values());
  }, [incidents, detectedBreaches]);

  // Handlers
  const handleToggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
  };

  const handleUpdateThreshold = (id: string, delta: number) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        const next = Math.max(10, r.threshold + delta);
        return { ...r, threshold: next };
      }
      return r;
    }));
  };

  const handleTriggerSimulation = () => {
    setTestNotice('SIMULATION: Heart Rate exceeded 112 bpm (Threshold: 100 bpm) · In-App & Push Notification Dispatched');
    setTimeout(() => setTestNotice(null), 4500);
  };

  const handleAcknowledgeIncident = (id: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'acknowledged' } : i));
  };

  const handleDismissIncident = (id: string) => {
    setIncidents(prev => prev.filter(i => i.id !== id));
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const unit = formMetric === 'spo2' ? '%' : 'bpm';
    const newRule: BiometricAlertRule = {
      id: `rule_custom_${Date.now()}`,
      name: formName || `${formMetric === 'spo2' ? 'SpO2' : 'Heart Rate'} ${formOperator === 'greater_than' ? '>' : '<'} ${formThreshold} ${unit}`,
      metric: formMetric,
      operator: formOperator,
      threshold: formThreshold,
      unit,
      severity: formSeverity,
      sustainedDurationMinutes: formDuration,
      isEnabled: true,
      notifyChannels: ['in_app', 'push'],
      description: `Automated alert when ${formMetric.replace('_', ' ')} is ${formOperator === 'greater_than' ? 'above' : 'below'} ${formThreshold} ${unit}.`
    };

    setRules(prev => [newRule, ...prev]);
    setIsModalOpen(false);
    setFormName('');
  };

  const activeCount = rules.filter(r => r.isEnabled).length;
  const activeIncidentCount = allIncidents.filter(i => i.status === 'active').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">Biometric Alert Rules & Thresholds</h2>
            <span className="text-xs font-mono text-teal-400">· Heart Rate & SpO2 Safety Monitors</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Continuous real-time edge evaluation with customizable clinical triggers and notification routing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleTriggerSimulation}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Simulate immediate threshold breach notification"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Test Trigger Simulation</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Threshold Rule</span>
          </button>
        </div>
      </div>

      {/* Simulated Alert Notification Banner */}
      {testNotice && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-200 font-mono animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{testNotice}</span>
          </div>
          <button
            onClick={() => setTestNotice(null)}
            className="p-1 hover:text-slate-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Threshold Rules</span>
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {activeCount} <span className="text-xs font-normal text-slate-400">/ {rules.length}</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1">Real-time monitors armed</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Heart Rate Guards</span>
            <Heart className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {rules.filter(r => r.metric.includes('heart_rate')).length}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">Tachycardia & Bradycardia</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>SpO2 Saturation Guards</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {rules.filter(r => r.metric === 'spo2').length}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">Desaturation & Hypoxemia</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Breaches</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            {activeIncidentCount}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">Requiring acknowledgment</div>
        </div>
      </div>

      {/* Heart Rate Threshold Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-slate-100">Heart Rate Threshold Rules</h3>
          <span className="text-xs text-slate-400 font-mono">· Beats Per Minute (BPM)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.filter(r => r.metric.includes('heart_rate')).map((rule) => {
            const isHigh = rule.operator === 'greater_than';

            return (
              <div 
                key={rule.id}
                className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
                  rule.isEnabled 
                    ? rule.severity === 'critical' ? 'border-rose-500/40' : 'border-slate-800'
                    : 'border-slate-800/40 opacity-60'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-100">{rule.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          rule.severity === 'critical' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {rule.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{rule.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                        rule.isEnabled ? 'bg-teal-500' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        rule.isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Threshold Adjuster Row */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] text-slate-400 font-mono block">TRIGGER CONDITION</span>
                      <div className="flex items-center gap-1.5 text-base font-bold font-mono text-slate-100 mt-0.5">
                        <span>{isHigh ? 'Over ( > )' : 'Under ( < )'}</span>
                        <span className="text-teal-400 text-lg tabular-nums">{rule.threshold}</span>
                        <span className="text-xs font-normal text-slate-400">bpm</span>
                      </div>
                    </div>

                    {/* Steppers */}
                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                      <button
                        onClick={() => handleUpdateThreshold(rule.id, -2)}
                        disabled={!rule.isEnabled}
                        className="px-2.5 py-1 text-xs font-mono font-bold text-slate-300 hover:text-teal-300 hover:bg-slate-800 rounded transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        -2
                      </button>
                      <span className="w-px h-4 bg-slate-800" />
                      <button
                        onClick={() => handleUpdateThreshold(rule.id, 2)}
                        disabled={!rule.isEnabled}
                        className="px-2.5 py-1 text-xs font-mono font-bold text-slate-300 hover:text-teal-300 hover:bg-slate-800 rounded transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        +2
                      </button>
                    </div>
                  </div>

                  {/* Duration & Delivery */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sustained: {rule.sustainedDurationMinutes > 0 ? `${rule.sustainedDurationMinutes} min` : 'Instantaneous'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">CHANNELS:</span>
                      <div className="flex items-center gap-1 text-slate-300">
                        {rule.notifyChannels.includes('in_app') && <span title="In-App Banner"><Volume2 className="w-3.5 h-3.5" /></span>}
                        {rule.notifyChannels.includes('push') && <span title="Push Notification"><Smartphone className="w-3.5 h-3.5" /></span>}
                        {rule.notifyChannels.includes('clinician') && <span title="Clinician Dispatch"><UserCheck className="w-3.5 h-3.5 text-teal-400" /></span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SpO2 Saturation Threshold Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">Blood Oxygen (SpO2) Threshold Rules</h3>
          <span className="text-xs text-slate-400 font-mono">· Arterial Oxygen Saturation (%)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.filter(r => r.metric === 'spo2').map((rule) => {
            return (
              <div 
                key={rule.id}
                className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
                  rule.isEnabled 
                    ? rule.severity === 'critical' ? 'border-rose-500/40' : 'border-slate-800'
                    : 'border-slate-800/40 opacity-60'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-100">{rule.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          rule.severity === 'critical' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {rule.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{rule.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                        rule.isEnabled ? 'bg-teal-500' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        rule.isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Threshold Adjuster Row */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] text-slate-400 font-mono block">TRIGGER CONDITION</span>
                      <div className="flex items-center gap-1.5 text-base font-bold font-mono text-slate-100 mt-0.5">
                        <span>Under ( &lt; )</span>
                        <span className="text-teal-400 text-lg tabular-nums">{rule.threshold}%</span>
                        <span className="text-xs font-normal text-slate-400">saturation</span>
                      </div>
                    </div>

                    {/* Steppers */}
                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                      <button
                        onClick={() => handleUpdateThreshold(rule.id, -1)}
                        disabled={!rule.isEnabled}
                        className="px-2.5 py-1 text-xs font-mono font-bold text-slate-300 hover:text-teal-300 hover:bg-slate-800 rounded transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        -1%
                      </button>
                      <span className="w-px h-4 bg-slate-800" />
                      <button
                        onClick={() => handleUpdateThreshold(rule.id, 1)}
                        disabled={!rule.isEnabled}
                        className="px-2.5 py-1 text-xs font-mono font-bold text-slate-300 hover:text-teal-300 hover:bg-slate-800 rounded transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        +1%
                      </button>
                    </div>
                  </div>

                  {/* Duration & Delivery */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sustained: {rule.sustainedDurationMinutes > 0 ? `${rule.sustainedDurationMinutes} min` : 'Instantaneous'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">CHANNELS:</span>
                      <div className="flex items-center gap-1 text-slate-300">
                        {rule.notifyChannels.includes('in_app') && <span title="In-App Banner"><Volume2 className="w-3.5 h-3.5" /></span>}
                        {rule.notifyChannels.includes('push') && <span title="Push Notification"><Smartphone className="w-3.5 h-3.5" /></span>}
                        {rule.notifyChannels.includes('clinician') && <span title="Clinician Dispatch"><UserCheck className="w-3.5 h-3.5 text-teal-400" /></span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Threshold Incident Log (Evaluated against telemetry stream) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Evaluated Incident Log</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live threshold breaches recorded across telemetry telemetry streams
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total {allIncidents.length} incidents evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
                <th className="py-2.5 px-4 font-medium">TIMESTAMP</th>
                <th className="py-2.5 px-4 font-medium">TRIGGERED RULE</th>
                <th className="py-2.5 px-4 font-medium">METRIC</th>
                <th className="py-2.5 px-4 font-medium text-right">OBSERVED VALUE</th>
                <th className="py-2.5 px-4 font-medium text-right">THRESHOLD</th>
                <th className="py-2.5 px-4 font-medium">SEVERITY</th>
                <th className="py-2.5 px-4 font-medium">STATUS</th>
                <th className="py-2.5 px-4 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {allIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    All vitals are currently within safe clinical thresholds.
                  </td>
                </tr>
              ) : (
                allIncidents.map((incident) => {
                  const isActive = incident.status === 'active';

                  return (
                    <tr key={incident.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {incident.timestamp}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-100">
                        {incident.ruleName}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {incident.metric}
                      </td>
                      <td className="py-3 px-4 text-right text-rose-400 font-bold tabular-nums">
                        {incident.triggerValue} {incident.unit}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 tabular-nums">
                        {incident.thresholdValue} {incident.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                          incident.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize">
                        <span className={isActive ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                        {isActive && (
                          <button
                            onClick={() => handleAcknowledgeIncident(incident.id)}
                            className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-teal-300 rounded transition-colors cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => handleDismissIncident(incident.id)}
                          className="p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                          title="Dismiss incident"
                        >
                          <X className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Threshold Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-slate-100">Add Threshold Alert Rule</h3>
                <p className="text-xs text-slate-400 font-mono">Real-Time Continuous Ingestion Guard</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aerobic Heart Rate Ceiling"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-teal-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Metric</label>
                  <select
                    value={formMetric}
                    onChange={(e) => {
                      const m = e.target.value as any;
                      setFormMetric(m);
                      if (m === 'spo2') setFormThreshold(92);
                      else setFormThreshold(110);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="heart_rate">Heart Rate (BPM)</option>
                    <option value="resting_heart_rate">Resting HR (BPM)</option>
                    <option value="spo2">SpO2 Oxygen (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Condition</label>
                  <select
                    value={formOperator}
                    onChange={(e) => setFormOperator(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="greater_than">Exceeds ( &gt; )</option>
                    <option value="less_than">Drops Below ( &lt; )</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Threshold Value</label>
                  <input
                    type="number"
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Severity Level</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="low">Low (Info)</option>
                    <option value="medium">Medium (Warning)</option>
                    <option value="critical">Critical (Emergency)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Sustained Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value))}
                  placeholder="0 for instantaneous alert"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-hidden focus:border-teal-500"
                />
                <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                  Set to 0 to trigger instantaneously on first breach point
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Save Alert Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
