import type { Building, LngLat, SensorDef, SiteConfig } from '@/types/domain';
import type { StyleSpecification } from 'maplibre-gl';
import { metersToLngLat, polygonFromRect } from '@/lib/geo/projection';

/**
 * Greenfield Institute of Technology — fictional demo campus.
 *
 * Building footprints are illustrative rectangles in metre offsets, and the
 * map style is fully self-contained (solid background, no tile servers,
 * no font servers, no external requests). The campus can be positioned at
 * any geographic center.
 */

/** Local-only basemap: no external tile or glyph requests. */
const CAMPUS_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#000000' } }],
};

function b(
  center: LngLat,
  id: string,
  name: string,
  shortName: string,
  type: Building['type'],
  dx: number,
  dy: number,
  w: number,
  h: number,
  height: number,
  capacity: number,
  rotation = 0,
  sensors?: SensorDef[],
): Building {
  return {
    id,
    name,
    shortName,
    type,
    polygon: polygonFromRect(center, dx, dy, w, h, rotation),
    height,
    capacity,
    floorArea: w * h,
    sensors: sensors ?? defaultSensors(type),
  };
}

function defaultSensors(type: Building['type']): SensorDef[] {
  const base: SensorDef[] = [
    { id: 'pm25', kind: 'pm25', label: 'PM2.5', unit: 'µg/m³' },
    { id: 'temp', kind: 'temp', label: 'Temperature', unit: '°C' },
    { id: 'humidity', kind: 'humidity', label: 'Humidity', unit: '%' },
    { id: 'occupancy', kind: 'occupancy', label: 'Occupancy (aggregate)', unit: 'people' },
    { id: 'energy', kind: 'energy', label: 'Energy', unit: 'kW' },
    { id: 'water', kind: 'water', label: 'Water flow', unit: 'L/h' },
  ];
  switch (type) {
    case 'hostel':
    case 'canteen':
    case 'auditorium':
      return [...base, { id: 'bin', kind: 'bin', label: 'Bin fill level', unit: '%' }];
    case 'parking':
      return [
        { id: 'parking', kind: 'parking', label: 'Parking occupancy', unit: 'vehicles' },
        { id: 'traffic', kind: 'traffic', label: 'Gate traffic', unit: 'veh/h' },
      ];
    case 'gate':
      return [{ id: 'traffic', kind: 'traffic', label: 'Gate traffic', unit: 'veh/h' }];
    case 'waste':
      return [{ id: 'bin', kind: 'bin', label: 'Bin fill level', unit: '%' }];
    case 'solar':
      return [
        { id: 'energy', kind: 'energy', label: 'Solar generation', unit: 'kW' },
        { id: 'water', kind: 'water', label: 'Tank level', unit: '%' },
      ];
    case 'sports':
      return base.filter((s) => s.kind !== 'water');
    default:
      return base;
  }
}

export function createCampusSite(center: LngLat): SiteConfig {
  return {
    id: 'campus',
    name: 'Greenfield Institute of Technology',
    shortName: 'Greenfield',
    type: 'campus',
    center,
    plusCode: 'Greenfield Institute of Technology',
    address: 'Greenfield Institute of Technology',
    mapStyle: CAMPUS_STYLE,
    mapAttribution: 'Greenfield Institute of Technology',
    buildings: [
      b(center, 'academic-a', 'Academic Block A', 'Block A', 'academic', 0, 80, 120, 50, 24, 1800),
      b(center, 'academic-b', 'Academic Block B', 'Block B', 'academic', 0, -40, 110, 48, 22, 1500),
      b(center, 'library', 'Central Library', 'Library', 'library', -170, 60, 70, 50, 18, 600),
      b(center, 'admin', 'Administrative Block', 'Admin', 'admin', 170, 80, 60, 40, 15, 220),
      b(center, 'science-labs', 'Science and IT Labs', 'Labs', 'lab', -40, -140, 80, 45, 20, 480),
      b(center, 'workshop', 'Engineering Workshop', 'Workshop', 'workshop', 140, -140, 90, 55, 12, 260),
      b(center, 'hostel-north', 'North Hostel', 'Hostel N', 'hostel', -280, 140, 60, 40, 21, 320),
      b(center, 'hostel-south', 'South Hostel', 'Hostel S', 'hostel', -280, 40, 60, 40, 21, 320),
      b(center, 'hostel-east', 'East Hostel', 'Hostel E', 'hostel', -280, -60, 60, 40, 21, 300),
      b(center, 'canteen', 'Canteen and Food Court', 'Canteen', 'canteen', 130, 190, 55, 35, 8, 400),
      b(center, 'auditorium', 'Auditorium and Seminar Hall', 'Auditorium', 'auditorium', 220, -220, 90, 60, 16, 900),
      b(center, 'sports', 'Sports Complex and Ground', 'Sports', 'sports', 310, 60, 140, 90, 6, 500),
      b(center, 'parking', 'Main Parking Lot', 'Parking', 'parking', 60, 210, 100, 60, 0, 0),
      b(center, 'staff', 'Staff Quarters', 'Staff Qtrs', 'residential', 250, 210, 70, 45, 12, 160),
      b(center, 'gate-main', 'Main Gate', 'Main Gate', 'gate', 0, -260, 24, 10, 5, 0),
      b(center, 'gate-north', 'North Gate', 'North Gate', 'gate', 0, 280, 20, 10, 5, 0),
      b(center, 'waste-yard', 'Waste Collection Yard', 'Waste Yard', 'waste', -130, -220, 30, 25, 4, 0),
      b(center, 'solar', 'Solar and Water Tank Area', 'Solar & Water', 'solar', 190, 260, 40, 30, 6, 0),
    ],
    roads: [
      {
        id: 'road-main',
        name: 'Campus Main Road',
        path: [
          metersToLngLat(center, 0, -280),
          metersToLngLat(center, 0, -120),
          metersToLngLat(center, 0, 120),
          metersToLngLat(center, 0, 300),
        ],
      },
      {
        id: 'road-ring',
        name: 'Ring Road',
        path: [
          metersToLngLat(center, -220, -230),
          metersToLngLat(center, 230, -230),
          metersToLngLat(center, 230, 230),
          metersToLngLat(center, -220, 230),
          metersToLngLat(center, -220, -230),
        ],
      },
      {
        id: 'road-hostel',
        name: 'Hostel Lane',
        path: [
          metersToLngLat(center, -280, -120),
          metersToLngLat(center, -280, 200),
        ],
      },
      {
        id: 'road-parking',
        name: 'Parking Access',
        path: [
          metersToLngLat(center, 0, 210),
          metersToLngLat(center, 60, 210),
        ],
      },
    ],
    bins: [
      { id: 'bin-canteen-1', buildingId: 'canteen', label: 'Canteen bin 1', position: metersToLngLat(center, 145, 180), capacityLitres: 240 },
      { id: 'bin-canteen-2', buildingId: 'canteen', label: 'Canteen bin 2', position: metersToLngLat(center, 115, 175), capacityLitres: 240 },
      { id: 'bin-hostel-n', buildingId: 'hostel-north', label: 'Hostel N bin', position: metersToLngLat(center, -265, 130), capacityLitres: 240 },
      { id: 'bin-hostel-s', buildingId: 'hostel-south', label: 'Hostel S bin', position: metersToLngLat(center, -265, 30), capacityLitres: 240 },
      { id: 'bin-hostel-e', buildingId: 'hostel-east', label: 'Hostel E bin', position: metersToLngLat(center, -265, -70), capacityLitres: 240 },
      { id: 'bin-academic', buildingId: 'academic-a', label: 'Block A bin', position: metersToLngLat(center, 20, 105), capacityLitres: 240 },
      { id: 'bin-auditorium', buildingId: 'auditorium', label: 'Auditorium bin', position: metersToLngLat(center, 240, -200), capacityLitres: 240 },
      { id: 'bin-library', buildingId: 'library', label: 'Library bin', position: metersToLngLat(center, -155, 80), capacityLitres: 120 },
    ],
    parkingLots: [
      {
        id: 'lot-main',
        buildingId: 'parking',
        label: 'Main Parking Lot',
        polygon: polygonFromRect(center, 60, 210, 100, 60),
        capacity: 180,
      },
    ],
    gates: [
      { id: 'gate-main', name: 'Main Gate', position: metersToLngLat(center, 0, -260) },
      { id: 'gate-north', name: 'North Gate', position: metersToLngLat(center, 0, 280) },
    ],
    thresholds: {
      pm25Warning: 60,
      pm25Critical: 120,
      binFillWarning: 70,
      binFillCritical: 85,
      occupancyWarningPct: 85,
      occupancyCriticalPct: 100,
      energyZScore: 3,
      parkingWarningPct: 80,
      parkingCriticalPct: 95,
      congestionWarning: 0.55,
      congestionCritical: 0.8,
      waterLeakFlow: 40,
    },
    emissions: {
      gridFactorKgPerKwh: 0.72,
      dieselKgPerLitre: 2.68,
      truckLitresPerKm: 0.35,
    },
    scoring: {
      weights: { air: 0.2, waste: 0.15, energy: 0.2, water: 0.15, mobility: 0.15, resilience: 0.15 },
    },
    scenarioDefaults: {
      crowdMultiplier: 1,
      temperatureC: 32,
      rainMm: 0,
      eventDurationHrs: 8,
      truckAvailability: 1,
      pm25Multiplier: 1,
      occupancyMultiplier: 1,
      wasteMultiplier: 1,
      energyMultiplier: 1,
      waterMultiplier: 1,
      parkingMultiplier: 1,
      congestionMultiplier: 1,
    },
  };
}

export function createDefaultCampusSite(): SiteConfig {
  return createCampusSite({ lng: 0, lat: 0 });
}
