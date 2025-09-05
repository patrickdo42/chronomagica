# Chronomagica — Overview & Developer Instructions

Chronomagica is a Next.js app that presents a welcoming splash screen, then an interactive main view for time, weather, planetary highlights, and basic astronomy-by-location data. The UI already includes inputs, controls, and layout; event logic and data wiring can be layered in using client components.

## How It Works (High Level)

- Splash view: Accepts a location and shows inline suggestions. A button transitions into the main app view.
- Main view: Shows date/time and weather panels, a planetary table (with retrograde and moon phase placeholders), and an astronomy section that accepts latitude/longitude to display sun/moon azimuth and altitude.
- Dark mode: A global toggle switches between light and dark themes using a `dark-mode` class on `<body>` with CSS variables.

The current `page.tsx` renders semantic structure and IDs/classes that make it easy to attach interactivity using React client components (e.g., toggles and data fetching hooks).

## Frameworks & Tooling

- Next.js 15 (App Router) with Turbopack for dev/build.
- React 19 with TypeScript (strict mode, path alias `@/*`).
- Styling via Tailwind CSS v4 and global CSS tokens. Fonts via `next/font` (Geist).
- Linting/formatting with Biome 2.x.

## Project Structure

- `src/app/layout.tsx`: Root layout, fonts, global CSS, metadata.
- `src/app/page.tsx`: Home page structure (server component by default).
- `src/app/globals.css`: Theme tokens, dark mode, and global styles. Tailwind v4 is loaded via `@import "tailwindcss"` and `@theme inline`.
- `public/`: Static assets (SVGs).
- `package.json`: Scripts and dependencies.
- `tsconfig.json`: TS settings (strict, bundler resolution, `@/*` alias).
- `biome.json`: Lint/format rules and Next/React recommended domains.
- `postcss.config.mjs`: Loads Tailwind’s PostCSS plugin.
- `next.config.ts`: Placeholder for Next config (extend as needed).

## Local Development

- Prereqs: Node 18+ (LTS), `pnpm` installed.
- Install: `pnpm install`
- Dev server: `pnpm dev` then open http://localhost:3000
- Lint: `pnpm lint`  •  Format: `pnpm format`
- Build/Start: `pnpm build` then `pnpm start`

Preferred package manager is `pnpm` (lockfile present). Avoid mixing with npm/yarn.

## Adding Interactivity & Data

- Client components: For DOM/event logic (e.g., wiring the dark-mode button, toggling splash → main, handling inputs), create client components with the `"use client"` directive and attach via props/state rather than `document.getElementById`.
- Data fetching: Prefer server components for fetching (using `fetch` in Server Components or Route Handlers under `src/app/api/*/route.ts`). Expose client-safe values with `NEXT_PUBLIC_` env vars; keep secrets server-side.
- Styling: Prefer Tailwind utilities for layout and spacing; keep shared theme tokens in `globals.css` under `@theme inline` and CSS variables.

## Known Gaps / Next Steps

- UI controls exist without logic (dark mode toggle, Enter, weather, astronomy fetch). Implement via client components and hooks.
- Planetary data is static; decide on a data source and fetching strategy (server-side fetch + cache suggested).
- Consider extracting reusable pieces (e.g., `DarkModeToggle`, `LocationAutocomplete`, `WeatherPanel`, `AstronomyPanel`) into `src/components/`.

