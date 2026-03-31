"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';

interface MapComponentProps {
  events: any[];
}

export default function MapComponent({ events }: MapComponentProps) {
  const [mounted, setMounted] = useState(false);
  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      const markerIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      });
      setIcon(markerIcon);
      setMounted(true);
    }
  }, []);

  if (!mounted || !icon) return <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">Loading Map...</div>;

  // Filter events with coordinates
  const markers = events.filter(e => e.lat && e.lng);
  
  // Default center index
  const defaultCenter: [number, number] = [40.7128, -74.0060];
  const center: [number, number] = markers.length > 0 ? [markers[0].lat, markers[0].lng] : defaultCenter;

  return (
    <MapContainer center={center} zoom={markers.length > 0 ? 4 : 2} className="w-full h-full z-0" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {markers.map((event) => (
        <Marker key={event.id} position={[event.lat, event.lng]} icon={icon}>
          <Popup className="custom-popup rounded-2xl overflow-hidden border-0 p-0 shadow-lg">
            <div className="p-4 min-w-[200px] m-0">
              <div className="text-[10px] uppercase font-bold text-[var(--color-primary)] mb-1 tracking-wider">{event.performerType}</div>
              <h3 className="font-bold text-[15px] mb-1.5 text-gray-900 leading-tight">
                {event.performerType === 'social' ? event.performerName : `Diwan with ${event.performerName}`}
              </h3>
              <div className="flex items-start gap-1.5 text-xs text-gray-600 mb-1.5">
                <MapPin size={14} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                <span className="max-w-[160px] line-clamp-2">{event.location}, {event.city}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4">
                <Calendar size={14} className="text-[var(--color-primary)] shrink-0" />
                <span className="font-medium">
                   {new Date(event.date.seconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <Link href={`/event/${event.id}`} className="block w-full text-center bg-[var(--color-primary)] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors uppercase tracking-wide">
                View Event
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
