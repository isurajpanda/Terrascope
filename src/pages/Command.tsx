import { useCallback, useMemo, useState } from 'react';
import { PanelRightClose, PanelRightOpen, History, Radio, X, MapPin, Users, Ruler, Building2, LogOut } from 'lucide-react';
import TopBar from '@/components/hud/TopBar';
import AlertFeed from '@/components/hud/AlertFeed';
import ActionCentre from '@/components/hud/ActionCentre';
import CornerFrame from '@/components/hud/CornerFrame';
import Campus3D from '@/components/map/Campus3D';
import Ticker from '@/components/hud/Ticker';
import TimeScrubber from '@/components/hud/TimeScrubber';
import { getSite } from '@/config/sites';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSimStore } from '@/store/useSimStore';
import { forecastSeries } from '@/lib/models/forecast';
import { buildInterior, type FloorPlan } from '@/lib/campus/interiors';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import WhyThisFired from '@/components/explain/WhyThisFired';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const SENSOR_CHART_DEFS: Record<string, { label: string; color: string }> = {
  pm25: { label: 'PM2.5', color: '#FFB020' },
  temp: { label: 'Temperature', color: '#FB923C' },
  humidity: { label: 'Humidity', color: '#3D8BFF' },
  occupancy: { label: 'Occupancy', color: '#00E5C3' },
  bin: { label: 'Bin fill', color: '#A78BFA' },
  energy: { label: 'Energy', color: '#3D8BFF' },
  water: { label: 'Water', color: '#38BDF8' },
  parking: { label: 'Parking', color: '#F472B6' },
  traffic: { label: 'Traffic', color: '#FBBF24' },
  co2: { label: 'CO₂', color: '#94A3B8' },
};

function statusOf(buildingId: string, alerts: { buildingId: string; severity: string; acknowledged?: boolean }[]): 'ok' | 'warning' | 'critical' {
  const bas = alerts.filter((a) => a.buildingId === buildingId && !a.acknowledged);
  if (bas.some((a) => a.severity === 'critical')) return 'critical';
  if (bas.some((a) => a.severity === 'warning')) return 'warning';
  return 'ok';
}

const STATUS_BADGE = { ok: 'ok', warning: 'warning', critical: 'destructive' } as const;

export default function CommandPage() {
  const [drawerBuilding, setDrawerBuilding] = useState<string | null>(null);
  const [focusBuilding, setFocusBuilding] = useState<string | null>(null);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [autoOrbit] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [showScrubber, setShowScrubber] = useState(false);
  const [entered, setEntered] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const siteId = useSettingsStore((s) => s.siteId);
  const history = useSimStore((s) => s.history);
  const alerts = useSimStore((s) => s.alerts);
  const scrubTime = useSimStore((s) => s.scrubTime);
  const site = getSite(siteId);
  const building = site.buildings.find((b) => b.id === drawerBuilding) ?? null;

  const buildingAlerts = building ? alerts.filter((a) => a.buildingId === building.id).slice(0, 3) : [];
  const status = building ? statusOf(building.id, alerts) : 'ok';

  const floors: FloorPlan[] = useMemo(() => {
    if (!building) return [];
    const occSeries = history[`${building.id}:occupancy`] ?? [];
    const tempSeries = history[`${building.id}:temp`] ?? [];
    const pmSeries = history[`${building.id}:pm25`] ?? [];
    const energySeries = history[`${building.id}:energy`] ?? [];
    const binStates = useSimStore.getState().binStates;
    const binFill = Math.max(0, ...site.bins.filter((x) => x.buildingId === building.id).map((x) => binStates[x.id] ?? 0));
    return buildInterior(building, {
      alerts: buildingAlerts,
      occupancy: occSeries[occSeries.length - 1]?.value ?? 0,
      tempC: tempSeries[tempSeries.length - 1]?.value ?? 22,
      pm25: pmSeries[pmSeries.length - 1]?.value ?? 30,
      energyKw: energySeries[energySeries.length - 1]?.value ?? 5,
      binFill,
    });
  }, [building, buildingAlerts, history, site, alerts]);

  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return null;
    for (const f of floors) {
      const r = f.rooms.find((x) => x.id === selectedRoomId);
      if (r) return r;
    }
    return null;
  }, [floors, selectedRoomId]);

  const focusOn = useCallback((buildingId: string) => {
    setFocusBuilding(buildingId);
    setFocusTrigger((n) => n + 1);
    setDrawerBuilding(buildingId);
    setRightOpen(true);
    setEntered(false);
    setSelectedRoomId(null);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerBuilding(null);
    setFocusBuilding(null);
    setEntered(false);
    setSelectedRoomId(null);
  }, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-black">
      <TopBar
        onFocusBuilding={focusOn}
        rightOpen={rightOpen}
        onToggleRight={() => setRightOpen(!rightOpen)}
      />

      <div className="relative flex-1 min-h-0">
        <Campus3D
          onBuildingClick={(id) => {
            focusOn(id);
          }}
          focusBuildingId={focusBuilding}
          focusTrigger={focusTrigger}
          autoOrbit={autoOrbit}
          entered={entered}
          onEnteredChange={setEntered}
          selectedRoomId={selectedRoomId}
          onRoomSelect={setSelectedRoomId}
        />
        <CornerFrame />

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center">
          <button
            onClick={() => setRightOpen(!rightOpen)}
            className="flex h-16 w-5 items-center justify-center rounded-l border border-r-0 border-[#1a1a1a] bg-[#0a0a0a]/90 text-[#8a8a8a] backdrop-blur transition-colors hover:text-[#fafafa] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={rightOpen ? 'Close panel' : 'Open panel'}
            title={rightOpen ? 'Collapse panel' : 'Expand panel'}
          >
            {rightOpen ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
          </button>
        </div>

        {rightOpen && (
          <div className="absolute right-2 sm:right-3 top-2 sm:top-3 bottom-14 z-20 flex flex-col overflow-y-auto no-scrollbar w-[calc(100vw-1rem)] sm:w-[22rem] max-w-[380px] pointer-events-auto">
            {building ? (
              <div className="hud-panel hud-corner flex flex-col overflow-hidden">
                <div className="border-b border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-display text-sm font-bold text-[#fafafa] truncate">{building.name}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={STATUS_BADGE[status]}>{status}</Badge>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {site.shortName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={11} /> cap {building.capacity}
                        </span>
                        <span className="flex items-center gap-1">
                          <Ruler size={11} /> {building.floorArea} m²
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={closeDrawer}
                      aria-label="Close building details"
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    {!entered ? (
                      <button
                        onClick={() => setEntered(true)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded bg-[#00E5C3] px-3 py-1.5 font-hud text-[10px] font-bold uppercase tracking-wider text-black hover:brightness-110"
                      >
                        <Building2 size={12} />
                        Enter Building
                      </button>
                    ) : (
                      <button
                        onClick={() => { setEntered(false); setSelectedRoomId(null); }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#2a2a2a] px-3 py-1.5 font-hud text-[10px] font-bold uppercase tracking-wider text-[#fafafa] hover:bg-[#1a1a1a]"
                      >
                        <LogOut size={12} />
                        Exit to Campus
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
                  {entered ? (
                    <div className="space-y-3">
                      <div className="rounded border border-[#00E5C3]/30 bg-[#00E5C3]/5 p-2 text-[11px] text-[#8a8a8a]">
                        {floors.reduce((a, f) => a + f.rooms.length, 0)} rooms across {floors.length} {floors.length === 1 ? 'level' : 'levels'}. Click a room to inspect its elements.
                      </div>
                      {floors.map((f) => (
                        <div key={f.floor}>
                          <div className="mb-1 font-hud text-[10px] font-bold uppercase tracking-wider text-[#8a8a8a]">
                            {f.label}
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {f.rooms.map((r) => (
                              <button
                                key={r.id}
                                onClick={() => setSelectedRoomId((cur) => (cur === r.id ? null : r.id))}
                                className={`rounded border px-1.5 py-1 text-left ${
                                  selectedRoomId === r.id ? 'border-[#00E5C3]' : 'border-[#1a1a1a]'
                                } bg-[#0a0a0a] hover:border-[#3a3a3a]`}
                              >
                                <div className="flex items-center gap-1">
                                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${r.status === 'critical' ? 'bg-crit' : r.status === 'warning' ? 'bg-warn' : 'bg-ok'}`} />
                                  <span className="truncate text-[10px] font-semibold text-[#fafafa]">{r.name}</span>
                                </div>
                                <div className="mt-0.5 text-[9px] text-[#8a8a8a]">
                                  {r.occupancy}/{r.capacity} · {r.tempC.toFixed(1)}°C
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {selectedRoom && (
                        <div className="rounded border border-[#00E5C3]/40 bg-[#00E5C3]/5 p-2">
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <span className={`inline-block h-2 w-2 rounded-full ${selectedRoom.status === 'critical' ? 'bg-crit' : selectedRoom.status === 'warning' ? 'bg-warn' : 'bg-ok'}`} />
                            <span className="text-[11px] font-bold text-[#fafafa]">{selectedRoom.name}</span>
                          </div>
                          <div className="space-y-1">
                            {selectedRoom.elements.map((e) => (
                              <div key={e.id} className="flex items-center gap-1.5 text-[10px]">
                                <span className={`inline-block h-1.5 w-1.5 rounded-full ${e.status === 'critical' ? 'bg-crit' : e.status === 'warning' ? 'bg-warn' : 'bg-ok'}`} />
                                <span className="text-[#8a8a8a]">{e.label}</span>
                                <span className="ml-auto text-right text-[#fafafa]">{e.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {buildingAlerts.length > 0 && (
                        <div className="mb-3 flex flex-col gap-2">
                          {buildingAlerts.map((a) => (
                            <WhyThisFired key={a.id} alert={a} />
                          ))}
                          <Separator />
                        </div>
                      )}
                      <Tabs defaultValue="overview">
                        <TabsList className="w-full flex-wrap gap-1 rounded-md border border-border bg-[#0a0a0a] p-1">
                          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                          {building.sensors.map((s) => (
                            <TabsTrigger key={s.id} value={s.id} className="flex-1">
                              {SENSOR_CHART_DEFS[s.kind]?.label ?? s.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        <TabsContent value="overview">
                          <BuildingOverview building={building} history={history} scrubTime={scrubTime} />
                        </TabsContent>
                        {building.sensors.map((s) => (
                          <TabsContent key={s.id} value={s.id}>
                            <SensorTab building={building} sensor={s} history={history} scrubTime={scrubTime} />
                          </TabsContent>
                        ))}
                      </Tabs>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <AlertFeed onAlertClick={focusOn} />
                <ActionCentre onFocusBuilding={focusOn} />
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-2 left-3 right-3 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-none">
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
          <div className="pointer-events-none hidden lg:flex items-center gap-1.5 rounded-full border border-[#1a1a1a] bg-[#0a0a0a]/80 px-3 py-1 backdrop-blur shadow-lg">
            <span className="font-hud text-[10px] uppercase tracking-wider text-[#8a8a8a]">
              Drag to orbit · scroll to zoom · click a building to inspect
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function useSeries(buildingId: string, sensorId: string, history: Record<string, { t: number; value: number }[]>, scrubTime: number | null) {
  const series = history[`${buildingId}:${sensorId}`] ?? [];
  if (scrubTime === null) return series;
  return series.filter((p) => p.t <= scrubTime);
}

function BuildingOverview({
  building,
  history,
  scrubTime,
}: {
  building: { id: string; capacity: number; height: number };
  history: Record<string, { t: number; value: number }[]>;
  scrubTime: number | null;
}) {
  const occSeries = useSeries(building.id, 'occupancy', history, scrubTime);
  const energySeries = useSeries(building.id, 'energy', history, scrubTime);
  const occ = occSeries[occSeries.length - 1]?.value ?? 0;
  const energy = energySeries[energySeries.length - 1]?.value ?? 0;
  const occForecast = forecastSeries(occSeries.slice(-200), 6, 'Occupancy', 'occupancy', building.id, 'people', ['Timetable-driven model.', 'Assumes normal schedule resumes.']);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded border border-border bg-[#000000]/60 p-2">
          <div className="hud-label">Occupancy</div>
          <div className="font-display text-lg tabular-nums text-ok">{Math.round(occ)}</div>
        </div>
        <div className="rounded border border-border bg-[#000000]/60 p-2">
          <div className="hud-label">Energy</div>
          <div className="font-display text-lg tabular-nums text-data">{energy.toFixed(1)} kW</div>
        </div>
        <div className="rounded border border-border bg-[#000000]/60 p-2">
          <div className="hud-label">Height</div>
          <div className="font-display text-lg tabular-nums text-[#fafafa]">{building.height} m</div>
        </div>
      </div>
      <div>
        <div className="hud-label mb-1">Occupancy — 24h + 6h forecast</div>
        <TimeSeriesChart data={occSeries.slice(-120)} showForecast={occForecast} color="#00E5C3" unit="people" height={170} />
      </div>
      <div>
        <div className="hud-label mb-1">Energy — 24h</div>
        <TimeSeriesChart data={energySeries.slice(-120)} color="#3D8BFF" unit="kW" height={140} />
      </div>
    </div>
  );
}

function SensorTab({
  building,
  sensor,
  history,
  scrubTime,
}: {
  building: { id: string };
  sensor: { id: string; kind: string; label: string; unit: string };
  history: Record<string, { t: number; value: number }[]>;
  scrubTime: number | null;
}) {
  const series = useSeries(building.id, sensor.id, history, scrubTime);
  const def = SENSOR_CHART_DEFS[sensor.kind] ?? { label: sensor.label, color: '#3D8BFF' };
  const current = series[series.length - 1]?.value ?? 0;
  const forecast = forecastSeries(
    series.slice(-200),
    6,
    def.label,
    sensor.id,
    building.id,
    sensor.unit,
    ['Holt-Winters additive with 24h seasonality.', 'Prediction interval from residual std (1.28σ).'],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="hud-label">{def.label}</div>
          <div className="font-display text-2xl tabular-nums" style={{ color: def.color }}>
            {sensor.kind === 'energy' ? current.toFixed(1) : Math.round(current)}
            <span className="ml-1 text-xs text-muted-foreground">{sensor.unit}</span>
          </div>
        </div>
        <Badge variant="data">{forecast.model}</Badge>
      </div>
      <TimeSeriesChart
        data={series.slice(-120)}
        showForecast={forecast}
        color={def.color}
        unit={sensor.unit}
        height={200}
        threshold={sensor.kind === 'pm25' ? 60 : undefined}
        thresholdLabel={sensor.kind === 'pm25' ? 'CPCB Satisfactory limit' : undefined}
      />
      <p className="text-[10px] text-muted-foreground">
        Forecast: {forecast.model} · horizon {forecast.horizonHours}h · window {forecast.windowHours}h ·{' '}
        {forecast.assumptions.join(' ')}
      </p>
    </div>
  );
}
