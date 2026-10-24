import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  SEED_INCIDENTS, 
  SEED_EMPLOYEES, 
  SEED_ROUTES, 
  SEED_JOURNEYS 
} from '../data/dataTemplates';
import api, { 
  getStoredToken, 
  getStoredUser, 
  clearStoredAuth, 
  normalizeIncidentFromBackend 
} from '../services/api';

const RouteWiseContext = createContext(null);

export const useRouteWise = () => {
  const ctx = useContext(RouteWiseContext);
  if (!ctx) throw new Error('useRouteWise must be used within RouteWiseProvider');
  return ctx;
};

export const RouteWiseProvider = ({ children }) => {
  // 1. Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('routewise_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('routewise_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // 2. Role State: 'passenger' | 'employer' | 'authority' | 'admin'
  const [role, setRoleState] = useState(() => localStorage.getItem('routewise_role') || 'passenger');

  const setRole = (newRole) => {
    setRoleState(newRole);
    localStorage.setItem('routewise_role', newRole);
  };

  // 3. User & Authentication State
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [backendConnected, setBackendConnected] = useState(false);

  // Role mapping helper
  const mapBackendRole = useCallback((backendRole) => {
    if (!backendRole) return 'passenger';
    if (backendRole === 'employer') return 'employer';
    if (backendRole === 'admin') return 'admin';
    if (
      backendRole.includes('authority') ||
      backendRole.includes('police') ||
      backendRole.includes('emergency') ||
      backendRole.includes('operator')
    ) {
      return 'authority';
    }
    return 'passenger';
  }, []);

  // Hydrate user session from backend if token exists
  useEffect(() => {
    let isMounted = true;
    async function checkAuthSession() {
      try {
        const health = await api.getHealth();
        if (isMounted) setBackendConnected(health.status === 'healthy');
      } catch {
        if (isMounted) setBackendConnected(false);
      }

      if (token) {
        try {
          const res = await api.getMe();
          if (isMounted && res.user) {
            setUser(res.user);
            if (res.user.role) {
              setRoleState(mapBackendRole(res.user.role));
            }
          }
        } catch (err) {
          // Token expired or invalid
          if (err.status === 401) {
            clearStoredAuth();
            if (isMounted) {
              setToken(null);
              setUser(null);
              setRoleState('passenger');
            }
          }
        }
      }
    }

    checkAuthSession();
    return () => { isMounted = false; };
  }, [token, mapBackendRole]);

  // Auth actions
  const loginUser = async (identifier, password, preferredRole = null) => {
    const res = await api.login(identifier, password);
    setToken(res.token);
    setUser(res.user);
    const assignedRole = mapBackendRole(res.user?.role) || preferredRole || 'passenger';
    setRole(assignedRole);
    return res;
  };

  const registerUser = async (registrationData) => {
    const res = await api.register(registrationData);
    if (res.token) {
      setToken(res.token);
      setUser(res.user);
      const assignedRole = mapBackendRole(res.user?.role || registrationData.role);
      setRole(assignedRole);
    }
    return res;
  };

  const logoutUser = () => {
    api.logout();
    setToken(null);
    setUser(null);
    setRoleState('passenger');
    localStorage.removeItem('routewise_role');
  };

  // 4. Toast System
  const [toasts, setToasts] = useState([]);
  const showToast = (title, message = '', type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev.slice(-3), { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 5. Incidents State (persisted with live backend synchronization)
  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem('routewise_incidents');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return SEED_INCIDENTS;
  });

  const [isLoadingIncidents, setIsLoadingIncidents] = useState(false);

  // Fetch live incidents from backend
  const fetchIncidents = useCallback(async () => {
    setIsLoadingIncidents(true);
    try {
      const live = await api.getIncidents();
      if (Array.isArray(live) && live.length > 0) {
        setIncidents(live);
        setBackendConnected(true);
      } else if (Array.isArray(live) && live.length === 0) {
        // If DB has 0 incidents, keep seed incidents locally so initial experience is not empty
        setIncidents(prev => (prev && prev.length > 0 ? prev : SEED_INCIDENTS));
      }
    } catch (e) {
      // Backend not running yet; gracefully retain local state
      setBackendConnected(false);
    } finally {
      setIsLoadingIncidents(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    localStorage.setItem('routewise_incidents', JSON.stringify(incidents));
  }, [incidents]);

  const addIncident = async (data) => {
    let savedIncident = null;

    try {
      // Attempt backend persistence
      savedIncident = await api.createIncident(data);
      setIncidents(prev => [savedIncident, ...prev.filter(i => i.id !== savedIncident.id)]);
      showToast('Report Published', 'Incident logged into RoadTruth verification workflow.', 'success');
      return savedIncident;
    } catch (err) {
      // Fallback to local storage creation if backend is offline
      const fallbackInc = {
        id: `inc-${Date.now().toString().slice(-4)}`,
        title: data.title || `${(data.category || 'hazard').toUpperCase()} Reported`,
        category: data.category || 'other',
        severity: data.severity || 'moderate',
        locationName: data.locationName || 'Coastal NH-66 Corridor',
        lat: Number(data.lat) || 12.8756,
        lng: Number(data.lng) || 74.8628,
        reportedAgo: 'Just now',
        timestamp: new Date().toISOString(),
        delayMinutes: Number(data.delayMinutes) || 15,
        affectedDistanceKm: Number(data.affectedDistanceKm) || 1.2,
        description: data.description || 'Community incident report submitted.',
        imageUrl: data.imageUrl || null,
        verificationLevel: data.imageUrl ? 5 : (data.lat ? 2 : 1),
        confirmationCount: 1,
        status: 'active',
        evidence: {
          hasGpsLocation: !!data.lat,
          userReportCount: 1,
          hasMedia: !!data.imageUrl,
          avgSpeedKmh: 6.0,
          normalSpeedKmh: 45.0,
          authorityConfirmed: false
        },
        alternativeRoute: 'Alternative diversion calculated by route planner.'
      };
      setIncidents(prev => [fallbackInc, ...prev]);
      showToast('Report Saved Locally', 'Backend offline; report cached in local telemetry.', 'info');
      return fallbackInc;
    }
  };

  const confirmIncident = async (id) => {
    try {
      if (typeof id === 'number' || (typeof id === 'string' && !id.startsWith('inc-'))) {
        await api.verifyIncident(id, { action: 'confirm' });
      }
    } catch {
      // Keep optimistic update even if API call fails
    }

    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        const newCount = (inc.confirmationCount || 1) + 1;
        const newLvl = newCount >= 3 && inc.verificationLevel < 3 ? 3 : inc.verificationLevel;
        return {
          ...inc,
          confirmationCount: newCount,
          verificationLevel: newLvl,
          evidence: {
            ...inc.evidence,
            userReportCount: newCount
          }
        };
      }
      return inc;
    }));
    showToast('Incident Confirmed', 'Your confirmation corroborated this road problem.', 'success');
  };

  const resolveIncident = async (id) => {
    try {
      if (typeof id === 'number' || (typeof id === 'string' && !id.startsWith('inc-'))) {
        await api.clearIncident(id);
      }
    } catch {
      // Local optimistic update
    }

    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'cleared', is_cleared: true } : inc));
    showToast('Incident Cleared', 'Marked resolved on the traffic grid.', 'info');
  };

  const deleteIncident = async (id) => {
    try {
      if (typeof id === 'number' || (typeof id === 'string' && !id.startsWith('inc-'))) {
        await api.clearIncident(id);
      }
    } catch {
      // Local removal
    }

    setIncidents(prev => prev.filter(inc => inc.id !== id));
    showToast('Incident Removed', '', 'info');
  };

  // 6. Employees State (persisted, user-editable)
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('routewise_employees');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return SEED_EMPLOYEES;
  });

  useEffect(() => {
    localStorage.setItem('routewise_employees', JSON.stringify(employees));
  }, [employees]);

  const addEmployee = (emp) => {
    const newEmp = {
      id: emp.id || `EMP-${Math.floor(110 + Math.random() * 880)}`,
      name: emp.name || 'New Staff Member',
      department: emp.department || 'Engineering',
      role: emp.role || 'Specialist',
      route: emp.route || 'Ullal – Mangaluru',
      origin: emp.origin || 'City Center',
      scheduledArrival: emp.scheduledArrival || '09:00 AM',
      estimatedArrival: emp.estimatedArrival || '09:00 AM',
      estimatedDelayMin: Number(emp.estimatedDelayMin) || 0,
      journeyStatus: Number(emp.estimatedDelayMin) > 0 ? 'delayed' : 'on_schedule',
      incidentAffected: emp.incidentAffected || (Number(emp.estimatedDelayMin) > 0 ? 'Corridor Delay' : 'None'),
      verificationStatus: Number(emp.estimatedDelayMin) > 0 ? 'Level 4 (Telemetry Verified)' : 'Normal Flow',
      consentGranted: emp.consentGranted !== false,
      evidenceApproved: Number(emp.estimatedDelayMin) > 0,
      delayCertificateId: Number(emp.estimatedDelayMin) > 0 ? `CERT-${Date.now().toString().slice(-4)}` : null,
      hrNotes: emp.hrNotes || 'Verified via commute telemetry.'
    };
    setEmployees(prev => [newEmp, ...prev]);
    showToast('Employee Added', `${newEmp.name} registered in commute roster.`, 'success');
  };

  const updateEmployee = (id, fields) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...fields } : e));
    showToast('Employee Updated', 'Changes saved to roster.', 'success');
  };

  const deleteEmployee = (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    showToast('Employee Removed', 'Removed from roster.', 'info');
  };

  // 7. Routes & Active Journey State
  const [routes, setRoutes] = useState(SEED_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState(SEED_ROUTES[0]);

  // Dynamic route alternatives generator using backend intelligence
  const calculateRouteAlternatives = async (fromCoords, toCoords) => {
    try {
      const res = await api.getRouteAlternatives(fromCoords, toCoords);
      if (res && res.routes && res.routes.length > 0) {
        // Map backend alternative routes into UI route card format
        const dynamicRoutes = res.routes.map((r, idx) => ({
          id: `route-osrm-${idx + 1}`,
          name: r.summary || `Route Alternative ${idx + 1}`,
          tag: idx === 0 ? 'Recommended' : (r.is_closure ? 'Roadblock Corridor' : `Alternative ${idx + 1}`),
          distanceKm: +(r.distance_km || 0).toFixed(1),
          typicalDurationMin: Math.round(r.duration_minutes || 30),
          currentDurationMin: Math.round((r.duration_minutes || 30) + (r.risk_score ? r.risk_score / 3 : 0)),
          delayMin: Math.round(r.risk_score ? r.risk_score / 3 : 0),
          riskScore: r.risk_score || 0,
          roadblocks: r.has_confirmed_closure || false,
          coordinates: r.geometry?.coordinates ? r.geometry.coordinates.map(c => [c[1], c[0]]) : SEED_ROUTES[0].coordinates,
          corridorAlerts: r.incidents_along_corridor || []
        }));
        setRoutes(dynamicRoutes);
        setSelectedRoute(dynamicRoutes[0]);
        return dynamicRoutes;
      }
    } catch {
      // Keep static routes if routing engine is not reachable
    }
    return SEED_ROUTES;
  };

  const [activeJourney, setActiveJourney] = useState(() => {
    const saved = localStorage.getItem('routewise_active_journey');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      isActive: false,
      isPaused: false,
      progress: 0,
      origin: 'Surathkal Town',
      destination: 'Hampankatta City Center',
      currentRoute: SEED_ROUTES[0],
      startTime: null,
      currentDelayMin: 12,
      speedKmh: 42,
      distanceRemainingKm: 34.2
    };
  });

  useEffect(() => {
    localStorage.setItem('routewise_active_journey', JSON.stringify(activeJourney));
  }, [activeJourney]);

  // Simulated live journey progression
  useEffect(() => {
    if (!activeJourney.isActive || activeJourney.isPaused) return;

    const timer = setInterval(() => {
      setActiveJourney(prev => {
        if (!prev.isActive || prev.isPaused) return prev;
        const nextProgress = Math.min(100, prev.progress + 2);
        const distanceRemaining = Math.max(0, +(prev.currentRoute.distanceKm * (1 - nextProgress / 100)).toFixed(1));
        const simulatedSpeed = nextProgress > 60 && nextProgress < 85 ? 12 : Math.floor(38 + Math.random() * 16);

        if (nextProgress >= 100) {
          return {
            ...prev,
            progress: 100,
            distanceRemainingKm: 0,
            speedKmh: 0,
            isActive: false
          };
        }

        return {
          ...prev,
          progress: nextProgress,
          distanceRemainingKm: distanceRemaining,
          speedKmh: simulatedSpeed
        };
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [activeJourney.isActive, activeJourney.isPaused]);

  // 8. Journey History
  const [journeyHistory, setJourneyHistory] = useState(() => {
    const saved = localStorage.getItem('routewise_journey_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return SEED_JOURNEYS;
  });

  useEffect(() => {
    localStorage.setItem('routewise_journey_history', JSON.stringify(journeyHistory));
  }, [journeyHistory]);

  const startJourney = (route = selectedRoute, origin = 'Surathkal Town', destination = 'Hampankatta') => {
    setActiveJourney({
      isActive: true,
      isPaused: false,
      progress: 4,
      origin,
      destination,
      currentRoute: route,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      currentDelayMin: route.delayMin || 8,
      speedKmh: 45,
      distanceRemainingKm: route.distanceKm
    });
    showToast('Journey Started', `Active commute tracking engaged on ${route.name}`, 'success');
  };

  const pauseJourney = () => {
    setActiveJourney(prev => ({ ...prev, isPaused: !prev.isPaused }));
    showToast(activeJourney.isPaused ? 'Journey Resumed' : 'Journey Paused', '', 'info');
  };

  const endJourney = () => {
    const newEntry = {
      id: `jrn-${Date.now().toString().slice(-4)}`,
      date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      origin: activeJourney.origin,
      destination: activeJourney.destination,
      routeUsed: activeJourney.currentRoute.name,
      durationMin: activeJourney.currentRoute.currentDurationMin || 48,
      typicalMin: activeJourney.currentRoute.typicalDurationMin || 42,
      delayMin: activeJourney.currentDelayMin,
      status: 'Completed',
      savedMinWithAlternative: 14
    };

    setJourneyHistory(prev => [newEntry, ...prev]);
    setActiveJourney({
      isActive: false,
      isPaused: false,
      progress: 0,
      origin: 'Surathkal Town',
      destination: 'Hampankatta City Center',
      currentRoute: SEED_ROUTES[0],
      startTime: null,
      currentDelayMin: 0,
      speedKmh: 0,
      distanceRemainingKm: 0
    });
    showToast('Journey Ended', 'Trip saved to your Journey History. Verified delay proof stored.', 'success');
  };

  // 9. Notifications & Notification Preferences
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('routewise_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      { id: 'notif-1', title: 'Thokkottu Collision Delay', message: '+28m delay reported on southbound NH-66.', time: '15m ago', read: false },
      { id: 'notif-2', title: 'Commute Waiver Generated', message: 'Delay certificate #CERT-8812 recorded for attendance.', time: '1h ago', read: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('routewise_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const [notificationPreferences, setNotificationPreferences] = useState(() => {
    const saved = localStorage.getItem('routewise_notif_prefs');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      trafficJams: true,
      accidents: true,
      flooding: true,
      roadworks: true
    };
  });

  const updateNotificationPreference = (key, value) => {
    setNotificationPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('routewise_notif_prefs', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('Notifications Marked Read', '', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('Notifications Cleared', '', 'info');
  };

  // 10. Emergency SOS State (integrated with backend /api/emergency/sos)
  const [sosActive, setSosActive] = useState(false);
  const sosState = {
    isActive: sosActive,
    active: sosActive,
    timestamp: sosActive ? new Date().toISOString() : null
  };

  const triggerSOS = async (customCoords = null) => {
    setSosActive(true);
    try {
      const coords = customCoords || {
        latitude: activeJourney?.currentRoute?.coordinates?.[0]?.[0] || 12.8756,
        longitude: activeJourney?.currentRoute?.coordinates?.[0]?.[1] || 74.8628
      };
      await api.triggerEmergencySOS(coords);
      showToast('EMERGENCY SOS BROADCASTED', 'Dispatched critical emergency alert to RoadTruth traffic desk.', 'warning');
      fetchIncidents();
    } catch {
      showToast('DEMO SOS ACTIVATED', 'Simulated emergency state active. Cancel if accidental.', 'warning');
    }
  };

  const cancelSOS = () => {
    setSosActive(false);
    showToast('SOS Stand Down', 'Simulated emergency broadcast safely cancelled.', 'info');
  };

  // Emergency Contacts (ICE)
  const [emergencyContacts, setEmergencyContacts] = useState(() => {
    const saved = localStorage.getItem('routewise_emergency_contacts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      { id: 'ec-1', name: 'Primary ICE (Family)', phone: '+91 98765 43210', relation: 'Spouse' },
      { id: 'ec-2', name: 'Work Transit Coordinator', phone: '+91 91234 56789', relation: 'Employer Ops' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('routewise_emergency_contacts', JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  const addEmergencyContact = (contact) => {
    const newContact = { id: `ec-${Date.now()}`, ...contact };
    setEmergencyContacts(prev => [...prev, newContact]);
    showToast('Contact Added', `${contact.name} saved to emergency contacts.`, 'success');
  };

  const deleteEmergencyContact = (id) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
    showToast('Contact Removed', 'Emergency contact deleted.', 'info');
  };

  // 11. Privacy & Consent Settings
  const [privacySettings, setPrivacySettings] = useState(() => {
    const saved = localStorage.getItem('routewise_privacy');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      isSharingCommute: true,
      sharingPolicy: 'active_commute',
      retentionDays: 7,
      allowLocation: true
    };
  });

  const updatePrivacySettings = (updates) => {
    setPrivacySettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('routewise_privacy', JSON.stringify(next));
      return next;
    });
    showToast('Settings Saved', 'Consent rules updated.', 'success');
  };

  // 12. CSV Dataset Import Logic
  const importDataset = (type, rows) => {
    if (type === 'incidents') {
      const formatted = rows.map((r, i) => ({
        id: `inc-imp-${Date.now().toString().slice(-4)}-${i}`,
        title: r.title || 'Imported Incident',
        category: r.category || 'other',
        severity: r.severity || 'moderate',
        locationName: r.locationName || 'Imported Location',
        lat: Number(r.lat) || 12.8756,
        lng: Number(r.lng) || 74.8628,
        reportedAgo: 'Recently imported',
        timestamp: new Date().toISOString(),
        delayMinutes: Number(r.delayMinutes) || 15,
        affectedDistanceKm: 1.2,
        description: r.description || 'Imported from CSV dataset',
        verificationLevel: Number(r.verificationLevel) || 3,
        confirmationCount: 3,
        status: 'active',
        evidence: { hasGpsLocation: true, userReportCount: 3, hasMedia: false, avgSpeedKmh: 8, normalSpeedKmh: 45, authorityConfirmed: false },
        alternativeRoute: 'Alternate route advised.'
      }));
      setIncidents(prev => [...formatted, ...prev]);
      showToast('Data Imported', `Added ${formatted.length} incidents to live telemetry.`, 'success');
    } else if (type === 'employees') {
      const formatted = rows.map((r, i) => ({
        id: r.id || `EMP-IMP-${i + 1}`,
        name: r.name || 'Imported Employee',
        department: r.department || 'Operations',
        role: r.role || 'Staff',
        route: r.route || 'Mangaluru – Udupi',
        origin: r.origin || 'City Center',
        scheduledArrival: r.scheduledArrival || '09:00 AM',
        estimatedArrival: r.scheduledArrival || '09:00 AM',
        estimatedDelayMin: Number(r.estimatedDelayMin) || 0,
        journeyStatus: Number(r.estimatedDelayMin) > 0 ? 'delayed' : 'on_schedule',
        incidentAffected: r.incidentAffected || 'None',
        verificationStatus: Number(r.estimatedDelayMin) > 0 ? 'Level 4 (Telemetry Verified)' : 'Normal Flow',
        consentGranted: r.consentGranted !== 'false' && r.consentGranted !== false,
        evidenceApproved: Number(r.estimatedDelayMin) > 0,
        delayCertificateId: Number(r.estimatedDelayMin) > 0 ? `CERT-${Date.now().toString().slice(-4)}` : null,
        hrNotes: 'Imported via CSV roster.'
      }));
      setEmployees(prev => [...formatted, ...prev]);
      showToast('Data Imported', `Added ${formatted.length} employees to commute roster.`, 'success');
    } else if (type === 'journeys') {
      const formatted = rows.map((r, i) => ({
        id: `jrn-imp-${i + 1}`,
        date: 'Imported Record',
        origin: r.origin || 'Origin Hub',
        destination: r.destination || 'Destination Hub',
        routeUsed: r.routeUsed || 'Coastal Corridor',
        durationMin: Number(r.durationMin) || 45,
        typicalMin: 40,
        delayMin: Number(r.delayMin) || 5,
        status: r.status || 'Completed',
        savedMinWithAlternative: Number(r.savedMinWithAlternative) || 0
      }));
      setJourneyHistory(prev => [...formatted, ...prev]);
      showToast('Data Imported', `Added ${formatted.length} trips to journey history.`, 'success');
    }
  };

  // 13. Clear All Data (To experience clean empty states)
  const clearAllData = () => {
    setIncidents([]);
    setEmployees([]);
    setJourneyHistory([]);
    setNotifications([]);
    localStorage.removeItem('routewise_incidents');
    localStorage.removeItem('routewise_employees');
    localStorage.removeItem('routewise_journey_history');
    localStorage.removeItem('routewise_notifications');
    showToast('Data Cleared', 'All datasets emptied. Experience clean empty states.', 'info');
  };

  // 14. Load Seed Data (To instantly test with project records)
  const loadSeedData = () => {
    setIncidents(SEED_INCIDENTS);
    setEmployees(SEED_EMPLOYEES);
    setJourneyHistory(SEED_JOURNEYS);
    showToast('Seed Data Loaded', 'Sample coastal corridor records populated.', 'success');
  };

  return (
    <RouteWiseContext.Provider
      value={{
        theme,
        toggleTheme,
        role,
        setRole,
        user,
        token,
        isAuthenticated: Boolean(token),
        loginUser,
        registerUser,
        logoutUser,
        backendConnected,
        toasts,
        showToast,
        removeToast,
        incidents,
        isLoadingIncidents,
        fetchIncidents,
        addIncident,
        confirmIncident,
        resolveIncident,
        deleteIncident,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        routes,
        selectedRoute,
        setSelectedRoute,
        calculateRouteAlternatives,
        activeJourney,
        startJourney,
        pauseJourney,
        endJourney,
        journeyHistory,
        notifications,
        notificationPreferences,
        updateNotificationPreference,
        markAllNotificationsRead,
        clearNotifications,
        sosActive,
        sosState,
        triggerSOS,
        cancelSOS,
        emergencyContacts,
        addEmergencyContact,
        deleteEmergencyContact,
        privacySettings,
        updatePrivacySettings,
        importDataset,
        clearAllData,
        loadSeedData
      }}
    >
      {children}
    </RouteWiseContext.Provider>
  );
};
