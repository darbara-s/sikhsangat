"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Calendar, MapPin, Users, Share2, Heart, 
  ChevronLeft, Clock, Info, ShieldCheck, 
  Map as MapIcon, Bookmark, CheckCircle2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getEventById, rsvpToEvent, unrsvpFromEvent, saveEventToProfile, unsaveEventFromProfile, EventData } from "@/lib/firestore";
import Link from "next/link";

// Mock featured events fallback (same as Home page)
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
    description: "A special morning Diwan and Kirtan Samagam. Join us for a spiritual journey through the sacred hymns of Gurbani. This event is open to all and will include Langar Seva after the completion of the Diwan.",
    posterUrl: "/images/kirtan-1.png",
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
    description: "Weekly Katha Vichaar on the life of Guru Nanak Dev Ji. Giani Ji will delve deep into the teachings and life stories of the first Sikh Guru, providing modern context and spiritual guidance for the Sangat.",
    posterUrl: "/images/katha-1.png",
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
    description: "Evening Kirtan Darbar with Classical Ragas. Experience the divine melody of Gurbani Kirtan performed in traditional classical Indian ragas. An evening of peace, meditation, and spiritual elevation.",
    posterUrl: "/images/gurdwara-1.png",
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
    description: "A casual meeting for the youth to discuss Sikhism and modern life. We'll explore how to balance professional goals with spiritual values, followed by a networking session over tea and snacks.",
    posterUrl: "/images/youth-group-1.png",
  }
];

export default function EventDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, profile, setIsAuthModalOpen, refreshProfile } = useAuth();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRsvped, setIsRsvped] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // Initialize saved state from profile
  useEffect(() => {
    if (profile?.savedEvents?.includes(id)) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [profile, id]);

  useEffect(() => {
    const fetchEvent = async () => {
      // Check featured first
      const feat = FEATURED_EVENTS.find(e => e.id === id);
      if (feat) {
        setEvent(feat);
        setIsRsvped(feat.attendees.includes(user?.uid || ""));
        setLoading(false);
        return;
      }

      // Check Firestore
      try {
        const data = await getEventById(id);
        if (data) {
          setEvent(data);
          setIsRsvped(data.attendees?.includes(user?.uid || "") || false);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, user]);

  const handleRsvp = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setRsvpLoading(true);
    try {
      if (isRsvped) {
        await unrsvpFromEvent(id, user.uid);
        setIsRsvped(false);
        setEvent((prev: any) => ({
          ...prev,
          attendees: prev.attendees.filter((uid: string) => uid !== user.uid)
        }));
      } else {
        await rsvpToEvent(id, user.uid);
        setIsRsvped(true);
        setEvent((prev: any) => ({
          ...prev,
          attendees: [...(prev.attendees || []), user.uid]
        }));
      }
      await refreshProfile();
    } catch (err) {
      console.error("RSVP error:", err);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    // Optimistic UI update
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    
    try {
      if (newSavedState) {
        await saveEventToProfile(user.uid, id);
      } else {
        await unsaveEventFromProfile(user.uid, id);
      }
      await refreshProfile();
    } catch (err) {
      console.error("Error saving event:", err);
      // Revert on error
      setIsSaved(!newSavedState);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-4">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-400">
           <Info size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-[var(--muted)] mb-8 text-center max-w-md">This event might have been removed or the link is incorrect.</p>
        <Link href="/" className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold shadow-lg">
          Browse Other Events
        </Link>
      </div>
    );
  }

  const eventDate = new Date(event.date.seconds * 1000);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">
      {/* --- Breadcrumbs / Back --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors group underline-offset-4 hover:underline"
        >
          <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back to Events
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* --- Left Column: Content --- */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Hero Poster */}
          <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
            <Image 
              src={event.posterUrl || "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=1200&auto=format&fit=crop"} 
              alt={event.performerName}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4">
               <span className="bg-black/50 backdrop-blur-md text-white text-xs uppercase font-bold px-4 py-1.5 rounded-full border border-white/20">
                  {event.performerType}
               </span>
            </div>
          </div>

          {/* Title & Stats */}
          <div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)] mb-6 leading-tight">
               {event.performerType === 'social' ? event.performerName : `Diwan with ${event.performerName}`}
             </h1>
             
             <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <Users size={24} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Attendance</p>
                      <p className="font-bold text-[var(--foreground)]">{event.attendees?.length || 0} Sangat Members</p>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                      <ShieldCheck size={24} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Entry Status</p>
                      <p className="font-bold text-[var(--foreground)]">Free Entry / All Welcome</p>
                   </div>
                </div>
             </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Description */}
          <div className="space-y-4">
             <h2 className="text-2xl font-black text-[var(--foreground)]">About this Event</h2>
             <p className="text-lg text-[var(--muted)] leading-relaxed font-medium">
               {event.description || "No detailed description provided for this event. Please contact the organizers for more information."}
             </p>
          </div>

          {/* Performer Card */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-8 items-center">
             <div className="w-32 h-32 rounded-full overflow-hidden relative border-4 border-white dark:border-gray-700 shadow-xl shrink-0">
                <Image 
                  src={event.posterUrl || "https://i.pravatar.cc/300?u=performer"} 
                  alt={event.performerName}
                  fill
                  className="object-cover"
                />
             </div>
             <div className="text-center md:text-left">
                <p className="text-xs font-black text-[var(--color-primary)] uppercase tracking-[0.2em] mb-2">{event.performerType}</p>
                <h3 className="text-2xl font-black mb-3">{event.performerName}</h3>
                <p className="text-[var(--muted)] font-medium mb-6 line-clamp-2 max-w-xl">
                  Highly respected {event.performerType} within the global Sikh Sangat, known for spiritual depth and divine connection.
                </p>
                <Link href={`/performer/${event.performerName.replace(/\s+/g, '-').toLowerCase()}`} className="text-sm font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm group">
                  View Full Profile <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
             </div>
          </div>

        </div>

        {/* --- Right Column: Sidebar Info --- */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl space-y-8">
             
             {/* Date Info */}
             <div className="flex gap-4">
                <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center text-[var(--color-primary)] shrink-0">
                   <Calendar size={24} />
                </div>
                <div>
                   <h4 className="font-black text-[var(--foreground)]">Date & Time</h4>
                   <p className="text-[var(--muted)] font-bold">{eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                   <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mt-1">
                      <Clock size={14} />
                      {eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} onwards
                   </div>
                </div>
             </div>

             {/* Location Info */}
             <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                   <MapPin size={24} />
                </div>
                <div>
                   <h4 className="font-black text-[var(--foreground)]">Venue Info</h4>
                   <p className="text-[var(--muted)] font-bold">{event.location}</p>
                   <p className="text-sm font-medium text-gray-500">{event.city}, {event.country}</p>
                   <button className="flex items-center gap-1.5 text-xs font-black text-blue-600 dark:text-blue-400 mt-2 hover:underline">
                      <MapIcon size={14} /> Open in Google Maps
                   </button>
                </div>
             </div>

             <hr className="border-gray-50 dark:border-gray-800" />

             {/* Action Buttons */}
             <div className="flex flex-col gap-4">
                <button 
                  onClick={handleRsvp}
                  disabled={rsvpLoading}
                  className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                    isRsvped 
                      ? "bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/20 dark:border-green-900/50" 
                      : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                  }`}
                >
                  {rsvpLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : isRsvped ? (
                    <><CheckCircle2 size={24} /> Going</>
                  ) : "Reserve a Spot"}
                </button>

                <div className="flex gap-3">
                   <button 
                    onClick={handleSave}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold transition-all active:scale-95 ${
                      isSaved ? "bg-red-50 text-red-500 border-red-100" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                    }`}
                   >
                      <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
                      {isSaved ? "Saved" : "Save Event"}
                   </button>
                   <button className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95">
                      <Share2 size={20} />
                   </button>
                </div>
             </div>

             {/* Social Proof */}
             <div className="flex flex-col gap-3">
                <div className="flex -space-x-2">
                   {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden relative shadow-sm">
                         <Image src={`https://i.pravatar.cc/100?u=user${i}`} alt="user" fill className="object-cover" />
                      </div>
                   ))}
                   <div className="w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500 shadow-sm">
                      +{Math.floor(Math.random() * 50)}
                   </div>
                </div>
                <p className="text-xs font-bold text-gray-500">
                   <span className="text-[var(--foreground)]">{event.attendees?.length || 0} people</span> are attending this event
                </p>
             </div>

          </div>

          <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/40 rounded-3xl text-center">
             <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">Stay updated!</p>
             <p className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70">Subscribe to notifications for this event's daily updates.</p>
          </div>

        </div>

      </div>

      {/* --- Mobile Fixed Attend Bar --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-50 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-full duration-500">
         <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase text-[var(--color-primary)] tracking-widest">{eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            <p className="text-sm font-black truncate max-w-[150px]">{event.performerName}</p>
         </div>
         <button 
           onClick={handleRsvp}
           disabled={rsvpLoading}
           className={`flex-1 py-3 rounded-xl font-black shadow-lg shadow-[var(--color-primary)]/20 active:scale-95 transition-all flex items-center justify-center gap-2 ${
             isRsvped 
               ? "bg-green-500 text-white" 
               : "bg-[var(--color-primary)] text-white"
           }`}
         >
           {rsvpLoading ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
           ) : isRsvped ? (
             <><CheckCircle2 size={20} /> Going</>
           ) : "Reserve a Spot"}
         </button>
      </div>
    </div>
  );
}
