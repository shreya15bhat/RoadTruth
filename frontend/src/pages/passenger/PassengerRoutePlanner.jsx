import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRouteWise } from '../../context/RouteWiseContext';
import TrafficMap from '../../components/maps/TrafficMap';
import MapLocationPicker from '../../components/maps/MapLocationPicker';
import { 
  Route, 
  MapPin, 
  Navigation, 
  Map as MapIcon, 
  Play, 
  ArrowUpDown, 
  Clock, 
  Search,
  Check,
  ShieldCheck
} from 'lucide-react';

const POPULAR_LOCATIONS = [
  { name: 'Surathkal NITK Corridor, Mangaluru', coords: [13.0118, 74.7943] },
  { name: 'Hampankatta City Center, Mangaluru', coords: [12.8688, 74.8436] },
  { name: 'Pumpwell (Mahaveera Circle), Mangaluru', coords: [12.8622, 74.8637] },
  { name: 'Kottara Chowki Flyover, Mangaluru', coords: [12.9056, 74.8384] },
  { name: 'Lalbagh Road, Mangaluru', coords: [12.8812, 74.8412] },
  { name: 'Mangaluru International Airport (Bajpe)', coords: [12.9612, 74.8900] },
  { name: 'Udupi City Center', coords: [13.3409, 74.7421] },
  { name: 'Ullal Junction, NH-66', coords: [12.8056, 74.8520] },
  { name: 'Bantwal BC Road Highway Junction', coords: [12.8892, 75.0321] },
  { name: 'Nanthoor Circle, Mangaluru', coords: [12.8756, 74.8628] },
  { name: 'Kuntikan Junction, Mangaluru', coords: [12.8988, 74.8492] },
  { name: 'Kadri Park Road, Mangaluru', coords: [12.8891, 74.8589] }
];

export default function PassengerRoutePlanner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { routes, selectedRoute, setSelectedRoute, calculateRouteAlternatives, startJourney, incidents, showToast } = useRouteWise();
  const [isCalculating, setIsCalculating] = useState(false);

  // Location text states
  const [fromLocation, setFromLocation] = useState('Surathkal NITK Corridor, Mangaluru');
  const [toLocation, setToLocation] = useState(
    searchParams.get('destination') || 'Hampankatta City Center, Mangaluru'
  );

  // Dedicated coordinates states (ensuring strict separation)
  const [fromCoords, setFromCoords] = useState([13.0118, 74.7943]);
  const [toCoords, setToCoords] = useState([12.8688, 74.8436]);

  // Autocomplete UI states
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // Map Picker Modal state
  const [mapPickerMode, setMapPickerMode] = useState(null); // 'from' | 'destination' | null

  // Route calculation feedback state
  const [hasSearched, setHasSearched] = useState(true);

  const fromRef = useRef(null);
  const toRef = useRef(null);

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (fromRef.current && !fromRef.current.contains(e.target)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(e.target)) {
        setShowToSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions
  const filteredFromSuggestions = POPULAR_LOCATIONS.filter(l =>
    l.name.toLowerCase().includes(fromLocation.toLowerCase())
  );
  const filteredToSuggestions = POPULAR_LOCATIONS.filter(l =>
    l.name.toLowerCase().includes(toLocation.toLowerCase())
  );

  // Handle Suggestion Selection
  const handleSelectFromSuggestion = (loc) => {
    setFromLocation(loc.name);
    setFromCoords(loc.coords);
    setShowFromSuggestions(false);
  };

  const handleSelectToSuggestion = (loc) => {
    setToLocation(loc.name);
    setToCoords(loc.coords);
    setShowToSuggestions(false);
  };

  // Open Map Picker
  const handleOpenMapPicker = (mode) => {
    setShowFromSuggestions(false);
    setShowToSuggestions(false);
    setMapPickerMode(mode);
  };

  // Handle Map Picker Confirmation (guaranteed separation of state)
  const handleConfirmMapLocation = (locationLabel, coords) => {
    if (mapPickerMode === 'from') {
      setFromLocation(locationLabel);
      setFromCoords(coords);
      showToast('Starting Point Selected', locationLabel, 'success');
    } else if (mapPickerMode === 'destination') {
      setToLocation(locationLabel);
      setToCoords(coords);
      showToast('Destination Selected', locationLabel, 'success');
    }
  };

  // Swap Locations
  const handleSwap = () => {
    const tempText = fromLocation;
    const tempCoords = fromCoords;
    setFromLocation(toLocation);
    setFromCoords(toCoords);
    setToLocation(tempText);
    setToCoords(tempCoords);
    showToast('Locations Swapped', '', 'info');
  };

  // Plan Route Submission
  const isPlanDisabled = !fromLocation.trim() || !toLocation.trim();

  const handlePlanRoute = async (e) => {
    e.preventDefault();
    if (isPlanDisabled) return;

    setHasSearched(true);
    setIsCalculating(true);

    try {
      if (calculateRouteAlternatives && fromCoords && toCoords) {
        await calculateRouteAlternatives(fromCoords, toCoords);
      }
    } catch {
      // Fallback preserves selected endpoints
    } finally {
      setIsCalculating(false);
    }

    // Update active route labels and coordinates
    if (selectedRoute) {
      const updatedRoute = {
        ...selectedRoute,
        origin: fromLocation,
        destination: toLocation
      };
      if (fromCoords && toCoords && selectedRoute.coordinates) {
        // Adjust endpoints for the polyline
        const coordsCopy = [...selectedRoute.coordinates];
        coordsCopy[0] = fromCoords;
        coordsCopy[coordsCopy.length - 1] = toCoords;
        updatedRoute.coordinates = coordsCopy;
      }
      setSelectedRoute(updatedRoute);
    }

    showToast('Route Calculated', `Corridor: ${fromLocation.split(',')[0]} → ${toLocation.split(',')[0]}`, 'success');
  };

  const handleSelectRouteOption = (r) => {
    const updated = {
      ...r,
      origin: fromLocation,
      destination: toLocation
    };
    if (fromCoords && toCoords && r.coordinates) {
      const coordsCopy = [...r.coordinates];
      coordsCopy[0] = fromCoords;
      coordsCopy[coordsCopy.length - 1] = toCoords;
      updated.coordinates = coordsCopy;
    }
    setSelectedRoute(updated);
  };

  const handleStartTrip = (r) => {
    startJourney(r, fromLocation, toLocation);
    navigate('/passenger/journeys');
  };

  // Display route with customized endpoints if available
  const displayRoute = selectedRoute ? {
    ...selectedRoute,
    origin: fromLocation,
    destination: toLocation
  } : routes[0];

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="border-b border-[#1B2A3B] pb-4">
        <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
          Transit Route Intelligence
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
          Corridor Route Planner
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compare route alternatives based on live incident telemetry and corridor latency
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Dual-Method Location Input + Route Cards */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Dual-Method Input Form */}
          <form onSubmit={handlePlanRoute} className="p-5 bg-[#101D2B] border border-[#1B2A3B] rounded-lg space-y-3.5 relative">
            
            {/* FROM FIELD */}
            <div className="space-y-1 relative" ref={fromRef}>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <label>Origin Point</label>
                <span className="text-[10px] text-[#64748B]">Type or select on map</span>
              </div>
              
              <div className="relative flex items-center">
                <Navigation className="w-3.5 h-3.5 text-[#23966B] absolute left-3 pointer-events-none" />
                
                <input
                  type="text"
                  value={fromLocation}
                  onChange={(e) => {
                    setFromLocation(e.target.value);
                    setShowFromSuggestions(true);
                  }}
                  onFocus={() => setShowFromSuggestions(true)}
                  placeholder="Enter departure point..."
                  className="w-full pl-9 pr-10 py-2.5 bg-[#142436] border border-[#1B2A3B] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#1769AA] transition-colors"
                />

                {/* Map Picker Icon Button */}
                <button
                  type="button"
                  onClick={() => handleOpenMapPicker('from')}
                  title="Select starting location on map"
                  className="absolute right-2 p-1.5 rounded text-slate-400 hover:text-[#23966B] hover:bg-[#101D2B] transition-colors flex items-center justify-center"
                >
                  <MapIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showFromSuggestions && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto bg-[#101D2B] border border-[#1B2A3B] rounded-lg shadow-xl divide-y divide-[#1B2A3B] text-xs">
                  {filteredFromSuggestions.length > 0 ? (
                    filteredFromSuggestions.map((loc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectFromSuggestion(loc)}
                        className="w-full text-left p-2.5 hover:bg-[#142436] text-slate-300 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span className="truncate">{loc.name}</span>
                        <span className="text-[10px] text-[#64748B] font-mono">Verified Node</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-2.5 text-slate-500 text-[11px] text-center">
                      Custom location: "{fromLocation}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Swap Button */}
            <div className="flex justify-center -my-1.5">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap Origin and Destination"
                className="p-1 rounded bg-[#142436] border border-[#1B2A3B] text-slate-400 hover:text-[#1769AA] transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* DESTINATION FIELD */}
            <div className="space-y-1 relative" ref={toRef}>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <label>Destination Point</label>
                <span className="text-[10px] text-[#64748B]">Type or select on map</span>
              </div>
              
              <div className="relative flex items-center">
                <MapPin className="w-3.5 h-3.5 text-[#1769AA] absolute left-3 pointer-events-none" />
                
                <input
                  type="text"
                  value={toLocation}
                  onChange={(e) => {
                    setToLocation(e.target.value);
                    setShowToSuggestions(true);
                  }}
                  onFocus={() => setShowToSuggestions(true)}
                  placeholder="Enter destination..."
                  className="w-full pl-9 pr-10 py-2.5 bg-[#142436] border border-[#1B2A3B] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#1769AA] transition-colors"
                />

                {/* Map Picker Icon Button */}
                <button
                  type="button"
                  onClick={() => handleOpenMapPicker('destination')}
                  title="Select destination on map"
                  className="absolute right-2 p-1.5 rounded text-slate-400 hover:text-[#1769AA] hover:bg-[#101D2B] transition-colors flex items-center justify-center"
                >
                  <MapIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showToSuggestions && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto bg-[#101D2B] border border-[#1B2A3B] rounded-lg shadow-xl divide-y divide-[#1B2A3B] text-xs">
                  {filteredToSuggestions.length > 0 ? (
                    filteredToSuggestions.map((loc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectToSuggestion(loc)}
                        className="w-full text-left p-2.5 hover:bg-[#142436] text-slate-300 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span className="truncate">{loc.name}</span>
                        <span className="text-[10px] text-[#64748B] font-mono">Verified Node</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-2.5 text-slate-500 text-[11px] text-center">
                      Custom location: "{toLocation}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Plan Route Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isPlanDisabled || isCalculating}
                className={`w-full py-2.5 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  isPlanDisabled
                    ? 'bg-[#142436] text-slate-500 cursor-not-allowed border border-[#1B2A3B]'
                    : 'bg-[#1769AA] hover:bg-[#1B7DC8] text-white shadow-sm'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                <span>{isCalculating ? 'Computing Optimal Corridor...' : isPlanDisabled ? 'Select Both Endpoints' : 'Calculate Routes'}</span>
              </button>
            </div>

          </form>

          {/* 3 Route Options */}
          {hasSearched && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider px-1">
                Corridor Alternatives ({routes.length})
              </div>
              {routes.map((r) => {
                const isSelected = selectedRoute?.id === r.id;

                return (
                  <div
                    key={r.id}
                    onClick={() => handleSelectRouteOption(r)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#142436] border-[#1769AA] shadow-sm ring-1 ring-[#1769AA]/40'
                        : 'bg-[#101D2B] border-[#1B2A3B] hover:border-[#2E4763]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${r.delayMin > 10 ? 'bg-[#E5484D]' : r.delayMin > 0 ? 'bg-[#F0A629]' : 'bg-[#23966B]'}`}></span>
                          <h3 className="text-sm font-bold text-white capitalize">
                            {r.tag || r.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          {r.currentDurationMin} min · {r.distanceKm} km {r.delayMin > 0 && <span className="text-[#F0A629] font-bold font-mono">· +{r.delayMin}m delay</span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRouteOption(r);
                          }}
                          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-[#1769AA]/20 text-[#1769AA] border border-[#1769AA]/40'
                              : 'bg-[#142436] hover:bg-[#1B2A3B] text-slate-300'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Select'}
                        </button>

                        {isSelected && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartTrip(r);
                            }}
                            className="px-3 py-1.5 bg-[#1769AA] hover:bg-[#1B7DC8] text-white rounded text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Navigate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right: Map Visualizer */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-300">Route Geometry Preview</span>
            <span className="font-mono text-[#1769AA]">
              {fromLocation.split(',')[0]} → {toLocation.split(',')[0]}
            </span>
          </div>

          <div className="rounded-lg overflow-hidden border border-[#1B2A3B] bg-[#101D2B] shadow-sm">
            <TrafficMap
              incidents={incidents}
              selectedRoute={displayRoute}
              height="h-[460px] lg:h-[520px]"
            />
          </div>
        </div>

      </div>

      {/* REUSABLE MAP LOCATION PICKER MODAL */}
      <MapLocationPicker
        isOpen={!!mapPickerMode}
        mode={mapPickerMode || 'from'}
        initialCoords={mapPickerMode === 'from' ? fromCoords : toCoords}
        onClose={() => setMapPickerMode(null)}
        onConfirm={handleConfirmMapLocation}
      />

    </div>
  );
}
