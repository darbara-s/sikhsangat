import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  increment,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ───────────────────────────────────────────────────────
export interface EventData {
  id?: string;
  performerName: string;
  performerType: "ragi" | "kirtaniye" | "katha";
  date: Timestamp;
  location: string;
  city: string;
  country: string;
  address?: string;
  description?: string;
  posterUrl?: string;
  lat?: number;
  lng?: number;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  attendees: string[]; // array of user UIDs
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  eventsAttended: number;
  eventsContributed: number;
  badges: Badge[];
  savedEvents?: string[]; // Array of event IDs
  createdAt: Timestamp;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: Timestamp;
}

// ─── Events ──────────────────────────────────────────────────────

export async function createEvent(data: Omit<EventData, "id" | "createdAt" | "attendees">) {
  // Strip undefined fields — Firestore rejects them
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(collection(db, "events"), {
    ...cleanData,
    attendees: [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAllEvents(): Promise<EventData[]> {
  const q = query(collection(db, "events"), orderBy("date", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EventData));
}

export async function getEventById(id: string): Promise<EventData | null> {
  const docRef = doc(db, "events", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as EventData;
}

export async function getEventsByUser(uid: string): Promise<EventData[]> {
  const q = query(
    collection(db, "events"),
    where("createdBy", "==", uid)
  );
  const snapshot = await getDocs(q);
  const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EventData));
  return events.sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0));
}

export async function getEventsAttendedByUser(uid: string): Promise<EventData[]> {
  const q = query(
    collection(db, "events"),
    where("attendees", "array-contains", uid)
  );
  const snapshot = await getDocs(q);
  const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EventData));
  return events.sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0));
}

export async function rsvpToEvent(eventId: string, uid: string) {
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) return;

  const data = eventSnap.data() as EventData;
  if (data.attendees?.includes(uid)) return; // already RSVP'd

  await updateDoc(eventRef, {
    attendees: [...(data.attendees || []), uid],
  });

  // Increment user's attended count
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { eventsAttended: increment(1) }, { merge: true });
}

export async function unrsvpFromEvent(eventId: string, uid: string) {
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) return;

  const data = eventSnap.data() as EventData;
  await updateDoc(eventRef, {
    attendees: (data.attendees || []).filter((id) => id !== uid),
  });

  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { eventsAttended: increment(-1) }, { merge: true });
}

export async function getSavedEventsByUser(uid: string): Promise<EventData[]> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return [];

  const data = userSnap.data() as UserProfile;
  const savedIds = data.savedEvents || [];
  if (savedIds.length === 0) return [];

  // Fetch all saved events in parallel
  const fetches = savedIds.map((id) => getEventById(id));
  const results = await Promise.all(fetches);

  // Filter out nulls and format as array
  const events = results.filter((e) => e !== null) as EventData[];
  return events.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)); // Most recent date first
}

// ─── User Profiles ───────────────────────────────────────────────

export async function getOrCreateUserProfile(
  uid: string,
  displayName: string,
  email: string,
  photoURL: string
): Promise<UserProfile> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // Update latest auth info each login
    await updateDoc(userRef, { displayName, email, photoURL });
    return { uid, ...userSnap.data() } as UserProfile;
  }

  // First time: create profile with a welcome badge
  const newProfile: Omit<UserProfile, "uid"> = {
    displayName,
    email,
    photoURL,
    eventsAttended: 0,
    eventsContributed: 0,
    badges: [
      {
        id: "welcome",
        name: "Sangat Member",
        description: "Joined the Sikh Sangat Events platform",
        earnedAt: Timestamp.now(),
      },
    ],
    savedEvents: [],
    createdAt: Timestamp.now(),
  };

  await setDoc(userRef, newProfile);
  return { uid, ...newProfile };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return { uid, ...userSnap.data() } as UserProfile;
}

export async function awardBadge(uid: string, badge: Badge) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const data = userSnap.data() as UserProfile;
  const alreadyHas = data.badges?.some((b) => b.id === badge.id);
  if (alreadyHas) return;

  await updateDoc(userRef, {
    badges: [...(data.badges || []), badge],
  });
}

export async function saveEventToProfile(uid: string, eventId: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const data = userSnap.data() as UserProfile;
  const saved = data.savedEvents || [];
  if (saved.includes(eventId)) return;

  await updateDoc(userRef, {
    savedEvents: [...saved, eventId],
  });
}

export async function unsaveEventFromProfile(uid: string, eventId: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const data = userSnap.data() as UserProfile;
  const saved = data.savedEvents || [];
  
  await updateDoc(userRef, {
    savedEvents: saved.filter(id => id !== eventId),
  });
}
