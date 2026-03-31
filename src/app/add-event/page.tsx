"use client";

import { Calendar, MapPin, Clock, Image as ImageIcon, CheckCircle, Loader2, Globe, ChevronDown, AlignLeft, Users, Mic } from "lucide-react";
import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { createEvent, awardBadge } from "@/lib/firestore";
import { Timestamp, doc, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function AddEvent() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    performerName: "",
    performerType: "",
    date: "",
    time: "",
    endTime: "",
    venueName: "",
    city: "",
    country: "",
    address: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      await createEvent({
        performerName: formData.performerName,
        performerType: formData.performerType as "ragi" | "kirtaniye" | "katha",
        date: Timestamp.fromDate(dateTime),
        location: formData.venueName,
        city: formData.city,
        country: formData.country,
        address: formData.address || undefined,
        description: formData.description || undefined,
        createdBy: user.uid,
        createdByName: user.displayName || "Anonymous",
      });

      // Safely increment — setDoc with merge won't fail if doc doesn't exist
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { eventsContributed: increment(1) }, { merge: true });

      // Award "New Sevadar" badge on first contribution
      if (profile && profile.eventsContributed === 0) {
        await awardBadge(user.uid, {
          id: "new_sevadar",
          name: "New Sevadar",
          description: "Added first event to the platform",
          earnedAt: Timestamp.now(),
        });
      }

      await refreshProfile();
      setSuccess(true);
    } catch (err: any) {
      console.error("Error adding event:", err);
      setError(err.message || "Failed to add event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Auth gate
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] py-20 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-6">
          <Mic className="text-[var(--color-primary)]" size={36} />
        </div>
        <h1 className="text-2xl font-bold mb-3">Sign in Required</h1>
        <p className="text-[var(--muted)] mb-8 max-w-md">You need to be signed in to add a new Diwan event.</p>
        <Link href="/login" className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[var(--color-primary-hover)] transition-all shadow-sm hover:shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[var(--background)] py-20 px-4 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
          <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-3">Diwan Published!</h1>
        <p className="text-[var(--muted)] mb-8 max-w-md">
          Your event is live. The Sangat can now discover and RSVP to this Diwan.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => { setSuccess(false); setFormData({ performerName: "", performerType: "", date: "", time: "", endTime: "", venueName: "", city: "", country: "", address: "", description: "" }); setShowDescription(false); setShowLocation(false); }}
            className="px-6 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            Add Another
          </button>
          <Link href="/my-events" className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-hover)] transition-all">
            View My Events
          </Link>
        </div>
      </div>
    );
  }

  // Format the selected date for display
  const formattedDate = formData.date
    ? new Date(formData.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-medium max-w-4xl mx-auto">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Left Column — Poster Upload */}
            <div className="w-full md:w-[280px] shrink-0">
              <div className="aspect-video md:aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-[var(--surface)] flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-200 group overflow-hidden relative">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[var(--color-primary)]/10 transition-all duration-200">
                  <ImageIcon className="text-[var(--muted)] group-hover:text-[var(--color-primary)] transition-colors" size={28} />
                </div>
                <p className="text-sm font-semibold text-[var(--muted)] group-hover:text-[var(--color-primary)] transition-colors">Upload Poster</p>
                <p className="text-xs text-[var(--muted)] mt-1 opacity-70">PNG, JPG (max. 5MB)</p>
              </div>

              {/* Performer Type Selector */}
              <div className="mt-4 bg-[var(--surface)] rounded-2xl border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                  <Mic size={18} className="text-[var(--color-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold block mb-0.5">Type</label>
                  <select
                    name="performerType"
                    value={formData.performerType}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm font-semibold text-[var(--foreground)] outline-none cursor-pointer appearance-none"
                    required
                  >
                    <option value="">Select type...</option>
                    <option value="ragi">Ragi</option>
                    <option value="kirtaniye">Kirtaniye</option>
                    <option value="katha">Katha Vachak</option>
                  </select>
                </div>
                <ChevronDown size={16} className="text-[var(--muted)] shrink-0" />
              </div>
            </div>

            {/* Right Column — Event Details */}
            <div className="flex-1 min-w-0 w-full">
              {/* Event Name */}
              <input
                type="text"
                name="performerName"
                value={formData.performerName}
                onChange={handleChange}
                placeholder="Event Name"
                className="w-full bg-transparent text-3xl md:text-4xl font-bold text-[var(--foreground)] placeholder-[var(--muted)]/50 outline-none mb-8 border-none leading-tight"
                required
              />

              {/* Date & Time Card */}
              <div className="bg-[var(--surface)] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
                {/* Start Row */}
                <div className="flex items-center px-5 py-4 gap-4">
                  <div className="flex items-center gap-3 min-w-[80px]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]"></div>
                    <span className="text-sm font-medium text-[var(--muted)]">Start</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all cursor-pointer min-w-[160px]"
                        required
                      />
                    </div>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Divider with dotted line */}
                <div className="flex items-center px-5">
                  <div className="min-w-[80px] flex justify-start pl-[4px]">
                    <div className="w-px h-5 border-l-2 border-dotted border-gray-300 dark:border-gray-600 ml-[4px]"></div>
                  </div>
                </div>

                {/* End Row */}
                <div className="flex items-center px-5 py-4 gap-4">
                  <div className="flex items-center gap-3 min-w-[80px]">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                    <span className="text-sm font-medium text-[var(--muted)]">End</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)]">
                      {formattedDate || "Select date"}
                    </span>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Location Row */}
              <div className="bg-[var(--surface)] rounded-2xl border border-gray-100 dark:border-gray-800 mb-4 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowLocation(!showLocation)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                >
                  <MapPin size={20} className="text-[var(--muted)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-semibold ${formData.venueName ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                      {formData.venueName
                        ? `${formData.venueName}${formData.city ? `, ${formData.city}` : ""}`
                        : "Add Event Location"}
                    </span>
                    {!formData.venueName && (
                      <p className="text-xs text-[var(--muted)] opacity-70 mt-0.5">Gurdwara or venue address</p>
                    )}
                  </div>
                  <ChevronDown size={16} className={`text-[var(--muted)] shrink-0 transition-transform duration-200 ${showLocation ? "rotate-180" : ""}`} />
                </button>

                {showLocation && (
                  <div className="px-5 pb-5 pt-1 space-y-4 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-200">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Venue Name</label>
                      <input type="text" name="venueName" value={formData.venueName} onChange={handleChange} placeholder="e.g. Dashmesh Darbar" className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Surrey" className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Country</label>
                        <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="e.g. Canada" className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Full Address <span className="normal-case font-medium">(optional)</span></label>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street address" className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all" />
                    </div>
                  </div>
                )}
              </div>

              {/* Description Row */}
              <div className="bg-[var(--surface)] rounded-2xl border border-gray-100 dark:border-gray-800 mb-6 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowDescription(!showDescription)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                >
                  <AlignLeft size={20} className="text-[var(--muted)] shrink-0" />
                  <span className={`text-sm font-semibold flex-1 ${formData.description ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                    {formData.description ? formData.description.substring(0, 60) + (formData.description.length > 60 ? "..." : "") : "Add Description"}
                  </span>
                  <ChevronDown size={16} className={`text-[var(--muted)] shrink-0 transition-transform duration-200 ${showDescription ? "rotate-180" : ""}`} />
                </button>

                {showDescription && (
                  <div className="px-5 pb-5 pt-1 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-200">
                    <textarea
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Share details about this Diwan — who is performing, what will be covered, special instructions for attendees..."
                      className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all resize-none"
                    ></textarea>
                  </div>
                )}
              </div>

              {/* Event Options */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3 px-1">Event Options</h3>
                <div className="bg-[var(--surface)] rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-[var(--muted)]" />
                      <span className="text-sm font-semibold text-[var(--foreground)]">Capacity</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--muted)]">Unlimited</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Globe size={18} className="text-[var(--muted)]" />
                      <span className="text-sm font-semibold text-[var(--foreground)]">Visibility</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">Public</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-base rounded-2xl shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Create Event"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
