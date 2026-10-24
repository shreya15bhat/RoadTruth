import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRouteWise } from '../../context/RouteWiseContext';
import { 
  Navigation, 
  MapPin, 
  Search, 
  ArrowRight, 
  Radio, 
  AlertCircle,
  AlertTriangle,
  Activity,
  Layers,
  Clock,
  ShieldCheck
} from 'lucide-react';

const CORRIDOR_HOTSPOTS = [
  { name: 'Surathkal NITK Corridor', lat: 13.0118, lng: 74.7943 },
  { name: 'Hampankatta City Center', lat: 12.8688, lng: 74.8436 },
  { name: 'Pumpwell (Mahaveera Circle)', lat: 12.8622, lng: 74.8637 },
  { name: 'Kottara Chowki Flyover', lat: 12.9056, lng: 74.8384 },
  { name: 'Udupi City Hub', lat: 13.3409, lng: 74.7421 }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, incidents } = useRouteWise();
  const [destinationInput, setDestinationInput] = useState('');
  const [validationError, setValidationError] = useState('');

  const activeIncidents = incidents.filter(i => i.status !== 'cleared');
  const severeCount = activeIncidents.filter(i => i.severity === 'critical' || i.severity === 'severe').length;

  const handleDestinationSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = destinationInput.trim();

    if (!query) {
      setValidationError('Please enter a destination to inspect corridor traffic.');
      return;
    }

    setValidationError('');

    if (isAuthenticated) {
      navigate(`/passenger/route?destination=${encodeURIComponent(query)}`);
    } else {
      navigate(`/login?portal=passenger&destination=${encodeURIComponent(query)}`);
    }
  };

  const handleSelectQuickDest = (dest) => {
    setDestinationInput(dest);
    setValidationError('');
    if (isAuthenticated) {
      navigate(`/passenger/route?destination=${encodeURIComponent(dest)}`);
    } else {
      navigate(`/login?portal=passenger&destination=${encodeURIComponent(dest)}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      {/* 1. EDITORIAL TRAFFIC COMMAND HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Direct Traffic Problem & Action */}
        <div className="lg:col-span-7 space-y-6">
          {/* Municipal Authority Badge */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#101D2B] border border-[#1B2A3B] text-xs font-mono text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#23966B] animate-pulse"></span>
            <span className="text-white font-semibold">URBAN TRAFFIC INTELLIGENCE</span>
            <span className="text-[#64748B]">|</span>
            <span>NH-66 COASTAL ARTERY</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Understand Traffic. <br />
              <span className="text-[#1769AA]">Move Smarter.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-xl">
              Real-time multi-source corridor monitoring, verified incident telemetry, and automated delay validation for citizens, employers, and traffic control authorities.
            </p>
          </div>

          {/* Prominent Location Search */}
          <div className="space-y-2.5 pt-1 max-w-xl">
            <form onSubmit={handleDestinationSearch} className="relative flex items-center">
              <MapPin className="w-4 h-4 text-[#E5484D] absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={destinationInput}
                onChange={(e) => {
                  setDestinationInput(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Where are you going? (e.g. Hampankatta, Surathkal NITK)..."
                className="w-full pl-11 pr-28 py-3.5 bg-[#101D2B] border border-[#1B2A3B] focus:border-[#1769AA] rounded-lg text-xs sm:text-sm text-white placeholder-[#64748B] focus:outline-none transition-colors"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-2 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>

            {/* Validation Error Message */}
            {validationError && (
              <div className="p-2.5 rounded-md bg-[#381316] border border-[#E5484D]/40 text-[#E5484D] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Key Corridors Quick-Select */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5">
              <span className="text-[#64748B] font-medium mr-1 font-mono">Corridors:</span>
              {CORRIDOR_HOTSPOTS.map((spot, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickDest(spot.name)}
                  className="px-2 py-0.5 rounded bg-[#101D2B] hover:bg-[#142436] text-[#94A3B8] hover:text-white border border-[#1B2A3B] transition-colors cursor-pointer"
                >
                  {spot.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/select-role"
              className="px-5 py-2.5 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Access Role Workspaces</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to={isAuthenticated ? "/passenger/route" : "/login?portal=passenger"}
              className="px-4 py-2.5 bg-[#101D2B] hover:bg-[#142436] border border-[#1B2A3B] text-slate-200 hover:text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5 text-[#1769AA] rotate-45" />
              <span>Open Route Planner</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Live Corridor Status Telemetry Panel (Real Data) */}
        <div className="lg:col-span-5 bg-[#101D2B] border border-[#1B2A3B] rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1B2A3B] pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#1769AA] animate-pulse" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Live Regional Status
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0E2E20] text-[#23966B] border border-[#23966B]/30 font-semibold">
              Telemetry Active
            </span>
          </div>

          {/* Restrained KPI Matrix */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-[#0A1118] border border-[#1B2A3B] rounded-lg">
              <span className="text-[10px] uppercase font-mono text-[#64748B] block">Active Events</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                {activeIncidents.length}
              </span>
            </div>
            <div className="p-3 bg-[#0A1118] border border-[#1B2A3B] rounded-lg">
              <span className="text-[10px] uppercase font-mono text-[#64748B] block">Choke Points</span>
              <span className={`text-xl font-bold font-mono mt-0.5 block ${severeCount > 0 ? 'text-[#E5484D]' : 'text-[#23966B]'}`}>
                {severeCount}
              </span>
            </div>
            <div className="p-3 bg-[#0A1118] border border-[#1B2A3B] rounded-lg">
              <span className="text-[10px] uppercase font-mono text-[#64748B] block">Avg Delay</span>
              <span className="text-xl font-bold font-mono text-[#F0A629] mt-0.5 block">
                14m
              </span>
            </div>
          </div>

          {/* Live Incident Snippet Feed */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-mono uppercase text-[#64748B] font-semibold tracking-wider block">
              Recent Verified Disruption:
            </span>
            {activeIncidents.slice(0, 2).map((inc, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-[#0A1118] border border-[#1B2A3B] rounded-lg text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                    {inc.locationName || inc.title}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    inc.severity === 'severe' || inc.severity === 'critical'
                      ? 'bg-[#381316] text-[#E5484D]'
                      : 'bg-[#38260E] text-[#F0A629]'
                  }`}>
                    {inc.severity || 'Moderate'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                  <span>{inc.category || 'Incident'}</span>
                  <span className="font-mono text-[#23966B] font-medium">TrustScore: {inc.trustScore || 85}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1B2A3B] flex items-center justify-between text-[11px] text-[#64748B]">
            <span>Municipal Consensus: 14 Sensor Drops</span>
            <Link to="/authority" className="text-[#5C7EAA] hover:text-white font-medium">
              View Control Room →
            </Link>
          </div>
        </div>
      </section>

      {/* 2. THREE OPERATIONAL WORKSPACES */}
      <section className="space-y-4 pt-4 border-t border-[#1B2A3B]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Dedicated Operation Portals</h2>
            <p className="text-xs text-[#94A3B8]">Purpose-built consoles tailored to municipal stakeholders.</p>
          </div>
          <Link to="/select-role" className="text-xs text-[#1769AA] hover:text-[#1B7DC8] font-semibold flex items-center gap-1">
            <span>Select Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Passenger Console */}
          <div className="p-5 rounded-xl bg-[#101D2B] border border-[#1B2A3B] hover:border-[#1769AA]/60 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#1769AA] font-bold">Portal 01</span>
                <span className="text-[10px] text-[#64748B] font-mono">Public Commute</span>
              </div>
              <h3 className="text-base font-bold text-white">Passenger & Commuter</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Dynamic route calculation, choke-point avoidance, crowdsourced hazard reporting, and verifiable delay certificates.
              </p>
            </div>
            <Link
              to="/login?portal=passenger"
              className="w-full py-2 bg-[#142436] hover:bg-[#1B2A3B] text-slate-200 hover:text-white border border-[#1B2A3B] font-semibold text-xs rounded-md text-center transition-colors"
            >
              Enter Passenger Portal
            </Link>
          </div>

          {/* Employer Console */}
          <div className="p-5 rounded-xl bg-[#101D2B] border border-[#1B2A3B] hover:border-[#23966B]/60 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#23966B] font-bold">Portal 02</span>
                <span className="text-[10px] text-[#64748B] font-mono">Workforce</span>
              </div>
              <h3 className="text-base font-bold text-white">Employer Commute Portal</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Consented employee commute monitoring, corridor bottleneck validation, and authentic delay verification reports.
              </p>
            </div>
            <Link
              to="/login?portal=employer"
              className="w-full py-2 bg-[#142436] hover:bg-[#1B2A3B] text-slate-200 hover:text-white border border-[#1B2A3B] font-semibold text-xs rounded-md text-center transition-colors"
            >
              Enter Employer Portal
            </Link>
          </div>

          {/* Traffic Authority Console */}
          <div className="p-5 rounded-xl bg-[#101D2B] border border-[#1B2A3B] hover:border-[#F0A629]/60 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F0A629] font-bold">Portal 03</span>
                <span className="text-[10px] text-[#64748B] font-mono">Municipal TOC</span>
              </div>
              <h3 className="text-base font-bold text-white">Traffic Control Operations</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Live sensor aggregation, recurring congestion investigation, incident dispatch, and municipal signal timing analysis.
              </p>
            </div>
            <Link
              to="/login?portal=authority"
              className="w-full py-2 bg-[#142436] hover:bg-[#1B2A3B] text-slate-200 hover:text-white border border-[#1B2A3B] font-semibold text-xs rounded-md text-center transition-colors"
            >
              Enter Control Operations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
