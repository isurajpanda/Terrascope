import { useCallback, useState } from 'react';
import { PanelRightClose, PanelRightOpen, History, Radio } from 'lucide-react';
import TopBar from '@/components/hud/TopBar';
import AlertFeed from '@/components/hud/AlertFeed';
import ActionCentre from '@/components/hud/ActionCentre';
import CornerFrame from '@/components/hud/CornerFrame';
import Campus3D from '@/components/map/Campus3D';
import BuildingDrawer from '@/components/building/BuildingDrawer';
import Ticker from '@/components/hud/Ticker';
import TimeScrubber from '@/components/hud/TimeScrubber';

export default function CommandPage() {
  const [drawerBuilding, setDrawerBuilding] = useState<string | null>(null);
  const [focusBuilding, setFocusBuilding] = useState<string | null>(null);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [autoOrbit] = useState(false);
  const [rightOpen, setRightOpen] = useState(true);
  const [showScrubber, setShowScrubber] = useState(false);

  const focusOn = useCallback((buildingId: string) => {
    setFocusBuilding(buildingId);
    setFocusTrigger((n) => n + 1);
    setDrawerBuilding(buildingId);
  }, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-black">
      {/* 1. HUD TopBar with KPIs, Site Selector, Role Nav and Right Panel Toggle */}
      <TopBar
        onFocusBuilding={focusOn}
        rightOpen={rightOpen}
        onToggleRight={() => setRightOpen(!rightOpen)}
      />

      {/* 2. 3D Viewport & HUD Overlays */}
      <div className="relative flex-1 min-h-0">
        <Campus3D
          onBuildingClick={(id) => {
            focusOn(id);
          }}
          focusBuildingId={focusBuilding}
          focusTrigger={focusTrigger}
          autoOrbit={autoOrbit}
        />
        <CornerFrame />

        {/* Right Toggle Handle */}
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 items-center">
          <button
            onClick={() => setRightOpen(!rightOpen)}
            className="flex h-16 w-5 items-center justify-center rounded-l border border-r-0 border-[#1a1a1a] bg-[#0a0a0a]/90 text-[#8a8a8a] backdrop-blur transition-colors hover:text-[#fafafa] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={rightOpen ? 'Close alerts and actions panel' : 'Open alerts and actions panel'}
            title={rightOpen ? 'Collapse right panel' : 'Expand alerts & actions'}
          >
            {rightOpen ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
          </button>
        </div>

        {/* Right Panel: Alerts Feed & Action Centre */}
        {rightOpen && (
          <div className="absolute right-2 sm:right-3 top-2 sm:top-3 bottom-14 z-20 flex flex-col gap-2 overflow-y-auto no-scrollbar w-[calc(100vw-1rem)] sm:w-80 pointer-events-auto">
            <AlertFeed onAlertClick={focusOn} />
            <ActionCentre onFocusBuilding={focusOn} />
          </div>
        )}

        {/* Bottom HUD Bar: Live Ticker / Time Scrubber & Navigation Helper */}
        <div className="absolute bottom-2 left-3 right-3 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-none">
          {/* Ticker / Scrubber Area */}
          <div className="pointer-events-auto flex items-center gap-2 max-w-xl w-full">
            <div className="flex-1">
              {showScrubber ? <TimeScrubber /> : <Ticker />}
            </div>
            <button
              onClick={() => setShowScrubber(!showScrubber)}
              aria-label={showScrubber ? 'Switch to live event ticker' : 'Switch to 24h replay scrubber'}
              title={showScrubber ? 'View live event ticker' : 'Open 24h replay scrubber'}
              className="hud-panel flex h-8 items-center gap-1.5 px-2.5 text-[11px] font-hud font-semibold uppercase tracking-wider text-[#8a8a8a] hover:text-[#fafafa] transition-colors"
            >
              {showScrubber ? (
                <>
                  <Radio size={12} className="text-ok animate-pulse" />
                  <span className="hidden md:inline">Live Ticker</span>
                </>
              ) : (
                <>
                  <History size={12} className="text-data" />
                  <span className="hidden md:inline">24h Replay</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation Helper Pill */}
          <div className="pointer-events-none hidden lg:flex items-center gap-1.5 rounded-full border border-[#1a1a1a] bg-[#0a0a0a]/80 px-3 py-1 backdrop-blur shadow-lg">
            <span className="font-hud text-[10px] uppercase tracking-wider text-[#8a8a8a]">
              Drag to orbit · scroll to zoom · click a building to inspect
            </span>
          </div>
        </div>
      </div>

      {/* Building Details Drawer */}
      <BuildingDrawer buildingId={drawerBuilding} onClose={() => setDrawerBuilding(null)} />
    </div>
  );
}
