# FloodPulse Frontend Shell

A calm, high-precision web platform for probabilistic flood forecasting and road-network impact intelligence, inspired by the serene aesthetic of Claude Support.

---

## ⚠️ Important Architecture & Security Notice (Mock Auth Warning)

> **MOCK AUTHENTICATION NOTICE:**  
> The authentication system in `src/services/authService.ts` and `src/config/demoUsers.ts` is a **client-side simulation designed strictly for UI design reviews and frontend prototyping**.
> 
> Client-side authentication is never secure. When the FloodPulse FastAPI backend is operational, `authService.ts` will be swapped to authenticate against server-side endpoints (`POST /api/v1/auth/token` with JWT / OAuth2 / OIDC). The `IAuthService` interface ensures a zero-breaking-change drop-in replacement.

---

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion (cubic-bezier easing `[0.22, 1, 0.36, 1]`, `prefers-reduced-motion` support)
- **Routing**: React Router v6
- **Maps**: MapLibre GL JS with OpenStreetMap raster tiles
- **State Management**: Zustand (persisted session in `sessionStorage`)
- **Icons**: Lucide React
- **Typography**: "Newsreader" (Google Fonts serif for headings) & "Inter" (sans for UI body)
- **Testing**: Vitest + React Testing Library

---

## Design Tokens

| Token | Value | Purpose |
| :--- | :--- | :--- |
| **Background** | `#FAF9F5` | Warm cream canvas |
| **Surface** | `#FFFFFF` | Primary card background |
| **Subtle Surface** | `#F3F1EA` | Secondary metric container background |
| **Text Primary** | `#141413` | Deep charcoal primary typography |
| **Text Secondary** | `#5E5D59` | Medium contrast secondary labels |
| **Text Muted** | `#8A8880` | Low contrast captions and borders |
| **Border Hairline** | `rgba(20, 20, 19, 0.10)` | Delicate 1px hairline separators |
| **Terracotta Accent** | `#D97757` | Primary brand accent and call-to-action |
| **Accent Hover** | `#C4623F` | Interactive hover state |
| **Water Blue** | `#2F6FB3` | Hydrological forecasts & river channels |
| **Top Edge Bar** | `#3B2A26` | 6px fixed brand bar at the very top |
| **Radius** | `12px` (cards), `8px` (controls) | Soft rounded geometry |

---

## Demo Accounts (Frontend Preview)

| Email | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `operator@floodpulse.demo` | `Flood@2026` | **Operator** | Emergency response operator (alert approval enabled) |
| `admin@floodpulse.demo` | `Admin@2026` | **Admin** | Chief hydrological officer (full administrative permissions) |
| `viewer@floodpulse.demo` | `View@2026` | **Viewer** | Public observer / read-only access (action buttons hidden) |

*Use the **"Fill demo login"** link on the login screen to autofill credentials instantly.*

---

## Folder Structure

```
frontend/
├── index.html                 # HTML template with Google Fonts & MapLibre stylesheet
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration with Vitest setup
├── tailwind.config.js         # Design tokens & color extensions
├── tsconfig.json              # TypeScript compilation rules
├── src/
│   ├── config/
│   │   ├── demoUsers.ts       # Typed demo credentials & user roles
│   │   └── navigation.ts      # Sidebar navigation items and paths
│   ├── mocks/
│   │   └── sample.ts          # Sample hydrograph and at-risk road data (labeled as sample)
│   ├── services/
│   │   ├── api.ts             # Dynamic API client with VITE_API_URL fallback
│   │   └── authService.ts     # Mock auth interface (IAuthService)
│   ├── store/
│   │   ├── authStore.ts       # Zustand store with sessionStorage persistence
│   │   └── toastStore.ts      # Global notification toast store
│   ├── styles/
│   │   └── index.css          # Tailwind directives, CSS variables, and font bindings
│   ├── components/
│   │   ├── common/
│   │   │   ├── Logo.tsx       # Water drop + pulse mark inline SVG with path animation
│   │   │   ├── Button.tsx     # Micro-interaction buttons (hover lift, press scale)
│   │   │   ├── Input.tsx      # Accessible inputs with eye toggle & validation states
│   │   │   ├── Card.tsx       # Soft-bordered surface containers
│   │   │   ├── Badge.tsx      # Status, role, and sample-data pills
│   │   │   ├── WaveBackground.tsx # Calm drifting background waves
│   │   │   └── Toast.tsx      # Alert approval and notification toasts
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx  # Responsive shell layout
│   │   │   ├── Sidebar.tsx    # Left navigation panel with active states
│   │   │   └── Header.tsx     # Top bar with user chip & sign out
│   │   └── map/
│   │       ├── LiveMap.tsx    # MapLibre canvas on Godavari / India with OSM tiles
│   │       ├── RiverForecastCard.tsx # Quantile hydrograph [q05..q95] card
│   │       ├── AtRiskRoadsCard.tsx   # Road closure probability list
│   │       └── DraftAlertCard.tsx    # Situational alert card with role-based actions
│   ├── pages/
│   │   ├── IntroPage.tsx      # Sequenced 4-step initialization intro with skip
│   │   ├── LoginPage.tsx      # Split-screen responsive login with shake validation
│   │   ├── LiveMapPage.tsx    # Operational map & decision card dashboard
│   │   ├── PlaceholderPage.tsx# Future modules preview with SVG illustrations
│   │   └── NotFoundPage.tsx   # 404 page
│   ├── tests/
│   │   ├── setup.ts           # Vitest setup & mocks
│   │   ├── auth.test.tsx      # Login validation & error test cases
│   │   ├── protectedRoute.test.tsx # Access control redirection tests
│   │   └── rolePermissions.test.tsx # Role-based UI visibility tests
│   ├── App.tsx                # Route tree with AnimatePresence page transitions
│   └── main.tsx               # Root entry point
```

---

## Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Run unit tests
npm test

# 4. Check linting and formatting
npm run lint
npm run format:check

# 5. Build production bundle
npm run build
```
