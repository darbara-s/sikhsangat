"use client";

import Image from "next/image";
import { Search, MapPin, Calendar, Filter, Bookmark, Users, ChevronDown, Globe, Heart, Mic, Music, BookOpen, Coffee, MessageSquare, Plus, LayoutGrid, Map as MapIcon, X, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getAllEvents, EventData } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";

const MapComponent = dynamic<any>(() => import("@/components/MapComponent"), { ssr: false });

// --- Sample/Featured Events for "Visual Richness" ---
const FEATURED_EVENTS = [
  {
    id: "feat_1",
    performerName: "Bhai Niranjan Singh Ji",
    performerType: "ragi",
    date: { seconds: Math.floor(Date.now() / 1000) + 86400 * 2, nanoseconds: 0 },
    location: "Dashmesh Darbar",
    city: "Surrey",
    country: "Canada",
    createdByName: "Bhai Sahib",
    attendees: ["u1", "u2", "u3", "u4", "u5"],
    description: "A special morning Diwan and Kirtan Samagam.",
    posterUrl: "/images/kirtan-1.png",
    lat: 49.1913,
    lng: -122.8490,
  },
  {
    id: "feat_2",
    performerName: "Giani Pinderpal Singh Ji",
    performerType: "katha",
    date: { seconds: Math.floor(Date.now() / 1000) + 86400 * 5, nanoseconds: 0 },
    location: "Gurdwara Sahib San Jose",
    city: "San Jose",
    country: "USA",
    createdByName: "Sangat Committee",
    attendees: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"],
    description: "Weekly Katha Vichaar on the life of Guru Nanak Dev Ji.",
    posterUrl: "/images/katha-1.png",
    lat: 37.3382,
    lng: -121.8863,
  },
  {
    id: "feat_3",
    performerName: "Bhai Chamanjeet Singh Lal",
    performerType: "kirtaniye",
    date: { seconds: Math.floor(Date.now() / 1000) + 86400 * 10, nanoseconds: 0 },
    location: "Guru Nanak Sikh Academy",
    city: "Hayes",
    country: "UK",
    createdByName: "Local Sangat",
    attendees: ["u1", "u2", "u3"],
    description: "Evening Kirtan Darbar with Classical Ragas.",
    posterUrl: "/images/gurdwara-1.png",
    lat: 51.5126,
    lng: -0.4248,
  },
  {
    id: "feat_4",
    performerName: "Youth Social Meeting",
    performerType: "social",
    date: { seconds: Math.floor(Date.now() / 1000) + 86400 * 15, nanoseconds: 0 },
    location: "Sangat Lounge",
    city: "London",
    country: "UK",
    createdByName: "Sikh Youth UK",
    attendees: ["u1", "u2", "u3", "u4", "u5", "u6"],
    description: "A casual meeting for the youth to discuss Sikhism and modern life.",
    posterUrl: "/images/youth-group-1.png",
    lat: 51.5074,
    lng: -0.1278,
  }
];

const CATEGORIES = [
  { name: "All events", icon: <Globe size={20} />, id: "all" },
  { name: "Ragi & Kirtan", icon: <Music size={20} />, id: "ragi" },
  { name: "Katha", icon: <BookOpen size={20} />, id: "katha" },
  { name: "Youth Clubs", icon: <Coffee size={20} />, id: "youth" },
  { name: "Social Activities", icon: <MessageSquare size={20} />, id: "social" },
];

function HomeContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [visibleCount, setVisibleCount] = useState(8);
  const [dateFilter, setDateFilter] = useState("any");
  const [typeFilter, setTypeFilter] = useState("any");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("upcoming");
  const searchTerm = searchParams.get("q") || "";
  const locationSearch = searchParams.get("l") || "";

  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [showTabs, setShowTabs] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setShowTabs(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setShowTabs(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setShowTabs(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node) &&
        typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node) &&
        sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getAllEvents();
        setDbEvents(events);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Combine Sample + DB Events
  const allEvents = [...FEATURED_EVENTS, ...dbEvents];

  // Filter Logic
  const filteredEvents = allEvents.filter(event => {
    const eventDate = new Date(event.date.seconds * 1000);
    const now = new Date();
    
    const matchesSearch = event.performerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationSearch === "" || (event.city || "").toLowerCase().includes(locationSearch.toLowerCase());
    
    // Category mapping
    const categoryType = activeCategory === "all" ? "any" : 
                        (activeCategory === "ragi" ? "ragi" : 
                        (activeCategory === "katha" ? "katha" : 
                        (activeCategory === "social" ? "social" : "any")));
    
    const matchesCategory = activeCategory === "all" || 
                           (activeCategory === "ragi" && (event.performerType === "ragi" || event.performerType === "kirtaniye")) ||
                           (activeCategory === "katha" && event.performerType === "katha") ||
                           (activeCategory === "social" && event.performerType === "social") ||
                           (activeCategory === "youth" && event.performerType === "social");

    const matchesType = typeFilter === "any" || event.performerType === typeFilter;
    
    const matchesDates = dateFilter === "any" || 
                         (dateFilter === "today" && eventDate.toDateString() === now.toDateString()) ||
                         (dateFilter === "week" && eventDate >= now && eventDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesLocation && matchesCategory && matchesType && matchesDates;
  }).sort((a, b) => {
    if (sortBy === "upcoming") return (a.date?.seconds || 0) - (b.date?.seconds || 0);
    if (sortBy === "newest") return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    if (sortBy === "alphabetical") return a.performerName.localeCompare(b.performerName);
    return 0;
  });

  const displayedEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      
      {/* --- Category Tabs (Meetup/Luma hybrid) --- */}
      <div className={`bg-[var(--surface)] border-b border-gray-100 dark:border-gray-800 sticky top-16 z-20 transition-all duration-300 ${
        showTabs ? "translate-y-0 opacity-100 blur-0" : "-translate-y-full opacity-0 blur-sm pointer-events-none"
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-8 py-4 min-w-max">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center gap-1.5 transition-all relative pb-2 ${
                  activeCategory === cat.id ? "text-[var(--color-primary)] scale-105" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  activeCategory === cat.id ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20" : "bg-gray-50 dark:bg-gray-800"
                }`}>
                  {cat.icon}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">{cat.name}</span>
                {activeCategory === cat.id && (
                  <div className="absolute -bottom-px left-0 right-0 h-1 bg-[var(--color-primary)] rounded-full animate-in fade-in zoom-in duration-300"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 mb-6 md:mb-10">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--foreground)] mb-2 leading-tight">
              {searchTerm 
                ? `${filteredEvents.length} events for "${searchTerm}"` 
                : locationSearch 
                  ? `Diwan events near ${locationSearch}` 
                  : "Upcoming events around the world"
              }
            </h1>
            <p className="text-[var(--muted)] text-sm md:text-base font-medium opacity-70">Discover kirtan and katha from your favorite performers</p>
          </div>

          {/* Filters Bar & Toggle Container (Desktop) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {/* Date Dropdown */}
              <div className="relative" ref={dateDropdownRef}>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === "date" ? null : "date")}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold transition-all ${dateFilter !== "any" ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-gray-200 dark:border-gray-700 bg-[var(--surface)] text-[var(--muted)] hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  <Calendar size={16} /> 
                  {dateFilter === "any" ? "Any day" : dateFilter === "today" ? "Today" : "This Week"} 
                  <ChevronDown size={13} className={`transition-transform duration-300 ${activeDropdown === "date" ? "rotate-180" : ""}`} />
                </button>

                {activeDropdown === "date" && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--surface)] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {["any", "today", "week"].map((option) => (
                      <button
                        key={option}
                        onClick={() => { setDateFilter(option); setActiveDropdown(null); }}
                        className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${dateFilter === option ? "text-[var(--color-primary)] bg-[var(--color-primary)]/5" : "text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                      >
                        {option === "any" ? "Any day" : option === "today" ? "Today" : "This Week"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Type Dropdown */}
              <div className="relative" ref={typeDropdownRef}>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === "type" ? null : "type")}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold transition-all ${typeFilter !== "any" ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-gray-200 dark:border-gray-700 bg-[var(--surface)] text-[var(--muted)] hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  <Mic size={16} /> 
                  {typeFilter === "any" ? "Any type" : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)} 
                  <ChevronDown size={13} className={`transition-transform duration-300 ${activeDropdown === "type" ? "rotate-180" : ""}`} />
                </button>

                {activeDropdown === "type" && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--surface)] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {["any", "ragi", "katha", "social"].map((option) => (
                      <button
                        key={option}
                        onClick={() => { setTypeFilter(option); setActiveDropdown(null); }}
                        className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${typeFilter === option ? "text-[var(--color-primary)] bg-[var(--color-primary)]/5" : "text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                      >
                        {option === "any" ? "Any type" : option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === "sort" ? null : "sort")}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold transition-all ${sortBy !== "upcoming" ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-gray-200 dark:border-gray-700 bg-[var(--surface)] text-[var(--muted)] hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  <Filter size={16} /> 
                  {sortBy === "upcoming" ? "Soonest" : sortBy === "newest" ? "Newest" : "A-Z"} 
                  <ChevronDown size={13} className={`transition-transform duration-300 ${activeDropdown === "sort" ? "rotate-180" : ""}`} />
                </button>

                {activeDropdown === "sort" && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--surface)] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {[
                      { id: "upcoming", name: "Soonest" },
                      { id: "newest", name: "Newest" },
                      { id: "alphabetical", name: "A-Z" }
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => { setSortBy(option.id); setActiveDropdown(null); }}
                        className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${sortBy === option.id ? "text-[var(--color-primary)] bg-[var(--color-primary)]/5" : "text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full items-center">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-full transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-700 shadow-sm text-[var(--color-primary)]" : "text-gray-400 hover:text-gray-600"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode("map")}
                className={`p-1.5 rounded-full transition-all ${viewMode === "map" ? "bg-white dark:bg-gray-700 shadow-sm text-[var(--color-primary)]" : "text-gray-400 hover:text-gray-600"}`}
              >
                <MapIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filters (Row style on mobile) */}
        <div className="flex md:hidden items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar pb-2">
                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-sm font-semibold transition-all ${dateFilter !== "any" ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-gray-200 dark:border-gray-700 bg-[var(--surface)] text-[var(--foreground)]"}`}
                >
                  <Calendar size={14} /> 
                  {dateFilter === "any" ? "Any day" : dateFilter === "today" ? "Today" : "This Week"} 
                  <ChevronDown size={12} className="text-[var(--muted)]" />
                </button>

                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-sm font-semibold transition-all ${typeFilter !== "any" ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-gray-200 dark:border-gray-700 bg-[var(--surface)] text-[var(--foreground)]"}`}
                >
                  <Mic size={14} /> 
                  {typeFilter === "any" ? "Any type" : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)} 
                  <ChevronDown size={12} className="text-[var(--muted)]" />
                </button>

                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-sm font-semibold transition-all ${sortBy !== "upcoming" ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-gray-200 dark:border-gray-700 bg-[var(--surface)] text-[var(--foreground)]"}`}
                >
                  <Filter size={14} /> 
                  {sortBy === "upcoming" ? "Soonest" : sortBy === "newest" ? "Newest" : "A-Z"} 
                  <ChevronDown size={12} className="text-[var(--muted)]" />
                </button>
              </div>

              {/* Mobile View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full items-center shrink-0">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-full transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-700 shadow-sm text-[var(--color-primary)]" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode("map")}
                  className={`p-1.5 rounded-full transition-all ${viewMode === "map" ? "bg-white dark:bg-gray-700 shadow-sm text-[var(--color-primary)]" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <MapIcon size={18} />
                </button>
              </div>
            </div>

        {/* --- View Content --- */}
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          </div>
        ) : viewMode === "map" ? (
          <div className="h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in duration-500">
             <MapComponent events={filteredEvents} />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayedEvents.map((event, index) => (
                <Link href={`/event/${event.id}`} key={event.id} className="group flex flex-col hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-[3/2] w-full bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all">
                    <Image 
                      src={event.posterUrl || "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800&auto=format&fit=crop"} 
                      alt={event.performerName} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                      priority={index < 4}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {event.id.startsWith('feat_') && (
                        <span className="bg-[var(--color-primary)] text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shadow-lg">Featured</span>
                      )}
                      <span className="bg-black/50 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-white/20">
                        {event.performerType}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 pl-1">
                    <h3 className="font-bold text-lg text-[var(--foreground)] leading-snug group-hover:text-[var(--color-primary)] transition-colors mb-1">
                      {event.performerType === 'social' ? event.performerName : `Diwan with ${event.performerName}`}
                    </h3>
                    
                    <p className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-2">
                      {new Date(event.date.seconds * 1000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} • {new Date(event.date.seconds * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                    
                    <div className="flex items-start gap-1.5 text-[var(--muted)] text-sm font-medium mb-3">
                      <MapPin size={16} className="mt-0.5" />
                      <span className="line-clamp-1">{event.location}, {event.city}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center py-10">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="px-8 py-3 bg-[var(--surface)] border border-gray-200 dark:border-gray-800 text-[var(--foreground)] rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                >
                  Load more events
                  <ChevronDown size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-40 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-3">No events found</h2>
            <p className="text-[var(--muted)] mb-8">Try searching for something else or browse another category</p>
            <button 
              onClick={() => { setActiveCategory("all"); }}
              className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold shadow-md hover:translate-y-[-2px] transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* --- Mobile Bottom Sheet Filters --- */}
      {isMobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileFilterOpen(false)}
          ></div>
          
          {/* Sheet */}
          <div className="relative bg-[var(--surface)] w-full rounded-t-3xl p-6 pb-safe shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">Filters & Sort</h3>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Date */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">Date</label>
                <div className="flex flex-wrap gap-2">
                  {["any", "today", "week"].map((option) => (
                    <button
                      key={`mob-date-${option}`}
                      onClick={() => setDateFilter(option)}
                      className={`px-4 py-2.5 rounded-full text-sm font-bold transition-colors ${dateFilter === option ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
                    >
                      {option === "any" ? "Any day" : option === "today" ? "Today" : "This Week"}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Type */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {["any", "ragi", "katha", "social"].map((option) => (
                    <button
                      key={`mob-type-${option}`}
                      onClick={() => setTypeFilter(option)}
                      className={`px-4 py-2.5 rounded-full text-sm font-bold transition-colors ${typeFilter === option ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
                    >
                      {option === "any" ? "Any type" : option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Sort */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "upcoming", name: "Soonest" },
                    { id: "newest", name: "Newest" },
                    { id: "alphabetical", name: "A-Z" }
                  ].map((option) => (
                    <button
                      key={`mob-sort-${option.id}`}
                      onClick={() => setSortBy(option.id)}
                      className={`px-4 py-2.5 rounded-full text-sm font-bold transition-colors ${sortBy === option.id ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full mt-8 py-4 bg-[var(--color-primary)] text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg"
            >
              Show {filteredEvents.length} Results
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
