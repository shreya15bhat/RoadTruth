import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useRouteWise } from '../../context/RouteWiseContext';
import { ShieldAlert, LogOut, ArrowRight } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles, portalName }) {
  const { isAuthenticated, user, logoutUser } = useRouteWise();
  const location = useLocation();

  // 1. Check Authentication
  if (!isAuthenticated) {
    const portal = portalName || 'passenger';
    const redirectUrl = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?portal=${portal}&redirect=${encodeURIComponent(redirectUrl)}`}
        replace
      />
    );
  }

  // 2. Check Role Authorization if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'citizen';
    const isAuthorized = allowedRoles.includes(userRole);

    if (!isAuthorized) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-400">Access Restricted</span>
              <h1 className="text-2xl font-black text-white mt-1">Authorization Required</h1>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your authenticated account (<span className="text-slate-200 font-semibold">{user?.email || user?.username}</span>) has the role of{' '}
              <span className="text-cyan-400 font-bold uppercase">{userRole}</span>, which is not authorized to access the{' '}
              <span className="text-white font-bold capitalize">{portalName || 'requested'} Portal</span>.
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                to={
                  userRole === 'employer'
                    ? '/employer'
                    : userRole.includes('authority') || userRole.includes('police')
                    ? '/authority'
                    : '/passenger'
                }
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Go to Your Authorized Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  logoutUser();
                  window.location.href = `/login?portal=${portalName || 'passenger'}`;
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out & Switch Account</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}
