import React from 'react';
import { useRouteWise } from '../../context/RouteWiseContext';
import { CheckCircle2, Trash2 } from 'lucide-react';

export default function AuthorityIncidents() {
  const { incidents, resolveIncident, deleteIncident } = useRouteWise();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1B2A3B] pb-4">
        <div>
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Operational Dispatch Queue
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Active Arterial Incidents
          </h1>
          <p className="text-xs text-slate-400 mt-1">Live municipal incident response and corridor clearance status</p>
        </div>
        <span className="text-xs font-mono text-[#1769AA] bg-[#1769AA]/15 px-2.5 py-1 rounded border border-[#1769AA]/30 font-bold">
          {incidents.length} Logged
        </span>
      </div>

      {incidents.length === 0 ? (
        <div className="p-12 bg-[#101D2B] border border-[#1B2A3B] rounded-lg text-center text-xs text-slate-400">
          <p className="text-white font-bold text-sm">No incidents in dispatch queue</p>
          <p className="mt-1">All arterial corridors in this sector report normal, obstruction-free transit.</p>
        </div>
      ) : (
        <div className="bg-[#101D2B] border border-[#1B2A3B] rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#142436] text-[#64748B] text-[11px] uppercase border-b border-[#1B2A3B]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Incident Record</th>
                  <th className="py-2.5 px-4 font-semibold">Corridor Location</th>
                  <th className="py-2.5 px-4 font-semibold">Severity</th>
                  <th className="py-2.5 px-4 font-semibold">Delay Impact</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B2A3B] text-slate-300">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-[#142436]/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {inc.title || inc.category}
                      <span className="block text-[11px] text-slate-500 capitalize">{inc.category} · {inc.reportedAgo || 'Recent'}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{inc.locationName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        inc.severity === 'severe' || inc.severity === 'critical'
                          ? 'bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/30'
                          : inc.severity === 'moderate'
                          ? 'bg-[#F0A629]/20 text-[#F0A629] border border-[#F0A629]/30'
                          : 'bg-[#23966B]/20 text-[#23966B] border border-[#23966B]/30'
                      }`}>
                        {inc.severity || 'Moderate'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[#F0A629]">
                      +{inc.delayMinutes || 15}m
                    </td>
                    <td className="py-3 px-4">
                      {inc.status === 'cleared' ? (
                        <span className="text-[#23966B] font-semibold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                        </span>
                      ) : (
                        <span className="text-[#F0A629] font-semibold text-[11px]">Active</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inc.status !== 'cleared' && (
                          <button
                            onClick={() => resolveIncident(inc.id)}
                            className="px-2.5 py-1 bg-[#23966B]/20 hover:bg-[#23966B]/30 text-[#23966B] border border-[#23966B]/40 rounded text-xs font-semibold transition-colors"
                          >
                            Mark Cleared
                          </button>
                        )}
                        <button
                          onClick={() => deleteIncident(inc.id)}
                          className="p-1 text-slate-500 hover:text-[#E5484D] transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
