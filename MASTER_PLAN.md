# HospitalityOS AI — Master Plan & Roadmap

**Version:** 1.0 · **Updated:** 31 July 2026
**Vision:** Not another PMS — an **AI-native Hospitality Operating System** where PMS, CRM, Revenue, Voice, Concierge, Marketing and Analytics share one data layer and one intelligence layer, driven by autonomous agents.

> "The operating system of the entire property." Not just software.

This document reconciles the **14-phase enterprise vision** with our **current build** and gives a **local-first, incremental execution path** we can actually ship now, plus the enterprise target to grow into.

---

## 0. How to read this

- **§1** Vision & the moat. **§2** Where we are today (honest %). **§3** Architecture: enterprise target vs pragmatic path. **§4** The AI layer (the differentiator). **§5** All 14 phases in deep detail with status. **§6** Re-sequenced execution roadmap. **§7** Team/timeline/cost. **§8** Security. **§9** The immediate next 3 targets.
- Status legend: ✅ Done · 🟡 Partial · 🔲 Not started.

---

## 1. Vision & positioning

**Competitors (Mews, Cloudbeds, Hotelogix, eZee, OPERA, Guesty)** ship PMS + Booking + Channel + CRM + Revenue + Housekeeping + Reporting as **separate modules with AI bolted on**.

**Our moat** = the parts almost nobody does well:
- AI Operations Copilot · AI Employee/Guest/Revenue/Voice Agents
- **Unified data layer** feeding **cross-module AI automation**
- Progression toward **autonomous hotel operations**

**Target segments:** Hotels · Resorts · Vacation Rentals · Hostels · Chains · Restaurants · Cloud Kitchens.

---

## 2. Current state — what's built (as of 31 Jul 2026)

| # | Phase | Status | % | Notes |
|---|-------|--------|---|-------|
| 1 | Foundation (Tenant/User/Auth/Audit) | 🟡 | 78% | Tenant, roles, JWT+refresh, audit logs ✅. **Settings→Users & Roles UI live** (invite, role change, activate). Missing: OTP, Google/Azure SSO, MFA, permissions matrix |
| 2 | PMS Engine (Reservations/Inventory/Check-in-out) | 🟡 | 85% | Create wizard, **modify/reprice**, cancel, check-in/out, availability, **inventory calendar + room blocking** ✅. Missing: group reservations, cancellation policies |
| 3 | Booking Engine | 🟡 | 95% | **LIVE public page** — availability → guest → add-ons/upsell → **promo codes** → **real Razorpay checkout** (server-created order, HMAC-verified signature; mock fallback when keys absent) → confirmed DIRECT reservation (extras/discount + folio settled); **guest self-service Manage page** (lookup by conf#+email, email-guarded cancel) ✅; admin share/preview ✅. Missing: confirmation email (SMTP), self-modify/reprice, prod keys + capture webhook/refunds |
| 4 | Channel Manager | 🔲 | 0% | — |
| 5 | CRM Platform | 🟡 | 80% | Guest profiles, preferences, 360° drawer, **live segments page**, **AI Guest Intelligence** (churn-risk + LTV projection scoring), **AI campaign builder** (OpenAI-drafted email copy per segment → saved drafts) ✅. Missing: real send (SMTP), scheduled sends, per-guest AI insights in drawer |
| 6 | Revenue Management | 🟡 | 68% | Rate plans, live editable grid, AI recs apply/accept-all, Autopilot, **live demand forecast** (on-books + seasonality) ✅. Missing: ML forecast, nightly cron |
| 7 | Housekeeping AI | 🟡 | 68% | Tasks + heuristic optimizer + **live board** (status advance, staff panel, room sync) ✅ + auto-task on checkout ✅. Missing: shift-aware ML optimizer, "accept AI plan" writeback |
| 8 | Maintenance AI | 🟡 | 40% | Tickets CRUD + dashboard + UI ✅. Missing: predictive/IoT |
| 9 | Voice AI | 🟡 | 20% | **Browser voice** on Copilot — Web Speech STT (mic) + TTS (speaks answers), zero deps ✅. Missing: telephony (Twilio) + OpenAI Realtime for phone calls |
| 10 | AI Concierge | 🔲 | 0% | — |
| 11 | AI Operations Copilot | 🟡 | 80% | **LIVE** — OpenAI + agentic tools grounded on `/context/snapshot`, chat UI, gated write-actions, dashboard quick-ask, **charts in answers**, **voice in/out** ✅. Missing: token streaming |
| 12 | Data Platform | 🟡 | 15% | **Unified context provider** (`GET /context/snapshot`) — one grounded property snapshot for AI agents ✅. Missing: event bus, warehouse, rollups |
| 13 | Analytics Platform | 🟡 | 50% | Live charts (revenue/occupancy/channel/loyalty) ✅ |
| 14 | Enterprise Features | 🟡 | 15% | Multi-tenant foundation ✅. Missing: multi-property UX, currency/lang, groups |

**Foundation already shipped:** 20 DB tables, 11 backend modules (~50 endpoints), full themed frontend with 8 live pages, registration wizard, guided onboarding tour, running on XAMPP MariaDB. See `DEVELOPMENT_REPORT.md`.

**Overall product completion ≈ 30%** of the enterprise vision — but the hardest scaffolding (multi-tenant model, auth, PMS core, design system, live data plumbing) is done.

---

## 3. Architecture: enterprise target vs pragmatic path

### 3a. Enterprise target (their stack)
| Concern | Enterprise |
|---|---|
| Admin UI | Next.js + TS + Tailwind + ShadCN + TanStack |
| Mobile | Flutter (Android/iOS/tablet) |
| Backend | NestJS + TS (microservice-ready) |
| Primary DB | PostgreSQL |
| Cache / AI memory | Redis |
| Search | ElasticSearch |
| Event bus | Kafka |
| Object storage | AWS S3 |
| Data lake / warehouse | Airbyte + dbt + Snowflake/ClickHouse |
| Infra | AWS EKS, RDS, Lambda, CloudFront, Route53, SES |

### 3b. Pragmatic path (what we run NOW, and how each maps up)
| Concern | Now (local-first) | Grows into |
|---|---|---|
| Admin UI | Next.js + Tailwind (built) | + ShadCN polish |
| Backend | NestJS (built) | Split into services later |
| DB | **MariaDB (XAMPP)** | PostgreSQL / RDS |
| Cache | (none yet) → in-memory | Redis |
| Search | SQL `LIKE`/indexes | ElasticSearch |
| Events | **`events` table + cron/queue table** | Kafka |
| Storage | local `/uploads` | S3 |
| Analytics | live SQL aggregations (built) | dbt + warehouse |
| AI | Claude/OpenAI API calls per request | agent runtime + vector memory |

**Principle:** ship the *feature* with a simple backing today; swap the *infrastructure* later without changing the product contract. Every module already returns the `{success,data,meta}` envelope, so internals can be replaced freely.

> ⚠️ **DB note:** we're on **MariaDB 10.1.37** (2018). For Voice/Concierge/Copilot scale and Prisma migrations, plan a move to **PostgreSQL** (or MariaDB 10.6+). A Postgres schema is already in `/database`. Target this upgrade before Phase 9.

---

## 4. The AI layer — our differentiator

### 4a. Unified Data Layer (build in Phase 12, but stub early)
A read model that every agent queries: guests, stays, folios, rates, occupancy, reviews, tasks, tickets, channel data. Near-term = **a set of SQL "context providers"** (functions that assemble a JSON snapshot per property/date). Long-term = event-sourced lake.

### 4b. The 5 agents
| Agent | Owns | Sample asks | Data it reads |
|---|---|---|---|
| **Guest Agent** | Guest comms, concierge, upsell | "Book a cab", "Order room service" | CRM, reservations, POS |
| **Revenue Agent** | Pricing, forecasting, publishing | Auto-price nightly | Occupancy, comp set, events, OTA |
| **Marketing Agent** | Campaigns, re-activation | "Email dormant corporates" | CRM segments, LTV |
| **Operations Agent** | HK/maintenance orchestration | Auto-allocate cleaning | Tasks, staff, check-in/out |
| **Executive Agent** | Owner Q&A, insights | "Why did revenue drop?" | Everything (read-only) |

### 4c. Agent runtime (technical)
- **Tool-calling loop**: each agent = system prompt + a set of typed tools (our existing REST endpoints wrapped as tool schemas).
- **Grounding**: context providers inject live property data into the prompt (no hallucinated numbers).
- **Memory**: conversation + property facts in Redis/vector store (near-term: a `ai_conversations` + `ai_memory` table).
- **Guardrails**: read-only by default; write actions require confirmation; every AI action logged to `audit_logs`.
- **Provider**: Claude (Anthropic) / OpenAI — pluggable; needs API keys.

---

## 5. Phase-by-phase detailed plan

> Each phase: **Objective · Scope · Data · API · AI · UI · Depends on · Definition of Done · Status**.

### PHASE 1 — Foundation Platform 🟡 70%
- **Objective:** Secure multi-tenant base every module builds on.
- **Scope:** Tenant/brand/chain, property settings; users, roles, departments, permissions; auth (password, OTP, Google, SSO/Azure AD, MFA); audit logs.
- **Data:** `tenants`, `properties`, `users`, `audit_logs` ✅. Add: `permissions`, `roles` table (currently enum), `sso_identities`.
- **API:** auth/register/login/refresh/me ✅. Add: `/auth/otp`, `/auth/google`, `/auth/sso`, `/auth/mfa`.
- **UI:** login ✅, register wizard ✅. Add: Settings → Users & Roles, Permissions matrix, MFA setup.
- **DoD:** an owner can invite staff, assign granular roles, enable MFA; every write audited.
- **Remaining:** OTP, social/SSO, MFA, permissions matrix, Settings→Users UI.

### PHASE 2 — PMS Engine 🟡 65%
- **Objective:** The operational core — reservations, inventory, front desk.
- **Scope:** Create/modify/cancel reservation (recalc + policies); room types, rooms, **inventory calendar**, availability engine, **overbooking rules**, room/maintenance/**group blocking**; check-in (ID verify, payment, room assign, key) and check-out (folio, settle, close, notify HK).
- **Data:** `reservations`, `rooms`, `room_types`, `folios`, `payments`, `reservation_extras` ✅. Add: `cancellation_policies`, `room_blocks`, `groups`.
- **API:** availability, create, cancel, check-in, check-out, today ✅. Add: **modify** (date/room/occupancy → reprice), blocking endpoints, group booking.
- **AI:** auto room-assignment (match prefs + minimize moves), overbooking risk score.
- **UI:** Reservations table+drawer ✅, Front Desk check-in/out ✅. Add: create-reservation wizard, inventory calendar grid, modify flow.
- **DoD:** full stay lifecycle bookable and modifiable from the UI with correct money math.
- **Remaining:** modify flow, calendar UI, create wizard, blocking, cancellation policies.

### PHASE 3 — Booking Engine 🔲 5%
- **Objective:** White-label direct-booking widget (commission-free channel).
- **Scope:** Public availability search, dynamic pricing, promo codes, packages, add-ons, payment, confirmation, upsell/cross-sell.
- **Data:** `promo_codes`, `packages`, `addons`, `booking_sessions`.
- **API (public, unauthenticated):** `/be/search`, `/be/quote`, `/be/hold`, `/be/pay`, `/be/confirm`.
- **AI:** upsell suggestions (room upgrade, breakfast, spa, airport pickup) at checkout.
- **UI:** standalone embeddable widget + hosted booking page; admin config (which room types, promos).
- **Depends on:** P2 availability + rates, a payment gateway.
- **DoD:** a guest completes a paid booking on a public URL → reservation appears in PMS.

### PHASE 4 — Channel Manager 🔲 0%
- **Objective:** Two-way sync with OTAs.
- **Scope:** Booking.com, Airbnb, Agoda, Expedia, MakeMyTrip, Goibibo. Rate/availability push; reservation pull; rate-parity checks.
- **Data:** `channels`, `channel_mappings`, `channel_sync_log`.
- **API:** `/channels/connect`, `/channels/sync`, webhook receivers per OTA.
- **Infra:** event-driven (near-term: `events` table + worker; later: Kafka).
- **DoD:** a rate change in Revenue propagates to a connected OTA sandbox; an OTA booking lands in PMS.
- **Note:** each OTA needs partner API access/approval — long lead time; start with one (Booking.com) via channel-manager aggregator or direct.

### PHASE 5 — CRM Platform 🟡 35%
- **Objective:** 360° guest intelligence.
- **Scope:** Rich profiles (prefs, food, spend, stays); **360° view** (history, revenue, complaints, reviews, loyalty); AI churn / repeat / LTV prediction; segments.
- **Data:** `guests`, `guest_preferences`, `loyalty_transactions` ✅. Add: `complaints`, `reviews`, `segments`, `communications`.
- **API:** guests CRUD + prefs + loyalty ✅. Add: timeline aggregation, segment builder, predictions.
- **AI:** churn score, next-stay likelihood, LTV projection, spa/upsell propensity (Marketing/Guest agents).
- **UI:** Guests list + detail drawer ✅. Add: 360° timeline tab, segments page, CRM dashboard.
- **DoD:** manager sees a guest's full history + AI risk/opportunity scores; can build a segment.

### PHASE 6 — Revenue Management 🟡 40%
- **Objective:** Where the money is made — dynamic pricing.
- **Scope:** AI demand forecasting (occupancy, seasonality, local events, comp pricing, OTA demand → recommended price); **AI Revenue Agent** runs nightly: forecast → analyze comp/occupancy → recommend → **auto-publish**.
- **Data:** `rate_plans`, `rate_plan_items` ✅. Add: `demand_signals`, `comp_set_prices`, `events_calendar`, `rate_change_log`.
- **API:** rate plans, grid, bulk, AI recs ✅. Add: forecast endpoint, auto-publish job, comp-set ingest.
- **AI:** forecasting model (start heuristic → ML), autonomous pricing with guardrails (min/max, approval mode).
- **UI:** rate grid + AI recs ✅. Add: forecast chart, comp-set panel, agent activity log, auto-pilot toggle.
- **DoD:** nightly agent proposes/publishes rates within guardrails; every change logged & reversible.

### PHASE 7 — Housekeeping AI 🟡 55%
- **Objective:** Optimal task allocation (weak in market = opportunity).
- **Scope:** Optimizer inputs (checkout/checkin times, staff availability) → outputs task/room/priority/cleaner/ETA automatically.
- **Data:** `housekeeping_tasks` ✅. Add: `staff_shifts`, `cleaning_standards`.
- **API:** tasks, status, assign, dashboard, optimizer (heuristic) ✅. Add: shift-aware optimizer, auto-generate tasks on checkout.
- **AI:** Operations Agent — assignment that minimizes idle time & hits pre-arrival deadlines.
- **UI:** kanban board + staff panel (designed) → **wire live**; add "Accept AI plan" that writes assignments.
- **DoD:** on check-out a task auto-appears; "Accept AI plan" assigns all pending rooms sensibly.

### PHASE 8 — Maintenance AI 🟡 40%
- **Objective:** From reactive tickets → predictive maintenance.
- **Scope:** Ticketing ✅; predictive via IoT/sensors (AC, lift, water) to predict failures before they happen.
- **Data:** `maintenance_tickets` ✅. Add: `assets`, `sensor_readings`, `maintenance_schedules`.
- **API:** tickets CRUD + dashboard ✅. Add: assets, sensor ingest, predictive alerts.
- **AI:** anomaly detection on sensor streams → pre-emptive tickets.
- **UI:** tickets page ✅. Add: assets registry, predictive alerts feed.
- **DoD:** a simulated sensor anomaly auto-creates a maintenance ticket + AI alert.

### PHASE 9 — Voice AI 🔲 0%  *(major differentiator)*
- **Objective:** AI answers the hotel phone.
- **Scope:** Book/cancel/check reservation, amenities Q&A, housekeeping request, food order — no human.
- **Tech:** OpenAI Realtime / Deepgram (STT) / Twilio (telephony) / LiveKit (media).
- **Data:** `call_logs`, `call_intents`, ties into reservations/CRM.
- **AI:** Guest Agent over voice with tool-calling into PMS.
- **DoD:** a phone call books a room end-to-end via voice in a test line.
- **Depends on:** stable PMS tools (P2), Postgres upgrade, telephony accounts.

### PHASE 10 — AI Concierge 🔲 0%
- **Objective:** Omni-channel guest assistant (app, web, WhatsApp, voice).
- **Scope:** "Where's the pool?", "Book a cab", "Suggest nearby places", "Order room service".
- **Tech:** WhatsApp Business API, web/app chat, shared Guest Agent runtime.
- **Data:** `conversations`, `messages`, `service_requests`.
- **DoD:** a WhatsApp message orders room service → creates a service request in ops.

### PHASE 11 — AI Operations Copilot 🟡 10%  *(killer feature)*
- **Objective:** Manager/owner asks anything; AI answers from live data.
- **Scope:** "Why did occupancy drop?", "Which OTA underperforms?", "Top complaints?" — reads PMS+CRM+Revenue+Reviews+HK and generates grounded insights with charts + citations.
- **Data:** context providers over existing tables (the near-term unified layer).
- **AI:** Executive Agent — read-only tool access + retrieval + chart generation.
- **UI:** chat shell ✅ → wire to real LLM + tools; render charts/tables/citations in answers.
- **DoD:** three canned exec questions return correct, data-grounded answers with a source line.
- **Depends on:** LLM keys; context providers.

### PHASE 12 — Data Platform 🔲 0%
- **Objective:** Central data lake feeding all agents & analytics.
- **Scope:** Ingest PMS/CRM/OTA/POS/web/app → model → serve.
- **Tech (target):** Kafka, Airbyte, dbt, Snowflake/ClickHouse. **Near-term:** an `events` table + nightly rollup tables + SQL views.
- **DoD:** one queryable "property snapshot" view powering Copilot + Analytics.

### PHASE 13 — Analytics Platform 🟡 50%
- **Objective:** Decision dashboards.
- **Scope:** Occupancy, ADR, RevPAR, LOS, channel perf, forecast, revenue, guest satisfaction.
- **API/UI:** revenue-trend, channel, occupancy, guest-stats live ✅. Add: ADR/RevPAR/LOS trends, satisfaction, export.
- **DoD:** exportable board covering all core hospitality KPIs.

### PHASE 14 — Enterprise Features 🟡 15%
- **Objective:** Scale to chains.
- **Scope:** Multi-property, multi-brand, multi-currency, multi-language, corporate accounts, group reservations, central reservations, enterprise reporting.
- **Data:** foundation ✅ (tenant/property). Add: `corporate_accounts`, `groups`, `fx_rates`, i18n.
- **UI:** property switcher (basic) → portfolio dashboard, cross-property reports.
- **DoD:** one login manages 2 properties with consolidated reporting.

---

## 6. Execution roadmap (re-sequenced for our context)

We build **depth-first on what compounds**: finish PMS + CRM + Revenue + the Copilot (the moat), then outward to Booking/Channel/Voice.

### Sprint plan (each ≈ a focused build cycle, backend module → seed → live UI → verified)

| Sprint | Deliverable | Phase | Why now |
|---|---|---|---|
| ~~S1~~ | ~~**Settings → Users & Roles** (invite, role, deactivate) live~~ ✅ **DONE** | P1 | Shipped 31 Jul — live + verified |
| ~~S2~~ | ~~**Wire Housekeeping board live** + auto-task on checkout~~ ✅ **DONE** | P7 | Shipped 31 Jul — live board + status sync + optimizer verified |
| ~~S3~~ | ~~**Reservation create wizard + modify/reprice flow**~~ ✅ **DONE** (31 Jul) | P2 | Create wizard + modify (dates/room-type reprice with GST) verified |
| ~~S4~~ | ~~**Inventory calendar** + room blocking~~ ✅ **DONE** (31 Jul) | P2 | 14-day grid + block/unblock verified |
| ~~S5~~ | ~~**CRM 360° timeline**~~ ✅ **DONE** (31 Jul) · segments → later | P5 | Loyalty ledger + spend insights in guest drawer |
| ~~S6~~ | ~~**Unified context providers** (property snapshot API)~~ ✅ **DONE** (31 Jul) | P12(lite) | `/context/snapshot` verified — foundation for the Copilot |
| ~~S7~~ | ~~**AI Operations Copilot — real LLM + tools**~~ ✅ **DONE** (3 Aug) | P11 | Live on **OpenAI**; provider-agnostic; runs on MariaDB |
| 🟡 S8 | **Live editable rate grid + AI recs apply** ✅ **DONE** (3 Aug) · forecast model + nightly autopilot → next | P6 | Monetization |
| 🟡 S9 | **Booking Engine (public page + mock payment)** ✅ **DONE** (5 Aug) · real gateway → needs keys | P3 | Direct revenue |
| **S10** | **Channel Manager (one OTA, sandbox)** | P4 | Distribution |
| **S11** | **Predictive Maintenance (simulated sensors)** | P8 | Differentiator |
| **S12+** | **Voice AI → Concierge → Data Platform → Enterprise** | P9,10,12,14 | Heavier lifts |

**Infra checkpoint before S7:** upgrade DB (MariaDB→Postgres) + add Redis + secure LLM keys + `events` table.

### Milestone view
- **M1 — "Complete PMS"** (S1–S4): full property operations end-to-end.
- **M2 — "Intelligent"** (S5–S8): CRM + Copilot + Revenue autopilot = the AI story is real.
- **M3 — "Distribution"** (S9–S10): direct + OTA bookings flow in.
- **M4 — "Autonomous & Enterprise"** (S11+): predictive ops, voice, chains.

---

## 7. Team, timeline & cost

### 7a. Their enterprise reference (accurate for a funded build)
- **Timeline:** 18–24 months · **Team:** 35–40 · **Cost:** ₹6 Cr–₹15 Cr+.
- **MVP:** 6–8 months · team 10–12 · ₹80 L–₹1.5 Cr.

### 7b. Our reality (bootstrapped, AI-assisted, single operator)
- We are compressing the *MVP* using AI-assisted development on a local stack.
- Realistic near-term goal: **M1 + M2 (Complete PMS + Copilot)** — the demonstrable "AI-native PMS" that raises funding or wins first customers.
- The enterprise stack/team/cost above is the **scale-up plan once funded**, not a prerequisite to a compelling product.

---

## 8. Security, compliance & non-functionals (continuous)
- **AuthN/Z:** JWT+refresh ✅ → add MFA, SSO, granular RBAC.
- **Data:** encrypt PII (ID docs), tenant isolation ✅, audit trail ✅.
- **Payments:** PCI-scope via gateway tokenization (never store card data).
- **Compliance:** GDPR/DPDP (India) data-subject rights, data retention.
- **Reliability:** backups, health checks, rate limiting ✅, idempotent booking ops.
- **AI safety:** read-only default, human-in-the-loop for writes, all AI actions audited, guardrails on pricing.

---

## 9. Immediate next 3 build targets (recommended)

1. **Settings → Users & Roles** (P1) — fully live on the existing users API. *(fast, high utility)*
2. **Wire Housekeeping board live + auto-task on checkout** (P7) — closes the operations loop; backend already exists.
3. **Unified context providers + AI Operations Copilot with a real LLM** (P12-lite + P11) — turns the vision into a working demo. *Requires: an Anthropic/OpenAI API key + (recommended) DB upgrade.*

> To start Copilot/Voice work I'll need: (a) an **LLM API key** (Anthropic Claude recommended), and (b) a decision on the **DB upgrade** (stay on MariaDB for now vs move to PostgreSQL). Tell me and I'll proceed sprint by sprint — each shipped as backend → seed → live UI → verified, exactly as we've been doing.

---

*Companion docs: `DEVELOPMENT_REPORT.md` (what's built), `PLAN.md` (original milestones), `database/DATABASE_MARIADB.md` (schema), `LOVABLE_PROMPT.md` (design system).*
