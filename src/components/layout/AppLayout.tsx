import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import ChatPanel from '@/components/hud/ChatPanel';
import { useSettingsStore } from '@/store/useSettingsStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const mobileSidebarOpen = useSettingsStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useSettingsStore((s) => s.setMobileSidebarOpen);

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-black text-foreground antialiased selection:bg-data/30 selection:text-white">
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar (responsive: drawer overlay on mobile, docked rail on desktop) */}
      <AppSidebar onOpenChat={() => setChatOpen(true)} />

      {/* Main Content Viewport */}
      <main className="relative flex flex-1 flex-col h-full min-w-0 overflow-hidden bg-black">
        {children}
      </main>

      {/* Global AI Assistant Dialog (z-60) */}
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
