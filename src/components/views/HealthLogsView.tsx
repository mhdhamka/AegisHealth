import React, { useState, useMemo } from 'react';
import { HealthLogCategory, HealthLogEntry, LogStatus } from '../../types/health';
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle,
  Info
} from 'lucide-react';

interface Props {
  logs: HealthLogEntry[];
  onDeleteLog: (id: string) => Promise<void>;
  onOpenQuickLog: () => void;
  onOpenExport: () => void;
}

export const HealthLogsView: React.FC<Props> = ({
  logs,
  onDeleteLog,
  onOpenQuickLog,
  onOpenExport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = 
        log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'all' || log.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [logs, searchTerm, selectedCategory, selectedStatus]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteLog(id);
    } finally {
      setDeletingId(null);
    }
  };

  const categories = ['all', 'vitals', 'labs', 'activity', 'symptoms', 'medication', 'nutrition'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">Clinical Health Logs & Lab Panels</h2>
            <span className="text-xs font-mono text-teal-400">· PostgreSQL Storage</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Structured biomarker ledger replacing legacy desktop flat files and Excel spreadsheets
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenQuickLog}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Log Entry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search biomarkers, notes, sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-teal-500 font-mono"
          />
        </div>

        {/* Category Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium capitalize rounded-md transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-teal-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
                <th className="py-3 px-4 font-medium">TIMESTAMP</th>
                <th className="py-3 px-4 font-medium">BIOMARKER & TITLE</th>
                <th className="py-3 px-4 font-medium">CATEGORY</th>
                <th className="py-3 px-4 font-medium text-right">OBSERVED VALUE</th>
                <th className="py-3 px-4 font-medium">REF RANGE</th>
                <th className="py-3 px-4 font-medium">STATUS</th>
                <th className="py-3 px-4 font-medium">SOURCE</th>
                <th className="py-3 px-4 font-medium">CLINICAL NOTES</th>
                <th className="py-3 px-4 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No matching health logs found</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Try clearing filters or log a new biomarker entry
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isDeleting = deletingId === log.id;
                  const statusColors: Record<LogStatus, string> = {
                    optimal: 'text-emerald-400',
                    nominal: 'text-teal-400',
                    elevated: 'text-amber-400',
                    abnormal: 'text-rose-400'
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{log.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{log.metric}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="capitalize text-slate-300">{log.category}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-100 tabular-nums whitespace-nowrap">
                        {log.value} <span className="text-xs font-normal text-slate-400">{log.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {log.referenceRange || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono capitalize">
                        <span className={statusColors[log.status] || 'text-slate-300'}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                        {log.source}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={log.notes}>
                        {log.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={isDeleting}
                          title="Delete health record"
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="p-3 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Displaying {filteredLogs.length} of {logs.length} total entries</span>
          <span>Indexed via PostgreSQL B-Tree Primary Key</span>
        </div>
      </div>
    </div>
  );
};
