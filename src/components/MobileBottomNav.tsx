"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Bookmark, Plus, Calendar, User, UserCircle, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, setIsAuthModalOpen } = useAuth();

  const handleAuthRestrictedClick = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      setIsAuthModalOpen(true);
    }
  };

  // Hide the bar entirely on certain pages to accommodate sticky CTAs 
  // or to avoid redundant navigation (like on the Add Event page itself)
  const isExcludedPage = pathname.startsWith('/event/') || pathname === '/add-event';
  
  if (isExcludedPage) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--surface)]/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-50 px-2 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] transition-colors">
      <div className="flex h-full items-center justify-around">
        
        {/* Discover Tab */}
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${
            pathname === "/" ? "text-[var(--color-primary)]" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          <Compass size={22} className={pathname === "/" ? "fill-[var(--color-primary)]/10" : ""} />
          <span className="text-[10px] font-bold">Discover</span>
        </Link>
        
        {/* Events Tab */}
        <Link 
          href="/my-events" 
          onClick={(e) => handleAuthRestrictedClick(e, "/my-events")}
          className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${
            pathname === "/my-events" ? "text-[var(--color-primary)]" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          <Calendar size={22} className={pathname === "/my-events" ? "fill-[var(--color-primary)]/10" : ""} />
          <span className="text-[10px] font-bold">Events</span>
        </Link>
        
        {/* Create Event (FAB style) */}
        <div className="relative w-16 h-full flex justify-center">
          <Link 
            href="/add-event" 
            onClick={(e) => handleAuthRestrictedClick(e, "/add-event")}
            className="absolute -top-5 flex items-center justify-center w-14 h-14 bg-[var(--color-primary)] text-white rounded-full shadow-lg shadow-[var(--color-primary)]/30 border-4 border-[var(--background)] active:scale-95 transition-transform"
          >
            <Plus size={26} strokeWidth={3} />
          </Link>
        </div>
        
        {/* Profile Tab */}
        <Link 
          href="/profile" 
          onClick={(e) => handleAuthRestrictedClick(e, "/profile")}
          className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${
            pathname === "/profile" ? "text-[var(--color-primary)]" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          {user && user.photoURL ? (
            <div className={`w-6 h-6 rounded-full overflow-hidden border-2 ${pathname === "/profile" ? "border-[var(--color-primary)]" : "border-transparent"}`}>
              <Image src={user.photoURL} alt="Profile" width={24} height={24} className="object-cover" />
            </div>
          ) : (
             <UserCircle size={22} className={pathname === "/profile" ? "fill-[var(--color-primary)]/10" : ""} />
          )}
          <span className="text-[10px] font-bold">Profile</span>
        </Link>

        {/* Notifications Tab */}
        <Link 
          href="/notifications" 
          onClick={(e) => handleAuthRestrictedClick(e, "/notifications")}
          className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${
            pathname === "/notifications" ? "text-[var(--color-primary)]" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          <div className="relative">
            <Bell size={22} className={pathname === "/notifications" ? "fill-[var(--color-primary)]/10" : ""} />
            {/* Notification dot */}
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[var(--surface)] rounded-full animate-pulse"></div>
          </div>
          <span className="text-[10px] font-bold">Alerts</span>
        </Link>
        
      </div>
    </div>
  );
}
