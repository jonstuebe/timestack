---
name: Timestack
description: A daily history puzzle, filed like a museum card catalogue.
colors:
  prussian-ink: "oklch(0.25 0.05 258)"
  ink-fill: "oklch(0.33 0.08 258)"
  button-ink: "oklch(0.3 0.07 258)"
  cinnabar-stamp: "oklch(0.53 0.17 33)"
  cinnabar-on-card: "oklch(0.5 0.17 33)"
  manila: "oklch(0.945 0.035 88)"
  manila-edge: "oklch(0.79 0.045 82)"
  manila-white: "oklch(0.97 0.02 88)"
  pale-vermilion: "oklch(0.87 0.07 42)"
  vermilion-edge: "oklch(0.55 0.16 35)"
  drawer-white: "oklch(0.968 0.006 250)"
  raised-white: "oklch(0.993 0.003 250)"
  drawer-surface: "oklch(0.925 0.012 250)"
  slate-muted: "oklch(0.46 0.035 258)"
  rule-gray: "oklch(0.86 0.014 250)"
  rod-gray: "oklch(0.6 0.03 258)"
  gallery-navy: "oklch(0.2 0.035 258)"
  gallery-navy-raised: "oklch(0.25 0.04 258)"
  lit-manila: "oklch(0.86 0.045 85)"
  cerulean-fill: "oklch(0.74 0.09 240)"
  dark-stamp: "oklch(0.74 0.14 40)"
typography:
  wordmark:
    fontFamily: "'Alegreya Variable', Georgia, 'Times New Roman', serif"
    fontSize: "1.6rem"
    fontWeight: 800
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Alegreya Variable', Georgia, 'Times New Roman', serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.15
  title:
    fontFamily: "'Alegreya Variable', Georgia, 'Times New Roman', serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.25
  date-stamp:
    fontFamily: "'Alegreya Variable', Georgia, 'Times New Roman', serif"
    fontSize: "1.15rem"
    fontWeight: 800
    fontFeature: "onum, pnum"
  body:
    fontFamily: "'Alegreya Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "'Alegreya Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
rounded:
  stamp: "3px"
  card: "6px"
  dialog: "10px"
  hole: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "10px"
  lg: "16px"
  xl: "20px"
  2xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.button-ink}"
    textColor: "{colors.manila-white}"
    rounded: "{rounded.card}"
    padding: "0 22px"
    height: "50px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.prussian-ink}"
    rounded: "{rounded.card}"
    padding: "0 22px"
    height: "50px"
  catalogue-card:
    backgroundColor: "{colors.manila}"
    textColor: "{colors.prussian-ink}"
    rounded: "{rounded.card}"
    padding: "8px 6px 8px 38px"
    height: "66px"
  catalogue-card-correct:
    backgroundColor: "{colors.ink-fill}"
    textColor: "{colors.manila-white}"
    rounded: "{rounded.card}"
  catalogue-card-close:
    backgroundColor: "{colors.pale-vermilion}"
    textColor: "{colors.prussian-ink}"
    rounded: "{rounded.card}"
  catalogue-card-far:
    backgroundColor: "transparent"
    textColor: "{colors.prussian-ink}"
    rounded: "{rounded.card}"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.slate-muted}"
    rounded: "{rounded.card}"
    size: "44px"
  stamp-label:
    backgroundColor: "transparent"
    textColor: "{colors.cinnabar-on-card}"
    rounded: "{rounded.stamp}"
    padding: "0 8px"
---

# Design System: Timestack

## 1. Overview

**Creative North Star: "The Card Catalogue"**

Timestack is a drawer from a museum's card catalogue. Each Event is a manila index card, punched and threaded on a rod that runs from Earliest to Latest; the player slides cards along the rod, locks the drawer, and each card is stamped with its date. Everything else on screen (the drawer label with its puzzle number, the ledger of the correct order, the curator's note) belongs to the same collection. PRODUCT.md calls the personality "archival, curious, quietly playful": scholarly in its materials, never stuffy in its voice.

The system is quiet and catalogued. Surfaces are orderly, cool and flat; type does the expressive work, and colour is held back for meaning. The only theatre is the reveal: the date stamp lands and the card's hole fills. Every other transition is quick and functional, in service of a two-minute daily ritual on a phone.

It explicitly rejects Wordle and its clones (the green, yellow and gray tile palette, `#121213` near-black, a bold centred wordmark between icon buttons, 🟩🟨⬜ share squares, the pill share button, the flip-tile reveal); costume archive (fake parchment, coffee stains, typewriter fonts everywhere, sepia filters); and generic editorial-magazine styling (italic display serif plus tracked mono labels plus ruled columns).

**Key Characteristics:**
- Manila catalogue cards on a cool, never-cream background.
- A vertical rod (the timeline) that threads every card through a punched hole.
- Results told by fill (filled, half, hollow) first, colour second: in the cards, the help legend and the share text (`●─◐─○`).
- Alegreya serif for content and numbers, Alegreya Sans for interface.
- Flat surfaces; depth comes from a paper edge, not a float.

## 2. Colors

A restrained palette of Prussian ink and manila card stock on a cool drawer-white, with cinnabar used like an archivist's ink stamp.

### Primary
- **Prussian Ink** (prussian-ink): all body text and card text in light mode; the colour of the catalogue's writing.
- **Ink Fill** (ink-fill): the background of a card placed in the correct position. In dark mode this role becomes **Cerulean Fill** (cerulean-fill) with ink text, so a correct card still reads as the "filled" state against the navy wall.
- **Button Ink** (button-ink): primary buttons, the selected segment in settings, the switch "on" state and the latest bar in the score distribution. In dark mode primary actions flip to **Lit Manila** (lit-manila) with ink text.

### Secondary
- **Cinnabar Stamp** (cinnabar-stamp): the archivist's red. Puzzle number ("No. 1"), the rod in the logo, the ✓ beside correctly placed answers, the focus ring. In dark mode use **Dark Stamp** (dark-stamp). On manila cards use **Cinnabar on Card** (cinnabar-on-card) so stamped labels keep 4.5:1.
- **Pale Vermilion** (pale-vermilion) with **Vermilion Edge** (vermilion-edge): the "close" result, one slot off. Warm, but never the yellow of a word game.

### Neutral
- **Manila** (manila) with **Manila Edge** (manila-edge): catalogue cards and the curator's note. In dark mode cards become **Lit Manila** (lit-manila), as if spotlit on a gallery wall, and keep ink text.
- **Manila White** (manila-white): text on ink fills and primary buttons.
- **Drawer White** (drawer-white): the page background in light mode, a cool off-white tinted toward the ink hue. **Gallery Navy** (gallery-navy) in dark mode.
- **Raised White** (raised-white): dialogs in light mode; **Gallery Navy Raised** (gallery-navy-raised) in dark mode.
- **Drawer Surface** (drawer-surface): hover fills behind icon and secondary buttons, the manual-share textarea.
- **Slate Muted** (slate-muted): secondary text (dates, hints, axis labels, countdown lead-in). At least 4.5:1 on the background.
- **Rule Gray** (rule-gray): 1px dividers between ledger rows, around the drawer label and in the stats strip.
- **Rod Gray** (rod-gray): the timeline rod, its end caps, the hover edge on a sortable card, and the dashed border of a "far" card.

### Named Rules
**The No-Cream Rule.** Manila belongs to cards only. The page background is a cool, near-neutral white (light) or a deep navy wall (dark), never a warm parchment. If the background reads as paper, the cards stop reading as objects.

**The Fill-Before-Hue Rule.** A result state must be legible in grayscale: correct is a solid fill, close is a half-tone fill with a strong edge, far is hollow with a dashed edge. Hue only reinforces it.

**The No-Green, No-Yellow Rule.** Green and yellow are forbidden anywhere in the game. They are Wordle's, not ours.

## 3. Typography

**Display Font:** Alegreya Variable (with Georgia, Times New Roman, serif)
**Body Font:** Alegreya Sans (with system-ui, -apple-system, Segoe UI, Roboto, sans-serif)

**Character:** A calligraphic book serif paired with its own humanist sans, as on a museum label: the serif names the thing, the sans tells you how to use it. Alegreya's old-style figures make dates feel like they were set in a history book.

Both families are self-hosted through Fontsource (`src/main.tsx`). Only the Latin files are precached by the service worker, so the game renders in its own type when offline.

### Hierarchy
- **Wordmark** (800, 1.6rem): "Timestack" in the header, beside the logo mark.
- **Headline** (800, 1.75rem, 1.15): the results headline, dialog titles (1.45rem), status headings. `text-wrap: balance`.
- **Title** (600, 1.125rem, 1.25): Event titles on cards. Serif because they are content, not interface. `text-wrap: pretty`.
- **Date Stamp** (800, 1.15rem, old-style proportional figures): dates on revealed cards and in the correct-order ledger.
- **Body** (500, 1.0625rem, 1.45): help copy, answer titles, settings. The fact text in the curator's note is serif at 1.2rem, capped at 60ch.
- **Label** (700, 0.95rem, sentence case): axis labels ("Earliest", "Latest"), the stamped "Curator's note", setting names.

### Named Rules
**The Lining-Numbers-for-Data Rule.** Old-style figures are for dates in prose and on cards. Counters, stats, the countdown and the distribution bars use `lining-nums tabular-nums`, or a 0 reads as an "o".

**The No-Eyebrow Rule.** Labels are sentence case and untracked. No tiny uppercase tracked kickers.

## 4. Elevation

Flat by default, with depth as paper rather than float. Cards sit on the page with a 1px paper-edge shadow in light mode (a 2px darker edge in dark mode), like a card resting in a drawer. Lift appears only as a response to state: a card being dragged rises with a soft shadow; dialogs float above a tinted backdrop.

### Shadow Vocabulary
- **Paper edge** (`box-shadow: 0 1px 0 oklch(0.79 0.045 82 / 0.6)`; dark: `0 2px 0 oklch(0.12 0.03 258 / 0.6)`): every catalogue card and the curator's note at rest.
- **Lifted card** (`box-shadow: 0 10px 24px oklch(0.15 0.04 258 / 0.28)`): only while a card is being dragged.
- **Dialog** (`box-shadow: 0 16px 48px oklch(0.15 0.04 258 / 0.3)`): native `<dialog>` modals.
- **Punched hole** (`box-shadow: inset 0 1px 2px oklch(0.15 0.04 258 / 0.25)`): the unplayed card hole, removed once the hole becomes a result mark.

### Named Rules
**The Paper-Edge Rule.** If a shadow at rest is blurred, it is too much. Resting cards get a hard 1–2px edge; blur is reserved for things the player is actively holding.

## 5. Components

### Catalogue Card (signature)
Quiet, orderly, and the one object the player handles.
- **Shape:** gently squared corners (6px), 2px manila-edge border, min-height 66px.
- **Anatomy:** a punched hole on the rod (14px circle, centred on the rod's x of 22px), an optional category emoji, the Event title in serif, then the up/down move buttons (40×44px, stroke chevrons).
- **Rod:** a 2px rod-gray line runs behind the stack from the "Earliest" end cap to the "Latest" end cap, visible in the 10px gaps between cards.
- **States:** hover shifts the border to rod gray; dragging raises the card (Lifted card shadow) with an ink border; keyboard focus shows the cinnabar focus ring. Arrow keys, Home and End move the focused card.
- **Reveal:** the card is stamped one at a time (300ms stagger). The date animates in like an ink stamp (scale 1.6 → 1, rotate −6° → 0, blur 2px → 0, 450ms, ease-out-expo), and the card's background, border and hole transition over 250ms. **Correct:** ink fill, hole filled solid (●). **Close:** pale vermilion, vermilion edge, hole half-filled (◐). **Far:** transparent with a dashed rod-gray border, hollow hole (○). High-contrast mode pushes correct to near-black (near-white in dark) and close to a saturated vermilion.

### Buttons
- **Shape:** gently squared (6px). Never a pill.
- **Primary:** button ink with manila-white text, 50px tall, 22px horizontal padding, weight 700. "Lock it in" and "Share result" span the full column width.
- **Hover / Active:** hover mixes 22% cinnabar into the ink; active nudges down 1px. Transitions are 150ms ease-out-expo.
- **Secondary:** transparent with a 2px rule-gray border; hover fills drawer surface.
- **Icon button:** 44px square, slate-muted stroke icon that darkens to ink on hover over a drawer-surface fill.

### Icons
One stroke set (24px grid, 1.9px round strokes), drawn for the catalogue: help is a card with a question mark, stats are horizontal distribution bars off a baseline, settings are sliders, share is a box with an up arrow. No filled Material icons, and never the Wordle gear and bar-chart pair.

### Drawer Label (puzzle meta)
The puzzle number and date between two rule-gray hairlines, left-aligned: "No. 1" in cinnabar serif bold, then the long-form date in slate muted.

### Results Ledger
Left-aligned. Headline, then a line with the score ("2/5"), "in place", and the result marks (`○─●─●─○─◐`) flush right, exactly as they will be shared. The correct order is a ledger of rows separated by rule-gray hairlines, with a 104px date column in serif and a ✓ in cinnabar for placements the player got right.

### Curator's Note
The Fact, filed on a manila card with the paper-edge shadow. Its label "Curator's note" is a small stamp: cinnabar-on-card text in a 1.5px cinnabar-on-card outline, 3px corners, rotated −2°. The fact itself is serif at 1.2rem.

### Dialogs
Native `<dialog>` at up to 460px (360px for confirmations), 10px corners, raised background, 1px rule border. Entrance is a 220ms slide-and-scale with no opacity fade, so text is at full contrast throughout. The backdrop fades in.

### Statistics
Four stats in one strip between hairlines, divided by 1px rules, with serif lining numerals. The score distribution uses 3px-cornered bars in a neutral fill; the player's latest score is in button ink.

### Settings Controls
A segmented control (2px rule border, 6px corners; the selected segment in button ink) for theme, and a pill switch for high contrast (rod gray off, button ink on).

## 6. Do's and Don'ts

### Do:
- **Do** treat every new screen as part of the card catalogue: drawer labels, catalogue cards, ledgers, stamps. Ask whether it would live in the drawer.
- **Do** encode results by fill (filled ●, half ◐, hollow ○) everywhere results appear, including the share text.
- **Do** keep manila on cards and the curator's note only, on a cool drawer-white or gallery-navy background.
- **Do** set content (Event titles, dates, headlines, the Fact) in Alegreya serif and interface in Alegreya Sans.
- **Do** use lining tabular numerals for stats, counters and the countdown.
- **Do** save motion for the reveal stamp; keep other transitions at 150–250ms with `cubic-bezier(0.22, 1, 0.36, 1)`, and make every animation instant under `prefers-reduced-motion`.
- **Do** verify 4.5:1 for text in light, dark and high-contrast modes (the e2e axe suite checks all three).

### Don't:
- **Don't** echo Wordle and its clones: no green/yellow/gray tile palette, no `#121213` near-black, no bold centred wordmark between icon buttons, no 🟩🟨⬜ share squares, no pill share button, no flip-tile reveal.
- **Don't** dress up as a costume archive: no fake parchment textures, coffee stains, typewriter fonts everywhere or sepia filters.
- **Don't** drift into generic editorial-magazine styling (italic display serif plus tracked mono labels plus ruled columns).
- **Don't** use a cream, sand or parchment page background. Warmth comes from the manila cards and the cinnabar stamp.
- **Don't** let colour carry a result alone.
- **Don't** use tiny uppercase tracked eyebrow labels, side-stripe borders, gradient text or glassmorphism.
- **Don't** add blurred shadows to resting surfaces; a resting card gets a paper edge only.
- **Don't** fade dialog or toast text in through low opacity; it fails contrast checks mid-animation.
