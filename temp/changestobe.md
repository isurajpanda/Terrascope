# Changes To Be — Terrascope Gap Closure Plan

> Generated 2026-10-09 from audit of `app/src` vs mentor checklist (Problem Statement 4) vs pitch deck (9 slides).
> Goal: make code, docs, and slides tell the same true story before judging + Q&A.

## How to use
- `P0` = demo will fail / judge will mark non-compliant if skipped.
- `P1` = needed to fully meet checklist / defend tech depth.
- `P2` = polish / credibility.
- Each item has: **Where** (file), **What**, **Why**, **Acceptance**.

---

## P0 — Critical (fix before any demo)

### P0-1. Fix anonymization drift in docs
- **Where:** `README.md:5`, `README.md:59,81,114`, `DEMO.md:71-72`
- **What:** Replace `Trident Academy of Technology, Bhubaneswar` → `Greenfield Institute of Technology (fictional demo campus)`. Remove `hospital.ts / City General Hospital` references (file does not exist; `src/config/sites/index.ts` has 1 site only) OR re-add the file (see P0-2).
- **Why:** Code is anonymized (`campus.ts:89,92-94`), docs are not. Mentor checklist Phase 1 requires generic names.
- **Acceptance:** `rg -i "trident|bhubaneswar|8RR5" README.md DEMO.md src` = 0 hits.

### P0-2. Restore template-switch demo OR drop the claim
- **Where:** `src/config/sites/index.ts:4`, `src/config/sites/campus.ts`, slides 2,5,7 + Closing, `DEMO.md:68-73`
- **What (pick A or B):**
  - A (recommended, 2-3h): copy `campus.ts` → `hospital.ts` with 6-8 buildings (`ward, icu, ot, emergency, pharmacy, cafeteria, lab-diagnostic, plant` types already supported in `generators.ts:142-164`), different `thresholds/scoring`, add to `SITES`. Verify role landing + map render.
  - B: delete "switch template live" beat from deck + `DEMO.md`, change to "architecture is config-driven (one typed file), second template is week-2 work".
- **Why:** Closing beat "switch template to prove not campus-only" currently fails — site switcher has 1 entry.
- **Acceptance:** Live switch works without reload errors, OR no slide promises it.

### P0-3. Make tech slide truthful (Isolation Forest / Prophet / LLM / Backend)
- **Where:** slides 4-5, `src/lib/models/anomaly.ts:57-63`, `src/lib/models/forecast.ts`, `src/lib/reco/engine.ts`, `src/pages/About.tsx:20,25,35`
- **What:** Change deck to:
  - Built: `Rolling z-score (w=32, EWMA α=0.3, z=3) + simplified isolation-style ranking heuristic (illustrative, not sklearn)` / `Holt-Winters additive 24h + seasonal-naive fallback + bin ETA (TS, in-browser, CPU-only)` / `Rules + forecasts + templates; LLM (Ask Terrascope) is optional Q&A layer, NOT the recommender`.
  - Target/scale: `Prophet/LightGBM, sklearn IsolationForest, FastAPI + TimescaleDB + MQTT, LLM-drafted advice` moved to roadmap diagram.
  - Add footnote: `Demo: frontend-only, no backend, localStorage only (About → Privacy)`.
- **Why:** `rg "prophet|lightgbm|fastapi|postgres|mqtt|pandas|sklearn" src` = 0 hits. Current deck inverts reality (`About.tsx:25` says engine is NOT an LLM). Judges will ask "show me Prophet code".
- **Acceptance:** Every tech noun on "Built" slide has a file:line citation in speaker notes.

### P0-4. Sync building names between deck and code
- **Where:** slides 2-3, `src/config/sites/campus.ts:97-116`
- **What:** Deck says `Hostel C, overflow by 4PM`. Code has `Hostel N/S/E (hostel-north/south/east)`. Either rename one hostel to `Hostel C (hostel-c)` in `campus.ts + bins[] + anomalyInjector.ts` + tests, or change deck to `South Hostel`.
- **Why:** Presenter clicking "Hostel C" won't find it.
- **Acceptance:** `Trigger event` → red pulse building name == slide name verbatim.

---

## P1 — Checklist compliance (mentor will score)

### P1-1. Seasonality: add explicit `season` param
- **Where:** `src/types/domain.ts` (`ScenarioParams`), `src/lib/sim/generators.ts` (`genPm25, genTemp, genEnergy, genWater`), `src/lib/sim/scenarios.ts`, `src/pages/Scenarios.tsx:66-67`
- **What:** Add `season: 'summer'|'winter'|'monsoon'` (default `summer`). Example: `summer: temp +4, energy ×1.25, water ×1.2; winter: temp -8, energy ×0.85 heating?; monsoon: rainMm=28, pm25×0.7, congestion×1.6`. Wire to existing `temperatureC/rainMm` sliders + Heatwave/Monsoon presets. Update `About → How simulator works`.
- **Why:** Checklist Phase 2 requires seasonality (summer AC/water vs winter). Current proxy (`temperatureC/rainMm` only) is implicit.
- **Acceptance:** Setting `season=winter` visibly lowers cooling load vs `summer` in Energy chart + scenario diff.

### P1-2. Asset statuses: explicit pump + lighting power
- **Where:** `src/types/domain.ts` (`SensorDef kind`), `src/lib/sim/generators.ts`, `src/config/sites/campus.ts:52-85` (`defaultSensors`), `src/lib/campus/interiors.ts:156-162`, `src/lib/reco/engine.ts:131-157`
- **What:** Add `lighting` (kW, occupancy-driven + daylight) and `pump` (L/h, ON/OFF schedule + leakDiagnosis) sensor kinds for `hostel/canteen` at minimum. Surface as `Lighting: ON 2.4kW` / `Pump: ON/OFF` in interior elements (replace current string-only `ON/OFF`). Add one reco branch: `lights on in empty building after 22:00 → switch off`.
- **Why:** Checklist asks HVAC on/off, lighting power, pump activity. Today lighting/HVAC are display strings, pump doesn't exist.
- **Acceptance:** Empty-building-at-night scenario fires `lighting-waste` alert with observed vs expected kW.

### P1-3. Predictive horizon: add week-ahead view (keep 6h ops forecast)
- **Where:** `src/lib/models/forecast.ts:12-146`, `src/components/building/BuildingDrawer.tsx:179-216`, `src/pages/Sustainability.tsx`
- **What:** Keep Holt-Winters 6h. Add `forecastDaily7d()`: aggregate history to daily means → Holt-Winters `SEASON=7` or seasonal-naive → "Campus energy next 7 days" card on Sustainability + Command KPI tooltip. Label assumptions ("assumes schedule repeats, no holidays").
- **Why:** Checklist: "predict how much electricity campus will need next week". Current 1-6h fails literal check.
- **Acceptance:** Sustainability shows 7 bars + total kWh with interval; `forecast.test.ts` covers shape.

### P1-4. NLP on maintenance logs / complaint tickets (optional but strong)
- **Where:** NEW `src/lib/nlp/complaintInsights.ts` + test, `src/components/hud/ComplaintsBoard.tsx:24-33`, `src/pages/Ops.tsx`, `src/lib/reco/engine.ts:159-184`
- **What (minimal, no deps, <150 lines):** normalize lowercase → keyword map (`ac→cooling, leak→plumbing, light→electrical, bin→waste, ...`, incl. `Room \d+` regex) → group by `(category keyword, buildingId)` → emit `RecurringIssue {keyword, count, buildings, exampleNotes}` → surface "Top recurring: AC cooling (4× in Labs)" card on Ops + feed into `maintenance` reco rationale. Document as "rule-based NLP baseline (TF + keyword clustering); transformer upgrade later".
- **Why:** Checklist optional NLP currently 0%. This closes it without backend/LLM dependency.
- **Acceptance:** 3 seeded `AC in Room 301`-style notes produce 1 recurring insight + 1 reco citing it.

### P1-5. Python mirror to satisfy "standard libraries" literally
- **Where:** NEW `notebooks/simulation_forecast.ipynb` + `notebooks/requirements.txt` (`pandas, scikit-learn, statsmodels, matplotlib`), linked from `README.md`
- **What:** Replicate 1 building energy series (export CSV from TS or regenerate with same seed logic in numpy) → pandas cleaning → `IsolationForest` anomaly demo → `ExponentialSmoothing (Holt-Winters)` 7-day forecast plot. Add cell: "TS app mirrors this logic in-browser for demo portability".
- **Why:** Checklist Phase 4 names Python packages. App is TS-only; strict judge marks fail. Notebook gives compliance without rewriting app.
- **Acceptance:** `pip install -r requirements && jupyter nbconvert --execute` passes; README cites it.

---

## P2 — Credibility / pitch alignment

### P2-1. Impact slide: replace invented % with built proof
- **Where:** slide 3, `src/pages/Sustainability.tsx`, `src/lib/scoring/scorecard.ts`
- **What:** Remove or footnote `30-40% fewer / 10-15% less / 40% faster` unless computed. Replace visual with: Sustainability scorecard screenshot (editable weights + CO₂e 0.72 kg/kWh) + Ops "time-to-resolve" from `useReportStore` timestamps. Keep targets labeled `Target under stated assumptions (simulation-based), not measured`.
- **Acceptance:** Every number on slide has either a CSV export or explicit `Target` badge.

### P2-2. Deck footers + About parity
- **Where:** all slides, `src/pages/About.tsx:73-81`
- **What:** Add footer to every slide: `Simulated data · illustrative layout · decision-support only`. Ensure thresholds slide cites `campus.ts:179-192` (CPCB bands, bin 70/85, parking 80/95).
- **Acceptance:** Judge pausing on any slide sees disclaimer.

### P2-3. Document roles, Q&A, costs left as "add before presenting"
- **Where:** NEW `PITCH.md` (10-min script + 5-min Q&A bank + role split)
- **What:** Include: why z=3/w=32, why Holt-Winters over Prophet for browser demo, why rules+templates over LLM for auditability, hardware cost table placeholder (ESP32 + PM2.5 + CO₂ + bin-fill — verify price, don't guess), GeM/tender note as `indicative`.
- **Why:** Speaker notes already flag missing stats/costs/competitor verification.
- **Acceptance:** Each member has named section; Q&A bank covers simulation logic + model choice.

### P2-4. Small hygiene
- [ ] `About.tsx:35` says "Map tiles need network" but `campus.ts:19-23` is local-only basemap — align wording.
- [ ] `engine.test.ts`, `anomaly.test.ts`, `forecast.test.ts` — add tests for new season/pump/NLP/7d forecast (keep `npm test` green, currently 43 tests).
- [ ] `DEMO.md` timings (60s+90s+45s+60s+60s+45s+30s+30s ≈ 7min) — trim or relabel to fit strict 10-min + 5-min Q&A format.
- [ ] Competitor matrix (slide 9) — keep `illustrative, verify before presenting` label; don't name products you haven't checked.

---

## Suggested build order (half-day sprints)
1. P0-1 + P0-4 (30 min, docs + rename).
2. P0-3 (30 min, deck edits only — no code).
3. P0-2 option B now, option A if time (2h).
4. P1-4 NLP baseline (2h, highest score/effort).
5. P1-1 + P1-2 (2h, simulator).
6. P1-3 + P1-5 (3h, forecast + notebook).
7. P2-1 → P2-3 (1h, pitch hardening).

## Definition of done
- [ ] `npm run typecheck && npm test` green.
- [ ] `rg` checks in P0-1/P0-3 pass.
- [ ] Live demo path works: `Trigger event → Hostel pulse → Why fired → Accept → Ops Kanban → /report 3-tap → Resolve → /sustainability CSV → /scenarios Heatwave → Reset to live → (if P0-2A) site switch`.
- [ ] Deck "Built" claims all cite file:line; "Target" claims all badged.
