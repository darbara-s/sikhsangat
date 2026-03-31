"use client";

import dynamic from 'next/dynamic';
import { Filter, Search } from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center font-medium text-[var(--muted)]">Initializing Interactive Map...</div>
});

export default function MapView() {
  return (
    <div className="h-[calc(100vh-64px)] w-full relative flex flex-col md:flex-row overflow-hidden isolate">
      <div className="flex-1 relative z-0 h-full">
        <MapComponent />
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
