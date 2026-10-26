# Timestack

A daily history puzzle. Drag five events into chronological order, lock it in, watch the cards flip, and share a spoiler-free emoji result, just like Wordle.

- One puzzle per day, the same for everyone, chosen from the player's **local** date. No server.
- One attempt per day. Progress mid-puzzle, results, streaks and stats live in `localStorage` (`timestack:v1`).
- Installable PWA that is fully playable offline once loaded.

## Develop

```sh
npm install
npm run dev          # http://localhost:5173
npm run build        # typecheck + production build into dist/
npm run preview      # serve dist/ (service worker enabled)
```

## Test

```sh
npm test             # Vitest unit tests: date math across time zones/DST, shuffle, scoring, share text, storage
npm run test:e2e     # Playwright: builds, serves, and plays the game (incl. offline, sharing, axe accessibility)
```

## Deploy

`dist/` is a fully static site. Deploy it to any HTTPS static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages at a root domain). HTTPS is required for the service worker, clipboard and Web Share APIs.

## Content

Puzzles live in `src/data/puzzles.json`. Ship new puzzles by editing that file and redeploying; players get a "New version available — Refresh" toast instead of a mid-game reload.

- Puzzle number = days since `LAUNCH_DATE` in `src/lib/puzzle.ts` (puzzle #1 on launch day). **Set this to the real launch date before release.** The list loops back to #1 if it runs out.
- `events` are stored in correct order; the app shuffles them deterministically per puzzle number, never starting solved.
- Sort key is `(year, month ?? 0, day ?? 0)`; `year` is negative for BCE. Every event in a puzzle must have a distinct sort key.
- `display` is what's shown on reveal (`"c. 2560 BC"`, `"Apr 1926"`). Titles must not contain years or era words.
- `fact` is the in-app "Did you know?" card; it never appears in the share text.
- Sources for every date are tracked in `docs/sources.csv` (not shipped with the app).

## Structure

```
src/
  data/puzzles.json
  lib/puzzle.ts      puzzle number from local date, lookup, seeded shuffle
  lib/scoring.ts     score + per-slot colours, headlines
  lib/share.ts       share text + Web Share API / clipboard fallback
  lib/storage.ts     versioned localStorage, streaks, stats
  lib/pwa.ts         service worker registration + update prompt
  components/        Board, RevealBoard, Results, Countdown, modals, toasts
public/icons/        PWA icons (regenerate with `npm run icons`)
```
