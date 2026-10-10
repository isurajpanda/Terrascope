import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayerKey, LngLat, Role } from '@/types/domain';

const NEW_YORK_CENTER: LngLat = { lng: -73.9857, lat: 40.7484 };

interface SettingsState {
  role: Role;
  siteId: string;
  dayNight: 'day' | 'night';
  speed: 1 | 5 | 20;
  running: boolean;
  seed: number;
  layers: Record<LayerKey, boolean>;
  weights: Record<string, number>;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  mapCenter: LngLat;
  setRole: (r: Role) => void;
  setSiteId: (id: string) => void;
  setDayNight: (d: 'day' | 'night') => void;
  setSpeed: (s: 1 | 5 | 20) => void;
  setRunning: (r: boolean) => void;
  setLayer: (k: LayerKey, v: boolean) => void;
  setSeed: (s: number) => void;
  setWeight: (k: string, v: number) => void;
  setSidebarCollapsed: (c: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (o: boolean) => void;
  toggleMobileSidebar: () => void;
  setMapCenter: (c: LngLat) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      role: 'admin',
      siteId: 'campus',
      dayNight: 'night',
      speed: 1,
      running: true,
      seed: 42,
      layers: { air: false, occupancy: false, waste: false, traffic: false, reports: false, energy: false },
      weights: { air: 0.2, waste: 0.15, energy: 0.2, water: 0.15, mobility: 0.15, resilience: 0.15 },
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      mapCenter: NEW_YORK_CENTER,
      setRole: (role) => set({ role }),
      setSiteId: (siteId) => set({ siteId }),
      setDayNight: (dayNight) => set({ dayNight }),
      setSpeed: (speed) => set({ speed }),
      setRunning: (running) => set({ running }),
      setLayer: (k, v) => set((s) => ({ layers: { ...s.layers, [k]: v } })),
      setSeed: (seed) => set({ seed }),
      setWeight: (k, v) => set((s) => ({ weights: { ...s.weights, [k]: v } })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
      toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
      setMapCenter: (mapCenter) => set({ mapCenter }),
    }),
    { name: 'terrascope-settings' },
  ),
);
