import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useRouteWise } from '../../context/RouteWiseContext';
import { 
  Navigation, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldAlert
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser, showToast, user: currentUser, isAuthenticated } = useRouteWise();

  // Read initial portal and destination from query parameters
  const portalParam = searchParams.get('portal') || 'passenger';
  const destinationParam = searchParams.get('destination') || '';
  const redirectParam = searchParams.get('redirect') || '';

  const [selectedPortal, setSelectedPortal] = useState(portalParam);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync selectedPortal if query param changes
  useEffect(() => {
    if (searchParams.get('portal')) {
      setSelectedPortal(searchParams.get('portal'));
    }
  }, [searchParams]);

  // If already authenticated, redirect to destination or portal
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (destinationParam) {
        navigate(`/passenger/route?destination=${encodeURIComponent(destinationParam)}`, { replace: true });
      } else if (redirectParam) {
        navigate(redirectParam, { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, destinationParam, redirectParam, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setErrorMessage('Please enter both your email/username and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser(cleanIdentifier, password);
      const userRole = res.user?.role || 'citizen';

      // 1. Validate authorization for requested portal
      if (selectedPortal === 'authority') {
        const authorityRoles = ['traffic_authority', 'traffic_police', 'emergency_service', 'road_operator', 'admin'];
        if (!authorityRoles.includes(userRole)) {
          setErrorMessage(
            `Access Denied: Your account role (${userRole.toUpperCase()}) does not have Traffic Authority privileges. Please sign in with an official authority account.`
          );
          setLoading(false);
          return;
        }
        showToast('Official Signed In', `Authenticated as ${res.user.username} (${res.user.agency || 'Traffic Authority'})`, 'success');
        navigate(redirectParam || '/authority');
        return;
      }

      if (selectedPortal === 'employer') {
        const employerRoles = ['employer', 'admin'];
        if (!employerRoles.includes(userRole)) {
          setErrorMessage(
            `Access Denied: Your account role (${userRole.toUpperCase()}) does not have Employer privileges. Please sign in with an authorized organization account.`
          );
          setLoading(false);
          return;
        }
        showToast('Employer Signed In', `Authenticated as ${res.user.username} (${res.user.agency || 'Organization'})`, 'success');
        navigate(redirectParam || '/employer');
        return;
      }

      // 2. Passenger Portal (or default)
      showToast('Welcome Back', `Signed in as ${res.user.username || res.user.email}`, 'success');

      if (destinationParam) {
        navigate(`/passenger/route?destination=${encodeURIComponent(destinationParam)}`);
      } else if (redirectParam) {
        navigate(redirectParam);
      } else {
        // Direct route based on authenticated role
        if (userRole === 'employer') {
          navigate('/employer');
        } else if (['traffic_authority', 'traffic_police', 'emergency_service', 'road_operator'].includes(userRole)) {
          navigate('/authority');
        } else if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/passenger');
        }
      }
    } catch (err) {
      let errorMsg = 'Invalid credentials. Please verify your email/username and password.';
      if (err.data?.errors && typeof err.data.errors === 'object') {
        const errorList = Object.values(err.data.errors).filter(Boolean);
        if (errorList.length > 0) errorMsg = errorList.join(' ');
      } else if (err.data?.message) {
        errorMsg = err.data.message;
      } else if (err.data?.error && err.data.error !== 'Validation Error') {
        errorMsg = err.data.error;
      } else if (err.message && err.message !== 'Validation Error') {
        errorMsg = err.message;
      }
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const portalConfig = {
    passenger: {
      title: 'Passenger Sign In',
      subtitle: 'Access smart corridor routing, verified hazard notices, and commute tracking',
      label: 'Passenger'
    },
    employer: {
      title: 'Employer Portal Sign In',
      subtitle: 'Audit workforce commute telemetry and issue verifiable delay certificates',
      label: 'Employer'
    },
    authority: {
      title: 'Traffic Authority Sign In',
      subtitle: 'Official traffic operations center dispatch, signal timing, and incident management',
      label: 'Traffic Authority'
    }
  };

  const currentConfig = portalConfig[selectedPortal] || portalConfig.passenger;

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-10 h-10 mx-auto rounded-lg bg-[#1769AA] flex items-center justify-center text-white shadow-sm">
          <Navigation className="w-5 h-5 fill-white rotate-45" />
        </div>
        <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
          ROADTRUTH Platform Access
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">{currentConfig.title}</h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          {currentConfig.subtitle}
        </p>
      </div>

      {/* Destination Preserved Notice */}
      {destinationParam && (
        <div className="p-3 bg-[#101D2B] border border-[#1769AA]/40 rounded-lg text-xs text-slate-200 flex items-center gap-2">
          <Navigation className="w-4 h-4 shrink-0 text-[#1769AA] rotate-45" />
          <span>
            Destination saved: <strong className="text-white">"{destinationParam}"</strong>. You will be redirected immediately upon authentication.
          </span>
        </div>
      )}

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-3.5 bg-[#101D2B] border border-[#E5484D]/40 rounded-lg text-xs text-[#E5484D] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#E5484D] shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="p-6 sm:p-7 bg-[#101D2B] border border-[#1B2A3B] rounded-lg shadow-sm space-y-5 text-xs">
        {/* Workspace Portal Selector */}
        <div className="space-y-1.5">
          <label className="text-slate-300 font-semibold block text-[11px] uppercase tracking-wider">
            Target Console Workspace:
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#142436] rounded-lg border border-[#1B2A3B]">
            {[
              { id: 'passenger', label: 'Passenger' },
              { id: 'employer', label: 'Employer' },
              { id: 'authority', label: 'Authority' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPortal(p.id);
                  setErrorMessage('');
                }}
                className={`py-2 rounded text-center font-bold capitalize transition-colors cursor-pointer ${
                  selectedPortal === p.id 
                    ? 'bg-[#1769AA] text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">
              {selectedPortal === 'authority' ? 'Official Username or Email' : 'Email Address or Username'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder={
                  selectedPortal === 'authority'
                    ? 'official@police.gov.in or badge ID'
                    : selectedPortal === 'employer'
                    ? 'admin@company.com'
                    : 'user@example.com'
                }
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#142436] border border-[#1B2A3B] rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#1769AA] transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-semibold block">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter account password"
                className="w-full pl-9 pr-10 py-2.5 bg-[#142436] border border-[#1B2A3B] rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#1769AA] transition-colors"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Central Core...</span>
              </>
            ) : (
              <>
                <span>Sign In to {currentConfig.label}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center pt-2 border-t border-[#1B2A3B] text-slate-400 text-[11px]">
          Need an account?{' '}
          <Link
            to={`/register?role=${selectedPortal}${destinationParam ? `&destination=${encodeURIComponent(destinationParam)}` : ''}`}
            className="text-[#1769AA] hover:text-[#1B7DC8] font-bold hover:underline"
          >
            Create {currentConfig.label} Account
          </Link>
        </div>
      </div>
    </div>
  );
}
