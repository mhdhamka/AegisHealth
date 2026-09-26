import React, { useState } from 'react';
import { HealthLogEntry, UserProfile } from '../types/health';
import { X, Download, FileText, Check, Printer } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  logs: HealthLogEntry[];
  apiService: any;
}

export const ReportExportModal: React.FC<Props> = ({ isOpen, onClose, user, logs, apiService }) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadCsv = (type: 'logs' | 'telemetry') => {
    const csvContent = apiService.exportToCsv(type);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aegis_${type}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(`Exported ${type.toUpperCase()} CSV`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadJson = () => {
    const data = {
      patient: user,
      generatedAt: new Date().toISOString(),
      logsCount: logs.length,
      logs: logs
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aegis_health_data_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess('Exported JSON Payload');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-400" />
            <div>
              <h3 className="text-base font-semibold text-slate-100">Export Clinical Health Report</h3>
              <p className="text-xs text-slate-400 font-mono">
                HIPAA-Compliant Format · Structured Interoperability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Patient Card Preview */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs text-slate-400">PATIENT REPORT SPECIFICATION</span>
                <h4 className="text-sm font-semibold text-slate-100">{user.name}</h4>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                <span>DOB / Age: {user.age} yrs ({user.gender})</span>
                <br />
                <span>VO2 Max: <strong className="text-teal-400">{user.vo2Max} mL/kg/min</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <span className="text-slate-400 block">Baseline RHR</span>
                <span className="font-mono font-semibold text-slate-200">51 bpm</span>
              </div>
              <div>
                <span className="text-slate-400 block">30D Avg HRV</span>
                <span className="font-mono font-semibold text-slate-200">76 ms</span>
              </div>
              <div>
                <span className="text-slate-400 block">Avg Systolic BP</span>
                <span className="font-mono font-semibold text-slate-200">116 mmHg</span>
              </div>
              <div>
                <span className="text-slate-400 block">Fasting Glucose</span>
                <span className="font-mono font-semibold text-slate-200">88 mg/dL</span>
              </div>
            </div>
          </div>

          {/* Export Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleDownloadCsv('logs')}
              className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200">Health Logs CSV</span>
                <Download className="w-3.5 h-3.5 text-teal-400 group-hover:translate-y-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Tabular spreadsheet containing all {logs.length} logged biomarkers, reference ranges, and clinical notes.
              </p>
            </button>

            <button
              onClick={() => handleDownloadCsv('telemetry')}
              className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200">Telemetry CSV</span>
                <Download className="w-3.5 h-3.5 text-teal-400 group-hover:translate-y-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Continuous high-resolution wearable sensor streams (HR, HRV, SpO2, Strain, Sleep).
              </p>
            </button>

            <button
              onClick={handleDownloadJson}
              className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200">JSON Data Schema</span>
                <Download className="w-3.5 h-3.5 text-teal-400 group-hover:translate-y-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Standard FHIR-compatible JSON payload for integration into hospital EHR systems.
              </p>
            </button>
          </div>

          {/* Success banner */}
          {downloadSuccess && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg flex items-center gap-2 text-xs text-teal-300 font-mono">
              <Check className="w-4 h-4 text-teal-400" />
              <span>{downloadSuccess} successfully downloaded to your workstation!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <span className="text-xs text-slate-400 font-mono">
            AegisHealth Enterprise · Version 3.4.1 Cloud Native
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Preview</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
