"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, PlusCircle, Loader2, CheckCircle2, Users, LogIn } from "lucide-react";
import { getEventsByUser, getEventsAttendedByUser, EventData } from "@/lib/firestore";

type Tab = "upcoming" | "past";

interface GroupedEvents {
  [dateKey: string]: EventData[];
}

export default function MyEvents() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [createdEvents, setCreatedEvents] = useState<EventData[]>([]);
  const [attendedEvents, setAttendedEvents] = useState<EventData[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchEvents() {
      if (!user) return;
      try {
        const [created, attended] = await Promise.all([
          getEventsByUser(user.uid),
          getEventsAttendedByUser(user.uid),
        ]);
        setCreatedEvents(created);
        setAttendedEvents(attended);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    if (user) fetchEvents();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const now = new Date();

  // Merge & deduplicate events
  const allEvents = [...createdEvents];
  for (const attended of attendedEvents) {
    if (!allEvents.find((e) => e.id === attended.id)) {
      allEvents.push(attended);
    }
  }

  // Filter by upcoming / past
  const filtered = allEvents.filter((event) => {
    const eventDate = event.date?.toDate?.() || new Date();
    return tab === "upcoming" ? eventDate >= now : eventDate < now;
  });

  // Sort: upcoming = ascending, past = descending
  filtered.sort((a, b) => {
    const dateA = a.date?.toDate?.()?.getTime() || 0;
    const dateB = b.date?.toDate?.()?.getTime() || 0;
    return tab === "upcoming" ? dateA - dateB : dateB - dateA;
  });

  // Group by date
  const grouped: GroupedEvents = {};
  for (const event of filtered) {
    const eventDate = event.date?.toDate?.() || new Date();
    const key = eventDate.toISOString().split("T")[0]; // YYYY-MM-DD
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  }

  const dateKeys = Object.keys(grouped);

  const performerTypeLabels: Record<string, string> = {
    ragi: "Ragi",
    kirtaniye: "Kirtaniye",
    katha: "Katha Vachak",
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Events</h1>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-[var(--surface)] border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm">
              <button
                onClick={() => setTab("upcoming")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  tab === "upcoming"
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setTab("past")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  tab === "past"
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Past
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loadingEvents && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
          </div>
        )}

        {/* Empty State */}
        {!loadingEvents && filtered.length === 0 && (
          <div className="text-center py-20 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="text-[var(--muted)]" size={36} />
            </div>
            <h2 className="text-xl font-bold mb-3 text-[var(--foreground)]">
              {tab === "upcoming" ? "No upcoming events" : "No past events"}
            </h2>
            <p className="text-[var(--muted)] mb-8 max-w-sm mx-auto">
              {tab === "upcoming"
                ? "You don't have any upcoming events yet. Browse Diwans or add your own!"
                : "You haven't attended any past events yet."}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/"
                className="px-6 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                Browse Diwans
              </Link>
              <Link
                href="/add-event"
                className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-hover)] transition-all flex items-center gap-2"
              >
                <PlusCircle size={18} />
                Add Event
              </Link>
            </div>
          </div>
        )}

        {/* Timeline */}
        {!loadingEvents && dateKeys.length > 0 && (
          <div className="relative animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Vertical timeline line */}
            <div className="absolute left-[130px] md:left-[170px] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

            <div className="space-y-10">
              {dateKeys.map((dateKey) => {
                const events = grouped[dateKey];
                const d = new Date(dateKey + "T00:00:00");
                const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
                const isToday = dateKey === now.toISOString().split("T")[0];

                return (
                  <div key={dateKey} className="relative">
                    <div className="flex items-start gap-6 sm:gap-10">
                      {/* Date label */}
                      <div className="w-[90px] md:w-[130px] text-right shrink-0 pt-3">
                        <div className={`text-lg font-bold ${isToday ? "text-[var(--color-primary)]" : "text-[var(--foreground)]"}`}>
                          {isToday ? "Today" : monthDay}
                        </div>
                        <div className="text-sm text-[var(--muted)]">{weekday}</div>
                      </div>

                      {/* Timeline dot */}
                      <div className="hidden sm:flex shrink-0 relative z-10">
                        <div className={`w-3 h-3 rounded-full mt-5 ${isToday ? "bg-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20" : "bg-gray-300 dark:bg-gray-600"}`}></div>
                      </div>

                      {/* Event cards */}
                      <div className="flex-1 space-y-4 min-w-0">
                        {events.map((event) => {
                          const eventDate = event.date?.toDate?.() || new Date();
                          const timeStr = eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                          const isCreator = event.createdBy === user.uid;
                          const isAttending = event.attendees?.includes(user.uid);
                          const isPast = eventDate < now;

                          return (
                            <div
                              key={event.id}
                              className={`bg-[var(--surface)] border border-gray-100 dark:border-gray-800 rounded-[var(--radius-card)] p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${
                                isPast ? "opacity-80" : ""
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 min-w-0">
                                  {/* Time */}
                                  <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-2">
                                    <Clock size={14} className="text-[var(--color-primary)]" />
                                    <span className="font-medium">{timeStr}</span>
                                  </div>

                                  {/* Title */}
                                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-1 truncate">
                                    {event.performerName}
                                  </h3>

                                  {/* Type badge */}
                                  <span className="inline-block text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2.5 py-0.5 rounded-full mb-3">
                                    {performerTypeLabels[event.performerType] || event.performerType}
                                  </span>

                                  {/* Location */}
                                  <div className="flex items-start gap-2 text-sm text-[var(--muted)]">
                                    <MapPin size={14} className="mt-0.5 shrink-0" />
                                    <span className="truncate">
                                      {event.location}, {event.city}
                                    </span>
                                  </div>

                                  {/* Description */}
                                  {event.description && (
                                    <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">{event.description}</p>
                                  )}

                                  {/* Status badges */}
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {isAttending && (
                                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
                                        <CheckCircle2 size={12} />
                                        Going
                                      </span>
                                    )}
                                    {isCreator && (
                                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">
                                        Created by you
                                      </span>
                                    )}
                                    {event.attendees && event.attendees.length > 0 && (
                                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--muted)]">
                                        <Users size={12} />
                                        {event.attendees.length} attending
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add event FAB on mobile */}
        <Link
          href="/add-event"
          className="fixed bottom-8 right-8 w-14 h-14 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[var(--color-primary-hover)] hover:shadow-2xl hover:scale-110 transition-all duration-200 z-40 md:hidden"
        >
          <PlusCircle size={24} />
        </Link>
      </div>
    </div>
  );
}
