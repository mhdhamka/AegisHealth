import React, { useState } from 'react';
import { WearableDevice } from '../../types/health';
import { 
  Watch, 
  RefreshCw, 
  Battery, 
  BatteryCharging, 
  CheckCircle2, 
  AlertCircle, 
  Wifi, 
  Layers, 
  Radio,
  Terminal,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Props {
  devices: WearableDevice[];
  onSyncDevice: (id: string) => Promise<void>;
  onSyncAll: () => Promise<void>;
  isSyncing: boolean;
  syncNotice: string | null;
}

export const WearablesSyncView: React.FC<Props> = ({
  devices,
  onSyncDevice,
  onSyncAll,
  isSyncing,
  syncNotice
}) => {
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);
  const [ingestionLogs, setIngestionLogs] = useState<string[]>([
    '[2026-09-24 08:44:12] [Garmin-Webhook-Worker] Ingested 360 heart rate samples @ 1Hz',
    '[2026-09-24 08:45:02] [Whoop-Ingest-Job] Synchronized 8 recovery sleep episodes (efficiency: 92%)',
    '[2026-09-24 08:46:19] [Oura-REST-Client] Ring firmware 2.9.22 validated · Circadian phase alignment OK',
    '[2026-09-24 08:48:30] [Dexcom-CGM-Stream] Continuous glucose 88 mg/dL · Rate of change: +0.2 mg/dL/min'
  ]);

  const handleDeviceSync = async (id: string, name: string) => {
    setSyncingDeviceId(id);
    const now = new Date().toLocaleTimeString();
    setIngestionLogs(prev => [
      `[${now}] [Sync-Trigger] Initiating secure mutual-TLS handshake for ${name}...`,
      ...prev.slice(0, 7)
    ]);

    try {
      await onSyncDevice(id);
      setIngestionLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [Sync-Success] Ingested 384 biometric frames from ${name} → Written to PostgreSQL & Redis cache updated.`,
        ...prev.slice(0, 7)
      ]);
    } finally {
      setSyncingDeviceId(null);
    }
  };

  const handleFullSync = async () => {
    setIngestionLogs(prev => [
      `[${new Date().toLocaleTimeString()}] [Sync-All] Dispatching batch queue across ${devices.length} wearable provider APIs...`,
      ...prev.slice(0, 7)
    ]);
    await onSyncAll();
    setIngestionLogs(prev => [
      `[${new Date().toLocaleTimeString()}] [Sync-All-Complete] Batch ingestion finished: 1,840 biometric packets ingested.`,
      ...prev.slice(0, 7)
    ]);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">Wearable Device Synchronization Hub</h2>
            <span className="text-xs font-mono text-teal-400">· REST & Webhook Ingestion</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Decoupled microservice architecture replacing legacy desktop local USB drivers
          </p>
        </div>

        <button
          onClick={handleFullSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Batch Ingesting...' : 'Sync All Devices'}</span>
        </button>
      </div>

      {/* Connected Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => {
          const isThisSyncing = syncingDeviceId === device.id || isSyncing;

          return (
            <div
              key={device.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400">
                      <Watch className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">{device.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{device.model}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400 font-medium capitalize">{device.status}</span>
                  </div>
                </div>

                {/* Specs List */}
                <div className="py-3 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Battery Level:</span>
                    <div className="flex items-center gap-1 text-slate-200">
                      <Battery className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{device.batteryPercent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Last Ingestion:</span>
                    <span className="text-slate-200">{device.lastSync}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Auto-Sync Frequency:</span>
                    <span className="text-slate-200">Every {device.autoSyncIntervalMinutes}m</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Firmware:</span>
                    <span className="text-slate-300">{device.firmwareVersion}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Lifetime Ingested:</span>
                    <span className="text-teal-300 font-semibold tabular-nums">
                      {device.totalRecordsSynced.toLocaleString()} pts
                    </span>
                  </div>
                </div>

                {/* Streams */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono block mb-1.5">ENABLED METRICS</span>
                  <div className="flex flex-wrap gap-1">
                    {device.metricsSupported.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {m.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sync Action */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleDeviceSync(device.id, device.name)}
                  disabled={isThisSyncing}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isThisSyncing ? 'animate-spin text-teal-400' : ''}`} />
                  <span>{isThisSyncing ? 'Syncing Streams...' : 'Sync Device Now'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Ingestion Webhook Telemetry Console */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span className="font-semibold">Live Ingestion Event Bus & Telemetry</span>
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active HTTP / gRPC Listeners
          </span>
        </div>

        <div className="mt-3 space-y-1.5 text-slate-400 max-h-48 overflow-y-auto">
          {ingestionLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-teal-400 select-none">&gt;</span>
              <span className={idx === 0 ? 'text-slate-100 font-medium' : 'text-slate-400'}>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
