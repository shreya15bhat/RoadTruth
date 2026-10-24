import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useRouteWise } from '../../context/RouteWiseContext';
import { 
  Navigation, 
  Building2, 
  Activity, 
  ArrowRight, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { registerUser, showToast } = useRouteWise();

  const roleParam = searchParams.get('role') || 'passenger';
  const destinationParam = searchParams.get('destination') || '';

  const [selectedRole, setSelectedRole] = useState(roleParam);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agency, setAgency] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (searchParams.get('role')) {
      setSelectedRole(searchParams.get('role'));
      setFieldErrors({});
      setGeneralError('');
    }
  }, [searchParams]);

  const validateClientSide = () => {
    const errors = {};
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Username validation
    if (!cleanUsername) {
      errors.username = 'Username is required.';
    } else if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      errors.username = 'Username must be between 3 and 30 characters long.';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      errors.username = 'Username can only contain letters, numbers, underscores, hyphens, and periods (no spaces).';
    }

    // Email validation
    if (!cleanEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Please provide a valid email address.';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    // Role-specific validation
    if (selectedRole === 'employer' && !agency.trim()) {
      errors.agency = 'Company or organization name is required.';
    }

    if (selectedRole === 'authority' && !agency.trim()) {
      errors.agency = 'Traffic department or police agency is required.';
    }

    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    const clientErrors = validateClientSide();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      const firstError = Object.values(clientErrors)[0];
      setGeneralError(firstError);
      return;
    }

    setLoading(true);

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const backendRole = selectedRole === 'authority' 
      ? 'traffic_authority' 
      : selectedRole === 'employer'
      ? 'employer'
      : 'citizen';

    const payload = {
      username: cleanUsername,
      email: cleanEmail,
      password: password,
      role: backendRole
    };

    if (agency.trim()) {
      payload.agency = agency.trim();
    }
    if (badgeNumber.trim()) {
      payload.badge_number = badgeNumber.trim();
    }

    try {
      const res = await registerUser(payload);
      const actualRole = res.user?.role || 'citizen';

      if (selectedRole === 'authority' && actualRole !== 'traffic_authority') {
        showToast(
          'Account Registered',
          'Official application submitted. Provisioned with commuter access pending departmental authorization.',
          'info'
        );
      } else {
        showToast('Registration Successful', `Welcome to ROADTRUTH, ${cleanUsername}!`, 'success');
      }

      // Route according to server-authorized role
      if (destinationParam) {
        navigate(`/passenger/route?destination=${encodeURIComponent(destinationParam)}`);
      } else if (actualRole === 'employer') {
        navigate('/employer');
      } else if (actualRole === 'traffic_authority' || actualRole === 'traffic_police') {
        navigate('/authority');
      } else {
        navigate('/passenger');
      }
    } catch (err) {
      const dataErrors = err.data?.errors;
      if (dataErrors && typeof dataErrors === 'object') {
        setFieldErrors(dataErrors);
        const firstMsg = Object.values(dataErrors).filter(Boolean)[0];
        setGeneralError(firstMsg || 'Please review the highlighted fields.');
      } else {
        const errorMsg = err.data?.message || err.data?.error || err.message || 'Registration failed. Please check your information and try again.';
        setGeneralError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const roleMeta = {
    passenger: {
      title: 'Create Passenger Account',
      subtitle: 'Plan smarter commutes and track live road intelligence.'
    },
    employer: {
      title: 'Create Employer Account',
      subtitle: 'Monitor workforce commute impact and verify transit delays.'
    },
    authority: {
      title: 'Official Departmental Registration',
      subtitle: 'Municipal transit monitoring and arterial corridor dispatch.'
    }
  };

  const currentMeta = roleMeta[selectedRole] || roleMeta.passenger;

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-10 h-10 mx-auto rounded-lg bg-[#1769AA] flex items-center justify-center text-white shadow-sm">
          <Navigation className="w-5 h-5 fill-white rotate-45" />
        </div>
        <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
          ROADTRUTH Account Enrollment
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">{currentMeta.title}</h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div className="p-3.5 bg-[#101D2B] border border-[#E5484D]/40 rounded-lg text-xs text-[#E5484D] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#E5484D] shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">{generalError}</div>
        </div>
      )}

      {/* Main Registration Card */}
      <div className="p-6 sm:p-7 bg-[#101D2B] border border-[#1B2A3B] rounded-lg shadow-sm space-y-5 text-xs">
        {/* Role Selector Tabs */}
        <div className="space-y-1.5">
          <label className="text-slate-300 font-semibold block text-[11px] uppercase tracking-wider">
            Select Account Role:
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#142436] rounded-lg border border-[#1B2A3B]">
            {[
              { id: 'passenger', label: 'Passenger' },
              { id: 'employer', label: 'Employer' },
              { id: 'authority', label: 'Authority' }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelectedRole(r.id);
                  setFieldErrors({});
                  setGeneralError('');
                }}
                className={`py-2 rounded text-center font-bold capitalize transition-colors cursor-pointer ${
                  selectedRole === r.id ? 'bg-[#1769AA] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.replace(/\s+/g, '_'));
                if (fieldErrors.username) {
                  setFieldErrors(prev => ({ ...prev, username: null }));
                }
                if (generalError) setGeneralError('');
              }}
              placeholder="e.g. ramesh_bhandary"
              className={`w-full px-3.5 py-2.5 bg-[#142436] border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                fieldErrors.username ? 'border-[#E5484D] focus:border-[#E5484D]' : 'border-[#1B2A3B] focus:border-[#1769AA]'
              }`}
              required
              disabled={loading}
              autoComplete="username"
            />
            {fieldErrors.username ? (
              <p className="text-[11px] text-[#E5484D] font-medium">{fieldErrors.username}</p>
            ) : (
              <p className="text-[10px] text-slate-500">3-30 characters: letters, numbers, underscores, dots, or hyphens.</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors(prev => ({ ...prev, email: null }));
                }
                if (generalError) setGeneralError('');
              }}
              placeholder="user@example.com"
              className={`w-full px-3.5 py-2.5 bg-[#142436] border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                fieldErrors.email ? 'border-[#E5484D] focus:border-[#E5484D]' : 'border-[#1B2A3B] focus:border-[#1769AA]'
              }`}
              required
              disabled={loading}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-[#E5484D] font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors(prev => ({ ...prev, password: null }));
                }
                if (generalError) setGeneralError('');
              }}
              placeholder="Minimum 6 characters"
              className={`w-full px-3.5 py-2.5 bg-[#142436] border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                fieldErrors.password ? 'border-[#E5484D] focus:border-[#E5484D]' : 'border-[#1B2A3B] focus:border-[#1769AA]'
              }`}
              required
              disabled={loading}
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <p className="text-[11px] text-[#E5484D] font-medium">{fieldErrors.password}</p>
            )}
          </div>

          {/* Employer Fields */}
          {selectedRole === 'employer' && (
            <div className="space-y-1 pt-1">
              <label className="text-slate-200 font-semibold block flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#1769AA]" />
                <span>Company or Organization Name</span>
              </label>
              <input
                type="text"
                value={agency}
                onChange={(e) => {
                  setAgency(e.target.value);
                  if (fieldErrors.agency) {
                    setFieldErrors(prev => ({ ...prev, agency: null }));
                  }
                  if (generalError) setGeneralError('');
                }}
                placeholder="e.g. Coastal Logistics Pvt Ltd"
                className={`w-full px-3.5 py-2.5 bg-[#142436] border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                  fieldErrors.agency ? 'border-[#E5484D] focus:border-[#E5484D]' : 'border-[#1B2A3B] focus:border-[#1769AA]'
                }`}
                required
                disabled={loading}
              />
              {fieldErrors.agency && (
                <p className="text-[11px] text-[#E5484D] font-medium">{fieldErrors.agency}</p>
              )}
            </div>
          )}

          {/* Authority Fields */}
          {selectedRole === 'authority' && (
            <div className="space-y-3 pt-1 border-t border-[#1B2A3B]">
              <div className="space-y-1">
                <label className="text-slate-200 font-semibold block flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#F0A629]" />
                  <span>Traffic Department / Agency</span>
                </label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => {
                    setAgency(e.target.value);
                    if (fieldErrors.agency) {
                      setFieldErrors(prev => ({ ...prev, agency: null }));
                    }
                    if (generalError) setGeneralError('');
                  }}
                  placeholder="e.g. Mangaluru City Traffic Police"
                  className={`w-full px-3.5 py-2.5 bg-[#142436] border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                    fieldErrors.agency ? 'border-[#E5484D] focus:border-[#E5484D]' : 'border-[#1B2A3B] focus:border-[#1769AA]'
                  }`}
                  required
                  disabled={loading}
                />
                {fieldErrors.agency && (
                  <p className="text-[11px] text-[#E5484D] font-medium">{fieldErrors.agency}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Officer / Badge ID (Optional)</label>
                <input
                  type="text"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  placeholder="e.g. KA-19-TR-402"
                  className="w-full px-3.5 py-2.5 bg-[#142436] border border-[#1B2A3B] rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#1769AA] transition-colors"
                  disabled={loading}
                />
              </div>

              <div className="p-3 bg-[#142436] rounded-lg border border-[#1B2A3B] text-[11px] text-slate-400 leading-relaxed">
                Official agency credentials are submitted for verification. Elevated authority privileges are activated following administrative departmental review.
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Account in System...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#1B2A3B] text-slate-400 text-[11px]">
          Already have an account?{' '}
          <Link
            to={`/login?portal=${selectedRole}${destinationParam ? `&destination=${encodeURIComponent(destinationParam)}` : ''}`}
            className="text-[#1769AA] hover:text-[#1B7DC8] font-bold hover:underline"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
