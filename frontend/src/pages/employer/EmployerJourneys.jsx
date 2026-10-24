import React, { useState } from 'react';
import { useRouteWise } from '../../context/RouteWiseContext';
import TrafficMap from '../../components/maps/TrafficMap';
import DelayCertificateModal from '../../components/employer/DelayCertificateModal';

export default function EmployerJourneys() {
  const { employees, incidents, routes } = useRouteWise();
  const [selectedEmp, setSelectedEmp] = useState(null);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#1B2A3B] pb-4">
        <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
          Live Workforce Telemetry
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
          Active Personnel Commutes
        </h1>
        <p className="text-xs text-slate-400 mt-1">Live corridor transit tracking and ETA estimation for staff on the road</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 8 Cols: Map */}
        <div className="lg:col-span-8 space-y-2">
          <div className="rounded-lg overflow-hidden border border-[#1B2A3B] bg-[#101D2B]">
            <div className="px-4 py-2.5 bg-[#142436] border-b border-[#1B2A3B] flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Workforce Transit Geometry</span>
              <span className="text-[11px] text-[#64748B] font-mono">{employees.length} Consented Staff</span>
            </div>
            <TrafficMap
              incidents={incidents}
              selectedRoute={routes[0]}
              height="h-[440px] lg:h-[500px]"
            />
          </div>
        </div>

        {/* Right 4 Cols: Active Commuter List */}
        <div className="lg:col-span-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1B2A3B]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Active Commutes ({employees.length})
            </h2>
            <span className="text-[10px] text-[#23966B] font-mono font-bold">Consented</span>
          </div>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1 text-xs">
            {employees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => {
                  if (emp.estimatedDelayMin > 0) setSelectedEmp(emp);
                }}
                className={`p-3 rounded-lg border transition-all ${
                  emp.estimatedDelayMin > 0
                    ? 'bg-[#142436] border-[#F0A629]/40 hover:border-[#F0A629] cursor-pointer'
                    : 'bg-[#142436] border-[#1B2A3B]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-slate-100">{emp.name}</div>
                    <div className="text-[11px] text-slate-400">{emp.route}</div>
                  </div>
                  <div className="text-right">
                    {emp.estimatedDelayMin > 0 ? (
                      <span className="text-xs font-mono font-bold text-[#F0A629] block">
                        +{emp.estimatedDelayMin}m
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#23966B] font-semibold block">
                        On Time
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                      ETA {emp.estimatedArrival || '09:00 AM'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedEmp && (
        <DelayCertificateModal
          employee={selectedEmp}
          onClose={() => setSelectedEmp(null)}
        />
      )}
    </div>
  );
}
