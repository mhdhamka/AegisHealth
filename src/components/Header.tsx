import React from 'react';
import { Plus, Download, RefreshCw, Radio, Check } from 'lucide-react';
import { NavTab } from './Sidebar';

interface Props {
  activeTab: NavTab;
  onOpenQuickLog: () => void;
  onOpenExport: () => void;
  onSyncAll: () => Promise<void>;
  isSyncing: boolean;
  syncNotice: string | null;
}

const TAB_TITLES: Record<NavTab, string> = {
  overview: 'Executive Overview',
  analytics: 'Biometrics & Trends',
  alerts: 'Biometric Alerts & Thresholds',
  wearables: 'Wearable Sync Hub',
  health_logs: 'Health Logs & Labs',
  anomalies: 'Anomalies & Recovery'
};

export const Header: React.FC<Props> = ({
  activeTab,
  onOpenQuickLog,
  onOpenExport,
  onSyncAll,
  isSyncing,
  syncNotice
}) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">AegisHealth</span>
        <span className="text-slate-400">/</span>
        <span className="font-semibold text-slate-100">{TAB_TITLES[activeTab]}</span>
      </div>

      {/* Zone 2: Sync telemetry status notice */}
      <div className="hidden md:flex items-center gap-3">
        {syncNotice ? (
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5" />
            <span>{syncNotice}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>5 Sensors Connected · Real-Time Ingestion</span>
          </div>
        )}

        <button
          onClick={onSyncAll}
          disabled={isSyncing}
          title="Force poll all wearable device endpoints"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-teal-300 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-md transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-teal-400' : ''}`} />
          <span>{isSyncing ? 'Ingesting...' : 'Sync Wearables'}</span>
        </button>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        <button
          onClick={onOpenQuickLog}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Biomarker</span>
        </button>
      </div>
    </header>
  );
};
