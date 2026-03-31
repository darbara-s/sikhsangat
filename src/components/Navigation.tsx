"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPin, Search, Menu, X, User, LogIn, Plus, Calendar, Bookmark } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, loading, setIsAuthModalOpen, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [locationSearch, setLocationSearch] = useState(searchParams.get("l") || "");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) params.set("q", searchTerm);
    else params.delete("q");
    if (locationSearch) params.set("l", locationSearch);
    else params.delete("l");
    
    router.push(`/?${params.toString()}`);
  };

  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
    setLocationSearch(searchParams.get("l") || "");
  }, [searchParams]);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[var(--surface)] border-b border-gray-100 dark:border-gray-800 z-[60] px-4 md:px-8 flex items-center justify-between transition-colors shadow-sm font-inter">
      <div className="flex items-center gap-6 flex-1">
        <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2 shrink-0 transition-transform hover:scale-105 active:scale-95">
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shadow-lg">
            <span className="text-xl leading-none">☬</span>
          </div>
          <span className="hidden lg:inline font-black tracking-tight bg-gradient-to-r from-[var(--color-primary)] to-orange-600 bg-clip-text text-transparent">Sikh Sangat</span>
        </Link>

        {/* Meetup Style Search Bar in Header */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full overflow-hidden shadow-inner focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 transition-all">
          <div className="flex items-center gap-2 px-4 flex-1 border-r border-gray-200 dark:border-gray-700">
            <Search className="text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search events" 
              className="w-full bg-transparent py-2.5 outline-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-4 flex-1">
            <MapPin className="text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Location" 
              className="w-full bg-transparent py-2.5 outline-none text-sm font-medium"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-[var(--color-primary)] text-white p-2.5 m-1 rounded-full hover:bg-[var(--color-primary-hover)] transition-all shadow-md">
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* Desktop Auth/Actions */}
      <div className="hidden md:flex items-center gap-4">
        {mounted && !loading && (
          user ? (
            <div className="flex items-center gap-6">
              <Link href="/add-event" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary)] flex items-center gap-1.5 transition-colors">
                <Plus size={18} /> Add event
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-3 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all focus:ring-2 focus:ring-[var(--color-primary)]/20 shadow-sm"
                >
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{user.displayName?.split(" ")[0] || "Profile"}</span>
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt="Profile" width={32} height={32} className="rounded-full shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                      {user.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-[70] py-3 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
                    <div className="px-5 py-2 mb-2 border-b border-gray-50 dark:border-gray-800">
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user.displayName}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">{user.email}</p>
                    </div>
                    
                    <Link 
                      href="/profile" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <User size={18} className="text-gray-400" /> View Profile
                    </Link>
                    <Link 
                      href="/my-events" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Calendar size={18} className="text-gray-400" /> My Events
                    </Link>
                    <Link 
                      href="/profile?tab=saved" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Bookmark size={18} className="text-gray-400" /> Saved Events
                    </Link>
                    
                    <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                      <button 
                        onClick={() => { signOut(); setIsProfileDropdownOpen(false); }}
                        className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              >
                Log in
              </button>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2 text-sm font-bold bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-hover)] transition-all shadow-md active:scale-95"
              >
                Sign up
              </button>
            </div>
          )
        )}
      </div>

      {/* Mobile Actions */}
      <div className="md:hidden flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:text-[var(--color-primary)]">
          <Search size={22} />
        </button>
        <button
          className="p-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-6 md:hidden shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-4">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-800 dark:text-white">Browse Events</Link>
            <Link href="/map" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-800 dark:text-white">Map View</Link>
            {user && <Link href="/my-events" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-800 dark:text-white">My Events</Link>}
          </div>
          
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            {mounted && !loading && (
              user ? (
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-black text-xl">
                    {user.displayName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{user.displayName}</h4>
                    <p className="text-sm text-gray-500 font-medium">View Profile</p>
                  </div>
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  <button onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full py-4 font-bold text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl">Log in</button>
                  <button onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full py-4 font-bold text-white bg-[var(--color-primary)] rounded-xl">Sign up</button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
