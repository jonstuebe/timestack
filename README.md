# Timestack

A daily history puzzle. Drag five events into chronological order, lock it in, watch the cards flip, and share a spoiler-free emoji result, just like Wordle.

- One puzzle per day, the same for everyone, chosen from the player's **local** date.
- A small Cloudflare Worker serves only today's puzzle, so future puzzles can't be read from the page source (see [ADR 0001](docs/adr/0001-puzzles-served-by-worker.md)).
- One attempt per day. Progress mid-puzzle, results, streaks and stats live in `localStorage` (`timestack:v1`); today's puzzle is cached in `timestack:puzzle`.
- Installable PWA. It needs the network once a day to fetch the puzzle; after that, today's game plays offline.

## Develop

```sh
npm install
npm run dev          # http://localhost:5173, with the Worker API running in workerd
npm run build        # typecheck + production build into dist/client (site) and dist/timestack (Worker)
npm run preview      # serve the build, Worker included (service worker enabled)
```

## Test

```sh
npm test             # Vitest unit tests: date keys across time zones/DST, the Worker's date gate, puzzle fetch/cache, shuffle, scoring, share text, storage
npm run test:e2e     # Playwright: builds, serves, and plays the game (incl. offline, sharing, axe accessibility)
```

## Deploy

```sh
npm run deploy       # build, then wrangler deploy to https://timestack.jonstuebe.com
```

One Cloudflare Worker serves the static site and `GET /api/puzzle/<YYYY-MM-DD>`, which returns `{ number, puzzle }` only while that date is "today" somewhere on Earth (UTC−12 to UTC+14). Every other date gets a 404.

## Content

Puzzles live in `worker/puzzles.json` and never ship in the client bundle. Ship new puzzles by appending to that file and running `npm run deploy`. The build warns when fewer than 14 puzzles are left after today.

- Puzzle number = days since `LAUNCH_DATE` in `worker/puzzles.ts` (puzzle #1 on launch day). When the list runs out, players see "Back tomorrow"; it never loops.
- `events` are stored in correct order; the app shuffles them deterministically per puzzle number, never starting solved.
- Sort key is `(year, month ?? 0, day ?? 0)`; `year` is negative for BCE. Every event in a puzzle must have a distinct sort key.
- `display` is what's shown on reveal (`"c. 2560 BC"`, `"Apr 1926"`). Titles must not contain years or era words.
- `fact` is the in-app "Did you know?" card; it never appears in the share text.
- Sources for every date are tracked in `docs/sources.csv` (not shipped with the app).

## Structure

```
worker/
  index.ts           GET /api/puzzle/:date with the "today somewhere" gate
  puzzles.ts         launch date, puzzle number, date window
  puzzles.json       every puzzle (server only)
src/
  lib/daily.ts       fetch today's puzzle, cache it for offline play
  lib/puzzle.ts      local date key, seeded shuffle
  lib/scoring.ts     score + per-slot colours, headlines
  lib/share.ts       share text + Web Share API / clipboard fallback
  lib/storage.ts     versioned localStorage, streaks, stats
  lib/pwa.ts         service worker registration + update prompt
  components/        Game, Board, RevealBoard, Results, Countdown, modals, toasts
public/icons/        PWA icons (regenerate with `npm run icons`)
```
