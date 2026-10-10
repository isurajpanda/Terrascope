import { useState } from 'react';
import { MapPin } from 'lucide-react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { LngLat } from '@/types/domain';

const GREENFIELD_LOCATION: LngLat = { lng: -73.9654, lat: 40.7829 };

interface LocationPickerProps {
  onEnter: () => void;
}

export default function LocationPicker({ onEnter }: LocationPickerProps) {
  const setMapCenter = useSettingsStore((s) => s.setMapCenter);
  const [selected, setSelected] = useState<LngLat>(GREENFIELD_LOCATION);

  const handleMarkerClick = () => {
    setMapCenter(GREENFIELD_LOCATION);
    onEnter();
  };

  const handleMapClick = (e: { lngLat: { lng: number; lat: number } }) => {
    setSelected({ lng: e.lngLat.lng, lat: e.lngLat.lat });
  };

  return (
    <div className="relative h-full w-full bg-black">
      <Map
        initialViewState={{
          longitude: GREENFIELD_LOCATION.lng,
          latitude: GREENFIELD_LOCATION.lat,
          zoom: 14,
          pitch: 50,
          bearing: -17,
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        attributionControl={false}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        <Marker
          longitude={GREENFIELD_LOCATION.lng}
          latitude={GREENFIELD_LOCATION.lat}
          anchor="center"
          onClick={handleMarkerClick}
        >
          <div className="relative flex flex-col items-center cursor-pointer">
            <div className="absolute -top-14 flex flex-col items-center">
              <div className="rounded border border-[#2a2a2a] bg-[#0a0a0a]/95 px-2.5 py-1.5 shadow-2xl">
                <span className="font-hud text-[10px] font-bold uppercase tracking-wider text-[#fafafa]">
                  Greenfield School
                </span>
              </div>
              <div className="mt-0.5 text-[8px] text-white/50">
                New York
              </div>
              <div className="h-1.5 w-1.5 rotate-45 border-b border-r border-[#2a2a2a] bg-[#0a0a0a]" />
            </div>
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-pulse" />
              <div className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-black shadow-[0_0_12px_rgba(255,255,255,0.5)]">
                <MapPin size={10} className="text-white" />
              </div>
            </div>
          </div>
        </Marker>

        {selected && (
          <Marker
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="center"
          >
            <div className="relative flex h-5 w-5 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/15 animate-ping" />
              <div className="relative h-2.5 w-2.5 rounded-full border-2 border-white bg-black" />
            </div>
          </Marker>
        )}
      </Map>

      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded border border-[#1a1a1a] bg-[#0a0a0a]/90 px-3 py-1.5 backdrop-blur-md">
        <MapPin size={12} className="text-white" />
        <span className="font-hud text-[10px] font-bold uppercase tracking-wider text-[#fafafa]">
          Select Location
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-1 right-1 z-10 max-w-[65%] text-right text-[9px] leading-tight text-slate-400/80">
        &copy; OpenStreetMap contributors &copy; CARTO
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.35); opacity: 0.9; }
          80%, 100% { transform: scale(2.8); opacity: 0; }
        }
        .animate-pulse-ring { animation: pulse-ring 2.4s cubic-bezier(0.2, 0.6, 0.4, 1) infinite; }
      `}</style>
    </div>
  );
}
