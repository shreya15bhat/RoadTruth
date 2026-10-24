import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  AlertTriangle, 
  Lightbulb
} from 'lucide-react';
import { AUTHORITY_HOTSPOTS } from '../../data/mockData';
import api from '../../services/api';

export default function AuthorityHotspotInspector({ onSelectHotspot = null }) {
  const [hotspotsList, setHotspotsList] = useState(AUTHORITY_HOTSPOTS);
  const [selectedHotspot, setSelectedHotspot] = useState(AUTHORITY_HOTSPOTS[0]);
  const [auditFilter, setAuditFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    async function loadBackendHotspots() {
      try {
        const res = await api.getHotspots({ min_count: 1 });
        if (isMounted && res && res.hotspots && res.hotspots.length > 0) {
          const formatted = res.hotspots.map((h, i) => {
            const sev = h.severity_level === 'high' ? 'Critical' : (h.severity_level === 'medium' ? 'High' : 'Moderate');
            const primaryTypes = Object.keys(h.incident_types || {});
            const primaryCauses = primaryTypes.length > 0 
              ? primaryTypes.map(t => `${t.replace('_', ' ').toUpperCase()} congestion concentration`)
              : ['Vehicle merge conflicts', 'Inadequate arterial discharge capacity', 'Signal cycle stall'];
            return {
              id: `hotspot-live-${i + 1}`,
              name: h.sample_locations?.[0] || `Spatial Cluster Node (${h.grid_cell})`,
              roadStretch: h.sample_locations?.join(' · ') || `Grid Cell ${h.grid_cell}`,
              lat: h.center_latitude,
              lng: h.center_longitude,
              severityIndex: sev,
              recurrenceRate: `${Math.min(96, 65 + h.incident_count * 6)}% Recurrence`,
              totalIncidentsRecorded: h.incident_count,
              avgDelayMin: Math.round(10 + h.incident_count * 3),
              peakHours: '08:30 – 10:15 AM & 17:30 – 19:45 PM',
              primaryCauses,
              aiRecommendations: [
                `Optimize signal timings based on ${h.incident_count} recorded incident clusters`,
                `Deploy auxiliary traffic wardens during morning and evening rush hours`,
                `Evaluate lane channeling and bottleneck bypass corridors`
              ],
              lastAuditDate: 'Live Telemetry'
            };
          });
          setHotspotsList(formatted);
          setSelectedHotspot(formatted[0]);
        }
      } catch {
        // Fallback to static hotspots
      }
    }
    loadBackendHotspots();
    return () => { isMounted = false; };
  }, []);

  const filteredHotspots = hotspotsList.filter(h => {
    if (auditFilter === 'critical') return h.severityIndex === 'Critical';
    if (auditFilter === 'high') return h.severityIndex === 'High';
    return true;
  });

  const handleChoose = (h) => {
    setSelectedHotspot(h);
    if (onSelectHotspot) onSelectHotspot(h);
  };

  return (
    <div className="space-y-6">
      {/* Hotspots Master Grid & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Hotspot List Selection */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Identified Recurring Bottleneck Nodes
            </span>
            <div className="flex gap-1 text-[10px]">
              <button
                onClick={() => setAuditFilter('all')}
                className={`px-2 py-0.5 rounded font-semibold ${auditFilter === 'all' ? 'bg-[#1769AA] text-white' : 'bg-[#142436] text-slate-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setAuditFilter('critical')}
                className={`px-2 py-0.5 rounded font-semibold ${auditFilter === 'critical' ? 'bg-[#E5484D] text-white' : 'bg-[#142436] text-slate-400'}`}
              >
                Critical
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredHotspots.map((h) => {
              const isSelected = selectedHotspot?.id === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => handleChoose(h)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#142436] border-[#1769AA] ring-1 ring-[#1769AA]/40 shadow-sm'
                      : 'bg-[#101D2B] border-[#1B2A3B] hover:border-[#2E4763]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      h.severityIndex === 'Critical' ? 'bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/30' : 'bg-[#F0A629]/20 text-[#F0A629] border border-[#F0A629]/30'
                    }`}>
                      {h.severityIndex} Priority
                    </span>
                    <span className="text-[11px] font-mono text-[#1769AA] font-bold">
                      {h.recurrenceRate}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white mt-2">{h.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{h.roadStretch}</p>

                  <div className="mt-3 pt-2 border-t border-[#1B2A3B] flex items-center justify-between text-[11px] text-slate-400">
                    <span>{h.totalIncidentsRecorded} reports recorded</span>
                    <span className="text-[#F0A629] font-semibold font-mono">Avg delay: +{h.avgDelayMin}m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Hotspot Forensic Report Card */}
        <div className="lg:col-span-7 bg-[#101D2B] border border-[#1B2A3B] rounded-lg p-6 shadow-sm space-y-6">
          {selectedHotspot ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1B2A3B]">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-[#1769AA]">
                    Municipal Traffic Audit Dossier
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedHotspot.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1769AA] shrink-0" />
                    <span>{selectedHotspot.roadStretch} • Coordinates: [{selectedHotspot.lat}, {selectedHotspot.lng}]</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 bg-[#142436] text-[#1769AA] border border-[#1769AA]/40 rounded text-xs font-semibold font-mono">
                    Hotspot #{selectedHotspot.id.replace('hotspot-', '')}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">Last Audit: {selectedHotspot.lastAuditDate}</div>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#142436] rounded-lg border border-[#1B2A3B]">
                  <span className="text-[#64748B] text-[10px] uppercase font-bold block">Recorded Incidents</span>
                  <span className="text-base font-bold text-white font-mono mt-1 block">
                    {selectedHotspot.totalIncidentsRecorded}
                  </span>
                </div>

                <div className="p-3 bg-[#142436] rounded-lg border border-[#1B2A3B]">
                  <span className="text-[#64748B] text-[10px] uppercase font-bold block">Recurrence Rate</span>
                  <span className="text-base font-bold text-[#F0A629] font-mono mt-1 block">
                    {selectedHotspot.recurrenceRate.split(' ')[0]}
                  </span>
                </div>

                <div className="p-3 bg-[#142436] rounded-lg border border-[#1B2A3B]">
                  <span className="text-[#64748B] text-[10px] uppercase font-bold block">Avg Corridor Delay</span>
                  <span className="text-base font-bold text-[#E5484D] font-mono mt-1 block">
                    +{selectedHotspot.avgDelayMin}m
                  </span>
                </div>

                <div className="p-3 bg-[#142436] rounded-lg border border-[#1B2A3B]">
                  <span className="text-[#64748B] text-[10px] uppercase font-bold block">Peak Gridlock</span>
                  <span className="text-xs font-bold text-[#1769AA] font-mono mt-2 block truncate">
                    {selectedHotspot.peakHours.split('&')[0]}
                  </span>
                </div>
              </div>

              {/* Root Causes Analysis */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#F0A629]" />
                  <span>Primary Structural Bottleneck Causes</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedHotspot.primaryCauses.map((cause, idx) => (
                    <div key={idx} className="p-3 bg-[#142436] border border-[#1B2A3B] rounded-lg text-xs text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-[#101D2B] text-[#1769AA] font-bold inline-flex items-center justify-center text-[10px] mr-1.5">
                        {idx + 1}
                      </span>
                      {cause}
                    </div>
                  ))}
                </div>
              </div>

              {/* Engineering Recommendations */}
              <div className="p-4 bg-[#142436] border border-[#1769AA]/30 rounded-lg space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#1769AA] font-bold">
                    <Lightbulb className="w-4 h-4 text-[#1769AA]" />
                    <span>Signal Optimization & Engineering Advisory</span>
                  </div>
                  <span className="text-[10px] text-slate-400">TOC Decision Support</span>
                </div>

                <ul className="space-y-2 text-slate-200">
                  {selectedHotspot.aiRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-[#1769AA] mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-2.5 bg-[#101D2B] rounded text-[11px] text-slate-400 border border-[#1B2A3B]">
                  *Official Notice: Engineering suggestions are advisory decision-support models intended to guide traffic planning officers. Physical civil engineering assessments required prior to corridor modifications.
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Select a bottleneck hotspot to inspect telemetry dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
