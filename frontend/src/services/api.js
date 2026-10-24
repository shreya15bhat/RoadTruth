/**
 * RoadTruth API Service Layer
 * Connects frontend React components to Python Flask backend.
 * Provides request helpers, authentication state, and two-way normalization.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Storage keys
const TOKEN_KEY = 'roadtruth_token';
const USER_KEY = 'roadtruth_user';

export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('routewise_token') || null;
};

export const setStoredAuth = (token, user) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('routewise_token', token);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('routewise_token');
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Universal JSON fetch helper with auth header injection and friendly error parsing.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getStoredToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  // Handle CSV / binary download
  if (response.headers.get('Content-Type')?.includes('text/csv')) {
    if (!response.ok) {
      throw new Error(`CSV download failed with status ${response.status}`);
    }
    return response.blob();
  }

  const contentType = response.headers.get('Content-Type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    if (data && typeof data === 'object') {
      if (data.errors && typeof data.errors === 'object') {
        const errorList = Object.values(data.errors).filter(Boolean);
        if (errorList.length > 0) {
          errorMsg = errorList.join(' ');
        } else if (data.message) {
          errorMsg = data.message;
        } else if (data.error) {
          errorMsg = data.error;
        }
      } else if (data.message) {
        errorMsg = data.message;
      } else if (data.error && data.error !== 'Validation Error') {
        errorMsg = data.error;
      }
    }
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ---------------------------------------------------------------------------
// ADAPTERS: Normalize between backend Flask schema and frontend UI components
// ---------------------------------------------------------------------------

export const CATEGORY_MAP_TO_BACKEND = {
  accident: 'accident',
  traffic_congestion: 'congestion',
  heavy_traffic: 'congestion',
  road_repair: 'roadwork',
  construction: 'roadwork',
  flooding: 'weather',
  flood: 'weather',
  heavy_rain: 'weather',
  landslide: 'hazard',
  fallen_tree: 'hazard',
  pothole: 'hazard',
  breakdown: 'breakdown',
  roadblock: 'roadblock',
  road_closure: 'closure',
  closure: 'closure',
  emergency: 'emergency',
  sos: 'emergency',
  other: 'other'
};

export const CATEGORY_MAP_FROM_BACKEND = {
  accident: 'accident',
  congestion: 'traffic_congestion',
  traffic_congestion: 'traffic_congestion',
  roadwork: 'road_repair',
  construction: 'road_repair',
  hazard: 'other',
  road_hazard: 'other',
  weather: 'flooding',
  weather_disruption: 'flooding',
  closure: 'road_closure',
  road_closure: 'road_closure',
  roadblock: 'roadblock',
  breakdown: 'breakdown',
  vehicle_breakdown: 'breakdown',
  emergency: 'accident',
  sos: 'accident',
  other: 'other'
};

/**
 * Calculates a user-friendly "reported ago" relative string.
 */
function formatTimeAgo(isoString) {
  if (!isoString) return 'Just now';
  const created = new Date(isoString);
  const now = new Date();
  const diffMinutes = Math.floor((now - created) / 60000);
  if (isNaN(diffMinutes) || diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Converts a backend Incident dictionary to the frontend format expected by UI cards,
 * tables, markers, and modals.
 */
export function normalizeIncidentFromBackend(b) {
  if (!b) return null;

  const bStatus = (b.verification_status || 'pending').toLowerCase();
  const isCleared = b.is_cleared || bStatus === 'cleared' || Boolean(b.cleared_at);
  const trustScore = typeof b.trust_score === 'number' ? b.trust_score : 0.4;
  const confirmations = Number(b.verification_count || (b.verifications ? b.verifications.length : 0)) || 1;

  // Compute 1-6 verification level matching frontend badges
  let vLevel = 1;
  if (bStatus === 'verified') {
    vLevel = trustScore >= 0.9 ? 6 : 5;
  } else if (confirmations >= 3) {
    vLevel = 4;
  } else if (confirmations >= 2) {
    vLevel = 3;
  } else if (b.latitude && b.longitude) {
    vLevel = 2;
  }

  const backendType = (b.incident_type || 'other').toLowerCase();
  const frontendCategory = CATEGORY_MAP_FROM_BACKEND[backendType] || 'other';

  return {
    id: b.id,
    title: b.description
      ? (b.description.length > 55 ? `${b.description.slice(0, 52)}...` : b.description)
      : `${(b.incident_type || 'Hazard').toUpperCase()}: ${b.location_name || 'Highway Corridor'}`,
    category: frontendCategory,
    incident_type: b.incident_type,
    severity: (b.severity || 'moderate').toLowerCase(),
    locationName: b.location_name || 'Highway Corridor',
    lat: Number(b.latitude),
    lng: Number(b.longitude),
    reportedAgo: formatTimeAgo(b.created_at),
    timestamp: b.created_at || new Date().toISOString(),
    delayMinutes: Number(b.baseline_duration_minutes) || Number(b.actual_duration_minutes) || 15,
    affectedDistanceKm: 1.5,
    description: b.description || 'Community reported road event.',
    imageUrl: b.evidence_url || null,
    videoUrl: null,
    verificationLevel: vLevel,
    trustScore: Math.round(trustScore * 100),
    confirmationCount: confirmations,
    status: isCleared ? 'cleared' : 'active',
    verification_status: b.verification_status || 'pending',
    is_cleared: isCleared,
    cleared_at: b.cleared_at || null,
    estimatedClearanceTime: b.estimated_clearance_time || null,
    reporter_id: b.reporter_id || 'anonymous',
    evidence: {
      hasGpsLocation: Boolean(b.latitude && b.longitude),
      userReportCount: confirmations,
      hasMedia: Boolean(b.evidence_url),
      avgSpeedKmh: 6.0,
      normalSpeedKmh: 45.0,
      authorityConfirmed: bStatus === 'verified' && trustScore >= 0.85
    },
    verifications: b.verifications || [],
    alternativeRoute: 'Alternative diversion calculated by route planner.'
  };
}

/**
 * Normalizes frontend form submission fields into backend Incident payload.
 */
export function normalizeIncidentToBackend(f) {
  const cat = (f.category || f.incident_type || 'hazard').toLowerCase();
  const canonicalType = CATEGORY_MAP_TO_BACKEND[cat] || 'hazard';

  return {
    incident_type: canonicalType,
    location_name: f.locationName || f.location_name || 'Corridor Landmark',
    latitude: Number(f.lat !== undefined ? f.lat : f.latitude),
    longitude: Number(f.lng !== undefined ? f.lng : f.longitude),
    description: f.description || f.title || `${canonicalType.toUpperCase()} reported near ${f.locationName || 'location'}`,
    severity: (f.severity || 'moderate').toLowerCase(),
    estimated_clearance_time: f.estimatedClearanceTime || f.estimated_clearance_time || null
  };
}

// ---------------------------------------------------------------------------
// API METHODS
// ---------------------------------------------------------------------------

export const api = {
  // --- System & Health ---
  async getHealth() {
    return request('/api/health');
  },

  async getRoot() {
    return request('/');
  },

  // --- Auth ---
  async login(identifier, password) {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: {
        username: identifier,
        password
      }
    });
    if (data.token) {
      setStoredAuth(data.token, data.user);
    }
    return data;
  },

  async register(registrationData) {
    const data = await request('/api/auth/register', {
      method: 'POST',
      body: registrationData
    });
    if (data.token) {
      setStoredAuth(data.token, data.user);
    }
    return data;
  },

  async getMe() {
    return request('/api/auth/me');
  },

  logout() {
    clearStoredAuth();
  },

  // --- Incidents ---
  async getIncidents(filters = {}) {
    const query = new URLSearchParams();
    if (filters.status) query.set('status', filters.status);
    if (filters.type) query.set('type', filters.type);
    if (filters.severity) query.set('severity', filters.severity);
    const qs = query.toString();
    const raw = await request(`/api/incidents${qs ? `?${qs}` : ''}`);
    if (Array.isArray(raw)) {
      return raw.map(normalizeIncidentFromBackend);
    }
    return [];
  },

  async getIncidentById(id) {
    const raw = await request(`/api/incidents/${id}`);
    return normalizeIncidentFromBackend(raw);
  },

  async createIncident(formData) {
    const payload = normalizeIncidentToBackend(formData);
    const raw = await request('/api/incidents', {
      method: 'POST',
      body: payload
    });
    return normalizeIncidentFromBackend(raw);
  },

  async checkDuplicates(data) {
    return request('/api/incidents/check-duplicates', {
      method: 'POST',
      body: {
        incident_type: CATEGORY_MAP_TO_BACKEND[data.category] || data.incident_type || 'hazard',
        latitude: Number(data.lat ?? data.latitude),
        longitude: Number(data.lng ?? data.longitude),
        radius_km: Number(data.radius_km || 0.5)
      }
    });
  },

  async getIncidentDuplicates(incidentId, radiusKm = 0.5) {
    return request(`/api/incidents/${incidentId}/duplicates?radius_km=${radiusKm}`);
  },

  async getNearbyIncidents(lat, lon, radiusKm = 5.0, type = null) {
    const query = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      radius_km: radiusKm
    });
    if (type) query.set('type', type);
    return request(`/api/incidents/nearby?${query.toString()}`);
  },

  // --- Incident Verification & Clearance ---
  async getIncidentVerifications(incidentId) {
    return request(`/api/incidents/${incidentId}/verifications`);
  },

  async verifyIncident(incidentId, verificationData) {
    return request(`/api/incidents/${incidentId}/verify`, {
      method: 'POST',
      body: {
        action: verificationData.action || 'confirm',
        supporting_info: verificationData.supporting_info || verificationData.notes || null,
        evidence_url: verificationData.evidence_url || verificationData.imageUrl || null,
        estimated_clearance_time: verificationData.estimated_clearance_time || null
      }
    });
  },

  async clearIncident(incidentId, notes = null) {
    return request(`/api/incidents/${incidentId}/clear`, {
      method: 'POST',
      body: notes ? { notes } : {}
    });
  },

  // --- Analytics & Hotspots ---
  async getIncidentStatsSummary() {
    return request('/api/incidents/stats/summary');
  },

  async getTrafficAnalytics(startDate = null, endDate = null) {
    const query = new URLSearchParams();
    if (startDate) query.set('start_date', startDate);
    if (endDate) query.set('end_date', endDate);
    const qs = query.toString();
    return request(`/api/incidents/analytics${qs ? `?${qs}` : ''}`);
  },

  async getHeatmapPoints(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query.set(k, v);
    });
    const qs = query.toString();
    return request(`/api/incidents/heatmap${qs ? `?${qs}` : ''}`);
  },

  async getHotspots(params = {}) {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.min_count) query.set('min_count', params.min_count);
    const qs = query.toString();
    return request(`/api/incidents/hotspots${qs ? `?${qs}` : ''}`);
  },

  // --- CSV Export ---
  async exportIncidentsCSV() {
    return request('/api/incidents/export/csv');
  },

  // --- Routing & Alerts ---
  async getRouteAlternatives(originCoords, destCoords, corridorBufferMeters = 200.0) {
    return request('/api/routes/alternatives', {
      method: 'POST',
      body: {
        origin: {
          latitude: Number(originCoords.latitude ?? originCoords[0]),
          longitude: Number(originCoords.longitude ?? originCoords[1])
        },
        destination: {
          latitude: Number(destCoords.latitude ?? destCoords[0]),
          longitude: Number(destCoords.longitude ?? destCoords[1])
        },
        corridor_buffer_meters: Number(corridorBufferMeters)
      }
    });
  },

  async getRouteAlerts(routeCoordinates, bufferMeters = 200.0) {
    return request('/api/routes/alerts', {
      method: 'POST',
      body: {
        route_coordinates: routeCoordinates,
        buffer_meters: Number(bufferMeters)
      }
    });
  },

  // --- Emergency SOS ---
  async triggerEmergencySOS(data = {}) {
    return request('/api/emergency/sos', {
      method: 'POST',
      body: {
        latitude: Number(data.latitude ?? data.lat ?? 12.8756),
        longitude: Number(data.longitude ?? data.lng ?? 74.8628),
        location_name: data.location_name || data.locationName || 'Traveler Broadcast Position',
        description: data.description || 'Emergency SOS traveler alert beacon activated.'
      }
    });
  }
};

export default api;
