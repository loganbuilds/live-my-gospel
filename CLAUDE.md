# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Live My Gospel**, a Next.js 16 + React 19 calendar application for personal schedule management with focus on tracking missionary activities and life goals. The entire application is client-side rendered with no backend or data persistence.

**Important**: The actual Next.js application is nested one level deep in the `calendar-app/` directory, not at the repository root.

## Project Structure

```
logan-live-my-gospel/          (git repo root)
└── calendar-app/              (Next.js application)
    ├── app/
    │   ├── layout.tsx         # Root layout with Geist fonts
    │   ├── page.tsx           # Main app (1500+ lines, single component)
    │   └── globals.css        # Tailwind v4 + custom CSS variables
    ├── public/                # Static assets
    └── [config files]         # next.config, tsconfig, tailwind, eslint
```

## Development Commands

All commands must be run from the `calendar-app/` directory:

```bash
cd calendar-app

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Production server (requires build first)
npm run start

# Linting
npm run lint
```

## Architecture

### Tech Stack
- **Next.js 16** using App Router (`app/` directory, not `pages/`)
- **React 19.2** with TypeScript 5
- **Tailwind CSS v4** (using PostCSS plugin)
- **ESLint v9** with flat config format
- **No external libraries**: No UI components, state management, or date libraries
- **No backend**: Client-side only, no API routes, no database
- **No persistence**: All data in React state (lost on refresh)

### Main Application: `app/page.tsx`

The entire application is a single 1500-line client component (`'use client'`). This is intentional but presents maintainability challenges.

**Core Features**:
- 24-hour day calendar view with hourly slots (64px each)
- Week view (7 days, week starts on Wednesday)
- Drag-and-drop event scheduling (vertical + horizontal)
- 11 pre-defined event types with color coding
- Advanced analog clock time picker
- Date navigation with custom date picker modal
- Weekly key indicators (Gospel Study, Workout, Work, School)
- Undo functionality with 5-second timeout
- Bottom navigation bar (5 tabs, only Calendar is active)

### Event Data Model

```typescript
type Event = {
  id: string;
  type: string;           // Event category
  color: string;          // Tailwind class (e.g., 'bg-pink-400')
  time: number;           // Hour of day (0-23)
  duration: number;       // In hours
  title: string;
  notes?: string;
  date: Date;
  startTime: string;      // Formatted: "H:MM AM/PM"
  endTime: string;
  repeat: string;         // "Daily", "Weekly", etc.
  backup: boolean;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
};
```

### Event Types (11 pre-defined)
- Relax (green) • School Study (yellow) • School Class (light purple)
- Gospel Church (pink) • Gospel Study (purple) • Gospel Meeting (gray)
- Work (cyan) • Travel (light pink) • Meal (light orange)
- Workout (gray) • Other (white)

## Code Patterns & Conventions

### State Management
- **All state in React hooks** - No Redux, Zustand, or Context API
- **Key state variables**:
  - `events`: All calendar events
  - `selectedDate`: Current date being viewed
  - `activeTab`: Navigation tab
  - `indicators`: Weekly metrics
  - `showXXX`: Boolean flags for modals (DatePicker, EventTypeSelector, etc.)
  - `draggedEvent`, `isDragging`: Drag-and-drop state

### Styling
- **Dark theme only**: Black backgrounds, gray scales, pink accents (#EC4899)
- **All Tailwind utilities**: No CSS modules or styled-components
- **Custom CSS variables** in `globals.css` for theming

### Naming Conventions
- **Booleans**: `isXXX`, `showXXX` (e.g., `isDragging`, `showDatePicker`)
- **Event handlers**: `handleXXX` (e.g., `handleCalendarClick`, `handleSaveEvent`)
- **Computed values**: `getXXX()` functions (e.g., `getWeekDays()`, `getCalendarDays()`)

### Key Utility Functions in `page.tsx`
- `parseTimeToHour()`: Convert "H:MM AM/PM" → 24-hour format
- `parseTimeToMinutes()`: Convert time string → minutes since midnight
- `calculateEventDuration()`: Get duration in hours from start/end time
- `calculateEventOffset()`: Get fractional hour offset for positioning
- `formatTimeFromHour()`: Convert hour + minute → "H:MM AM/PM"
- `getWeekDays()`: Generate 7-day week centered on selected date
- `getCalendarDays()`: Generate calendar grid for date picker

## Important Context for Development

### Known Limitations
1. **No data persistence** - Events disappear on page refresh (no localStorage, no backend)
2. **Single large component** - All logic in one 1500-line file (difficult to test/maintain)
3. **Client-side only** - No server-side rendering for page component
4. **No testing framework** - No Jest, Vitest, or E2E tests configured
5. **No accessibility features** - Limited ARIA labels, keyboard navigation needs improvement
6. **Hardcoded strings** - Month/day names in English only (no i18n)

### Refactoring Considerations
If breaking apart `page.tsx`, consider extracting:
- `<Calendar>` - Main calendar grid and event rendering
- `<EventForm>` - Event creation/editing modal
- `<TimePicker>` - Analog clock time picker
- `<DatePicker>` - Custom date selection modal
- `<EventTypeSelector>` - Event type grid selector
- `<WeeklyIndicators>` - Key metrics display
- `<NavigationBar>` - Bottom navigation tabs

### Adding Persistence
To add data persistence, consider:
1. **LocalStorage** - Quick solution, client-only
2. **Supabase** - Backend-as-a-Service with PostgreSQL
3. **Firebase** - Real-time database with authentication
4. **Custom API** - Node.js + Express + database of choice

### Configuration Files
- **TypeScript**: Strict mode enabled, path alias `@/*` maps to root
- **ESLint**: Flat config format with Next.js presets
- **Tailwind**: v4 with custom theme variables, dark mode via `prefers-color-scheme`
- **Next.js**: Minimal config, all defaults

## Deployment

**Vercel Deployment**:
- Set **Root Directory** to `calendar-app` during setup
- Environment: Node.js 20
- Build command: `npm run build`
- Output directory: `.next` (automatic)

**Other Hosts**:
- Requires Node.js 20+
- Run `npm run build` then `npm run start`
- Serve on port 3000 by default

## Week Calculation Logic

**Important**: The week starts on **Wednesday**, not Sunday/Monday. This is controlled by offset calculations around line 466 in `page.tsx`:

```typescript
const getWeekDays = (date: Date) => {
  const day = date.getDay(); // 0 = Sunday
  const diff = day >= 3 ? day - 3 : day + 4; // Wednesday as week start
  // ... rest of calculation
};
```

When modifying date logic, be aware of this custom week start day.

## Fonts

Uses **Geist** and **Geist Mono** from `next/font/google`, configured in `app/layout.tsx`. Font variables are applied to the `<html>` element and referenced in Tailwind config.
