import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteWise } from '../../context/RouteWiseContext';
import { computeEmployeeMetrics } from '../../utils/calculations';
import TrafficMap from '../../components/maps/TrafficMap';
import DelayCertificateModal from '../../components/employer/DelayCertificateModal';
import EmployeeModal from '../../components/employer/EmployeeModal';
import { 
  Plus, 
  Users, 
  Car, 
  Clock, 
  ShieldCheck, 
  X, 
  FileText, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function EmployerOverview() {
  const navigate = useNavigate();
  const { employees, incidents, routes } = useRouteWise();

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedCertEmp, setSelectedCertEmp] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const metrics = computeEmployeeMetrics(employees);

  if (!employees.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#1B2A3B] pb-4">
          <div>
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              Workforce Mobility Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Workforce Commute Overview
            </h1>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded-lg transition-colors"
          >
            + Add Employee
          </button>
        </div>

        <div className="p-12 bg-[#101D2B] border border-[#1B2A3B] rounded-lg text-center space-y-3">
          <div className="w-12 h-12 rounded-lg bg-[#142436] text-[#64748B] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No personnel roster active</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Enroll consented employees or import transit rosters to monitor commute disruption.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded-lg transition-colors"
            >
              Add First Employee
            </button>
          </div>
        </div>

        <EmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1B2A3B] pb-4">
        <div>
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Workforce Mobility & Transit Verification
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Personnel Commute Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit corridor disruptions and issue verifiable delay credentials</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* 2. Four Operational Metrics Only */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg">
          <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">Enrolled Staff</span>
          <span className="text-2xl font-bold text-white font-mono block mt-1">{metrics.total}</span>
        </div>
        <div className="p-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg">
          <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">In Transit</span>
          <span className="text-2xl font-bold text-[#1769AA] font-mono block mt-1">{metrics.activeTraveling}</span>
        </div>
        <div className="p-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg">
          <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">Corridor Delayed</span>
          <span className="text-2xl font-bold text-[#F0A629] font-mono block mt-1">{metrics.delayed}</span>
        </div>
        <div className="p-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg">
          <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">Verified Certificates</span>
          <span className="text-2xl font-bold text-[#23966B] font-mono block mt-1">{metrics.verifiedDelays}</span>
        </div>
      </div>

      {/* 3. Employee Commute Table */}
      <div className="bg-[#101D2B] border border-[#1B2A3B] rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#1B2A3B] flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Consented Employee Commute Grid
          </h2>
          <button
            onClick={() => navigate('/employer/employees')}
            className="text-xs text-[#1769AA] hover:text-[#1B7DC8] font-semibold flex items-center gap-1"
          >
            <span>Full roster</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#142436] text-[#64748B] text-[11px] uppercase border-b border-[#1B2A3B]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Employee</th>
                <th className="py-2.5 px-4 font-semibold">Assigned Corridor</th>
                <th className="py-2.5 px-4 font-semibold">Journey Status</th>
                <th className="py-2.5 px-4 font-semibold">Corridor Delay</th>
                <th className="py-2.5 px-4 font-semibold text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2A3B] text-slate-300">
              {employees.slice(0, 6).map((emp) => (
                <tr 
                  key={emp.id} 
                  onClick={() => setSelectedEmployee(emp)}
                  className="hover:bg-[#142436]/60 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-white">
                    {emp.name}
                    <span className="block text-[11px] text-slate-500 font-mono">{emp.id}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{emp.route}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      emp.journeyStatus === 'delayed'
                        ? 'bg-[#F0A629]/20 text-[#F0A629] border border-[#F0A629]/30'
                        : 'bg-[#23966B]/20 text-[#23966B] border border-[#23966B]/30'
                    }`}>
                      {emp.journeyStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium">
                    {emp.estimatedDelayMin > 0 ? (
                      <span className="text-[#F0A629]">+{emp.estimatedDelayMin}m</span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {emp.estimatedDelayMin > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCertEmp(emp);
                        }}
                        className="px-2.5 py-1 bg-[#1769AA]/15 text-[#1769AA] hover:bg-[#1769AA]/25 border border-[#1769AA]/40 rounded text-[11px] font-semibold transition-colors"
                      >
                        Proof Certificate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Commute Map & Recent Delays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Map */}
        <div className="lg:col-span-8 space-y-2">
          <div className="rounded-lg overflow-hidden border border-[#1B2A3B] bg-[#101D2B]">
            <div className="px-4 py-2.5 bg-[#142436] border-b border-[#1B2A3B] flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Workforce Corridor Spatial Monitoring</span>
              <span className="text-[11px] text-[#64748B] font-mono">Coastal Belt Hub</span>
            </div>
            <TrafficMap
              incidents={incidents}
              selectedRoute={routes[0]}
              height="h-[360px]"
            />
          </div>
        </div>

        {/* Recent Delays List */}
        <div className="lg:col-span-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg p-4 space-y-3">
          <div className="border-b border-[#1B2A3B] pb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Recent Disrupted Commutes
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {employees.filter(e => e.estimatedDelayMin > 0).slice(0, 4).map((e) => (
              <div 
                key={e.id}
                onClick={() => setSelectedEmployee(e)}
                className="p-3 bg-[#142436] rounded-lg border border-[#1B2A3B] hover:border-[#2E4763] cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{e.name}</span>
                  <span className="text-[#F0A629] font-mono font-bold">+{e.estimatedDelayMin}m</span>
                </div>
                <div className="text-[11px] text-slate-400">{e.route}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. EMPLOYEE DETAILS SIDE PANEL */}
      {selectedEmployee && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#101D2B] border-l border-[#1B2A3B] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between text-slate-100">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#1B2A3B] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Staff Record</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedEmployee.name}</h3>
                <span className="text-xs text-slate-400 font-mono">{selectedEmployee.id} · {selectedEmployee.department}</span>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#142436] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#142436] border border-[#1B2A3B] rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Transit Corridor</span>
                  <span className="font-semibold text-slate-200">{selectedEmployee.route}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Journey Status</span>
                  <span className="capitalize font-semibold text-slate-200">{selectedEmployee.journeyStatus.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Arrival</span>
                  <span className="font-mono font-semibold text-slate-200">{selectedEmployee.estimatedArrival || '09:00 AM'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Corridor Delay</span>
                  <span className="font-mono font-bold text-[#F0A629]">
                    {selectedEmployee.estimatedDelayMin > 0 ? `+${selectedEmployee.estimatedDelayMin} min` : 'On time'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Consent State</span>
                  <span className="text-[#23966B] font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Active Consented
                  </span>
                </div>
              </div>

              {/* Related Incident & Verification */}
              {selectedEmployee.incidentAffected && selectedEmployee.incidentAffected !== 'None (Clear Corridor)' && (
                <div className="p-3 bg-[#142436] border border-[#1B2A3B] rounded-lg space-y-1.5">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold">Corridor Obstruction</span>
                  <div className="font-semibold text-slate-200">{selectedEmployee.incidentAffected}</div>
                  <div className="text-[11px] text-[#1769AA] flex items-center gap-1 pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{selectedEmployee.verificationStatus || 'Verified Telemetry Proof'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="pt-4 border-t border-[#1B2A3B]">
            {selectedEmployee.estimatedDelayMin > 0 ? (
              <button
                onClick={() => {
                  setSelectedCertEmp(selectedEmployee);
                }}
                className="w-full py-2.5 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Issue Delay Certificate</span>
              </button>
            ) : (
              <button
                onClick={() => setSelectedEmployee(null)}
                className="w-full py-2 bg-[#142436] text-slate-300 font-semibold text-xs rounded-lg border border-[#1B2A3B]"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delay Certificate Modal */}
      {selectedCertEmp && (
        <DelayCertificateModal
          employee={selectedCertEmp}
          onClose={() => setSelectedCertEmp(null)}
        />
      )}

      {/* Add Employee Modal */}
      <EmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

    </div>
  );
}
