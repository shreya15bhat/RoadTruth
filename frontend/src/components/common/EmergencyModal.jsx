import React, { useState } from 'react';
import { useRouteWise } from '../../context/RouteWiseContext';
import { AlertOctagon, PhoneCall, X, AlertTriangle, Users, CheckCircle, Plus, Trash2 } from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose }) {
  const context = useRouteWise() || {};
  const { 
    sosActive = false,
    sosState = { isActive: false }, 
    triggerSOS = () => {}, 
    cancelSOS = () => {}, 
    emergencyContacts = [], 
    addEmergencyContact = () => {}, 
    deleteEmergencyContact = () => {} 
  } = context;

  const isSosActive = Boolean(sosState?.isActive || sosActive);

  const [confirmStep, setConfirmStep] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen && !isSosActive) return null;

  const handleStartSOS = () => {
    setConfirmStep(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          triggerSOS({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            location_name: `Emergency Beacon (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
          });
        },
        () => {
          triggerSOS();
        },
        { timeout: 4000 }
      );
    } else {
      triggerSOS();
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    addEmergencyContact({
      name: newContactName,
      phone: newContactPhone,
      relation: newContactRelation || 'Emergency Contact'
    });
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1118]/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#101D2B] border border-[#1B2A3B] rounded-lg shadow-2xl overflow-hidden p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1B2A3B]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${isSosActive ? 'bg-[#E5484D]/20 text-[#E5484D] animate-pulse' : 'bg-[#E5484D]/10 text-[#E5484D]'}`}>
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ROADTRUTH Emergency SOS</h3>
              <p className="text-xs text-slate-400">Incident and traveler safety protocol</p>
            </div>
          </div>
          {!isSosActive && (
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#142436] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-4 p-3 bg-[#142436] border border-[#E5484D]/30 rounded-lg text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#E5484D] mt-0.5" />
          <span>
            <strong>Safety Notice:</strong> Interactive safety simulation. Activating SOS does NOT dispatch real 112/police or emergency telemetry outside the system.
          </span>
        </div>

        {/* ACTIVE SOS STATE */}
        {isSosActive ? (
          <div className="mt-6 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#E5484D]/20 border border-[#E5484D] flex items-center justify-center text-[#E5484D] animate-ping">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#E5484D] uppercase tracking-wider">Distress Beacon Active</div>
              <h4 className="text-lg font-black text-white mt-1">Live Location Telemetry Broadcasted</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Priority alert dispatched to configured ICE contacts and employer operations monitoring desk.
              </p>
            </div>

            <div className="p-4 bg-[#142436] border border-[#1B2A3B] rounded-lg text-left space-y-2 text-xs">
              <div className="text-[#64748B] font-semibold uppercase tracking-wider text-[10px]">Notified ICE Contacts:</div>
              {(emergencyContacts || []).map(c => (
                <div key={c.id} className="flex justify-between items-center text-slate-300 py-1 border-b border-[#1B2A3B] last:border-0">
                  <span className="font-medium">{c.name} ({c.relation})</span>
                  <span className="text-[#23966B] flex items-center gap-1 font-mono text-[11px]">
                    <CheckCircle className="w-3 h-3" /> Beacon Received
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={cancelSOS}
              className="w-full py-2.5 bg-[#142436] hover:bg-[#1B2A3B] text-white font-bold text-xs rounded-lg border border-[#1B2A3B] transition-colors"
            >
              Stand Down / Cancel Emergency Distress
            </button>
          </div>
        ) : (
          /* INACTIVE / TRIGGER DIALOG */
          <div className="mt-5 space-y-5">
            {!confirmStep ? (
              <>
                <div className="p-4 bg-[#142436] border border-[#1B2A3B] rounded-lg space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Safety Broadcast Sequence:</h4>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                    <li>Transmits priority GPS coordinate stream to transit control.</li>
                    <li>Dispatches immediate notification to configured emergency contacts.</li>
                    <li>Flags active corridor for emergency route diversions.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setConfirmStep(true)}
                    className="w-full py-3 bg-[#E5484D] hover:bg-[#D63E43] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>Broadcast Emergency Distress Signal</span>
                  </button>

                  <div className="flex gap-2">
                    <a
                      href="tel:112"
                      className="flex-1 py-2.5 bg-[#142436] hover:bg-[#1B2A3B] text-slate-200 font-semibold text-xs rounded-lg border border-[#1B2A3B] transition-colors flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#1769AA]" />
                      <span>Dial Emergency (112)</span>
                    </a>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="px-4 py-2.5 bg-[#142436] hover:bg-[#1B2A3B] text-slate-300 font-semibold text-xs rounded-lg border border-[#1B2A3B] transition-colors flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-[#1769AA]" />
                      <span>ICE Contacts</span>
                    </button>
                  </div>
                </div>

                {/* ICE Contacts List / Management */}
                {showAddForm && (
                  <div className="mt-4 p-4 bg-[#142436] border border-[#1B2A3B] rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Emergency Contacts</span>
                      <span className="text-[10px] text-[#64748B] font-mono">{emergencyContacts.length} configured</span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {(emergencyContacts || []).map(contact => (
                        <div key={contact.id} className="flex items-center justify-between p-2 rounded bg-[#101D2B] border border-[#1B2A3B] text-xs">
                          <div>
                            <div className="font-semibold text-slate-200">{contact.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{contact.phone} • {contact.relation}</div>
                          </div>
                          <button
                            onClick={() => deleteEmergencyContact(contact.id)}
                            className="p-1 text-slate-500 hover:text-[#E5484D] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Contact Mini-Form */}
                    <form onSubmit={handleAddSubmit} className="space-y-2 pt-2 border-t border-[#1B2A3B]">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Contact Name"
                          value={newContactName}
                          onChange={e => setNewContactName(e.target.value)}
                          className="px-2.5 py-1.5 bg-[#101D2B] border border-[#1B2A3B] rounded text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-[#1769AA]"
                        />
                        <input
                          type="text"
                          placeholder="Phone Number"
                          value={newContactPhone}
                          onChange={e => setNewContactPhone(e.target.value)}
                          className="px-2.5 py-1.5 bg-[#101D2B] border border-[#1B2A3B] rounded text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-[#1769AA]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Relationship (e.g. Next of Kin, Manager)"
                          value={newContactRelation}
                          onChange={e => setNewContactRelation(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-[#101D2B] border border-[#1B2A3B] rounded text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-[#1769AA]"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              /* Confirmation Step */
              <div className="space-y-4 text-center py-2">
                <AlertOctagon className="w-12 h-12 text-[#E5484D] mx-auto animate-bounce" />
                <div>
                  <h4 className="text-base font-bold text-white">Confirm Simulated Emergency Distress?</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    This activates the simulated emergency beacon and updates your live corridor transit status.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmStep(false)}
                    className="flex-1 py-2 bg-[#142436] hover:bg-[#1B2A3B] text-slate-300 font-semibold text-xs rounded-lg transition-colors border border-[#1B2A3B]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartSOS}
                    className="flex-1 py-2 bg-[#E5484D] hover:bg-[#D63E43] text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Confirm Broadcast
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
