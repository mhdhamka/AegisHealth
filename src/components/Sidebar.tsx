import React from 'react';
import { 
  LayoutDashboard, 
  LineChart, 
  Watch, 
  ClipboardList, 
  AlertTriangle, 
  Bell, 
  ChevronDown,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types/health';

export type NavTab = 
  | 'overview' 
  | 'analytics' 
  | 'alerts'
  | 'wearables' 
  | 'health_logs' 
  | 'anomalies';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: UserProfile;
  alternateProfiles: UserProfile[];
  onSelectProfile: (u: UserProfile) => void;
  activeAnomaliesCount: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  currentUser,
  alternateProfiles,
  onSelectProfile,
  activeAnomaliesCount
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      desc: 'Real-time vitals & readiness'
    },
    {
      id: 'analytics' as NavTab,
      label: 'Biometrics & Trends',
      icon: LineChart,
      desc: 'Interactive time-series charts'
    },
    {
      id: 'alerts' as NavTab,
      label: 'Biometric Alerts',
      icon: Bell,
      desc: 'HR & SpO2 thresholds'
    },
    {
      id: 'wearables' as NavTab,
      label: 'Wearable Sync Hub',
      icon: Watch,
      desc: 'Garmin, Whoop, Oura, Apple'
    },
    {
      id: 'health_logs' as NavTab,
      label: 'Health Logs & Labs',
      icon: ClipboardList,
      desc: 'Clinical biomarkers & entries'
    },
    {
      id: 'anomalies' as NavTab,
      label: 'Anomalies & Recovery',
      icon: AlertTriangle,
      desc: 'Autonomic & cardiac alerts',
      badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : undefined
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-100">AegisHealth</h1>
              <p className="text-[11px] text-slate-400 font-mono">Biometrics SaaS Cloud</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-slate-800 text-teal-300 font-semibold shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile & Patient Context at bottom */}
      <div className="p-3 border-t border-slate-800 relative">
        <div 
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{currentUser.name}</p>
              <p className="text-[10px] font-mono text-slate-400 truncate">{currentUser.profileType}</p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </div>

        {/* Profile Switcher Popover */}
        {profileDropdownOpen && (
          <div className="absolute bottom-16 left-3 right-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 z-50 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 px-2 py-1 block">SELECT COHORT PROFILE</span>
            {alternateProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProfile(p);
                  setProfileDropdownOpen(false);
                }}
                className={`w-full text-left p-2 rounded-md text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  p.id === currentUser.id 
                    ? 'bg-slate-800 text-teal-300' 
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[10px] text-slate-400">{p.profileType}</div>
                </div>
                {p.id === currentUser.id && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
