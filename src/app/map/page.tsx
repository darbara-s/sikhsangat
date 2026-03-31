"use client";

import dynamic from 'next/dynamic';
import { Filter, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllEvents } from '@/lib/firestore';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center font-medium text-[var(--muted)]">Initializing Interactive Map...</div>
});

// --- Sample/Featured Events snippet ---
const FEATURED_EVENTS = [
  {
    id: "feat_1",
    performerName: "Bhai Niranjan Singh Ji",
    performerType: "ragi",
    date: { seconds: Math.floor(Date.now() / 1000) + 86400 * 2, nanoseconds: 0 },
    location: "Dashmesh Darbar",
    city: "Surrey",
    country: "Canada",
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
    lat: 51.5074,
    lng: -0.1278,
  }
];

export default function MapView() {
  const [dbEvents, setDbEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getAllEvents();
        setDbEvents(events);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  const allEvents = [...FEATURED_EVENTS, ...dbEvents];

  return (
    <div className="h-[calc(100vh-64px)] w-full relative flex flex-col md:flex-row overflow-hidden isolate">
      <div className="flex-1 relative z-0 h-full">
        <MapComponent events={allEvents} />
      </div>

      {/* Floating Filter Panel for Map */}
      <div className="absolute left-4 top-4 z-10 w-[calc(100%-32px)] md:w-80 bg-[var(--surface)]/95 backdrop-blur-md p-5 rounded-[var(--radius-card)] shadow-xl border border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-left-4 duration-500 hidden sm:block">
        <div className="flex items-center gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search map area..." 
              className="w-full bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm font-bold uppercase tracking-wider text-[var(--muted)]">
          <Filter size={16} className="text-[var(--color-primary)]" />
          Quick Filters
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)] accent-[var(--color-primary)]" defaultChecked />
            <span className="text-sm font-medium group-hover:text-[var(--color-primary)] transition-colors">Show Ragis</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)] accent-[var(--color-primary)]" defaultChecked />
            <span className="text-sm font-medium group-hover:text-[var(--color-primary)] transition-colors">Show Kirtaniyes</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)] accent-[var(--color-primary)]" defaultChecked />
            <span className="text-sm font-medium group-hover:text-[var(--color-primary)] transition-colors">Show Katha Vachaks</span>
          </label>
        </div>
      </div>
    </div>
  );
}
