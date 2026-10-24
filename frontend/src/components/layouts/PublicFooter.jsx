import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="border-t border-[#1B2A3B] bg-[#0A1118] text-[#64748B] text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#1769AA] flex items-center justify-center text-white">
                <Navigation className="w-3.5 h-3.5 fill-white rotate-45" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                ROADTRUTH
              </span>
            </div>
            <p className="text-[#94A3B8] text-xs leading-relaxed max-w-sm">
              Urban traffic telemetry and incident verification infrastructure. Built to provide city transportation departments and travelers with verified corridor intelligence.
            </p>
            <div className="text-[11px] font-mono text-[#64748B]">
              Coastal Karnataka Regional Traffic Management Protocol
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-[#E2E8F0] uppercase tracking-wider text-[11px] font-mono">Operations Portals</h4>
            <ul className="space-y-2 text-[#94A3B8]">
              <li><Link to="/select-role" className="hover:text-[#5C7EAA] transition-colors">Workspace Selector</Link></li>
              <li><Link to="/passenger" className="hover:text-[#5C7EAA] transition-colors">Passenger & Commuter Console</Link></li>
              <li><Link to="/employer" className="hover:text-[#5C7EAA] transition-colors">Employer Commute Portal</Link></li>
              <li><Link to="/authority" className="hover:text-[#5C7EAA] transition-colors">Traffic Management Operations</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-[#E2E8F0] uppercase tracking-wider text-[11px] font-mono">Platform Reference</h4>
            <ul className="space-y-2 text-[#94A3B8]">
              <li><Link to="/about" className="hover:text-[#5C7EAA] transition-colors">System Architecture</Link></li>
              <li><Link to="/help" className="hover:text-[#5C7EAA] transition-colors">Field Documentation</Link></li>
              <li><Link to="/login" className="hover:text-[#5C7EAA] transition-colors">Authorized Personnel Sign In</Link></li>
              <li><Link to="/register" className="hover:text-[#5C7EAA] transition-colors">Register Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#142436] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#64748B]">
          <div>© 2026 ROADTRUTH Municipal Mobility & Traffic Management.</div>
          <div className="flex gap-4">
            <Link to="/help" className="hover:text-slate-300">Data Governance</Link>
            <Link to="/help" className="hover:text-slate-300">Telemetry SLA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
