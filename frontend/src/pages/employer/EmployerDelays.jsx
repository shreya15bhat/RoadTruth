import React, { useState } from 'react';
import { useRouteWise } from '../../context/RouteWiseContext';
import DelayCertificateModal from '../../components/employer/DelayCertificateModal';
import { ShieldCheck, FileText } from 'lucide-react';

export default function EmployerDelays() {
  const { employees } = useRouteWise();
  const [selectedEmp, setSelectedEmp] = useState(null);

  const delayedEmployees = employees.filter(e => (Number(e.estimatedDelayMin) || 0) > 0);

  if (!delayedEmployees.length) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#1B2A3B] pb-4">
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Workforce Mobility Records
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Verified Transit Delays
          </h1>
          <p className="text-xs text-slate-400 mt-1">Verified commute delay certificates and automated attendance waivers</p>
        </div>

        <div className="p-12 bg-[#101D2B] border border-[#1B2A3B] rounded-lg text-center text-xs text-slate-400">
          <p className="text-white font-bold text-sm">No commute disruptions recorded</p>
          <p className="mt-1">All monitored employees are traveling on schedule without arterial delays.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#1B2A3B] pb-4">
        <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
          Workforce Mobility Records
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
          Verified Transit Delays
        </h1>
        <p className="text-xs text-slate-400 mt-1">Verified commute delay certificates and automated attendance waivers</p>
      </div>

      <div className="bg-[#101D2B] border border-[#1B2A3B] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#142436] text-[#64748B] text-[11px] uppercase border-b border-[#1B2A3B]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Employee</th>
                <th className="py-2.5 px-4 font-semibold">Commute Route</th>
                <th className="py-2.5 px-4 font-semibold">Delay Impact</th>
                <th className="py-2.5 px-4 font-semibold">Verification Proof</th>
                <th className="py-2.5 px-4 font-semibold text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2A3B] text-slate-300">
              {delayedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#142436]/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    {emp.name}
                    <span className="block text-[11px] text-slate-500 font-mono">{emp.id} · {emp.department}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{emp.route}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#F0A629]">
                    +{emp.estimatedDelayMin} min
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[#1769AA] font-semibold flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{emp.verificationStatus || 'Verified Telemetry'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedEmp(emp)}
                      className="px-3 py-1.5 bg-[#1769AA]/15 hover:bg-[#1769AA]/25 text-[#1769AA] border border-[#1769AA]/40 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Certificate</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
