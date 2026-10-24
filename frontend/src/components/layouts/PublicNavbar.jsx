import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRouteWise } from '../../context/RouteWiseContext';
import { Navigation, ArrowRight, LogOut, Radio } from 'lucide-react';

export default function PublicNavbar() {
  const location = useLocation();
  const { isAuthenticated, user, logoutUser, role } = useRouteWise();

  const navLinks = [
    { label: 'Live Traffic', path: '/' },
    { label: 'Documentation', path: '/help' },
    { label: 'About Platform', path: '/about' }
  ];

  const getPortalPath = () => {
    if (role === 'employer' || user?.role === 'employer') return '/employer';
    if (role === 'authority' || user?.role?.includes('authority') || user?.role?.includes('police')) return '/authority';
    if (role === 'admin' || user?.role === 'admin') return '/admin';
    return '/passenger';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1B2A3B] bg-[#101D2B]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Brand Logo & Authority Identifier */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[#1769AA] flex items-center justify-center text-white shadow-sm group-hover:bg-[#1B7DC8] transition-colors">
            <Navigation className="w-4 h-4 fill-white rotate-45" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">
                ROADTRUTH
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[#142436] text-[#85A4D0] border border-[#1B2A3B]">
                City Traffic Control
              </span>
            </div>
            <span className="text-[10px] font-medium tracking-tight text-[#64748B] -mt-0.5">
              Intelligent Transportation & Incident Management
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
          {navLinks.map((link, idx) => (
            <Link
              key={idx}
              to={link.path}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                location.pathname === link.path
                  ? 'text-white bg-[#142436] font-semibold border border-[#1B2A3B]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#142436]/60'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Corridor Live Node */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0A1118] border border-[#1B2A3B] text-[10px] font-mono text-[#94A3B8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#23966B] animate-pulse"></span>
            <span>NH-66 GRID: ACTIVE</span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to={getPortalPath()}
                className="px-3 py-1.5 bg-[#142436] hover:bg-[#1B2A3B] border border-[#1B2A3B] hover:border-[#2E4763] rounded-lg text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#23966B]"></div>
                <span className="max-w-[120px] truncate">{user?.username || user?.email || 'Dashboard'}</span>
              </Link>
              <button
                onClick={logoutUser}
                title="Sign Out"
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#E5484D] hover:bg-[#142436] border border-[#1B2A3B] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
              >
                Sign In
              </Link>

              <Link
                to="/select-role"
                className="px-3.5 py-1.5 bg-[#1769AA] hover:bg-[#1B7DC8] text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
