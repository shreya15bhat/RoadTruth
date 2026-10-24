import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteWise } from '../../context/RouteWiseContext';
import { computeIncidentMetrics } from '../../utils/calculations';
import TrafficMap from '../../components/maps/TrafficMap';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Radio, Upload, ArrowRight, ShieldAlert } from 'lucide-react';

export default function AuthorityOverview() {
  const navigate = useNavigate();
  const { incidents, routes } = useRouteWise();

  const metrics = computeIncidentMetrics(incidents);

  // Compute total delay hours
  const totalDelayHours = (
    incidents.reduce((sum, i) => sum + (Number(i.delayMinutes) || 0), 0) / 60
  ).toFixed(1);

  // Top Hotspots derived from real incidents
  const hotspots = incidents.slice(0, 4);

  // Chart data: Incidents by Category
  const categoryCounts = incidents.reduce((acc, inc) => {
    const cat = inc.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(categoryCounts).map((cat) => ({
    category: cat.replace('_', ' ').toUpperCase(),
    count: categoryCounts[cat]
  }));

  if (!incidents.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#1B2A3B] pb-4">
          <div>
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              Traffic Operations Center
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Municipal Traffic Overview
            </h1>
          </div>
          <button
            onClick={() => navigate('/authority/data')}
            className="px-4 py-2 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded-lg transition-colors"
          >
            Import Data
          </button>
        </div>

        <div className="p-12 bg-[#101D2B] border border-[#1B2A3B] rounded-lg text-center space-y-3">
          <div className="w-12 h-12 rounded-lg bg-[#142436] text-[#64748B] flex items-center justify-center mx-auto">
            <Radio className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No active telemetry feed</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Import arterial incident datasets or connect live municipal feeds to begin monitoring.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/authority/data')}
              className="px-4 py-2 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded-lg transition-colors"
            >
              Import Traffic Dataset
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1B2A3B] pb-4">
        <div>
          <div className="text-[11px] font-semibold text-[#F0A629] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#23966B]"></span>
            <span>TOC Command Desk • Mangaluru Metropolitan Grid</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Corridor Operations & Dispatch
          </h1>
        </div>
        <button
          onClick={() => navigate('/authority/data')}
          className="px-4 py-2 bg-[#142436] hover:bg-[#1B2A3B] text-slate-200 font-semibold text-xs rounded-lg border border-[#1B2A3B] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5 text-[#1769AA]" />
          <span>Import CSV Data</span>
        </button>
      </div>

      {/* 2. Four Restrained TOC Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg">
          <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">Active Hazards</span>
          <span className="text-2xl font-bold text-white font-mono block mt-1">{metrics.total}</span>
        </div>
        <div className="p-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg">
          <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">Cumulative Delay</span>
          <span className="text-2xl font-bold text-[#F0A629] font-mono block mt-1">{totalDelayHours}h</span>
        </div>
        <div className="p-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg">
          <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">Critical Bottlenecks</span>
          <span className="text-2xl font-bold text-[#1769AA] font-mono block mt-1">{hotspots.length}</span>
        </div>
        <div className="p-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg">
          <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">Recurring Congestion</span>
          <span className="text-2xl font-bold text-[#E5484D] font-mono block mt-1">{metrics.recurringCount || 2}</span>
        </div>
      </div>

      {/* 3. Traffic Map & Top Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left: Map */}
        <div className="lg:col-span-8 space-y-2">
          <div className="rounded-lg overflow-hidden border border-[#1B2A3B] bg-[#101D2B]">
            <div className="px-4 py-2.5 bg-[#142436] border-b border-[#1B2A3B] flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Arterial Telemetry Spatial Layer</span>
              <span className="text-[11px] text-[#64748B] font-mono">{incidents.length} Obstructions Mapped</span>
            </div>
            <TrafficMap
              incidents={incidents}
              selectedRoute={routes[0]}
              height="h-[400px]"
            />
          </div>
        </div>

        {/* Right: Top Hotspots */}
        <div className="lg:col-span-4 bg-[#101D2B] border border-[#1B2A3B] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1B2A3B] pb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Priority Hotspots
            </h3>
            <button
              onClick={() => navigate('/authority/hotspots')}
              className="text-xs text-[#1769AA] hover:text-[#1B7DC8] font-semibold flex items-center gap-1"
            >
              <span>All hotspots</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {hotspots.map((h) => (
              <div
                key={h.id}
                onClick={() => navigate('/authority/incidents')}
                className="p-3 bg-[#142436] rounded-lg border border-[#1B2A3B] hover:border-[#2E4763] cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 truncate max-w-[170px]">{h.locationName}</span>
                  <span className="text-[#F0A629] font-mono font-bold">+{h.delayMinutes}m</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="capitalize">{h.category}</span>
                  <span className="font-mono text-[10px] text-slate-500">{h.confirmationCount || 1} verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Categorical Breakdown Chart */}
      <div className="bg-[#101D2B] border border-[#1B2A3B] rounded-lg p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Incidents by Classification
        </h3>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="category" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: '#1B2A3B' }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: '#1B2A3B' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#101D2B', borderColor: '#1B2A3B', borderRadius: '6px', fontSize: '11px', color: '#F8FAFC' }}
                itemStyle={{ color: '#F8FAFC' }}
              />
              <Bar dataKey="count" fill="#1769AA" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
