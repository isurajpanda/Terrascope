import type { SiteConfig } from '@/types/domain';
import { createCampusSite } from './campus';
import { useSettingsStore } from '@/store/useSettingsStore';

let cachedSite: SiteConfig | null = null;
let cachedCenter = '';

export function getSite(_id: string): SiteConfig {
  const center = useSettingsStore.getState().mapCenter;
  const key = `${center.lng},${center.lat}`;
  if (cachedSite && cachedCenter === key) return cachedSite;
  cachedSite = createCampusSite(center);
  cachedCenter = key;
  return cachedSite;
}
