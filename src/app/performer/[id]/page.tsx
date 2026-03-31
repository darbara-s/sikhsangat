"use client";

import Image from "next/image";
import { BadgeCheck, Users, Calendar as CalendarIcon, MapPin, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function PerformerProfile() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3)); // April 2026

  const performer = {
    name: "Bhai Niranjan Singh Ji",
    type: "Ragi",
    isVerified: true,
    followers: "124K",
    bio: "Internationally renowned Ragi jatha, dedicated to spreading the divine message of Guru Granth Sahib Ji through profound and soul-stirring Kirtan. Based in Patiala, Punjab, but frequently travels globally for Diwans across North America, Europe, and Australia.",
    photoUrl: "https://images.unsplash.com/photo-1540304453527-62f97914fd76?w=800&h=800&fit=crop",
  };

  const events = [
    { date: "2026-04-15", time: "18:00", location: "Gurdwara Sahib San Jose", city: "San Jose, CA" },
    { date: "2026-04-16", time: "10:00", location: "Fremont Gurdwara", city: "Fremont, CA" },
    { date: "2026-04-18", time: "19:00", location: "Dashmesh Darbar", city: "Surrey, BC" },
  ];

  // Helper to get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const days = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  return (
    <div className="min-h-screen bg-[var(--background)] pb-16">
      {/* Cover / Header Layer */}
      <div className="h-64 md:h-80 w-full relative bg-[var(--secondary)] overflow-hidden">
        <Image 
          src={performer.photoUrl} 
          alt="Cover" 
          fill 
          className="object-cover opacity-30 blur-sm scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative -mt-32">
        {/* Profile Info Section */}
        <div className="bg-[var(--surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 md:gap-10 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-[var(--surface)] shadow-lg shrink-0 mx-auto md:mx-0 -mt-20 md:-mt-28 bg-gray-200">
            <Image src={performer.photoUrl} alt={performer.name} fill className="object-cover" />
          </div>

          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold flex items-center justify-center md:justify-start gap-2">
                  {performer.name}
                  {performer.isVerified && <BadgeCheck className="text-blue-500 shrink-0" size={28} />}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-[var(--muted)] font-medium">
                  <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1 rounded-full text-sm font-semibold">
                    {performer.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    {performer.followers} Followers
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <button 
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-8 py-2.5 rounded-full font-semibold transition-all shadow-sm ${
                    isFollowing 
                    ? "bg-gray-100 dark:bg-gray-800 text-[var(--foreground)] border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200" 
                    : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[var(--foreground)] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <p className="text-[var(--foreground)] leading-relaxed mt-4 opacity-90 text-sm md:text-base">
              {performer.bio}
            </p>
          </div>
        </div>

        {/* Calendar & Events Section */}
        <div className="mt-8 flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
          
          {/* Calendar Widget */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-[var(--surface)] rounded-[var(--radius-card)] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CalendarIcon className="text-[var(--color-primary)]" />
                  Schedule
                </h2>
                <div className="flex gap-2 text-[var(--foreground)]">
                  <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
                  <span className="font-semibold px-2 flex items-center">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                  <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><ChevronRight size={20} /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                  <div key={d} className="text-xs font-semibold text-[var(--muted)] py-1">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}
                {Array.from({ length: days }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const hasEvent = events.some(e => e.date === dateStr);
                  
                  return (
                    <div 
                      key={day} 
                      className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium relative cursor-pointer transition-all ${
                        hasEvent 
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold hover:bg-[var(--color-primary)] hover:text-white" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--foreground)] opacity-80"
                      }`}
                    >
                      {day}
                      {hasEvent && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--color-primary)]"></div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Event List */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold mb-4">Upcoming Diwans ({events.length})</h3>
            
            {events.map((event, i) => (
              <div key={i} className="group bg-[var(--surface)] p-5 rounded-[var(--radius-card)] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-5 relative overflow-hidden">
                {/* Decorative side bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="bg-[var(--color-primary)]/5 text-[var(--color-primary)] p-4 rounded-xl text-center min-w-[80px]">
                  <div className="text-sm font-bold uppercase">{monthNames[parseInt(event.date.split("-")[1]) - 1].substring(0, 3)}</div>
                  <div className="text-2xl font-black leading-none my-1">{event.date.split("-")[2]}</div>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-1">{event.location}</h4>
                  <div className="flex flex-col sm:flex-row gap-3 text-sm text-[var(--muted)] font-medium">
                    <span className="flex items-center gap-1.5"><CalendarIcon size={14} /> {event.time}</span>
                    <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> {event.city}</span>
                  </div>
                </div>

                <div className="w-full sm:w-auto mt-2 sm:mt-0 flex gap-2">
                  <button className="flex-1 sm:flex-none px-4 py-2 border-2 border-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white rounded-lg font-semibold transition-colors">
                    Save
                  </button>
                  <button className="px-5 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors">
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
