import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SunflowerDoodle, SparklesDoodle } from './Doodles';
import { BookOpen, Calendar, SunMedium, Plus, LogOut, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-[#FFE5D9] text-[#5D4037] shadow-sm font-bold border border-[#F4ACB7]/60'
        : 'text-[#6D5D5A] hover:bg-[#F2ECE1] hover:text-[#4A3E3D]'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6EE]/90 backdrop-blur-md border-b border-[#E8DEC8]/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link
          to={isAuthenticated ? "/journal" : "/"}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="relative">
            <SunflowerDoodle className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
            <SparklesDoodle className="w-3.5 h-3.5 absolute -top-1 -right-1 text-amber-500 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-hand text-2xl font-bold tracking-wide text-[#5D4037] flex items-center gap-1">
              TODO: fix my life <span className="text-[#E57373] text-lg font-normal">♡</span>
            </span>
            <span className="text-[10px] tracking-widest text-[#8C7E7A] uppercase -mt-1 font-semibold">
              Personal Journal & Planner
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/journal" className={navLinkClasses} end>
              <BookOpen className="w-4 h-4 text-[#D47A60]" />
              <span>Journal</span>
            </NavLink>
            <NavLink to="/planner" className={navLinkClasses} end>
              <Calendar className="w-4 h-4 text-[#7BA870]" />
              <span>Weekly Planner</span>
            </NavLink>
            <NavLink to={`/planner/${todayStr}`} className={navLinkClasses}>
              <SunMedium className="w-4 h-4 text-[#E9A825]" />
              <span>Daily Planner</span>
            </NavLink>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#6D5D5A] hover:text-[#4A3E3D] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-full bg-[#FFE5D9] hover:bg-[#FFCAD4] text-[#5D4037] font-semibold text-sm transition-all shadow-sm border border-[#F4ACB7]/60"
            >
              Start Journaling ♡
            </Link>
          </nav>
        )}

        {/* Right side Actions */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/journal/new"
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#FFF3B0] hover:bg-[#FFEAA7] text-[#5D4037] font-semibold text-sm transition-all shadow-sm border border-[#FDCB6E]/60 transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-[#B7791F]" />
              <span>New Entry</span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full bg-[#FFFEFA] border border-[#E8DEC8] hover:border-[#D4A373] transition-colors shadow-sm"
              >
                <span className="w-7 h-7 rounded-full bg-[#FFE5D9] flex items-center justify-center text-sm">
                  {user?.avatar || '🌸'}
                </span>
                <span className="text-xs font-semibold text-[#5D4037] pr-2 max-w-[100px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-2xl shadow-lg py-2 z-50 animate-fadeIn"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#FAF6EE]">
                    <p className="text-xs text-[#8C7E7A] font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-[#5D4037] truncate">{user?.name}</p>
                    <p className="text-xs text-[#8C7E7A] truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#5D4037] hover:bg-[#FAF6EE] font-medium transition-colors"
                  >
                    <User className="w-4 h-4 text-[#7BA870]" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#E57373] hover:bg-[#FFF0F0] font-medium transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <Link
              to="/journal/new"
              className="p-2 rounded-full bg-[#FFF3B0] text-[#5D4037] border border-[#FDCB6E]/60 shadow-sm"
              title="New Entry"
            >
              <Plus className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#5D4037] hover:bg-[#F2ECE1]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFEFA] border-b border-[#E8DEC8] px-4 pt-3 pb-6 space-y-3 shadow-md animate-fadeIn">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-[#FAF6EE] rounded-2xl mb-2">
                <span className="text-2xl">{user?.avatar || '🌸'}</span>
                <div>
                  <div className="font-bold text-[#5D4037] text-sm">{user?.name}</div>
                  <div className="text-xs text-[#8C7E7A]">{user?.email}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  to="/journal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#FAF6EE] font-semibold text-[#5D4037]"
                >
                  <BookOpen className="w-4 h-4 text-[#D47A60]" />
                  <span>Journal</span>
                </Link>
                <Link
                  to="/planner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#FAF6EE] font-semibold text-[#5D4037]"
                >
                  <Calendar className="w-4 h-4 text-[#7BA870]" />
                  <span>Weekly Planner</span>
                </Link>
                <Link
                  to={`/planner/${todayStr}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#FAF6EE] font-semibold text-[#5D4037]"
                >
                  <SunMedium className="w-4 h-4 text-[#E9A825]" />
                  <span>Daily Planner</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#FAF6EE] font-semibold text-[#5D4037]"
                >
                  <User className="w-4 h-4 text-[#7BA870]" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl text-[#E57373] hover:bg-[#FFF0F0] font-semibold w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 font-semibold text-[#5D4037] border border-[#E8DEC8] rounded-full bg-[#FAF6EE]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 font-semibold text-[#5D4037] bg-[#FFE5D9] rounded-full shadow-sm"
              >
                Start Journaling ♡
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
