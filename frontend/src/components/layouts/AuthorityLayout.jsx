import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useRouteWise } from '../../context/RouteWiseContext';
import { 
  Activity, 
  MapPin, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut, 
  Upload, 
  Menu, 
  X,
  Radio,
  ShieldAlert
} from 'lucide-react';
import CSVImportModal from '../forms/CSVImportModal';

export default function AuthorityLayout() {
  const navigate = useNavigate();
  const { incidents, importDataset, logoutUser, user } = useRouteWise();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const navItems = [
    { label: 'Operations Overview', path: '/authority', icon: Activity, end: true },
    { label: 'Active Incidents', path: '/authority/incidents', icon: Radio },
    { label: 'Bottleneck Hotspots', path: '/authority/hotspots', icon: MapPin },
    { label: 'Recurring Problems', path: '/authority/recurring', icon: TrendingUp },
    { label: 'Traffic Analytics', path: '/authority/analytics', icon: BarChart3 },
    { label: 'Official Reports', path: '/authority/reports', icon: FileText },
    { label: 'Console Settings', path: '/authority/settings', icon: Settings }
  ];

  const activeHazardsCount = incidents.filter(i => i.status !== 'cleared').length;

  return (
    <div className="min-h-screen bg-[#0A1118] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* DESKTOP AUTHORITY SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#1B2A3B] bg-[#101D2B] p-4 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Logo & Portal Identity */}
          <Link to="/" className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-[#1769AA] flex items-center justify-center text-white shadow-sm">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                ROADTRUTH
              </div>
              <span className="text-[10px] font-semibold text-[#F0A629] uppercase tracking-wider block">
                Traffic Operations Center
              </span>
            </div>
          </Link>

          {/* Active Incidents Monitor Badge */}
          <div className="p-3 rounded-lg bg-[#142436] border border-[#1B2A3B] text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B] block tracking-wider">
              Live Arterial Telemetry
            </span>
            <div className="text-base font-bold text-white font-mono flex items-center justify-between">
              <span>{activeHazardsCount} Active Hazards</span>
              <span className="text-[10px] text-[#23966B] font-sans font-semibold">TOC Live</span>
            </div>
          </div>

          {/* Navigation Items (Strictly Authority Only) */}
          <nav className="space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#1769AA]/15 text-white border-l-2 border-[#1769AA]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#142436]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-[#94A3B8]" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-4 border-t border-[#1B2A3B] space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <span className="text-[11px] text-slate-300 font-medium truncate max-w-[110px]">
              {user?.agency || user?.username || 'Traffic Official'}
            </span>

            <button
              onClick={() => {
                logoutUser();
                navigate('/login?portal=authority');
              }}
              className="text-[11px] text-slate-400 hover:text-[#E5484D] flex items-center gap-1 font-semibold cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#1B2A3B] bg-[#101D2B]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#1769AA]" />
          <span className="font-bold text-white text-sm">ROADTRUTH Authority Center</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[#1B2A3B] bg-[#101D2B] p-4 space-y-1">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-[#142436]"
            >
              <item.icon className="w-4 h-4 text-[#1769AA]" />
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => { setIsMobileMenuOpen(false); navigate('/select-role'); }}
            className="w-full text-left p-2.5 text-xs text-[#F0A629] font-bold"
          >
            Switch Role Experience →
          </button>
        </div>
      )}

      {/* MAIN PORTAL CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Command Strip */}
        <div className="border-b border-[#1B2A3B] bg-[#101D2B]/80 px-4 sm:px-8 py-2 text-[11px] flex flex-wrap items-center justify-between gap-2 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#23966B] animate-pulse"></span>
            <span className="font-semibold text-slate-200">Traffic Authority Command:</span>
            <span>Coastal Karnataka Highways & Urban Transit Grid (NH-66 / NH-75)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="text-[#1769AA] hover:text-[#1B7DC8] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Traffic CSV</span>
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        targetType="incidents"
        onImportSuccess={importDataset}
      />
    </div>
  );
}
