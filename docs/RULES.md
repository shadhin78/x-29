# X-29 ADVANCE — PERMANENT DEVELOPMENT RULES & GOVERNANCE

> **Document Version:** 1.0.0  
> **Status:** Active / Non-Negotiable AI Control File  
> **Target Audience:** All AI Agents, Engineers, and Collaborators on X-29

---

## 1. ABSOLUTE DESIGN RULE: ZERO UNPROMPTED REDESIGN

> [!CAUTION]
> **THE CURRENT HTML/CSS/JS VERSION IS THE VISUAL SOURCE OF TRUTH.**  
> Under no circumstances may an AI agent or developer independently redesign, reskin, or "modernize" the visual appearance of X-29 without explicit, written instruction from the user.

1. **Pixel & Behavioral Parity:** The modernized version must look, feel, animate, and behave identically to the existing version.
2. **Forbidden Changes:**
   * Do NOT change color palettes, dark mode shades (`#0b0f19`, `#0f172a`), or surface gradients.
   * Do NOT change fonts (Outfit, Inter, Plus Jakarta Sans, JetBrains Mono, Rajdhani, Chakra Petch).
   * Do NOT modify margins, padding, card borders, corner radii, or visual density.
   * Do NOT replace existing custom cards (`.glass-card`), inputs (`.glowing-input`), or badges with generic shadcn/ui or stock Tailwind templates.
   * Do NOT alter existing micro-animations, slide-up page transitions, or pulse effects (`animate-page-enter`, `shimmer-progress`, `animate-aura`).
   * Do NOT rewrite or alter user-facing terminology, button labels, badge texts, or table headers.
3. **Target Equation:**
   $$\text{OLD X-29 DESIGN} \equiv \text{NEW X-29 DESIGN}$$
   *The entire technical modernization happens strictly underneath the user interface.*

---

## 2. FUNCTIONALITY & BUSINESS LOGIC PRESERVATION

1. **Feature Retention:** No existing feature, view, modal, calculation, or helper may be pruned or silently dropped.
2. **Math & Metrics Integrity:**
   * KPI calculations in `js/core/metrics.js` (Totals, Success Score, Countdown, Subject Progress) must output identical numerical values.
   * Pace estimation algorithms in `js/features/pace/` must maintain exact formulaic relationships between target deadlines and required chapter rates.
   * Focus Timer calculations in `shared/services/timerService.js` (elapsed time, session logging, streak calculation) must remain mathematically exact.
3. **Database Schema Stability:**
   * Do NOT arbitrarily alter Firestore document structures or field types in `/users/{userId}`.
   * All 48 whitelisted top-level keys in `firestore.rules` must remain supported.
   * Any change to data structures requires explicit user approval and backward-compatible migration logic in `migrateLegacyData()`.
4. **Security Rules Immobility:**
   * `firestore.rules` is production infrastructure. Do NOT modify, weaken, or deploy security rule changes without explicit user authorization.

---

## 3. MIGRATION & REFACTORING PROTOCOLS

1. **Incremental Execution Only:** Never perform a blind "big bang" rewrite. Modernization must proceed phase-by-phase, module-by-module.
2. **Pre-Migration Dependency Audit:** Before touching or moving any module:
   * Inspect all inbound and outbound dependencies.
   * Identify all `window` global attachments and event listeners.
   * Verify whether the module interacts with `AppState`, `FirebaseService`, `TimerService`, or `Router`.
3. **Rollback Points & Git Discipline:**
   * Maintain a clean Git working tree before starting any phase.
   * Create an explicit Git checkpoint (`git status`, commit with descriptive phase summary) upon completion.
   * Never delete legacy files until the replacement module is verified functional and passes regression tests.
4. **Automated Verification Gate:** Every migrated component must pass existing test suites in `tests/` (`full-regression.test.js`) or newly created modular unit tests before moving to the next task.

---

## 4. PERFORMANCE & RUNTIME GOVERNANCE

1. **Client JavaScript Minimization:**
   * Do not declare `"use client"` globally or at layout roots.
   * Keep Client Components strictly at the interactive leaves (buttons, inputs, canvas charts, live clocks).
   * Prefer React Server Components (RSC) for page shells, layout structures, and static text.
2. **Bundle Discipline:**
   * Route-level code splitting must ensure visiting `/dashboard` loads zero code for `/analytics`, `/focus`, or `/settings`.
   * Heavy libraries (Chart.js) must be dynamically imported via `next/dynamic` or `React.lazy()` with `ssr: false`.
3. **Resource Leak Prevention:**
   * Every `setInterval`, `setTimeout`, and `addEventListener` inside React hooks must return a thorough cleanup function (`useEffect` teardown).
   * Firestore `onSnapshot` listeners must unsubscribe cleanly on component unmount or user logout.
   * Chart.js canvas instances must be explicitly destroyed (`chart.destroy()`) before creating new instances or unmounting.
4. **Main Thread Non-Blocking:**
   * Avoid heavy synchronous JSON operations or multi-thousand-item array sorting directly in event handlers.
   * Debounce all autosave routines (minimum 180ms debounce window).

---

## 5. DEPENDENCY ADDITION CRITERIA

Before proposing or installing any third-party npm package, answer and document:

| Question | Evaluation Standard |
| :--- | :--- |
| **1. What real problem does it solve?** | Must address a concrete functional gap; "it is popular" is an invalid reason. |
| **2. What is the bundle cost?** | Must check bundlephobia / minified+gzipped footprint; reject heavy packages. |
| **3. Does native platform already provide it?** | If native browser APIs, Next.js built-ins, or small internal utils solve it, write the utility. |
| **4. Does it improve long-term maintainability?** | Must have active maintenance, TypeScript support, and zero conflicting peer dependencies. |

*Approved Stack Components:* Next.js 16, React 19, TypeScript, Tailwind CSS (build-time), Zustand, Radix UI primitives, Lucide React, `idb`.  
*Disallowed Without Explicit Permission:* Heavy UI frameworks (Bootstrap, MUI, AntD, Chakra), arbitrary CSS libraries, redundant state managers (Redux, MobX).

---

## 6. SECURITY & CREDENTIAL HYGIENE

1. **Private Access Enforcement:** The application must remain strictly single-tenant for `ris2k29@gmail.com`.
2. **Zero Client Secrets:**
   * Never commit or bundle `firebase-service-account.json` into client builds or public files.
   * Never expose private keys, database secrets, or admin credentials.
   * Never prefix private environment variables with `NEXT_PUBLIC_`.
3. **Client-Side Auth Isolation:**
   * Firebase Admin SDK (`firebase-admin`) must remain strictly on the server or in Node.js backup CLI scripts.
   * The browser client interacts solely via standard Firebase Web Client SDK subject to `firestore.rules`.
4. **Backup Directory Immutability:**
   * Automated backup scripts in `scripts/` must strictly operate in **READ-ONLY** mode against live Firestore unless running an explicit manual restore via `scripts/restore.js`.

---

## 7. AI AGENT SESSION WORKFLOW

At the start of every future modernization turn, the AI agent MUST:
1. Consult `docs/MEMORY.md` to identify active phase, latest checkpoint, and next scheduled task.
2. Read the corresponding phase specification in `docs/TASKS.md`.
3. Adhere strictly to the design and performance constraints in `docs/RULES.md`.
4. Perform work strictly within the scope of the requested phase.
5. Verify changes with automated tests and visual comparisons.
6. Update `docs/TASKS.md` and `docs/MEMORY.md` before concluding the turn.
