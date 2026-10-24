import React, { useState } from 'react';
import { useRouteWise } from '../../context/RouteWiseContext';
import { 
  Bell, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  SlidersHorizontal
} from 'lucide-react';

export default function TrafficAlertsList({ onSelectIncident = () => {} }) {
  const { 
    incidents, 
    notificationPreferences, 
    updateNotificationPreference, 
    showToast 
  } = useRouteWise();

  const [dismissedIds, setDismissedIds] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [showPrefsModal, setShowPrefsModal] = useState(false);

  const activeAlerts = incidents.filter(i => {
    if (dismissedIds.includes(i.id)) return false;
    if (filterType !== 'all' && i.category !== filterType) return false;
    return true;
  });

  const handleDismiss = (id, e) => {
    e.stopPropagation();
    setDismissedIds(prev => [...prev, id]);
    showToast('Alert Dismissed', '', 'info');
  };

  return (
    <div className="bg-[#101D2B] border border-[#1B2A3B] rounded-lg p-5 text-slate-100 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1B2A3B]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#E5484D]/15 text-[#E5484D]">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Live Roadway Alerts</h4>
            <p className="text-[11px] text-slate-400">{activeAlerts.length} verified corridor notices</p>
          </div>
        </div>

        <button
          onClick={() => setShowPrefsModal(!showPrefsModal)}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#142436] border border-[#1B2A3B] transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Notification Preferences"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preferences</span>
        </button>
      </div>

      {/* Notification Preferences Modal / Accordion */}
      {showPrefsModal && (
        <div className="p-4 bg-[#142436] border border-[#1B2A3B] rounded-lg space-y-3 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-200">
            <span>Corridor Alert Preferences</span>
            <button onClick={() => setShowPrefsModal(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#101D2B] rounded border border-[#1B2A3B]">
              <input
                type="checkbox"
                checked={notificationPreferences.trafficJams}
                onChange={(e) => updateNotificationPreference('trafficJams', e.target.checked)}
                className="accent-[#1769AA]"
              />
              <span>Traffic Jams (&gt; 15m delay)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#101D2B] rounded border border-[#1B2A3B]">
              <input
                type="checkbox"
                checked={notificationPreferences.accidents}
                onChange={(e) => updateNotificationPreference('accidents', e.target.checked)}
                className="accent-[#1769AA]"
              />
              <span>Accidents & Collisions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#101D2B] rounded border border-[#1B2A3B]">
              <input
                type="checkbox"
                checked={notificationPreferences.flooding}
                onChange={(e) => updateNotificationPreference('flooding', e.target.checked)}
                className="accent-[#1769AA]"
              />
              <span>Flooding & Waterlogging</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#101D2B] rounded border border-[#1B2A3B]">
              <input
                type="checkbox"
                checked={notificationPreferences.roadClosures}
                onChange={(e) => updateNotificationPreference('roadClosures', e.target.checked)}
                className="accent-[#1769AA]"
              />
              <span>Road Closures / Diversions</span>
            </label>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded font-semibold shrink-0 transition-colors ${
            filterType === 'all' ? 'bg-[#1769AA] text-white' : 'bg-[#142436] text-slate-400 hover:text-white'
          }`}
        >
          All ({incidents.length})
        </button>
        <button
          onClick={() => setFilterType('accident')}
          className={`px-3 py-1 rounded font-semibold shrink-0 transition-colors ${
            filterType === 'accident' ? 'bg-[#E5484D] text-white' : 'bg-[#142436] text-slate-400 hover:text-white'
          }`}
        >
          Accidents
        </button>
        <button
          onClick={() => setFilterType('flooding')}
          className={`px-3 py-1 rounded font-semibold shrink-0 transition-colors ${
            filterType === 'flooding' ? 'bg-[#1769AA] text-white' : 'bg-[#142436] text-slate-400 hover:text-white'
          }`}
        >
          Flooding
        </button>
        <button
          onClick={() => setFilterType('road_repair')}
          className={`px-3 py-1 rounded font-semibold shrink-0 transition-colors ${
            filterType === 'road_repair' ? 'bg-[#F0A629] text-[#101D2B]' : 'bg-[#142436] text-slate-400 hover:text-white'
          }`}
        >
          Repairs
        </button>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {activeAlerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-[#142436] rounded-lg">
            No alerts matching current filters. Corridors clear.
          </div>
        ) : (
          activeAlerts.map((incident) => {
            const isSevere = incident.severity === 'critical' || incident.severity === 'severe';
            const isModerate = incident.severity === 'moderate';

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isSevere 
                    ? 'bg-[#142436] border-[#E5484D]/40 hover:border-[#E5484D]' 
                    : 'bg-[#142436] border-[#1B2A3B] hover:border-[#2E4763]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isSevere ? 'bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/40' : isModerate ? 'bg-[#F0A629]/20 text-[#F0A629] border border-[#F0A629]/40' : 'bg-[#23966B]/20 text-[#23966B] border border-[#23966B]/40'
                    }`}>
                      {incident.category.toUpperCase().replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">• {incident.reportedAgo}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-[#F0A629]">
                      +{incident.delayMinutes}m delay
                    </span>
                    <button
                      onClick={(e) => handleDismiss(incident.id, e)}
                      className="p-1 text-slate-500 hover:text-white rounded"
                      title="Dismiss alert"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-xs text-white mt-1.5">{incident.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#1769AA] shrink-0" />
                  <span>{incident.locationName}</span>
                </p>

                {/* Footer Badges */}
                <div className="mt-2.5 pt-2 border-t border-[#1B2A3B] flex items-center justify-between text-[10px]">
                  <span className="text-[#1769AA] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Level {incident.verificationLevel} (Confidence {incident.trustScore}%)</span>
                  </span>

                  <span className="text-slate-400 flex items-center gap-1 hover:text-white">
                    <span>Inspect details</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
