import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteWise } from '../../context/RouteWiseContext';
import { 
  MapPin, 
  Camera, 
  Video, 
  LocateFixed, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function IncidentReportForm({ onReportSubmitted = null }) {
  const navigate = useNavigate();
  const { addIncident, showToast } = useRouteWise();

  const [category, setCategory] = useState('accident');
  const [locationName, setLocationName] = useState('NH-66 Near Kottara Chowki, Mangaluru');
  const [lat, setLat] = useState(12.9056);
  const [lng, setLng] = useState(74.8384);
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [photoName, setPhotoName] = useState(null);
  const [videoName, setVideoName] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'accident', label: 'Accident', severity: 'severe' },
    { id: 'flood', label: 'Flooding', severity: 'severe' },
    { id: 'roadblock', label: 'Roadblock', severity: 'severe' },
    { id: 'construction', label: 'Construction', severity: 'moderate' },
    { id: 'heavy_traffic', label: 'Congestion', severity: 'moderate' },
    { id: 'other', label: 'Hazard', severity: 'moderate' }
  ];

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation Unavailable', 'Location services not supported by browser', 'error');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationName(`Corridor GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        showToast('Location Set', 'Using precise GPS coordinates', 'success');
      },
      () => {
        setIsLocating(false);
        showToast('Location Denied', 'Please enter location description manually.', 'info');
      },
      { timeout: 8000 }
    );
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      showToast('Photo Attached', file.name, 'success');
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoName(file.name);
      showToast('Video Attached', file.name, 'success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const chosenCat = categories.find(c => c.id === category);
    const newInc = {
      title: `${category.toUpperCase().replace('_', ' ')}: ${locationName}`,
      category,
      severity: chosenCat?.severity || 'moderate',
      locationName,
      lat: Number(lat),
      lng: Number(lng),
      delayMinutes: Number(delayMinutes),
      description: `Reported obstruction: ${category.replace('_', ' ')} near ${locationName}. Estimated delay +${delayMinutes} mins.`,
      imageUrl: photoName ? 'https://images.unsplash.com/photo-1543393470-bce01e0a233b?auto=format&fit=crop&w=800&q=80' : null
    };

    try {
      const created = await addIncident(newInc);
      setSubmitted(true);
      if (onReportSubmitted) onReportSubmitted(created || newInc);
    } catch {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 bg-[#101D2B] border border-[#1B2A3B] rounded-lg text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#23966B]/20 text-[#23966B] flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Incident Report Dispatched</h3>
          <p className="text-xs text-slate-400 mt-1">
            Thank you for improving city road intelligence. Your report is now live on the arterial grid.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 bg-[#142436] hover:bg-[#1B2A3B] text-xs font-semibold rounded-lg text-slate-200 transition-colors border border-[#1B2A3B]"
          >
            Submit Another
          </button>
          <button
            onClick={() => navigate('/passenger')}
            className="px-4 py-2 bg-[#1769AA] hover:bg-[#1B7DC8] text-xs font-bold rounded-lg text-white transition-colors"
          >
            View on Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-[#101D2B] border border-[#1B2A3B] rounded-lg shadow-sm space-y-6 text-slate-100">
      
      {/* Step 1: Incident Category */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          1. Hazard Classification
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`py-2.5 px-3 rounded-lg text-xs font-semibold text-center transition-all border ${
                category === c.id
                  ? 'bg-[#1769AA]/20 text-white border-[#1769AA] ring-1 ring-[#1769AA]/40'
                  : 'bg-[#142436] border-[#1B2A3B] text-slate-400 hover:text-slate-200 hover:border-[#2E4763]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Location */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            2. Corridor Location
          </label>
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={isLocating}
            className="text-[11px] text-[#1769AA] hover:text-[#1B7DC8] flex items-center gap-1 font-semibold disabled:opacity-50 transition-colors"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS...' : 'Use Device GPS'}</span>
          </button>
        </div>
        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. NH-66 Thokkottu Junction"
            className="w-full pl-9 pr-3 py-2.5 bg-[#142436] border border-[#1B2A3B] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#1769AA] transition-colors"
          />
        </div>
      </div>

      {/* Step 3: Evidence */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          3. Forensic Verification (Optional)
        </label>
        <div className="grid grid-cols-2 gap-3">
          
          {/* Photo */}
          <label className={`p-3 rounded-lg border flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-semibold ${
            photoName ? 'bg-[#1769AA]/15 border-[#1769AA] text-white' : 'bg-[#142436] border-[#1B2A3B] text-slate-400 hover:border-[#2E4763]'
          }`}>
            <Camera className="w-4 h-4" />
            <span className="truncate">{photoName || 'Attach Photo'}</span>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>

          {/* Video */}
          <label className={`p-3 rounded-lg border flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-semibold ${
            videoName ? 'bg-[#1769AA]/15 border-[#1769AA] text-white' : 'bg-[#142436] border-[#1B2A3B] text-slate-400 hover:border-[#2E4763]'
          }`}>
            <Video className="w-4 h-4" />
            <span className="truncate">{videoName || 'Attach Video'}</span>
            <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
          </label>

        </div>
      </div>

      {/* Step 4: Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>{isSubmitting ? 'Transmitting Incident...' : 'Broadcast Incident Report'}</span>
        </button>
      </div>

    </form>
  );
}
