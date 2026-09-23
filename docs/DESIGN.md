# X-29 ADVANCE — VISUAL DESIGN SPECIFICATION & INTERFACE AUDIT

> **Document Version:** 1.0.0  
> **Status:** Active / Permanent Visual Source of Truth  
> **Rule:** This document describes the EXACT existing design of X-29. No new design is introduced.

---

## 1. Visual Identity & Foundations

The design language of **X-29** is an ultra-sleek, technical, futuristic dark aesthetic featuring deep midnight backgrounds, glassmorphic floating panels, multi-hue neon accents, and high-precision chronograph instruments.

### 1.1 Color Architecture

```text
CORE CANVAS & SURFACE PALETTE
---------------------------------------------------------------------------------------
Deep Cosmic Void (App Background) : #0b0f19
Dark Slate Surface (Main Wrapper)  : #0f172a (Tailwind slate-900 / dark:bg-[#0f172a])
Light Surface (Light Mode)         : #f8fafc (Tailwind slate-50)
Glassmorphic Panel Fill            : rgba(30, 41, 59, 0.45)
Panel Border Accent                : 1px solid rgba(255, 255, 255, 0.08)
Panel Elevation Shadow             : 0 25px 50px -12px rgba(0, 0, 0, 0.5)
Input Focus Glow                   : 0 0 15px rgba(59, 130, 246, 0.25)
Primary Action Gradient            : linear-gradient(to right, #2563eb, #4f46e5) [blue-600 to indigo-600]
```

#### Tailwind Component Accent Palette (`twColors` in `js/state.js` & `css/style.css`):
Used across tracks, badges, status indicators, and subject pills:

| Token | Hex | Badge / Border Classes | Icon Background / Text |
| :--- | :--- | :--- | :--- |
| **indigo** | `#6366f1` | `border-indigo-500`, `bg-indigo-50 dark:bg-indigo-900/20` | `text-indigo-400`, `bg-indigo-100 dark:bg-indigo-500/10` |
| **violet** | `#8b5cf6` | `border-violet-500`, `bg-violet-50 dark:bg-violet-900/20` | `text-violet-400`, `bg-violet-100 dark:bg-violet-500/10` |
| **orange** | `#f97316` | `border-orange-500`, `bg-orange-50 dark:bg-orange-900/20` | `text-orange-400`, `bg-orange-100 dark:bg-orange-500/10` |
| **purple** | `#a855f7` | `border-purple-500`, `bg-purple-50 dark:bg-purple-900/20` | `text-purple-400`, `bg-purple-100 dark:bg-purple-500/10` |
| **emerald**| `#10b981` | `border-emerald-500`, `bg-emerald-50 dark:bg-emerald-900/20` | `text-emerald-400`, `bg-emerald-100 dark:bg-emerald-500/10` |
| **rose**   | `#f43f5e` | `border-rose-500`, `bg-rose-50 dark:bg-rose-900/20` | `text-rose-400`, `bg-rose-100 dark:bg-rose-500/10` |
| **cyan**   | `#06b6d4` | `border-cyan-500`, `bg-cyan-50 dark:bg-cyan-900/20` | `text-cyan-400`, `bg-cyan-100 dark:bg-cyan-500/10` |
| **amber**  | `#f59e0b` | `border-amber-500`, `bg-amber-50 dark:bg-amber-900/20` | `text-amber-400`, `bg-amber-100 dark:bg-amber-500/10` |

#### Canonical 14-Color Subject Palette (`js/utils/colors.js`):
Used for deterministic chapter hashing and multi-track charts:
`#ef4444`, `#f97316`, `#eab308`, `#84cc16`, `#22c55e`, `#14b8a6`, `#06b6d4`, `#3b82f6`, `#6366f1`, `#8b5cf6`, `#a855f7`, `#d946ef`, `#ec4899`, `#f43f5e`.

---

### 1.2 Typography System

The interface leverages specialized Google Fonts loaded in `<head>`:

| Font Family | CSS Class / Selector | Usage Scope in X-29 |
| :--- | :--- | :--- |
| **Inter** | `font-sans`, `body` | Body copy, table cells, descriptions, form labels, tooltips. |
| **Outfit** | `font-display`, `font-outfit`, `h1..h4` | Main headings, modal titles, KPI metric numbers, card headers. |
| **Plus Jakarta Sans** | Secondary display fallback | Supporting headers and badge typography. |
| **JetBrains Mono** | `font-tech` | Timestamps, IDs, code snippets, status badges, log records. |
| **Rajdhani** | `font-rajdhani` | Technical readouts, sub-dial metrics, status indicators. |
| **Chakra Petch** | `font-chakra` | Futuristic badges, track titles, operational mode tags. |
| **Tabular Numbers** | `font-countdown` | Countdown clocks, timer numbers (`font-feature-settings: "tnum" 1, "zero" 1`). |

---

## 2. Layout & Shell Architecture

### 2.1 Desktop Layout ($\ge$ 768px)
* **Master App Shell:** `#app-wrapper` spanning `h-screen w-screen overflow-hidden flex flex-row`.
* **Sidebar (`#sidebar-container`):** Fixed width (260px), background `#0b0f19` / slate-900 with glass border, containing:
  * Application logo (`icons/logo-sticker.png`), Title "X-29", version pill (`v1.0.16`).
  * Primary navigation items with SVG icons, hover transitions, active background `bg-blue-600/10 text-blue-400 border-l-2 border-blue-500`.
  * User profile card at bottom (`#profile-avatar`, `#profile-name`, `#profile-email`), logout button (`#btn-logout`).
* **Header Bar:** Horizontal top bar displaying:
  * Exam countdown segment (`.hdr-countdown-segment`) with tabular digit displays and colored urgency rings.
  * Live Cloud Synchronization Status Badge (`#sync-status`): Saving (spinning blue), Saved (green check), Local (blue dot), Offline (amber), Sync Conflict (rose).
  * Quick action buttons (PWA Install trigger `#pwa-install-btn`, notifications).
* **Main View Container:** `#page-container` scrollable area with custom scrollbars (`.custom-scrollbar`).

### 2.2 Mobile & Tablet Layout (< 768px)
* **Mobile Header:** Fixed top banner with three-dot hamburger trigger (`#mobile-sidebar-toggle`), X-29 logo, and sync status badge.
* **Off-Canvas Drawer:** `#sidebar-container` transforms into an off-canvas drawer:
  * Closed state: `-translate-x-full pointer-events-none`.
  * Open state: `translate-x-0 shadow-2xl z-[9999]`.
  * Managed by `js/shared/sidebar.js` with backdrop `#sidebar-backdrop` (`opacity-0` $\rightarrow$ `opacity-100`).
* **Mobile Form Optimization:**
  * All input, select, textarea elements have `font-size: 16px !important;` below 640px to completely suppress iOS mobile Safari auto-zooming.
  * Universal touch optimization: `.touch-action-manipulation` eliminating the 300ms tap delay.

---

## 3. Component Design Reference

### 3.1 Cards & Containers
* **Glass Card (`.glass-card`):** Rounded corners (`rounded-2xl` to `rounded-3xl`), translucent slate background, subtle light border (`border-white/10`), deep diffuse drop shadow.
* **Metric Cards:** Large tabular KPI number (Outfit 900), subtle uppercase tracking tag (Inter 800 10px), contextual SVG icon in rounded squircle.

### 3.2 Buttons & Controls
* **Primary Button:** Gradient background `from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700`, white bold uppercase text, `active:scale-[0.98]`, subtle shadow glow.
* **Secondary / Ghost Button:** Slate-800 background, border border-slate-700, text-slate-300, hover:bg-slate-700.
* **Inputs & Form Fields (`.glowing-input`):** `bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3`, text-sm, placeholder-slate-600, focus outline blue with glowing shadow.
* **Select Dropdowns:** Custom styled with dark option list backgrounds (`#0f172a`, text `#f8fafc`) and blue optgroup labels (`#020617`, text `#3b82f6`).

### 3.3 Study Task Cards
* **Normal Task Card:** Card with colored accent left border matching subject color, checkbox, chapter number badge, title, and action menu.
* **Completed Task Card:** Card opacity fades to 0.7, strike-through line on title and description, checkbox checks with emerald fill.
* **Skipped Task Card:** Dashed border, italicized text, amber skipped tag.
* **Revision Task Card:** Cyan badge indicator (`REV`), practice checkbox.

### 3.4 Focus Chronograph Dial (`pages/Focus/Focus.{html,css}`)
* **Flat "Painted-on-the-Wall" Dial:** SVG clock dial with major ticks (`--chrono-tick-major`), minor ticks (`--chrono-tick-minor`), numeric hour labels, sub-dial hands, and center hub.
* **Sweep Needle Hand:** Primary blue needle hand (`#2563eb` light / `#3b82f6` dark) with smooth hardware-accelerated CSS needle glow (`--chrono-main-hand-glow`).
* **Digital Readout:** Split display with large HH:MM tabular digits and high-contrast seconds/milliseconds readout.
* **Fullscreen Presentation:** Fixed fullscreen viewport (`z-[99999]`) hiding all surrounding navigation and displaying only clock, subject tag, and floating pause/save controls.

### 3.5 Modals & Dialogs (40 Distinct Modals)
* Coordinated by `js/shared/modals.js`:
  * Backdrop: `fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990]`.
  * Container: Centered flex layout with scale/fade animation.
  * Universal dismissal: Clicking backdrop, close icon button, or pressing Escape dismisses modal with `pointer-events-none` cleanup.

---

## 4. Animation & Interaction Catalog

| Animation Token | Keyframe / Timing | Usage in Application |
| :--- | :--- | :--- |
| `animate-page-enter` | `0.4s cubic-bezier(0.16, 1, 0.3, 1)` | Slide-up and fade-in when switching router pages (`translateY(12px) -> translateY(0)`). |
| `animate-aura` | `4s ease-in-out infinite` | Ambient radial glows on login and splash screens (`scale(1) -> scale(1.04)`). |
| `animate-premium-pulse` | `2.2s ease-in-out infinite` | Highlighting critical countdown clocks and exam milestones. |
| `shimmer-progress` | `1.5s infinite linear` | Loading bar animated gradient shimmer on splash and progress bars. |
| `animate-gold-pulse` | `2.5s ease-in-out infinite` | Daily target milestone achieved and 100% completion celebration cards. |
| `animate-gem-shimmer` | `3s ease infinite` | High-tier streak days and GitHub activity heatmap boxes. |
| `animate-diamond-shimmer`| `2.8s ease-in-out infinite` | Perfect study streak badge on Spectra analytics. |

---

## 5. Design Preservation Mandate

> **The current X-29 interface is the visual source of truth. Future technical modernization must preserve the existing visual language unless the user explicitly requests a design change.**
