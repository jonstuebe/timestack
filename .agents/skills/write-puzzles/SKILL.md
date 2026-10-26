---
name: write-puzzles
description: Write new daily Puzzles (five Events plus a Fact, every date sourced) into worker/puzzles.json. Use when adding puzzles, topping up the runway, or fixing a puzzle's dates.
---

# Write puzzles

A Puzzle is five Events the player puts in order, plus a Fact shown after the reveal (terms in `GLOSSARY.md`). The schema is `Puzzle` in `src/lib/types.ts`; the mechanical rules (title length, no years or era words in titles, known categories, strictly ascending order) are enforced by `tests/unit/puzzles.test.ts`. This skill carries the craft those don't.

## Steps

1. **Find where you're starting.** Read `LAUNCH_DATE` in `worker/puzzles.ts` and count `worker/puzzles.json`. Puzzle N plays on `LAUNCH_DATE + (N − 1)` days, so the new puzzles cover the dates after the current last one. Write that number of puzzles if the user gave one; otherwise write 14 (two weeks of runway) and say so. Done when you know the first new id and the dates it covers.

2. **Pick each puzzle's hook first.** The Fact is the hook, and the puzzle is built around it: a single surprising, true sentence that links two or more of the puzzle's own Events (see **Hooks**). Then choose the other Events to make ordering hard (see **Traps**). Done when every new puzzle has a hook and five Events that pass **Choosing Events**.

3. **Source every date.** For each Event, find a page (Wikipedia by default) that states the date at the precision you're storing it. Keep only the fields the source supports: year alone, year and month, or the full date. A disputed or approximate date gets year only and a `c.` display. Fix or drop any Event whose date you can't confirm. Done when every Event has a source URL and every Fact's claim holds against those dates.

4. **Write the JSON.** Append to `worker/puzzles.json` with sequential `id`s continuing from the last one. Store each puzzle's Events in correct chronological order with ids `e1` to `e5` in that order; the app shuffles them. Field formats are in **Writing Events**.

5. **Record the sources.** Append one row per Event to `docs/sources.csv`: `puzzle_id,event_id,title,date,source_url`, where `date` is the `display` string. Quote any field that contains a comma.

6. **Run the gate.** `npx vitest run tests/unit/puzzles.test.ts` must be green. Done when it passes with every new puzzle included.

7. **Report.** State how many puzzles you added, the id range and the last date now covered, and list each hook so the human can sanity-check them. Shipping is `npm run deploy`, which publishes to the live site: run it only when the human asks.

## Hooks

The hook is what the player tells a friend. The strongest shapes, all present in the existing puzzles:

- **Overlap:** two people or things that coexisted against intuition ("Woolly mammoths were still alive on Wrangel Island when the Great Pyramid of Giza was built").
- **Nearness:** a gap that is much shorter than it feels ("Queen Elizabeth II and Marilyn Monroe were born less than six weeks apart").
- **Inversion:** something "old" that came after something "modern" ("The lighter came before the match").
- **Closer-to:** A is closer in time to C than to B ("Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid").

One sentence, at most about 130 characters. It may use years, since it's shown only after the reveal. Do the arithmetic for every "closer to", "before" or "apart" claim from the sourced dates.

## Traps

A puzzle is good when the player is confident and wrong about one or two placements:

- A **near pair**: two Events weeks or months apart, ideally the hook's pair, so the order turns on a detail.
- A **false anchor**: an Event that feels older or newer than it is (Nintendo was founded in 1889; the fax was patented in 1843).
- **Spread:** span the puzzle across eras when the hook allows it, so not every placement is a coin-flip. Some puzzles run within one decade; most cover centuries.

Every Event in a puzzle needs a distinct sort key `(year, month ?? 0, day ?? 0)`. Two Events in the same year therefore need at least one month.

## Choosing Events

- Recognisable to a curious general audience. Prefer events a player has heard of but couldn't date.
- Mix categories within a puzzle; a puzzle of five wars or five inventions is flat. Valid categories are the keys in `src/lib/icons.ts`.
- Prefer fresh Events. Before choosing, list existing titles with `node -e "require('./worker/puzzles.json').flatMap(p=>p.events).forEach(e=>console.log(e.title))"`. A repeat is fine only when it's the hook's partner, and never within 14 puzzles of its last use.
- Vary the hook shape and the eras from one puzzle to the next, so consecutive days feel different.

## Writing Events

- `title`: present tense, at most 60 characters, naming the Event without giving away its date ("Nintendo is founded in Kyoto", "Future Queen Elizabeth II is born"). Spoiler words beyond the test's list count too: "first-ever", "post-war", or a ruler's name that dates the Event to a narrow window.
- `year`: negative for BC (`-44` is 44 BC); there is no year 0.
- `display`, matching the stored precision: `31 Aug 1888`, `Sep 1928`, `1099`, `c. 2560 BC`, `15 Mar 44 BC`, or `by 1096` when the source gives only a latest date.
- `category`: one key from `src/lib/icons.ts`.
- `note`: one sentence, at most about 80 characters, adding a detail the title doesn't (who, where, how). Shown after the reveal.
