import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Radar,
  Activity,
  Leaf,
  FlaskConical,
  MessageSquare,
  Info,
  ChevronLeft,
  ChevronRight,
  Wind,
  Users,
  Trash2,
  Car,
  Zap,
  Play,
  Pause,
  History,
  Bot,
  Layers,
  Sparkles,
  ChevronDown,
  Building2,
  X,
} from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSimStore } from '@/store/useSimStore';
import { useReportStore } from '@/store/useReportStore';
import { getSite } from '@/config/sites';
import { formatSimTime } from '@/lib/sim/clock';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import type { LayerKey } from '@/types/domain';

interface AppSidebarProps {
  onOpenChat?: () => void;
  onToggleScrubber?: () => void;
  isScrubberOpen?: boolean;
}

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Command Center',
    shortLabel: 'Command',
    icon: Radar,
    description: '2.5D Campus Telemetry HUD',
  },
  {
    path: '/ops',
    label: 'Operations',
    shortLabel: 'Ops',
    icon: Activity,
    description: 'Task board, routing & dispatch',
  },
  {
    path: '/sustainability',
    label: 'Sustainability',
    shortLabel: 'ESG',
    icon: Leaf,
    description: 'ESG composite & carbon score',
  },
  {
    path: '/scenarios',
    label: 'Scenario Lab',
    shortLabel: 'Lab',
    icon: FlaskConical,
    description: 'What-if parameter simulator',
  },
  {
    path: '/report',
    label: 'Citizen Reports',
    shortLabel: 'Reports',
    icon: MessageSquare,
    description: 'Public incident reporting',
  },
  {
    path: '/about',
    label: 'Methodology',
    shortLabel: 'About',
    icon: Info,
    description: 'Models, assumptions & privacy',
  },
];

const LAYER_CONFIG: Array<{ key: LayerKey; label: string; icon: typeof Wind; color: string }> = [
  { key: 'air', label: 'Air Quality', icon: Wind, color: 'text-warn' },
  { key: 'occupancy', label: 'Occupancy', icon: Users, color: 'text-data' },
  { key: 'waste', label: 'Waste Bins', icon: Trash2, color: 'text-crit' },
  { key: 'traffic', label: 'Traffic & Parking', icon: Car, color: 'text-warn' },
  { key: 'reports', label: 'Citizen Reports', icon: MessageSquare, color: 'text-data' },
  { key: 'energy', label: 'Energy Grid', icon: Zap, color: 'text-ok' },
];

export default function AppSidebar({ onOpenChat, onToggleScrubber, isScrubberOpen }: AppSidebarProps) {
  const location = useLocation();
  const {
    siteId,
    setSiteId,
    layers,
    setLayer,
    running,
    setRunning,
    speed,
    setSpeed,
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    role,
  } = useSettingsStore();

  const site = getSite(siteId);
  const kpis = useSimStore((s) => s.kpis);
  const alerts = useSimStore((s) => s.alerts);
  const tasks = useSimStore((s) => s.tasks);
  const scenario = useSimStore((s) => s.scenario);
  const simTime = useSimStore((s) => s.simTime);
  const reports = useReportStore((s) => s.reports);

  const [layersExpanded, setLayersExpanded] = useState(true);

  // Desktop vs Mobile compact determination
  const isCompact = sidebarCollapsed && !mobileSidebarOpen;

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const activeAlertsCount = alerts.filter((a) => !a.acknowledged && a.severity === 'critical').length;
  const inProgressTasksCount = tasks.filter((t) => t.status === 'in-progress' || t.status === 'new').length;
  const openReportsCount = reports.filter((r) => r.status !== 'resolved').length;

  const layerCounts: Record<LayerKey, number | string> = {
    air: `${kpis.campusAqi} AQI`,
    occupancy: kpis.totalPeople.toLocaleString(),
    waste: `${kpis.binsAbove80} full`,
    traffic: `${Math.round(kpis.congestion * 100)}%`,
    reports: openReportsCount,
    energy: `${Math.round(kpis.energyKw)} kW`,
  };

  const activeLayersCount = Object.values(layers).filter(Boolean).length;
  const isCommandRoute = location.pathname === '/';

  const handleNavClick = () => {
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
      const menuButton = document.querySelector<HTMLElement>('[aria-label="Open navigation menu"]');
      menuButton?.focus();
    }
  };

  return (
    <aside
      aria-label="Application Sidebar"
      className={cn(
        'flex flex-col border-r border-[#1a1a1a] bg-[#070707] text-foreground transition-all duration-300 ease-in-out select-none',
        // Responsive behavior: fixed drawer on mobile (< md), in-flow rail on desktop (>= md)
        mobileSidebarOpen
          ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-2xl flex md:relative md:z-30'
          : 'hidden md:flex md:relative md:z-30',
        // Desktop widths
        isCompact ? 'md:w-16' : 'md:w-64',
      )}
    >
      {/* 1. Header / Brand */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#1a1a1a] px-3">
        <NavLink
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-2.5 overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md"
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#111111] shadow-[0_0_12px_rgba(61,139,255,0.2)]">
            <Radar size={18} className="text-data animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-black bg-ok" />
          </div>
          {!isCompact && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="font-display text-sm font-bold tracking-widest text-[#fafafa] leading-none">
                TERRASCOPE
              </div>
              <div className="font-hud text-[9px] uppercase tracking-[0.2em] text-[#8a8a8a] mt-0.5">
                Estate Intelligence
              </div>
            </div>
          )}
        </NavLink>

        <div className="flex items-center gap-1">
          {/* Mobile close button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close navigation menu"
            className="flex md:hidden h-7 w-7 items-center justify-center rounded border border-[#1a1a1a] bg-[#0a0a0a] text-[#8a8a8a] hover:text-[#fafafa] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <X size={14} />
          </button>
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            title={sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded border border-[#1a1a1a] bg-[#0a0a0a] text-[#8a8a8a] transition-colors hover:border-[#333] hover:text-[#fafafa] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>

      {/* 2. Site / Campus Quick Selector Pill */}
      {!isCompact && (
        <div className="border-b border-[#141414] bg-[#0a0a0a]/60 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 size={12} className="text-[#8a8a8a] shrink-0" />
              <span className="font-hud text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a] truncate">
                {site.shortName}
              </span>
            </div>
            <span className="flex items-center gap-1 font-mono text-[9px] text-ok">
              <span className="h-1.5 w-1.5 rounded-full bg-ok animate-ping" />
              ONLINE
            </span>
          </div>
          <div className="mt-1.5">
            <Select
              ariaLabel="Switch campus site"
              value={siteId}
              onValueChange={setSiteId}
              options={[{ value: site.id, label: site.name }]}
              className="h-7 w-full text-[11px]"
            />
          </div>
        </div>
      )}

      {/* 3. Main Navigation & Docked Sections (Scrollable without default scrollbars) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 no-scrollbar">
        {/* Navigation Links */}
        <div>
          {!isCompact && (
            <div className="px-2 pb-1.5 font-hud text-[10px] font-bold uppercase tracking-[0.16em] text-[#666]">
              Modules
            </div>
          )}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              // Compute module-specific badge
              let badge: React.ReactNode = null;
              if (item.path === '/ops' && (activeAlertsCount > 0 || inProgressTasksCount > 0)) {
                badge = (
                  <Badge variant={activeAlertsCount > 0 ? 'destructive' : 'warning'} className="h-4 px-1 text-[9px]">
                    {activeAlertsCount > 0 ? activeAlertsCount : inProgressTasksCount}
                  </Badge>
                );
              } else if (item.path === '/scenarios' && scenario) {
                badge = (
                  <Badge variant="warning" className="h-4 px-1 text-[9px]">
                    Sim
                  </Badge>
                );
              } else if (item.path === '/report' && openReportsCount > 0) {
                badge = (
                  <Badge variant="data" className="h-4 px-1 text-[9px]">
                    {openReportsCount}
                  </Badge>
                );
              }

              const linkContent = (
                <NavLink
                  to={item.path}
                  onClick={handleNavClick}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group flex items-center rounded-md text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    isCompact ? 'h-10 w-10 justify-center mx-auto' : 'h-9 px-2.5 gap-2.5',
                    isActive
                      ? 'border border-data/40 bg-data/10 text-[#fafafa] shadow-[0_0_12px_rgba(61,139,255,0.15)]'
                      : 'text-[#9a9a9a] hover:bg-[#121212] hover:text-[#fafafa]',
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      'shrink-0 transition-colors',
                      isActive ? 'text-data' : 'text-[#8a8a8a] group-hover:text-[#fafafa]',
                    )}
                  />
                  {!isCompact && (
                    <>
                      <span className="flex-1 truncate font-hud text-[12px] font-semibold uppercase tracking-wider">
                        {item.label}
                      </span>
                      {badge}
                    </>
                  )}
                  {isCompact && badge && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-crit text-[8px] font-bold text-white">
                      !
                    </span>
                  )}
                </NavLink>
              );

              if (isCompact) {
                return (
                  <Tooltip key={item.path} content={`${item.label} — ${item.description}`} side="right">
                    <div className="relative">{linkContent}</div>
                  </Tooltip>
                );
              }

              return <div key={item.path}>{linkContent}</div>;
            })}
          </nav>
        </div>

        {/* 4. Docked Map Telemetry Layers (Only shown on Command route, clean in sidebar) */}
        {isCommandRoute && (
          <div className="border-t border-[#141414] pt-3">
            {!isCompact ? (
              <div>
                <button
                  onClick={() => setLayersExpanded(!layersExpanded)}
                  className="flex w-full items-center justify-between px-2 pb-1.5 font-hud text-[10px] font-bold uppercase tracking-[0.16em] text-[#666] hover:text-[#fafafa]"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers size={11} />
                    <span>Telemetry Layers</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="rounded bg-[#141414] px-1 py-0.2 font-mono text-[9px] text-data">
                      {activeLayersCount}/6
                    </span>
                    <ChevronDown
                      size={12}
                      className={cn('transition-transform duration-200', !layersExpanded && '-rotate-90')}
                    />
                  </div>
                </button>

                {layersExpanded && (
                  <div className="mt-1 space-y-1">
                    {LAYER_CONFIG.map(({ key, label, icon: LayerIcon, color }) => {
                      const active = layers[key];
                      return (
                        <button
                          key={key}
                          onClick={() => setLayer(key, !active)}
                          aria-pressed={active}
                          className={cn(
                            'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                            active
                              ? 'border border-[#222] bg-[#141414] text-[#fafafa]'
                              : 'text-[#8a8a8a] hover:bg-[#0f0f0f] hover:text-[#cccccc]',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                              active ? 'border-data/60 bg-data/20 text-data' : 'border-[#222] bg-[#0c0c0c] text-[#666]',
                            )}
                          >
                            <LayerIcon size={12} className={active ? color : ''} />
                          </span>
                          <span className="flex-1 truncate font-hud text-[11px] font-semibold uppercase tracking-wider">
                            {label}
                          </span>
                          <span className="rounded bg-[#0a0a0a] px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-[#8a8a8a]">
                            {layerCounts[key]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 pt-1">
                <Tooltip content={`Telemetry Layers (${activeLayersCount}/6 active)`} side="right">
                  <button
                    onClick={() => {
                      toggleSidebar();
                      setLayersExpanded(true);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded border border-[#222] bg-[#111] text-data hover:bg-[#1a1a1a] transition-colors"
                  >
                    <Layers size={15} />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        )}

        {/* 5. Docked Ask AI Assistant Button */}
        <div className="border-t border-[#141414] pt-3">
          {!isCompact ? (
            <button
              onClick={() => {
                onOpenChat?.();
                handleNavClick();
              }}
              className="group relative flex w-full items-center gap-2.5 rounded-lg border border-data/30 bg-gradient-to-r from-data/10 to-transparent p-2.5 text-left transition-all hover:border-data/60 hover:from-data/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-data/40 bg-data/20 text-data shadow-[0_0_10px_rgba(61,139,255,0.3)]">
                <Bot size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 font-hud text-[11px] font-bold uppercase tracking-wider text-[#fafafa]">
                  <span>Ask Terrascope</span>
                  <Sparkles size={11} className="text-data animate-pulse" />
                </div>
                <div className="text-[10px] text-[#8a8a8a] truncate">AI Facility Co-Pilot</div>
              </div>
            </button>
          ) : (
            <Tooltip content="Ask Terrascope AI Assistant" side="right">
              <button
                onClick={onOpenChat}
                className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg border border-data/40 bg-data/20 text-data hover:bg-data/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shadow-[0_0_10px_rgba(61,139,255,0.2)]"
              >
                <Bot size={17} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* 6. Docked Simulation Console & Time Scrubber Controls */}
      <div className="shrink-0 border-t border-[#1a1a1a] bg-[#050505] p-2.5">
        {!isCompact ? (
          <div className="space-y-2">
            {/* Clock & Status Header */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className={cn('h-2 w-2 rounded-full', running ? 'bg-ok animate-pulse' : 'bg-warn')} />
                <span className="font-hud text-[10px] font-bold uppercase tracking-wider text-[#8a8a8a]">
                  {running ? `Live ${speed}×` : 'Paused'}
                </span>
              </div>
              <span className="font-mono text-[11px] font-semibold text-[#fafafa]">
                {formatSimTime(simTime)}
              </span>
            </div>

            {/* Play/Pause & Speed Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRunning(!running)}
                aria-label={running ? 'Pause simulation' : 'Resume simulation'}
                className={cn(
                  'flex h-7 items-center justify-center gap-1.5 flex-1 rounded border text-[11px] font-semibold transition-colors',
                  running
                    ? 'border-[#222] bg-[#111] text-[#fafafa] hover:bg-[#1a1a1a]'
                    : 'border-ok/50 bg-ok/10 text-ok hover:bg-ok/20',
                )}
              >
                {running ? <Pause size={12} /> : <Play size={12} />}
                <span>{running ? 'Pause' : 'Play'}</span>
              </button>

              <div className="flex rounded border border-[#222] bg-[#0c0c0c] p-0.5">
                {([1, 5, 20] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    aria-label={`Set simulation speed to ${s}x`}
                    className={cn(
                      'rounded px-2 py-1.5 font-mono text-[10px] font-semibold transition-colors min-h-[32px]',
                      speed === s ? 'bg-data text-white' : 'text-[#8a8a8a] hover:text-[#fafafa]',
                    )}
                  >
                    {s}×
                  </button>
                ))}
              </div>

              {onToggleScrubber && (
                <Tooltip content={isScrubberOpen ? 'Close 24h scrubber' : 'Open 24h replay scrubber'} side="top">
                  <button
                    onClick={onToggleScrubber}
                    aria-label="Replay 24h scrubber"
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded border transition-colors',
                      isScrubberOpen
                        ? 'border-data/60 bg-data/20 text-data'
                        : 'border-[#222] bg-[#111] text-[#8a8a8a] hover:text-[#fafafa]',
                    )}
                  >
                    <History size={13} />
                  </button>
                </Tooltip>
              )}
            </div>

            {/* Active User Role pill */}
            <div className="flex items-center justify-between rounded border border-[#1a1a1a] bg-[#0a0a0a] px-2 py-1 text-[10px]">
              <span className="font-hud uppercase tracking-wider text-[#777]">Role:</span>
              <span className="font-semibold text-data capitalize">{role}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Tooltip content={running ? `Simulation running (${speed}×) · Click to pause` : 'Simulation paused · Click to resume'} side="right">
              <button
                onClick={() => setRunning(!running)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded border transition-colors',
                  running ? 'border-[#222] bg-[#111] text-[#fafafa]' : 'border-warn/50 bg-warn/10 text-warn',
                )}
              >
                {running ? <Pause size={14} /> : <Play size={14} />}
              </button>
            </Tooltip>

            {onToggleScrubber && (
              <Tooltip content="24h Replay Scrubber" side="right">
                <button
                  onClick={onToggleScrubber}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded border transition-colors',
                    isScrubberOpen ? 'border-data/60 bg-data/20 text-data' : 'border-[#222] bg-[#111] text-[#8a8a8a]',
                  )}
                >
                  <History size={14} />
                </button>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
