"use client";

import { Bell, MapPin, Clock, Heart, Calendar } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Mock Notification Data
const NOTIFICATIONS = [
  {
    id: 1,
    type: "event_near_you",
    icon: MapPin,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    title: "New Diwan Near You",
    message: "Bhai Niranjan Singh is doing kirtan at Dashmesh Darbar this weekend.",
    time: "2h ago",
    unread: true,
  },
  {
    id: 2,
    type: "reminder",
    icon: Clock,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    title: "Upcoming Event Reminder",
    message: "Rain Sabaai Kirtan starts in 2 hours. See you there!",
    time: "5h ago",
    unread: true,
  },
  {
    id: 3,
    type: "social",
    icon: Heart,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    title: "New Follower",
    message: "Bhai Sahib started following your event updates.",
    time: "1d ago",
    unread: false,
  },
  {
    id: 4,
    type: "platform",
    icon: Calendar,
    iconColor: "text-green-500",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    title: "Event Successfully Published",
    message: "Your Raag Darbar event is now live and visible to the Sangat.",
    time: "3d ago",
    unread: false,
  }
];

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/notifications");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 md:px-8 pb-32">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Bell size={24} className="text-[var(--color-primary)]" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Notifications</h1>
          </div>
          <button className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
            Mark all read
          </button>
        </div>

        {/* List */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {NOTIFICATIONS.map((notif) => {
            const Icon = notif.icon;
            return (
              <div 
                key={notif.id} 
                className={`p-4 rounded-[var(--radius-card)] flex gap-4 items-start transition-colors ${
                  notif.unread 
                    ? "bg-[var(--surface)] border-l-4 border-[var(--color-primary)] shadow-sm" 
                    : "bg-transparent border border-gray-100 dark:border-gray-800 opacity-80"
                }`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.iconBg}`}>
                  <Icon size={20} className={notif.iconColor} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`font-bold text-[var(--foreground)] truncate ${notif.unread ? "text-base" : "text-sm"}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs font-semibold text-[var(--muted)] shrink-0 mt-1">
                      {notif.time}
                    </span>
                  </div>
                  <p className={`text-sm ${notif.unread ? "text-[var(--foreground)]/90" : "text-[var(--muted)]"} leading-relaxed`}>
                    {notif.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State fallback */}
        {NOTIFICATIONS.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="text-[var(--muted)]" size={36} />
            </div>
            <h2 className="text-xl font-bold mb-3 text-[var(--foreground)]">You're all caught up</h2>
            <p className="text-[var(--muted)]">No new notifications right now.</p>
          </div>
        )}

      </div>
    </div>
  );
}
