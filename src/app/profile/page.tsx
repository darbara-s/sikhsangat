"use client";

import Image from "next/image";
import { Award, ShieldCheck, Settings, Calendar, LogOut, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getEventsAttendedByUser, EventData } from "@/lib/firestore";

export default function Profile() {
  const { user: authUser, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [recentEvents, setRecentEvents] = useState<EventData[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/login');
    }
  }, [authUser, loading, router]);

  useEffect(() => {
    async function fetchRecentEvents() {
      if (!authUser) return;
      try {
        const events = await getEventsAttendedByUser(authUser.uid);
        // Get last 5 events, most recent first
        setRecentEvents(events.reverse().slice(0, 5));
      } catch (err) {
        console.error("Error fetching recent events:", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    if (authUser) fetchRecentEvents();
  }, [authUser]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || !authUser) {
    return (
      <div className="min-h-screen bg-[var(--background)] py-12 px-4 md:px-8 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const badgeStyleMap: Record<string, { color: string; border: string }> = {
    welcome: { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
    new_sevadar: { color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
    verified_contributor: { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
    frequent_attendee: { color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
  };

  const defaultBadgeStyle = { color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-gray-700" };

  const badgeIcons: Record<string, React.ReactNode> = {
    welcome: <Star size={24} />,
    new_sevadar: <ShieldCheck size={24} />,
    verified_contributor: <Award size={24} />,
  };

  const userName = authUser.displayName || profile?.displayName || "Sevadar";
  const userEmail = authUser.email || profile?.email || "";
  const userPhoto = authUser.photoURL || profile?.photoURL || "";
  const badges = profile?.badges || [];
  const stats = {
    attended: profile?.eventsAttended || 0,
    contributed: profile?.eventsContributed || 0,
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <section className="bg-[var(--surface)] p-8 rounded-[var(--radius-card)] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-8 items-center md:items-start relative animate-in fade-in slide-in-from-top-4 duration-500">
          <button className="absolute top-6 right-6 p-2 text-[var(--muted)] hover:text-[var(--color-primary)] bg-gray-50 dark:bg-gray-800 rounded-full transition-colors hidden sm:block">
            <Settings size={20} />
          </button>
          
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-primary)]/20 relative shrink-0 bg-gray-200 dark:bg-gray-700">
            {userPhoto ? (
              <Image src={userPhoto} alt={userName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[var(--color-primary)]">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left w-full">
            <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">{userName}</h1>
            <p className="text-[var(--muted)] mb-6">{userEmail}</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto md:mx-0">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-black text-[var(--color-primary)]">{stats.attended}</div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold mt-1">Attended</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-black text-[var(--color-primary)]">{stats.contributed}</div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold mt-1">Added</div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Gamification / Badges */}
          <section className="w-full md:w-1/3 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-[var(--surface)] p-6 rounded-[var(--radius-card)] shadow-sm border border-gray-100 dark:border-gray-800 flex-1">
              <h2 className="text-title font-bold text-xl mb-4 flex items-center gap-2">
                <Award className="text-[var(--color-accent)]" /> 
                Your Badges
              </h2>
              {badges.length === 0 ? (
                <p className="text-sm text-[var(--muted)] text-center py-6">Start attending and contributing to earn badges!</p>
              ) : (
                <div className="space-y-4">
                  {badges.map((badge, i) => {
                    const style = badgeStyleMap[badge.id] || defaultBadgeStyle;
                    const icon = badgeIcons[badge.id] || <Award size={24} />;
                    return (
                      <div key={badge.id || i} className={`p-4 rounded-xl border ${style.border} ${style.color} bg-opacity-20 flex items-start gap-4`}>
                        <div className="mt-1">{icon}</div>
                        <div>
                          <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                          <p className="text-xs font-medium opacity-80">{badge.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <button onClick={handleSignOut} className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--surface)] text-red-500 font-semibold rounded-[var(--radius-card)] border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors shadow-sm">
              <LogOut size={18} />
              Sign Out
            </button>
          </section>

          {/* History / My Events */}
          <section className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">
             <div className="bg-[var(--surface)] p-6 rounded-[var(--radius-card)] shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="text-[var(--color-primary)]" />
                  Recent History
                </h2>
                <Link href="/my-events" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                  View All
                </Link>
              </div>
              
              {loadingEvents ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-[var(--color-primary)]" size={24} />
                </div>
              ) : recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--muted)] text-sm mb-4">No events attended yet.</p>
                  <Link href="/" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">Browse upcoming Diwans →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEvents.map((event, i) => {
                    const eventDate = event.date?.toDate?.() || new Date();
                    return (
                      <div key={event.id || i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 gap-4">
                        <div>
                          <h4 className="font-bold text-[var(--foreground)]">{event.performerName}</h4>
                          <p className="text-sm text-[var(--muted)]">{event.location}, {event.city}</p>
                        </div>
                        <div className="text-sm font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">
                          {eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
