# Terrascope — Estate Intelligence Dashboard

> **Cognizant Hackathon · Team Vintage · BH26PS04T004**  
> **Demo site:** Greenfield Institute of Technology (fictional demo campus)  
> ⚠️ **Demo note:** All telemetry is simulated by a client-side engine. Building footprints are illustrative rectangles. Outputs are **decision-support insights, not official measurements**.

---

## Overview

**Terrascope** is an AI-powered 2.5D estate intelligence and decision-support command centre for campus and facility operators. It turns complex, multi-source IoT telemetry (energy, water, air quality, waste levels, traffic, and citizen reports) into real-time situational awareness, predictive anomaly alerts, explainable maintenance actions, and automated operational dispatch.

Built as an end-to-end interactive system, Terrascope runs completely client-side without requiring physical hardware, utilizing deterministic mathematical generators and in-browser ML algorithms.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev        # http://localhost:5173

# 3. Run automated tests (43 unit tests)
npm test

# 4. Typecheck codebase
npm run typecheck
```

### Additional Scripts

- `npm run build`: Production bundle build (`tsc -b && vite build`)
- `npm run preview`: Serve production build locally
- `npm run lint`: ESLint check
- `npm run format`: Prettier code formatting

---

## Key Features & Modules

| Module | Route | Highlights |
|---|---|---|
| **Command Centre HUD** | `/` | Dark 2.5D MapLibre interface with extruded 3D buildings colored by operational status, pulsing alert markers, layer toggles (Air Quality, Occupancy, Waste, Traffic, Reports, Energy), live KPI strip, alert feed, live ticker, and a 24h time scrubber ($1\times, 5\times, 20\times$). |
| **Building Drawer & Explainability** | Drawer | Per-building telemetry tabs (24h history + 6h forecast bands) and a **"Why this fired"** explainability card (observed vs. expected baseline, threshold, confidence score, and assumptions). |
| **Action Centre & Ops Dispatch** | `/` & `/ops` | Automated recommendation engine with 1-click **Accept / Snooze / Dismiss**. Accepting a recommendation automatically creates a work order in the Operations Kanban board and logs an audit entry. |
| **Operations Management** | `/ops` | Live Kanban board, waste collection route planner, citizen complaints triage queue, audit timeline, and shift summary. |
| **Mobile Citizen Reporting** | `/report` | Mobile-first 3-tap incident reporting flow: Category $\rightarrow$ Location $\rightarrow$ Submit. Generates unique tracking IDs (`SSR-XXXX`) with real-time lifecycle status (*Received $\rightarrow$ Assigned $\rightarrow$ In Progress $\rightarrow$ Resolved*). |
| **Scenario Simulator ("What-If")** | `/scenarios` | 5 presets (*Fest weekend, Exam day, Heatwave, Bad air day, Monsoon*) plus custom sliders. Visualizes projected resource surges without altering live baseline telemetry. |
| **Sustainability Scorecard** | `/sustainability` | ESG composite score (Air, Waste, Energy, Water, Mobility, Resilience) with editable weights, carbon estimation ($0.72\text{ kg CO}_2\text{e/kWh}$ Indian grid factor), and client-side CSV report export. |
| **Assumptions & Methodology** | `/about` | Complete transparency on simulator design, mathematical formulations, thresholds, limitations, and DPDP / GDPR privacy design. |
| **Ask Terrascope (GenAI)** | HUD Box | Streaming conversational interface with live site context via OpenAI-compatible endpoints, serving as an optional natural-language assistant alongside the deterministic rule engine. |

---

## System Architecture

```
src/
├── app/                 App shell, layout providers, simulation clock tick loop
├── components/
│   ├── ui/              shadcn/ui primitives (Button, Card, Badge, Sheet, Dialog, …)
│   ├── hud/             TopBar, LayerRail, AlertFeed, ActionCentre, Ticker, TimeScrubber, KpiStrip
│   ├── map/             CampusMap (MapLibre GL), Campus3D (Three.js), useMapLayers
│   ├── charts/          TimeSeriesChart, ForecastChart, Sparkline, ComparisonBars (Recharts)
│   ├── building/        BuildingDrawer, SensorTabs, InteriorViewer
│   └── explain/         WhyThisFired explainability modal
├── config/
│   └── sites/           campus.ts, index.ts (fully typed, config-driven site definition)
├── lib/
│   ├── sim/             mulberry32 PRNG, clock, signal generators, scenarios, anomalyInjector
│   ├── models/          anomaly.ts (Z-score, IsoForest), forecast.ts (Holt-Winters), eta.ts
│   ├── reco/            engine.ts, templates.ts, llmProvider.ts, llmContext.ts
│   ├── geo/             projection.ts (coordinate math, GeoJSON transforms)
│   └── scoring/         scorecard.ts (sustainability composite index)
├── store/               useSimStore, useReportStore (persisted), useSettingsStore (persisted)
└── pages/               Command, Ops, Sustainability, Scenarios, Report, About
```

---

## Analytical & Forecasting Models

1. **Anomaly Detection:**
   - **Rolling Z-Score:** Computes baseline moving mean and standard deviation over a 32-point window ($\approx 8$ hours) with exponential moving average (EWMA $\alpha = 0.3$). Anomalies are flagged at $z \ge 3$ with sensor cooldown deduplication.
   - **Multivariate Ranking:** Isolation-forest heuristic (12 shallow trees with random split axes) to prioritize critical multi-signal alerts.
2. **Short-Term Demand Forecasting:**
   - **Holt-Winters Additive Smoothing:** Incorporates 24-hour diurnal seasonality ($s = 96$ steps, $\alpha = 0.35, \beta = 0.08, \gamma = 0.12$) to project $1\text{--}6$ hour resource consumption with $1.28\sigma$ residual prediction intervals.
3. **Bin Overflow ETA:**
   - Dynamic fill-rate regression over the trailing 16 data points combined with meal-time diurnal multipliers to predict exact overflow timestamps.

---

## Data Flow & Simulation Engine

1. **Initialization:** On boot, `useSimStore.init()` uses a deterministic seeded PRNG (`mulberry32`) to pre-generate **7 days of 15-minute resolution history** across all campus sensors and schedules demo anomaly events (canteen lunch air surge, hostel bin overflow, night plumbing leak).
2. **Live Tick Loop:** `App.tsx` executes a tick cycle every 2 seconds (divided by simulation speed $1\times, 5\times, 20\times$), advancing 15 simulated minutes, appending new telemetry, evaluating anomaly models, and refreshing recommendations.
3. **Reactive UI:** Map layers update via memoized GeoJSON vectors; charts query time slices from the historical buffer; time-scrubbing filters the entire HUD state to any chosen moment in the 24-hour window.

---

## Privacy & Security by Design

- **Aggregate-Only Occupancy:** Tracks room/building headcounts without individual identity tracking or facial recognition.
- **Anonymous Reporting:** Citizen tickets are anonymized by default and stored locally in the browser (`localStorage`).
- **Local-First & Compliant:** Adheres to DPDP Act 2023 and GDPR guidelines: no invasive telemetry tracking, zero unauthorized external data transmission.

---

## Test Suite

All core mathematical functions, models, and recommendation logic are covered by **43 passing unit tests** using Vitest:
- PRNG determinism and distribution reproducibility
- Rolling Z-score anomaly bounds and cooldown deduplication
- Holt-Winters forecast sanity, interval boundaries, and seasonal fallbacks
- Predictive bin ETA calculations
- Sustainability scorecard weighting and emission factor calculations
- Recommendation engine rules and edge cases

---

## License & Credits

Developed for the **Cognizant Hackathon** by **Team Vintage** (BH26PS04T004).
