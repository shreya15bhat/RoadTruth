import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useRouteWise } from '../../context/RouteWiseContext';
import { 
  Navigation, 
  Compass, 
  Route, 
  Bell, 
  AlertTriangle, 
  Car, 
  Settings, 
  HelpCircle, 
  LogOut, 
  AlertOctagon, 
  Upload, 
  Menu, 
  X,
  Radio
} from 'lucide-react';
import EmergencyModal from '../common/EmergencyModal';
import CSVImportModal from '../forms/CSVImportModal';

export default function PassengerLayout() {
  const navigate = useNavigate();
  const { 
    activeJourney, 
    privacySettings, 
    importDataset,
    logoutUser,
    user
  } = useRouteWise();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const navItems = [
    { label: 'Live Dashboard', path: '/passenger', icon: Compass, end: true },
    { label: 'Plan Route', path: '/passenger/route', icon: Route },
    { label: 'Traffic Alerts', path: '/passenger/alerts', icon: Bell },
    { label: 'Report Incident', path: '/passenger/report', icon: AlertTriangle },
    { label: 'My Journeys', path: '/passenger/journeys', icon: Car },
    { label: 'Settings', path: '/passenger/settings', icon: Settings },
    { label: 'Help & Docs', path: '/passenger/help', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-[#0A1118] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* DESKTOP PASSENGER SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#1B2A3B] bg-[#101D2B] p-4 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Logo & Portal Identity */}
          <Link to="/" className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-[#1769AA] flex items-center justify-center text-white shadow-sm">
              <Navigation className="w-4 h-4 fill-white rotate-45" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                ROADTRUTH
              </div>
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Passenger Console
              </span>
            </div>
          </Link>

          {/* Active Tracking Pill */}
          {activeJourney.isActive && (
            <div className="p-3 rounded-lg bg-[#142436] border border-[#1769AA]/50 text-xs text-slate-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#1769AA]">
                <span className="w-2 h-2 rounded-full bg-[#23966B] animate-ping"></span>
                <span>Active Commute Live</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {activeJourney.speedKmh} km/h • {activeJourney.distanceRemainingKm} km remaining
              </div>
            </div>
          )}

          {/* Navigation Items (Strictly Passenger Only) */}
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
          {/* Quick SOS Trigger */}
          <button
            onClick={() => setIsEmergencyOpen(true)}
            className="w-full py-2.5 px-3 rounded-lg bg-[#E5484D]/15 hover:bg-[#E5484D]/25 text-[#E5484D] border border-[#E5484D]/30 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4 text-[#E5484D]" />
            <span>Emergency SOS</span>
          </button>

          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <span className="text-[11px] text-slate-300 font-medium truncate max-w-[110px]">
              {user?.username || user?.email || 'Citizen User'}
            </span>

            <button
              onClick={() => {
                logoutUser();
                navigate('/login?portal=passenger');
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

      {/* MOBILE TOPBAR & DRAWER */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#1B2A3B] bg-[#101D2B]">
        <Link to="/" className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#1769AA] rotate-45" />
          <span className="font-bold text-white text-sm tracking-tight">ROADTRUTH Passenger</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEmergencyOpen(true)}
            className="p-1.5 rounded-lg bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/30 text-xs font-bold"
          >
            SOS
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
        {/* Top Mini Commute Status Bar */}
        <div className="border-b border-[#1B2A3B] bg-[#101D2B]/80 px-4 sm:px-8 py-2 text-[11px] flex flex-wrap items-center justify-between gap-2 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#23966B] animate-pulse"></span>
            <span className="font-semibold text-slate-200">Corridor Telemetry:</span>
            <span>{privacySettings.isSharingCommute ? 'Consent-driven corridor sharing active' : 'Commute sharing paused'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="text-[#1769AA] hover:text-[#1B7DC8] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Incidents CSV</span>
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />

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
