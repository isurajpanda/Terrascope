import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useSettingsStore } from '@/store/useSettingsStore';
import { enableRemoteLLM } from '@/lib/reco/llmProvider';

enableRemoteLLM();
import { useSimStore } from '@/store/useSimStore';

import CommandPage from '@/pages/Command';
import OpsPage from '@/pages/Ops';
import SustainabilityPage from '@/pages/Sustainability';
import ScenariosPage from '@/pages/Scenarios';
import ReportPage from '@/pages/Report';
import AboutPage from '@/pages/About';

const ROLE_LANDING: Record<string, string> = {
  admin: '/',
  operations: '/ops',
  sustainability: '/sustainability',
  reporter: '/report',
};

import AppLayout from '@/components/layout/AppLayout';
import LocationPicker from '@/components/map/LocationPicker';

export default function App() {
  const siteId = useSettingsStore((s) => s.siteId);
  const role = useSettingsStore((s) => s.role);
  const initialized = useSimStore((s) => s.initialized);
  const init = useSimStore((s) => s.init);
  const tick = useSimStore((s) => s.tick);
  const running = useSettingsStore((s) => s.running);
  const speed = useSettingsStore((s) => s.speed);
  const [showLocationPicker, setShowLocationPicker] = useState(true);

  useEffect(() => {
    if (!initialized) init(siteId);
  }, [initialized, init, siteId]);

  useEffect(() => {
    if (!initialized) return;
    const interval = setInterval(() => {
      if (running) tick();
    }, 2000 / speed);
    return () => clearInterval(interval);
  }, [initialized, running, speed, tick]);

  return (
    <AppLayout>
      {showLocationPicker ? (
        <LocationPicker onEnter={() => setShowLocationPicker(false)} />
      ) : (
        <Routes>
          <Route path="/" element={<CommandPage />} />
          <Route path="/ops" element={<OpsPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />
          <Route path="/scenarios" element={<ScenariosPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to={ROLE_LANDING[role] ?? '/'} replace />} />
        </Routes>
      )}
      <Toaster />
    </AppLayout>
  );
}
