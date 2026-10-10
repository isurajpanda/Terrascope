import type { SiteConfig } from '@/types/domain';
import { createCampusSite } from './campus';
import { useSettingsStore } from '@/store/useSettingsStore';

const DEFAULT_CENTER = { lng: 0, lat: 0 };

export const SITES: SiteConfig[] = [createCampusSite(DEFAULT_CENTER)];

export function getSite(_id: string): SiteConfig {
  const center = useSettingsStore.getState().mapCenter;
  return createCampusSite(center);
}
