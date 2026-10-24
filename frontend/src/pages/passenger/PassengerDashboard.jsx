import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteWise } from '../../context/RouteWiseContext';
import TrafficMap from '../../components/maps/TrafficMap';
import { 
  Search, 
  MapPin, 
  Route, 
  X, 
  CheckCircle,
  Circle,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const { incidents, selectedRoute } = useRouteWise();

  const [destinationSearch, setDestinationSearch] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showEvidence, setShowEvidence] = useState(false);

  // Derive the 3 core numbers from the active/selected route or incidents
  const typicalMin = selectedRoute?.typicalDurationMin || 35;
  const currentMin = selectedRoute?.currentDurationMin || 52;
  const delayMin = selectedRoute?.delayMin !== undefined ? selectedRoute.delayMin : 17;

  const handlePlanRoute = (e) => {
    e.preventDefault();
    const dest = destinationSearch.trim() || 'Hampankatta City Center';
    navigate(`/passenger/route?destination=${encodeURIComponent(dest)}`);
  };

  const handleMarkerClick = (inc) => {
    setSelectedIncident(inc);
    setShowEvidence(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header: Operational Greeting & Route Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1B2A3B] pb-4">
        <div>
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            City Transit Network • Coastal Grid
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Active Commuter Overview
          </h1>
        </div>

        {/* Search destination form */}
        <form onSubmit={handlePlanRoute} className="flex items-center gap-2 max-w-md w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              placeholder="Search destination corridor..."
              className="w-full pl-9 pr-3 py-2 bg-[#101D2B] border border-[#1B2A3B] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#1769AA] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded-lg transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <Route className="w-3.5 h-3.5" />
            <span>Plan Route</span>
          </button>
        </form>
      </div>

      {/* 2. Main Content: Map (Hero, 65-70%) + Traffic Alerts (30-35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Map: Hero Section */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-lg overflow-hidden border border-[#1B2A3B] bg-[#101D2B] shadow-sm">
            <div className="px-4 py-2.5 bg-[#142436] border-b border-[#1B2A3B] flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#23966B]"></span>
                Live Arterial Map
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {incidents.length} Hazards Active
              </span>
            </div>
            <TrafficMap
              incidents={incidents}
              selectedRoute={selectedRoute}
              onIncidentClick={handleMarkerClick}
              showCurrentLocation={true}
              height="h-[420px] sm:h-[480px] lg:h-[500px]"
            />
          </div>

          {/* 3 Core Numbers: Typical, Current, Delay */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg text-center">
            <div className="p-2">
              <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider block">Typical Baseline</span>
              <span className="text-xl sm:text-2xl font-bold text-[#94A3B8] mt-1 block font-mono">
                {typicalMin} min
              </span>
            </div>
            <div className="p-2 border-x border-[#1B2A3B]">
              <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider block">Current Commute</span>
              <span className="text-xl sm:text-2xl font-bold text-white mt-1 block font-mono">
                {currentMin} min
              </span>
            </div>
            <div className="p-2">
              <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider block">Estimated Delay</span>
              <span className={`text-xl sm:text-2xl font-bold mt-1 block font-mono ${delayMin > 0 ? 'text-[#F0A629]' : 'text-[#23966B]'}`}>
                {delayMin > 0 ? `+${delayMin} min` : '0 min'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Traffic Alerts Feed */}
        <div className="lg:col-span-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1B2A3B]">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Active Incident Alerts</h2>
            <span className="text-[11px] font-mono text-[#1769AA] bg-[#1769AA]/15 px-2 py-0.5 rounded border border-[#1769AA]/30">
              {incidents.length} Monitored
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {incidents.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs space-y-1">
                <p className="font-semibold text-slate-400">No active alerts</p>
                <p className="text-[11px] text-slate-500">Corridors in your jurisdiction report normal transit flow.</p>
              </div>
            ) : (
              incidents.map((inc) => {
                const isSevere = inc.severity === 'severe' || inc.severity === 'critical';
                const isModerate = inc.severity === 'moderate';

                return (
                  <div
                    key={inc.id}
                    onClick={() => handleMarkerClick(inc)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedIncident?.id === inc.id
                        ? 'bg-[#1769AA]/15 border-[#1769AA]'
                        : 'bg-[#142436] border-[#1B2A3B] hover:border-[#2E4763]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isSevere ? 'bg-[#E5484D]' : isModerate ? 'bg-[#F0A629]' : 'bg-[#23966B]'}`}></span>
                          <span className="font-semibold text-slate-200 capitalize">{inc.category || 'Hazard'}</span>
                          <span className="text-[10px] text-slate-500 font-mono">• {inc.reportedAgo || 'Recent'}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[190px]">
                          {inc.locationName || 'Mangaluru Arterial Road'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#F0A629] font-mono">
                          +{inc.delayMinutes || 15}m
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {inc.confirmationCount || 1} {inc.confirmationCount === 1 ? 'report' : 'reports'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 3. INCIDENT DETAIL SIDE PANEL (Progressive Disclosure) */}
      {selectedIncident && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#101D2B] border-l border-[#1B2A3B] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between text-slate-100">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#1B2A3B] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#1769AA]">Incident Telemetry</span>
                <h3 className="text-lg font-bold text-white capitalize mt-0.5">
                  {selectedIncident.category || 'Road Hazard'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedIncident.locationName || 'NH-66 · Mangaluru'}
                </p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#142436] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Severity Pill */}
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${
                selectedIncident.severity === 'severe' || selectedIncident.severity === 'critical'
                  ? 'bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30'
                  : selectedIncident.severity === 'moderate'
                  ? 'bg-[#F0A629]/15 text-[#F0A629] border border-[#F0A629]/30'
                  : 'bg-[#23966B]/15 text-[#23966B] border border-[#23966B]/30'
              }`}>
                <span>{selectedIncident.severity === 'severe' ? 'Severe Congestion' : selectedIncident.severity === 'moderate' ? 'Moderate Congestion' : 'Normal Flow'}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">• Reported {selectedIncident.reportedAgo || 'Recently'}</span>
            </div>

            {/* Concise Stats: Delay, Reports, Verification */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-[#142436] border border-[#1B2A3B] rounded-lg text-center">
              <div>
                <div className="text-[10px] text-[#64748B] uppercase font-bold">Delay Impact</div>
                <div className="text-base font-bold text-[#F0A629] font-mono mt-0.5">
                  +{selectedIncident.delayMinutes || 15}m
                </div>
              </div>
              <div className="border-x border-[#1B2A3B]">
                <div className="text-[10px] text-[#64748B] uppercase font-bold">Reports</div>
                <div className="text-base font-bold text-slate-200 font-mono mt-0.5">
                  {selectedIncident.confirmationCount || 1}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] uppercase font-bold">Confidence</div>
                <div className="text-base font-bold text-[#1769AA] font-mono mt-0.5">
                  {selectedIncident.verificationLevel >= 4 ? 'Verified' : selectedIncident.verificationLevel >= 2 ? 'Corroborated' : 'Preliminary'}
                </div>
              </div>
            </div>

            {/* Compact 5-Signal Timeline */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Verification Signals</span>
                <span className="text-[11px] text-[#1769AA] font-mono font-bold">
                  {Math.min(selectedIncident.verificationLevel || 3, 5)} of 5 Verified
                </span>
              </div>

              <div className="p-3 bg-[#142436] border border-[#1B2A3B] rounded-lg space-y-2 text-xs font-medium">
                <div className="flex items-center gap-2 text-[#23966B]">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Citizen Report Logged</span>
                </div>
                <div className="flex items-center gap-2 text-[#23966B]">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>GPS Location Validated</span>
                </div>
                <div className={`flex items-center gap-2 ${selectedIncident.verificationLevel >= 3 ? 'text-[#23966B]' : 'text-slate-500'}`}>
                  {selectedIncident.verificationLevel >= 3 ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
                  <span>Multi-User Corroboration</span>
                </div>
                <div className={`flex items-center gap-2 ${selectedIncident.verificationLevel >= 4 ? 'text-[#23966B]' : 'text-slate-500'}`}>
                  {selectedIncident.verificationLevel >= 4 ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
                  <span>Corridor Velocity Drop Detected</span>
                </div>
                <div className={`flex items-center gap-2 ${selectedIncident.verificationLevel >= 5 ? 'text-[#23966B]' : 'text-slate-500'}`}>
                  {selectedIncident.verificationLevel >= 5 ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
                  <span>Media / Forensic Evidence Confirmed</span>
                </div>
              </div>
            </div>

            {/* Evidence Drawer Toggle */}
            {showEvidence && selectedIncident.imageUrl && (
              <div className="p-3 bg-[#142436] border border-[#1B2A3B] rounded-lg space-y-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Forensic Image</span>
                <img
                  src={selectedIncident.imageUrl}
                  alt="Incident evidence"
                  className="w-full h-36 object-cover rounded border border-[#1B2A3B]"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#1B2A3B] space-y-2">
            {selectedIncident.imageUrl && (
              <button
                onClick={() => setShowEvidence(!showEvidence)}
                className="w-full py-2 bg-[#142436] hover:bg-[#1B2A3B] text-slate-200 font-semibold text-xs rounded-lg border border-[#1B2A3B] transition-colors"
              >
                {showEvidence ? 'Hide Evidence' : 'View Evidence'}
              </button>
            )}

            <button
              onClick={() => {
                setSelectedIncident(null);
                navigate(`/passenger/route?avoid=${encodeURIComponent(selectedIncident.locationName || 'Incident')}`);
              }}
              className="w-full py-2.5 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Route className="w-3.5 h-3.5" />
              <span>Calculate Bypass Route</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
