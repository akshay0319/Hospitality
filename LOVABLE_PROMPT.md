# HospitalityOS AI — Complete Lovable Build Prompt

> Copy everything below this line and paste it into Lovable as your project prompt.

---

---

# LOVABLE PROMPT — START HERE

---

Build me a complete, production-ready **SaaS web application** called **HospitalityOS AI** — an AI-first Hospitality Operating System. This is not a simple CRUD app. This is an enterprise-grade, deeply intelligent, beautifully designed product that will compete with and beat Mews, Cloudbeds, and Oracle OPERA.

I want the UI to feel like the intersection of **Linear + Vercel + Stripe Dashboard + Notion** — clean, fast, opinionated, modern. Every pixel must feel intentional. No generic Bootstrap components. No amateur layouts. This needs to look like a $10M funded startup product on day one.

---

## PRODUCT IDENTITY

```
Product Name    : HospitalityOS AI
Tagline         : The Operating System of Your Property
Type            : AI-First SaaS — B2B Hospitality Platform
Target Users    : Hotel Managers, Revenue Managers, Front Desk Staff,
                  Housekeeping Supervisors, Hotel Owners, Chain GMs
Brand Tone      : Confident. Intelligent. Elegant. Trustworthy. Fast.
```

---

## DESIGN PHILOSOPHY

- **Dark-first design** with a rich deep navy/charcoal foundation
- Glass morphism cards with subtle frosted blur effects
- Crisp white typography on dark backgrounds
- Accent colors that feel premium, not playful
- Micro-animations everywhere — hover states, loading states, transitions
- Data-dense but never cluttered — inspired by Bloomberg Terminal meets Linear
- Every chart, table, and card should feel like it belongs in a fintech or DevOps product
- Sidebar navigation with icon + label, collapsible to icon-only mode
- Right-side panel / drawer pattern for details (no full-page navigations for secondary data)
- Command palette (CMD+K) for power users

---

## COLOR SYSTEM

### Primary Palette

```
Background Base         : #0A0F1E   (Deep Space Navy)
Background Surface      : #0F1629   (Midnight Blue)
Background Elevated     : #141D35   (Elevated Card)
Background Overlay      : #1A2444   (Modal / Dropdown)

Border Subtle           : #1E2D50   (Barely visible borders)
Border Default          : #253460   (Standard border)
Border Strong           : #2E3F72   (Focused/active border)

Text Primary            : #F0F4FF   (Almost white, slight blue tint)
Text Secondary          : #8A9BBE   (Muted body text)
Text Tertiary           : #4A5A82   (Disabled / placeholder)
Text Inverse            : #0A0F1E   (On light backgrounds)
```

### Accent Colors

```
Primary Accent          : #4F6EF7   (Electric Blue — CTAs, links, active states)
Primary Accent Hover    : #6B85FF   (Brighter on hover)
Primary Accent Muted    : #1E2D6B   (Soft background for badges)

AI / Intelligence Color : #8B5CF6   (Violet — all AI features)
AI Accent Hover         : #A78BFA
AI Accent Muted         : #2D1B69

Success                 : #10B981   (Emerald Green)
Success Muted           : #064E3B
Warning                 : #F59E0B   (Amber)
Warning Muted           : #451A03
Danger                  : #EF4444   (Red)
Danger Muted            : #450A0A
Info                    : #06B6D4   (Cyan)
Info Muted              : #083344
```

### Semantic Colors (Hospitality Domain)

```
Checked In              : #10B981   (Green)
Checked Out             : #6B7280   (Grey)
Reservation Confirmed   : #4F6EF7   (Blue)
Reservation Pending     : #F59E0B   (Amber)
Cancelled               : #EF4444   (Red)
Maintenance Block       : #F97316   (Orange)
Dirty Room              : #EF4444   (Red)
Cleaning In Progress    : #F59E0B   (Amber)
Clean Room              : #10B981   (Green)
Inspecting              : #06B6D4   (Cyan)
```

### Gradient Definitions

```css
/* Hero / Banner gradient */
background: linear-gradient(135deg, #0A0F1E 0%, #141D35 50%, #1A2444 100%);

/* AI Feature gradient */
background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%);

/* Primary CTA gradient */
background: linear-gradient(135deg, #3B4FD4 0%, #4F6EF7 50%, #6B85FF 100%);

/* Success gradient */
background: linear-gradient(135deg, #064E3B 0%, #065F46 100%);

/* Card shimmer (for AI loading) */
background: linear-gradient(90deg, transparent, rgba(79,110,247,0.05), transparent);

/* Revenue positive */
background: linear-gradient(135deg, #064E3B 0%, #10B981 100%);
```

---

## TYPOGRAPHY

```
Font Family (UI)        : Inter (weights: 300, 400, 500, 600, 700)
Font Family (Headings)  : Cal Sans or Sora (weights: 600, 700)
Font Family (Mono/Code) : JetBrains Mono or Fira Code
Font Family (Numbers)   : Tabular nums (Inter with font-variant-numeric: tabular-nums)

Base Size               : 14px
Line Height             : 1.5
```

### Type Scale

```
Display (Hero)          : 48px / 700 / -0.02em letter-spacing
H1                      : 32px / 700 / -0.01em
H2                      : 24px / 600
H3                      : 18px / 600
H4                      : 16px / 600
Body Large              : 15px / 400
Body Default            : 14px / 400
Body Small              : 13px / 400
Caption                 : 12px / 400 / #8A9BBE
Label                   : 11px / 600 / uppercase / 0.05em letter-spacing
```

---

## SPACING & LAYOUT

```
Base Unit               : 4px
Sidebar Width           : 240px (expanded) / 64px (collapsed)
Header Height           : 56px
Right Panel Width       : 420px
Content Max Width       : 1440px
Card Border Radius      : 12px
Button Border Radius    : 8px
Input Border Radius     : 8px
Tag/Badge Radius        : 6px
Avatar Radius           : 50% (circles)
```

---

## COMPONENT LIBRARY

Build every component from scratch matching this spec. Do not use default shadcn defaults — restyle everything to match the dark theme.

### Navigation — Sidebar

```
Background     : #0F1629
Width          : 240px / 64px collapsed
Top Section    : Logo + Property Selector dropdown
Bottom Section : User Avatar + Settings + Logout

Navigation Groups:
  [OPERATIONS]
    Dashboard         (grid icon)
    Reservations      (calendar icon)
    Front Desk        (door open icon)
    Housekeeping      (sparkles icon)
    Maintenance       (tool icon)

  [REVENUE]
    Rate Management   (trending up icon)
    Channel Manager   (globe icon)
    Booking Engine    (shopping bag icon)

  [GUESTS]
    Guest Profiles    (users icon)
    CRM               (heart handshake icon)
    Communications    (message square icon)
    Loyalty           (star icon)

  [AI COMMAND CENTER]      ← highlight this section differently with violet accent
    AI Copilot        (brain icon — violet)
    AI Agents         (bot icon — violet)
    Voice AI          (mic icon — violet)
    Concierge         (concierge bell icon — violet)

  [ANALYTICS]
    Revenue Analytics (bar chart icon)
    Operations Report (activity icon)
    Guest Analytics   (pie chart icon)

  [SETTINGS]
    Property Setup    (building icon)
    Users & Roles     (shield icon)
    Integrations      (plug icon)
    Billing           (credit card icon)

Active state: left border 2px solid #4F6EF7, background rgba(79,110,247,0.08)
Hover state: background rgba(255,255,255,0.04)
```

### Top Header Bar

```
Height         : 56px
Background     : #0A0F1E with bottom border #1E2D50
Left           : Page title + breadcrumb
Center         : Global search bar (CMD+K trigger)
Right          : 
  - AI Copilot quick-access button (violet, glowing)
  - Notifications bell (badge count)
  - Property selector (current property name)
  - User avatar dropdown
```

### Cards

```
// Standard Data Card
background: #0F1629
border: 1px solid #1E2D50
border-radius: 12px
padding: 20px
box-shadow: 0 1px 3px rgba(0,0,0,0.3)

On hover (interactive cards):
border-color: #253460
box-shadow: 0 4px 20px rgba(79,110,247,0.1)
transform: translateY(-1px)
transition: all 0.2s ease

// Glass Card (for AI features)
background: rgba(20, 29, 53, 0.6)
backdrop-filter: blur(20px)
border: 1px solid rgba(79,110,247,0.2)

// Metric Card (KPI cards)
background: linear-gradient(135deg, #0F1629, #141D35)
border: 1px solid #1E2D50
Has: icon (top left) + label + big number + trend badge
```

### Buttons

```
// Primary
background: linear-gradient(135deg, #3B4FD4, #4F6EF7)
color: white
padding: 10px 18px
border-radius: 8px
font-weight: 600
font-size: 14px
On hover: brightness(1.1) + box-shadow: 0 4px 15px rgba(79,110,247,0.4)

// Secondary
background: transparent
border: 1px solid #253460
color: #F0F4FF
On hover: background: #141D35, border-color: #2E3F72

// Danger
background: transparent
border: 1px solid #7F1D1D
color: #EF4444
On hover: background: #450A0A

// AI Action Button (special)
background: linear-gradient(135deg, #2D1B69, #4C1D95)
border: 1px solid rgba(139,92,246,0.4)
color: #A78BFA
icon: brain or sparkles
On hover: box-shadow: 0 4px 20px rgba(139,92,246,0.4)

// Icon Button
width: 36px, height: 36px
background: transparent
border: 1px solid #1E2D50
border-radius: 8px
On hover: background: #141D35

Sizes: sm (32px h), md (40px h), lg (48px h)
```

### Inputs & Forms

```
// Text Input
background: #0A0F1E
border: 1px solid #253460
border-radius: 8px
color: #F0F4FF
padding: 10px 14px
placeholder: #4A5A82

On focus:
border-color: #4F6EF7
box-shadow: 0 0 0 3px rgba(79,110,247,0.15)

// Select / Dropdown
Same style as text input
Dropdown panel: background #141D35, border #253460, shadow: 0 8px 32px rgba(0,0,0,0.5)

// Search Input
Left: search icon in #4A5A82
Right: keyboard shortcut badge (⌘K)
```

### Data Tables

```
Header row:
background: #0A0F1E
border-bottom: 1px solid #1E2D50
text: 11px / uppercase / 600 / #4A5A82
padding: 8px 16px

Data rows:
background: transparent
border-bottom: 1px solid #1E2D50
padding: 14px 16px
On hover: background: rgba(255,255,255,0.02)

Selected row: background: rgba(79,110,247,0.08)

Sortable columns: show sort icon on hover, arrow icon on active
```

### Badges / Tags / Status Pills

```
// Generic Badge
border-radius: 6px
padding: 3px 8px
font-size: 11px
font-weight: 600

Status Colors map to Semantic Colors section above.

// Room Status Pills (extra wide, for Housekeeping board)
padding: 4px 12px
min-width: 90px
text-align: center

// AI Badge (on AI-powered features)
background: rgba(139,92,246,0.15)
border: 1px solid rgba(139,92,246,0.3)
color: #A78BFA
text: "AI" or "✦ AI Powered"
```

### Charts & Graphs

Use **Recharts** or **Tremor** — dark themed.

```
Chart background      : transparent
Grid lines            : #1E2D50 (very subtle)
Axis text             : #4A5A82
Tooltip background    : #141D35
Tooltip border        : #253460
Tooltip shadow        : 0 8px 32px rgba(0,0,0,0.5)

Line chart stroke     : #4F6EF7 (primary), #8B5CF6 (AI/secondary)
Area fill             : gradient from #4F6EF7 with 20% opacity at bottom
Bar chart fill        : #4F6EF7 with hover: #6B85FF
Positive bars         : #10B981
Negative bars         : #EF4444

Sparklines in metric cards : 2px stroke, no axes, pure trend line
```

### Modals & Drawers

```
// Modal
backdrop: rgba(0,0,0,0.7) with blur(4px)
panel background: #0F1629
border: 1px solid #253460
border-radius: 16px
box-shadow: 0 24px 80px rgba(0,0,0,0.6)
max-width: 600px (standard), 900px (wide)
animation: scale from 0.96 + fade in, 180ms ease

// Right Drawer (Detail Panel)
width: 420px
background: #0F1629
border-left: 1px solid #1E2D50
slides in from right, 250ms ease
```

### Loading States

```
// Skeleton Loader
background: #141D35
shimmer animation: gradient sweep left to right, 1.5s infinite

// AI Thinking State (while AI generates)
Show animated violet gradient pulse
Text: "Analyzing your data..." with animated dots
Small violet orb that breathes/pulses
duration: match actual API response time

// Table loading: 5 skeleton rows
// Card loading: shimmer box matching card dimensions
```

### Notification / Toast

```
position: bottom-right
background: #141D35
border: 1px solid #253460
border-left: 3px solid (color matches type: success/error/warning/info)
border-radius: 10px
shadow: 0 8px 32px rgba(0,0,0,0.5)
animation: slide up from bottom + fade in
auto-dismiss: 4 seconds
```

---

## PAGES & SCREENS — FULL DETAIL

---

### SCREEN 1 — Login / Auth Page

Layout: Split screen — left brand panel, right login form.

Left Panel (60% width):
- Background: the deep navy base gradient
- Center: Large product logo + tagline "The Operating System of Your Property"
- Below: 3 rotating social proof stats with animation:
  - "2,400+ properties managed"
  - "₹140 Crore+ revenue optimized"
  - "98.7% uptime SLA"
- Background: subtle animated mesh gradient (slow motion)
- Bottom: floating glass cards showing mini versions of the dashboard

Right Panel (40% width):
- Background: #0F1629
- "Welcome back" heading
- Email input
- Password input (show/hide toggle)
- "Forgot password?" link
- Primary CTA: "Sign in to HospitalityOS"
- Divider: "or continue with"
- Google SSO button
- Azure AD button (for enterprise)
- Bottom: "New property? Start free trial →"

---

### SCREEN 2 — Main Dashboard (Operations Hub)

This is the first screen after login. It should feel like mission control.

Layout: Full width, 3-column grid

**Top Row — Hero Metrics (5 KPI cards)**

Each card has:
- Icon (top left, colored based on type)
- Label (small, uppercase, muted)
- Big number (32px, tabular nums)
- Trend indicator (green ↑ or red ↓ with percentage vs yesterday)
- Mini sparkline chart

Cards:
1. Occupancy Today — e.g. "87%" — trend vs yesterday
2. Available Rooms — e.g. "12" — with room type breakdown tooltip
3. Arrivals Today — e.g. "24 guests" — with checked-in count
4. Departures Today — e.g. "18 guests" — with checked-out count
5. Revenue Today — e.g. "₹1,24,500" — trend vs same day last week

**Second Row — Live Operations Grid**

Left (60%): Reservation Timeline / Gantt View
- Room rows on Y axis
- Time on X axis (today's 24 hours)
- Color blocks for each stay
- Hover shows guest name, stay details
- Click opens reservation detail drawer

Right (40%): Today's Activity Feed
- Real-time log of events
- Check-ins, check-outs, new bookings, housekeeping completions, AI alerts
- Each event has icon + time + description
- Color coded by type

**Third Row — Bottom Split**

Left (50%): Housekeeping Status Board (mini version)
- Room cards in a grid showing status colors
- Click → go to Housekeeping module

Right (50%): AI Copilot Quick Ask
- Mini chat interface
- Placeholder: "Ask anything about your property..."
- 3 suggested quick prompts below:
  - "Why did occupancy drop?"
  - "Top revenue opportunities this week"
  - "Show me unsold rooms this weekend"

---

### SCREEN 3 — Reservations List

Layout: Full-width list view with filters sidebar.

**Top Bar:**
- Page title: "Reservations"
- Tabs: All | Arriving Today | In House | Departing Today | Upcoming | Cancelled
- Right: "+ New Reservation" button (primary), Export button, Filter toggle

**Filter Sidebar (collapsible, left side):**
- Date range picker
- Room type filter (checkboxes)
- Status filter (checkboxes with color indicators)
- Channel filter (Direct, Booking.com, Airbnb, etc.)
- Rate plan filter

**Reservations Table:**

Columns:
- Confirmation # (monospace, link style)
- Guest Name + avatar initials
- Room Type + Room Number
- Check-In Date
- Check-Out Date
- Nights
- Adults + Children
- Rate Plan
- Total Amount (tabular numbers, right-aligned)
- Status badge (color coded)
- Channel icon (OTA logos or "Direct")
- Actions: View | Check In | Modify (context menu ···)

Row click → opens right-side detail drawer (no page navigation).

**Reservation Detail Drawer (Right Panel — 420px):**

Top section:
- Guest photo / avatar
- Guest name (large, 20px)
- "Returning Guest" badge if applicable + loyalty tier badge
- Quick actions: Check In | Modify | Cancel | Print

Section 1 — Stay Details:
- Confirmation number
- Room type + room number
- Check-in / Check-out dates
- Number of nights
- Adults + children

Section 2 — Financial:
- Rate plan
- Nightly rate breakdown
- Extras added
- Taxes
- Total amount
- Amount paid / balance due
- Payment method

Section 3 — Guest Notes:
- Staff notes (editable inline)
- Guest preferences from CRM

Section 4 — History:
- Timeline of all actions on this reservation

---

### SCREEN 4 — Create / Modify Reservation (Modal)

Multi-step modal, 900px wide.

Step 1 — Search Availability:
- Date range picker (check-in / check-out) — calendar popup, dark themed
- Adults / children counter
- Number of rooms
- "Search Availability" button

Step 2 — Room Selection:
- Room type cards in a grid
- Each card: photo, room name, max occupancy, amenities icons, price/night, availability count
- Hover: slight lift + glow
- AI Recommendation badge on best-value option ("✦ AI Pick — Best Value")
- Select button on each card

Step 3 — Guest Details:
- Search existing guest (autocomplete from CRM)
- Or create new guest
- Contact details input

Step 4 — Rate & Extras:
- Rate plan selector
- Add-on items (breakfast, airport pickup, spa)
- Promo code field
- Price summary on right side (sticky)

Step 5 — Confirm & Payment:
- Full booking summary
- Payment method selector
- Confirm Reservation button

---

### SCREEN 5 — Front Desk (Check-In / Check-Out)

Two-panel layout.

Left Panel — Expected Today:
- Tabs: Arrivals | In-House | Departures
- Each guest shown as a card:
  - Name, reservation number, room type, arrival time
  - Status indicator
  - Quick action button (Check In / Check Out)

Right Panel — Check-In Flow (appears when a guest card is selected):

Step 1 — Verify Identity:
- Guest photo + ID upload area (drag and drop)
- Document type selector
- ID number field
- Verification checkbox

Step 2 — Room Assignment:
- Auto-suggested room (AI picks based on preferences)
- Manual room selector (visual floor map or list view)
- Room status shown (Clean ✓, Inspected ✓)

Step 3 — Payment:
- Folio summary
- Collect payment
- Payment method

Step 4 — Complete:
- Check-In Confirmed screen
- Key card instructions
- Welcome message preview (that will be sent to guest)
- Option to send WhatsApp welcome message

---

### SCREEN 6 — Room Inventory Calendar

A visual availability calendar — the most used screen for front desk teams.

Layout: Full width, scrollable horizontally.

Left column (fixed): Room list — sorted by floor, then room type
- Each room: room number + type badge + status icon

Top row (scrollable): Date columns (next 30 days default, configurable)

Cell content: Color block showing reservation
- Color = status (Confirmed=Blue, Tentative=Amber, Blocked=Grey, Maintenance=Orange)
- Text inside block: Guest name (truncated) + nights

Interactions:
- Click empty cell → create reservation starting that date in that room
- Click reservation block → open detail drawer
- Drag block edges to modify stay dates (stretch/shrink)
- Drag block to different row to change room

Top controls:
- Date range navigator (prev/next week, month selector)
- Zoom: Day | Week | Month view
- Filter by room type
- Legend

---

### SCREEN 7 — Housekeeping Board

Visual Kanban board + AI optimization panel.

Top Bar:
- Date selector (today, tomorrow)
- "Run AI Optimizer" button (violet, with sparkle icon)
- Stats: Total tasks | Completed | In Progress | Pending | Overdue

AI Optimization Panel (top, collapsible):
- Card with violet gradient background
- Shows: "AI has optimized task allocation for 18 rooms"
- Key insight: "Room 204, 308, 412 need priority — check-ins before 2 PM"
- "Accept AI Plan" button | "Modify" button

Kanban Columns:

Column 1 — Dirty (needs cleaning):
Column 2 — In Progress:
Column 3 — Inspecting:
Column 4 — Clean & Ready:

Each task card:
- Room number (large, bold)
- Room type
- Priority badge (Urgent / High / Normal)
- Assigned cleaner avatar + name
- Estimated time
- Next check-in time (if urgent: shown in red)
- Drag to move between columns

Right side: Staff list panel
- Each staff member: name, avatar, assigned rooms count, completed count, current task

---

### SCREEN 8 — Revenue Management

Split layout with AI on the right.

Left (65%) — Rate Grid:
- Calendar grid: Room Types on Y, Dates on X (next 90 days)
- Each cell: Current rate + occupancy % indicator (color fills the cell)
  - 0-40%: Red tint
  - 40-70%: Amber tint
  - 70-90%: Green tint
  - 90-100%: Dark green, full
- Click cell → edit rate inline
- "Lock" icon to override AI recommendation and lock a rate

Right (35%) — AI Revenue Panel:

Section 1 — AI Demand Forecast:
- "Next 30 Days Forecast" heading
- Bar chart: predicted occupancy per day
- High-demand dates highlighted with gold star
- Events affecting demand listed below chart

Section 2 — AI Rate Recommendations:
- Table: Date | Current Rate | AI Recommended | Variance | Accept button
- Bulk accept button: "Accept all AI recommendations"
- Green = AI suggests higher, Red = AI suggests lower

Section 3 — Competitor Snapshot:
- If competitor data connected: competitor names + their rates in a table
- Radar chart showing rate positioning

---

### SCREEN 9 — AI Operations Copilot

Full-page experience. This is the showpiece screen.

Layout: Two-panel chat + insight panel

Left Panel (60%) — AI Chat Interface:

Top: 
- "AI Copilot" heading with animated violet orb/pulse beside it
- Subtitle: "Powered by HospitalityOS Intelligence"

Chat area:
- Dark background, messages float in the center
- AI messages: glass card with subtle violet border, violet avatar orb
- User messages: right-aligned, #253460 background

AI message card components:
- Text answer (well-formatted, uses bullet points, bold for key numbers)
- Embedded mini-chart when data is shown
- "Confidence: High" badge
- Data sources footer: "Read from: PMS, Revenue, CRM"
- Action suggestions: "Would you like to..." buttons below

Input area (bottom):
- Large input field: "Ask about your property..."
- Voice input button
- Send button (violet gradient)
- Quick prompts chips above input:
  - "Why did occupancy drop this week?"
  - "Show revenue forecast"
  - "Rooms likely unsold this weekend"
  - "Top guest complaints"
  - "Which OTA underperforming?"

Right Panel (40%) — Context & Data:

Top: Shows which modules AI has access to (PMS ✓, CRM ✓, Revenue ✓, etc.)
Middle: "Active Alerts" — AI-generated proactive alerts
  - Each alert: icon + description + severity badge + "Investigate" link
Bottom: "Report History" — past generated reports

---

### SCREEN 10 — Guest Profile (CRM)

Full-page guest profile — feels like a premium CRM.

Hero Section (top):
- Large guest avatar (initials if no photo)
- Name (24px, bold)
- Loyalty tier badge (Gold / Platinum / Silver) with icon
- Key stats inline: Total stays | Total nights | Lifetime revenue | Last stay date

Tab Navigation:
- Overview | Stay History | Preferences | Financials | Communications | AI Insights

**Overview Tab:**
- 4 metric cards: Total Stays, Total Nights, Total Spend, Avg Daily Rate
- Last stay summary card
- Quick notes section
- Tags (VIP, Corporate, Wedding Guest, etc.)

**Stay History Tab:**
- Timeline view of all past stays
- Each stay: dates, property, room type, rate, satisfaction score
- Reservation summary with financials

**Preferences Tab:**
- Room preferences (type, floor, view)
- Food preferences (vegetarian, allergies, favorites)
- Service preferences (no disturbance, early housekeeping)
- Communication preferences

**AI Insights Tab (violet themed):**
- "AI Guest Intelligence" heading
- Predicted: Next stay probability, Churn risk score, LTV estimate
- Personalization recommendations:
  - "This guest always books deluxe rooms. Offer suite upgrade at ₹800/night extra."
  - "Booked spa last 3 stays. Pre-offer spa package on next booking."
- Sentiment summary from reviews and complaints

---

### SCREEN 11 — Channel Manager

Multi-OTA management dashboard.

Top — Connection Status Bar:
- Each OTA as a card: logo + name + status badge (Connected / Error / Syncing)
- Last sync time
- Click → OTA detail panel

Main Content — Rate & Inventory Grid:
Same visual style as Revenue screen but shows per-OTA rates.

Columns: Room Type | Your Rate | Booking.com | Airbnb | Expedia | Agoda | MakeMyTrip
Rows: Next 30 dates

Color code cells: Green = matching, Amber = slight variance, Red = large variance

Right Panel — Sync Activity:
- Live feed of sync events (Kafka-powered in real system)
- "Booking.com rate updated — 2s ago"
- "Airbnb inventory synced — 5s ago"

---

### SCREEN 12 — Analytics Dashboard

Data-rich, premium dashboard feel.

Layout: Responsive grid of charts and tables.

Top Row — RevPAR / ADR / Occupancy (3 big metric cards with trend charts)

Row 2 — Revenue Over Time:
- Full-width line chart
- Toggle: Daily | Weekly | Monthly
- Comparison: This year vs last year (two lines)
- Annotations on chart: events, price changes

Row 3 — Channel Performance:
- Left: Donut chart — revenue by channel
- Right: Bar chart — booking volume by channel

Row 4 — Heatmap Calendar:
- GitHub contribution graph style
- Each day colored by occupancy % (lighter = lower, darker = higher)
- Hover shows: date, occupancy %, ADR, RevPAR

Row 5 — Guest Satisfaction:
- NPS trend line chart
- Review category breakdown (horizontal bar chart)
- Top complaints word cloud (styled, dark themed)

---

### SCREEN 13 — Booking Engine Preview (White Label)

A "Preview" tab in settings where hotel can see their white-label booking page.

This should be shown as a browser mockup (screenshot frame) within the admin panel.

The booking engine itself (separate page, embeddable):
- Clean, bright design (opposite of admin — light theme, hotel branding colors)
- Full-width hero with hotel photo
- Availability search widget (dates, guests)
- Room type cards with photos, amenities, prices
- AI recommendation badge on best option
- Smooth step-by-step booking flow

---

### SCREEN 14 — Voice AI Dashboard

A dedicated screen for Voice AI monitoring.

Top — Live Status:
- "AI Voice Agent" status: Online (green pulse animation)
- Active calls counter
- Today's call volume

Call Log Table:
- Caller number (masked: +91 98765 *****)
- Duration
- Intent detected (Booking / Cancellation / Info / Escalated)
- Status (Resolved / Escalated to Human)
- Recording (play button inline)
- Transcript (expandable)

Analytics:
- Top intents chart (bar chart)
- Resolution rate over time
- Average call duration
- Escalation rate

---

## SPECIAL UI PATTERNS

### 1. Command Palette (CMD+K)
- Full-screen overlay with blur backdrop
- Search box at top: "Search or run a command..."
- Groups: Recent, Reservations, Guests, Actions, Navigation
- Keyboard navigation (up/down arrows)
- Result items: icon + label + shortcut badge

### 2. AI Thinking Animation
When AI is processing:
```
Show a violet pulsing orb + text "Analyzing 4,521 data points..." 
Subtitle: "Reading PMS, CRM, Revenue data"
Animated progress: small violet dots flowing left to right
```

### 3. Notification Center (Bell icon → Panel)
- Slide-down panel from top-right
- Grouped: Alerts | AI Insights | System | Activity
- Each notification: icon + description + time + "Mark read" / action button

### 4. Onboarding Empty States
When a module has no data yet:
- Centered illustration (minimal, line-art style)
- Heading: "No reservations yet"
- Body: Short explanation
- CTA button to add first item
- Optional: short explainer video link

### 5. Keyboard Shortcuts Reference (? key)
- Modal showing all keyboard shortcuts
- Grouped by section

---

## ANIMATIONS & MICRO-INTERACTIONS

```
Page transitions           : fade + slight upward translate, 200ms
Sidebar collapse           : smooth width animation, 250ms ease-in-out
Card hover                 : translateY(-2px) + shadow intensify, 150ms
Button press               : scale(0.97), 80ms
Modal open                 : scale from 0.95 + opacity 0 → 1, 200ms ease-out
Drawer open                : translateX from 100% → 0, 250ms ease-out
Toast in                   : translateY(20px) + opacity 0 → 1
Number counters            : animate from old value to new (when KPI updates)
Chart draw                 : animate bars/lines drawing in on first render
AI orb                     : slow breathing pulse, scale 1 → 1.05 → 1, 3s infinite
Notification badge         : scale bounce on new notification
Skeleton shimmer           : gradient sweep, 1.5s infinite
Drag-and-drop              : item lifts up (shadow + slight scale), ghost preview shown
```

---

## RESPONSIVENESS

Primary target: **Desktop (1280px–1920px)**
Secondary: **Tablet (768px–1280px)** — sidebar collapses, content stacks
Mobile: **Staff App only** — separate Flutter app, not this web UI

Tablet adjustments:
- Sidebar auto-collapses to icon-only
- 2-column grids become 1-column
- Right drawers become bottom sheets
- Tables get horizontal scroll

---

## TECH STACK (for Lovable to use)

```
Framework          : Next.js 14 (App Router)
Language           : TypeScript
Styling            : Tailwind CSS + CSS Variables for theming
Components         : ShadCN UI (fully restyled to dark theme)
Icons              : Lucide React
Charts             : Recharts (dark styled) or Tremor
Animations         : Framer Motion
State              : TanStack Query v5 + Zustand
Forms              : React Hook Form + Zod
Date Handling      : date-fns
Drag & Drop        : @dnd-kit
Command Palette    : cmdk
Notifications      : Sonner
Table              : TanStack Table v8
```

---

## SAMPLE DATA TO USE IN THE UI

Use this realistic Indian hotel data to populate all screens:

```
Property Name    : The Grand Meridian Hotel
Location         : Connaught Place, New Delhi
Star Rating      : 5 Star
Total Rooms      : 142 rooms
Room Types       : Standard (40), Deluxe (50), Club Room (30), Suite (15), Presidential Suite (7)

Sample Guests:
  Arjun Malhotra   | Room 301 | Checked In | Gold Loyalty
  Priya Sharma     | Room 512 | Arriving Today | New Guest
  Rahul Gupta      | Room 215 | Checked Out | Platinum Loyalty
  Neha Joshi       | Room 408 | Departing Today
  Vikram Singh     | Room 110 | Confirmed, Arriving Tomorrow

Today's KPIs:
  Occupancy        : 84%
  Available Rooms  : 23
  Arrivals         : 18
  Departures       : 12
  Revenue Today    : ₹1,87,450
  ADR              : ₹8,230
  RevPAR           : ₹6,913

OTA Distribution:
  Direct           : 38%
  Booking.com      : 28%
  Airbnb           : 14%
  Expedia          : 10%
  MakeMyTrip       : 10%
```

---

## LOVABLE-SPECIFIC INSTRUCTIONS

1. Start with the **Login page** and **Main Dashboard** first.
2. Build the **Sidebar navigation** with all sections — make it collapsible.
3. Build the **Reservations list + detail drawer** as the first full module.
4. Then build **Housekeeping board**, **Revenue screen**, and **AI Copilot chat**.
5. Make sure every screen uses the exact color palette defined above — do not deviate.
6. Use **realistic sample data** (Indian hotel context, Indian currency ₹, Indian names).
7. All number formatting: Indian locale (1,87,450 not 187,450).
8. Every chart should have real-looking data — no flat lines, no zeroes.
9. The AI Copilot screen must have at least 3 pre-loaded sample conversations showing the AI answering real hotel questions with charts embedded in the response.
10. The dashboard must feel **alive** — use animated numbers, pulsing status indicators, and live-looking activity feeds.
11. Add the AI violet accent consistently throughout — every AI-powered feature should have the violet glow/accent so users know it's intelligent.
12. Make the product feel **premium** — this competes with enterprise software. Every interaction should feel smooth and considered.

---

## FINAL VISION STATEMENT FOR LOVABLE

> This product is not a hotel management tool. It is an **intelligent command center** for hospitality businesses. Every screen should communicate: *we have made running a hotel effortless because the AI handles the complexity.* The visual language should inspire confidence in the operators using it. It should feel like flying a modern aircraft — powerful instruments, calm design, total situational awareness.

Build something that would make a hotel owner look at the screen and say: *"I finally understand exactly what is happening in my property — in real time."*

---

*— HospitalityOS AI, Project Prompt v1.0*
*Project Folder: C:\xampp73\htdocs\Hospitality*

---

# END OF LOVABLE PROMPT
