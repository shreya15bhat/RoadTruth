import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Building2, 
  Activity, 
  ArrowRight, 
  Navigation, 
  ShieldAlert
} from 'lucide-react';

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  const handleRoleSelect = (portalKey) => {
    navigate(`/login?portal=${portalKey}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-16 space-y-10 px-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-lg bg-[#1769AA] flex items-center justify-center text-white shadow-sm">
          <Navigation className="w-5 h-5 fill-white rotate-45" />
        </div>
        <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
          ROADTRUTH Intelligence Network
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Select Dedicated Workspace
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Access the mobility intelligence module configured for your operational role.
        </p>
      </div>

      {/* 3 Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Passenger Card */}
        <div className="p-6 rounded-lg bg-[#101D2B] border border-[#1B2A3B] hover:border-[#1769AA] shadow-sm space-y-5 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#1769AA]/15 text-[#1769AA] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Citizen Transit</span>
              <h2 className="text-lg font-bold text-white mt-0.5">Passenger</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculate optimal commute routes, receive verified corridor hazard alerts, and report obstructions.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleRoleSelect('passenger')}
              className="w-full py-2.5 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Sign In as Passenger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="text-center">
              <button
                onClick={() => navigate('/register?role=passenger')}
                className="text-[11px] text-[#1769AA] hover:text-[#1B7DC8] font-semibold"
              >
                Create citizen account →
              </button>
            </div>
          </div>
        </div>

        {/* 2. Employer Card */}
        <div className="p-6 rounded-lg bg-[#101D2B] border border-[#1B2A3B] hover:border-[#1769AA] shadow-sm space-y-5 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#1769AA]/15 text-[#1769AA] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Workforce Transit</span>
              <h2 className="text-lg font-bold text-white mt-0.5">Employer</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitor consented employee corridor delays, verify traffic disruption credentials, and reduce attendance disputes.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleRoleSelect('employer')}
              className="w-full py-2.5 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Sign In as Employer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="text-center">
              <button
                onClick={() => navigate('/register?role=employer')}
                className="text-[11px] text-[#1769AA] hover:text-[#1B7DC8] font-semibold"
              >
                Register organization →
              </button>
            </div>
          </div>
        </div>

        {/* 3. Traffic Authority Card */}
        <div className="p-6 rounded-lg bg-[#101D2B] border border-[#1B2A3B] hover:border-[#F0A629] shadow-sm space-y-5 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#F0A629]/15 text-[#F0A629] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#F0A629]">Command Desk</span>
              <h2 className="text-lg font-bold text-white mt-0.5">Traffic Authority</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time incident response, corridor congestion management, sensor telemetry analytics, and dispatch controls.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleRoleSelect('authority')}
              className="w-full py-2.5 bg-[#142436] hover:bg-[#1B2A3B] text-white font-bold text-xs rounded-lg border border-[#1B2A3B] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Official Department Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="text-center">
              <button
                onClick={() => navigate('/register?role=authority')}
                className="text-[11px] text-slate-400 hover:text-white font-semibold"
              >
                Register departmental agency →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
