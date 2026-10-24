import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  X,
  Navigation,
  Compass
} from 'lucide-react';
import { VERIFICATION_LEVELS } from '../../data/dataTemplates';

export default function WhyIsRoadBlockedModal({ incident, onClose, onReroute = null }) {
  const navigate = useNavigate();
  if (!incident) return null;

  const currentLvl = Number(incident.verificationLevel) || 1;
  const levelInfo = VERIFICATION_LEVELS[currentLvl - 1] || VERIFICATION_LEVELS[0];

  const handleAlternativeClick = () => {
    if (onReroute) {
      onReroute(incident);
    } else {
      onClose();
      navigate('/passenger/route');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1118]/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#101D2B] border border-[#1B2A3B] rounded-lg shadow-2xl overflow-hidden p-6 text-slate-100 space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1B2A3B]">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#1769AA] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Corridor Telemetry Diagnostics</span>
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Why is this corridor affected?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#142436] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: WHAT WE KNOW */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1769AA]" />
            <span>Verified Corridor Evidence</span>
          </div>

          <div className="p-4 bg-[#142436] rounded-lg border border-[#1B2A3B] space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-[#1B2A3B]">
              <span className="text-slate-400 font-medium">Condition Type:</span>
              <span className="font-bold text-white uppercase text-[11px] px-2 py-0.5 rounded bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/30">
                {incident.category ? incident.category.replace(/_/g, ' ') : 'Road Hazard'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#1B2A3B]">
              <span className="text-slate-400 font-medium">Corridor Location:</span>
              <span className="font-semibold text-slate-200 text-right">{incident.locationName || 'Coastal Corridor'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#1B2A3B]">
              <span className="text-slate-400 font-medium">Report Age:</span>
              <span className="font-mono text-slate-300">{incident.reportedAgo || 'Active report'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#1B2A3B]">
              <span className="text-slate-400 font-medium">Matching Citizen Reports:</span>
              <span className="font-mono text-slate-200 font-bold">
                {incident.confirmationCount ? `${incident.confirmationCount} corroborations` : 'Initial submission'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#1B2A3B]">
              <span className="text-slate-400 font-medium">Forensic Evidence:</span>
              <span className="text-slate-200 font-semibold">
                {incident.imageUrl ? '📷 Photo Proof Attached' : '📍 GPS Geofence Only'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#1B2A3B]">
              <span className="text-slate-400 font-medium">Verification Status:</span>
              <span className="font-bold text-[#1769AA]">
                Level {currentLvl} — {levelInfo.title}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-medium">Corridor Latency:</span>
              <span className="font-mono text-[#F0A629] font-bold">
                +{incident.delayMinutes || 15} min delay ({incident.affectedDistanceKm || 1.2} km queue)
              </span>
            </div>
          </div>

          {/* Description Snippet */}
          {incident.description && (
            <div className="p-3 bg-[#142436] rounded-lg border border-[#1B2A3B] text-xs text-slate-300 leading-relaxed italic">
              "{incident.description}"
            </div>
          )}
        </div>

        {/* SECTION 2: WHAT YOU CAN DO */}
        <div className="p-4 bg-[#142436] rounded-lg border border-[#1769AA]/40 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#1769AA] flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-[#1769AA]" />
            <span>Recommended Route Action</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {incident.alternativeRoute 
              ? incident.alternativeRoute 
              : 'Our route planner calculates congestion-free detours to circumvent this bottleneck and minimize corridor travel time.'}
          </p>

          <button
            onClick={handleAlternativeClick}
            className="w-full py-2.5 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>View Bypass Route Detours</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
