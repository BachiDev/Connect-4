# Connect-4 Upgrade Plan — bachi.dev Design System Edition

> Goal: take this functional old portfolio demo from "works but dated/isolated" to a nice, sturdy, portfolio-grade game that matches https://bachi.dev/work in look, quality, and engineering standards — while staying a zero-backend static demo with no tracking.

Live demo: https://bachidev.github.io/Connect-4/ · Repo: `BachiDev/Connect-4` (branch `master`) · Owner: Fabian Bachmayer (fabian@bachi.dev, site bachi.dev).
Stack today: Next.js 15.3.4 + React 19 + TS + Tailwind v4, client-only page, minimax AI (depth 3, main thread). Deployed to GitHub Pages via `.github/workflows/nextjs.yml` (static export to `./out`, magic `configure-pages` injection).

Design target (from `bachidev-github-io/PLAN.md`): dark zinc-950/zinc-900 surfaces, violet accent (#8b5cf6 / violet-400), Inter body + mono accents, rounded-xl cards with border-white/10, pill badges, Lucide icons (no emojis), server-first Next.js, accessible + mobile-clean. Link back to https://bachi.dev/work. No tracking/analytics.

---

## 1. Current-state audit

### What's already good — keep it

- Clean hook split: `useGame` + `useGameHistory` + `useGameSettings` + pure `gameLogic.ts` (`checkWin`/`checkWinner`/`minimax`/`findBestMove`).
- Two game modes (PvP, PvC) + two difficulties (normal heuristic, strong minimax depth 3).
- Undo/redo with full-round semantics vs computer (undo reverts both moves).
- Win detection returns winning coordinates; winning line highlighted with `animate-radiate`; drop animation `animate-fall`.
- Responsive-ish board via `vw` + `max-w` caps; hover preview; turn indicator; disabled states on controls.

### Visual / coherence gaps (biggest lever)

1. **Off-brand full-bleed gradient:** `page.tsx:16` uses `from-purple-400 to-indigo-600` light gradient — clashes with bachi.dev dark zinc-950/zinc-900 + violet accent. White text/buttons assume that gradient.
2. **No shared chrome:** no header/nav, no footer, no backlink to `bachi.dev/work`, no "portfolio demo" framing. Feels orphaned from main site.
3. **Board styling is ad-hoc:** `GameBoard.tsx:23` grid has no board surface (transparent on gradient); `GameCell.tsx:5` is a white circle (inverted vs classic blue board / dark theme). No card, no border-white/10, no shadow.
4. **Typography drift:** `layout.tsx` loads Geist/Geist_Mono variables but `globals.css:25` forces `font-family: Arial` on body — variables unused, mono never used as accent, no Inter.
5. **Buttons drift:** every control file hardcodes its own `bg-white text-indigo-600 / bg-gray-300` toggle styles (`GameModeSelection.tsx:25-29`, `ComputerOptions.tsx:27-31`). No shared `Button` primitive, no variants/sizes, small touch targets.
6. **Template clutter in `public/`:** `next.svg vercel.svg file.svg globe.svg window.svg` boilerplate left over; `github.svg` only used by FAB.

### Gameplay / UX gaps

7. **Keyboard + touch inaccessible board:** cells are `<div onClick>` (`GameBoard.tsx:26-32`) — no buttons, no focus, no arrow-key play, no column-level action. Hover preview is mouse-only (`onMouseEnter`), useless on touch.
8. **No screen-reader support:** no `role=grid/gridcell` or column `aria-label`s, no `aria-live` turn/win announcements, win conveyed by color only.
9. **No game-over experience:** status line swaps text only (`GameStatusDisplay.tsx:51-80`); board stays interactive-looking, no dialog/summary, no score tally across games, no "play again" focus management.
10. **Controls are confusing:** "First/Second" + red/yellow dots (`ComputerOptions.tsx:49-78`) doesn't say "you play as…"; changing any option instantly `resetGame()` with no confirmation — misclicks wipe games.
11. **Undo/redo is fragile:** `useGameHistory.ts:8-38` derives next player from a stale `currentPlayer` prop instead of board parity; edge cases (undo at index 1 vs computer, redo after new move) can desync turn. Redo equally brittle.
12. **No persistence or stats:** refresh wipes game; no wins/losses/draws tally, no move counter, no difficulty label in status.

### AI / logic tech debt

13. **Duplicated win logic:** `checkWin` (boolean) and `checkWinner` (winner+coords) in `gameLogic.ts:4-167` scan the board 4× each with near-identical loops. One canonical function should serve both.
14. **AI blocks the main thread:** `findBestMove` strong runs minimax depth 3 synchronously in `useGame.ts:76-79` inside render-effect + `setTimeout(500)` with no cleanup — UI jank on mobile, risk of multiple queued timeouts (StrictMode / rapid play), no cancellation on reset/undo.
15. **Weak evaluation:** `evaluateBoard` (`gameLogic.ts:48-105`) counts only 2s/3s (±10/±2), no center-column preference, no window-position weighting, no move ordering — strong mode is beatable and slow at the same time. Magic scores `1e13/1e14` risk overflow/imbalance.
16. **Shared mutable `initialBoard` singleton:** `useGame.ts:7` + `resetGame`/`resetHistory` reuse one array reference — a future in-place mutation would corrupt history. Should be a factory `createBoard()`.
17. **Missing guards:** `dropPiece` (`useGame.ts:19-32`) doesn't guard full columns or computer-turn clicks; effect deps include `winner/draw/dropPiece` causing extra evaluations; no draw-highlight; no stalemate edge handling.

### Code health / repo hygiene

18. **`page.tsx` is all-client, no structure:** everything composed in one client page, components under `src/app/components/` (route-adjacent, not reusable), no `src/data|lib|components/ui`, no types beyond `types.ts:1-2`.
19. **Dead/buggy settings state:** `useGameSettings.ts:13-25` `setStartingPlayer` branches set identical colors (copy-paste — second branch comment says human=yellow but code assigns same red/yellow mapping); `setChosenStartingPlayer/setPlayerColors` exposed raw, allowing inconsistent states.
20. **FAB anti-pattern (same as main site decided):** `FloatingActionButton.tsx` floats a white circle bottom-right that will overlap cookie/game controls on small screens; source link belongs in header/footer.
21. **`next.config.ts` empty:** static-export settings injected magically by `configure-pages` in CI — same fragility flagged on main site. Document + make explicit (`output: 'export'`, `images.unoptimized`).
22. **`package.json` scripts stale:** `lint: next lint` (deprecated/removed in Next 15), `tsc: tsc` (no `--noEmit`, wrong name vs `typecheck`), no `format`, no `test`. Next 15.3.4 vs main site 15.3.5; no `lucide-react`.
23. **SEO/a11y gaps:** metadata is title+description only (`layout.tsx:15-18`); no OG/Twitter card, canonical, `robots.ts`/`sitemap.ts`, `theme-color`, JSON-LD `Game`; default Next favicon; no skip-link, focus-visible rings, or `prefers-reduced-motion` handling for `animate-fall/radiate`.
24. **No tests, no quality gates:** zero unit/integration tests for win logic/AI/history; CI only builds, no `typecheck/lint/test` gate.
25. **Branch convention drift:** repo uses `master`, main site standardized on `main` — keep or migrate deliberately (redirect-safe either way since Pages URL is repo-name based).

---

## 2. Vision & principles

**Positioning line:** _Connect-4 — a polished, accessible, portfolio-grade demo: play locally or against a real minimax AI, in the bachi.dev dark + violet system, backlinked from bachi.dev/work._

**Principles (mirror main site):**

1. **One brand, everywhere:** zinc-950/zinc-900, violet-400 accent, Inter + mono accent, `rounded-xl border-white/10` cards, pill badges, Lucide only.
2. **Sturdy over flashy:** correct game logic, tested AI/history, no main-thread jank, graceful win/draw/game-over states.
3. **Accessible + mobile-clean:** full keyboard play, screen-reader announcements, ≥44px touch targets, reduced-motion respected.
4. **Server-first Next.js:** static shell (header/status/footer) as Server Components; client islands only for board + controls + AI worker.
5. **Zero backend, zero tracking:** no cookies, no analytics; game state in memory (+ optional localStorage stats only).
6. **Maintainable:** pure logic in `src/lib/`, content in `src/data/`, UI primitives shared, linted/formatted/tested.

**Success metrics (done = all true):** Lighthouse ≥95/95/95/100 (mobile+desktop) · axe clean + keyboard-only full game pass · `typecheck+lint+test+build` green · AI never blocks paint · visual review vs bachi.dev passes on mobile + desktop.

---

## 3. Information architecture (single page, keep it tight)

```
Header (mini: ← bachi.dev/work · Connect-4 title · source on GitHub icon)
Hero strip (compact: title + 1-line lede + pill badges: PvP · Minimax AI · Undo/Redo · No tracking)
Game card (status banner + toolbar [mode | difficulty | color] + board + game-over dialog)
Below-board row (New game · Undo · Redo · How to play <details>)
Stats strip (session: you X · computer/player2 Y · draws Z · moves N — localStorage, with reset)
Footer (back to portfolio · source link · "Built with Next.js & Tailwind" · © year)
```

No separate routes. No marketing sections — the game is the page.

---

## 4. Design system (apply bachi.dev tokens)

### 4.1 Tokens (Tailwind v4 `@theme` in `globals.css`)

- **Colors:** base `zinc-950` (#09090b), raised `zinc-900`; text `zinc-100` headings / `zinc-300–400` body; accent `violet-400` (#a78bfa ok for text on dark) + `violet-500` for fills; gradients violet→fuchsia only, sparingly. Pieces: keep classic red/yellow but retuned for dark (`red-400/500`, `amber-300/400`) with ring highlights; board surface `bg-blue-950`-ish? No — use `bg-zinc-900 border-white/10` with cells as `bg-zinc-950 inset-shadow` sockets so pieces pop (avoids classic-blue clash with violet brand).
- **Typography:** `Inter` (body/headings, tight `-0.02em` headings) + `Geist_Mono`/`JetBrains Mono` for kickers, badges, stats only. Remove `Arial` body override; wire font variables properly.
- **Shape:** `rounded-xl` game card, `rounded-full` pieces/pills/buttons; card style `border-white/10 bg-white/[0.02]` + subtle violet glow on win.
- **Rhythm:** page `max-w-3xl` centered, sections `py-10 md:py-14`; toolbar wraps cleanly on mobile.

### 4.2 Shared primitives to build

- `Button` (variants `primary|secondary|ghost`, sizes `sm|md`, `disabled`, icon slot via Lucide) — replaces 6+ hardcoded button styles.
- `SegmentedControl` (mode / difficulty / color pickers with `aria-pressed` or radiogroup semantics).
- `Card`, `Pill/Badge`, `StatusBanner` (turn/win/draw with icon + `aria-live="polite"`).
- `GameOverDialog` (accessible `<dialog>`: winner, stats, Play again / Review board, Escape close, focus return).
- `SiteHeader` / `SiteFooter` (mini chrome with backlink + source link; Lucide `ArrowLeft Github RotateCcw Undo2 Redo2 Bot Users Sparkles`).
- Delete after migration: per-file button styles, `FloatingActionButton.tsx` (move link to header/footer), `public/{next,vercel,file,globe,window}.svg`.

### 4.3 Motion

- Keep `fall` drop animation but shorten (0.3s), add `prefers-reduced-motion: no animation` fallback (pieces just appear); `radiate` win pulse → calmer ring glow, also disabled under reduced motion. Never animate layout.

---

## 5. Section-by-section plan

### 5.1 Chrome: header + footer (new)

- Mini sticky/non-sticky header: `← All work` (→ https://bachi.dev/work), centered `Connect-4` wordmark (mono kicker ok), right: GitHub icon-link (Lucide `Github` — note: lucide-react ships no brand icons per main-site finding, so keep `github.svg` asset _or_ inline SVG; decide once, document).
- Footer: back-to-portfolio link, source link, `Built with Next.js · No tracking` note, dynamic © year. FAB deleted.

### 5.2 Hero strip (compact, new)

- H1 `Connect-4`, lede "Local two-player or vs minimax AI — undo/redo included." Pill badges: `Player vs Player` `Minimax AI` `Undo / Redo` `No tracking`. No particles, no full-viewport hero — game is above the fold.

### 5.3 Controls toolbar (rework `GameModeSelection` + `ComputerOptions`)

- Three `SegmentedControl` groups in one toolbar card: **Mode** (Users icon: Player vs Player / Bot icon: vs Computer) · **Difficulty** (shown only vs computer; add 1-line hint: Normal = wins/blocks + random · Strong = minimax depth 4–5 in worker) · **You play** (First/red disc vs Second/yellow disc, with disc swatches).
- Changing options starts a new game — add explicit confirm only if mid-game (`<dialog>` or inline "starts a new game" hint; no silent wipes).
- All controls ≥44px targets, `aria-pressed`/radiogroup, visible focus rings.

### 5.4 Status banner (rework `GameStatusDisplay`)

- Single `StatusBanner` with disc swatch + text + `aria-live="polite"`: "Your turn (red)" / "Computer is thinking…" (with spinner, `aria-busy`) / "You win!" / "Player 2 wins" / "It's a draw — board full".
- Color never the only signal: always text + icon (Lucide `CircleDot Trophy Handshake`).

### 5.5 Board (rework `GameBoard` + `GameCell` + `GamePiece`)

- Real board card: `rounded-xl border-white/10 bg-zinc-900` with 7 column buttons as the interactive unit (not 42 divs): each column = `<button aria-label="Drop in column N">` containing 6 sockets. Full keyboard support (Tab to column, Enter/Space drop, ←/→ move between columns optionally).
- Sockets: `bg-zinc-950` wells with inner shadow; pieces: red `bg-red-500 ring-red-300` / yellow `bg-amber-400 ring-amber-200`, white/10 border, drop animation; winning 4 get `ring-2 ring-violet-400` + glow (keep radiate idea, tame it).
- Column hover/focus preview: show ghost disc at top socket on hover _and_ focus-visible (fixes touch/mouse-only gap; on touch, tapping column drops directly).
- Disabled states: board inert during computer thinking / game over / dialog open (`aria-disabled` + `inert` where appropriate).
- Fixed aspect sizing with CSS grid (not `vw` per cell) — `aspect-[7/6]`, `gap-2`, max-w ~560px; kills CLS and tiny-gap-on-desktop issue.

### 5.6 Game-over dialog (new)

- On win/draw: `StatusBanner` updates + dialog opens (focus-trapped, Escape → "review board"): winner text, moves count, difficulty, buttons `Play again` (primary, autofocus) + `Review board` (ghost). Focus returns to board/new-game on close.

### 5.7 Below-board actions (rework `NewGameButton` + `UndoRedoButtons`)

- One action row: `New game` (RotateCcw, secondary) · `Undo` (Undo2) · `Redo` (Redo2) with disabled tooltips (`disabled:opacity-50`, `aria-disabled`, title reasons). Undo/redo keep full-round vs-computer semantics, now derived from history (see §6.2).
- `How to play` as native `<details>` (rules in 3 lines + "Connect 4 is solved — Strong AI still won't be perfect at depth 4").

### 5.8 Stats strip (new, tiny)

- Session stats from localStorage (`connect4:stats:v1`: wins/losses/draws per mode+difficulty, best (fewest moves) win): mono numerals, `Reset stats` ghost button. No cookies, note "stored only in this browser".

---

## 6. Technical plan

### 6.1 App structure (target)

```
src/
  app/
    layout.tsx            # Inter+mono fonts, full metadata, theme-color, JSON-LD Game
    page.tsx              # Server Component shell composing sections
    globals.css           # Tailwind v4 @theme tokens + fall/radiate (reduced-motion safe)
    robots.ts sitemap.ts manifest.ts icon.svg  # SEO/PWA, force-static
    game/
      page-state.tsx      # client island: useGame + board + toolbar + dialog wiring
    components/
      chrome/  (SiteHeader, SiteFooter)
      game/    (Board, ColumnButton, Cell, Piece, Toolbar, StatusBanner, GameOverDialog, StatsStrip, HowToPlay)
      ui/      (Button, SegmentedControl, Card, Pill, Dialog)
  lib/
    connect4.ts           # createBoard, dropIn, validMoves, checkWinner (single source), isFull
    ai.ts                 # evaluate, minimax w/ alpha-beta + center-first move ordering (pure, worker-safe)
    ai.worker.ts          # Web Worker wrapper (strong difficulty off main thread)
    stats.ts              # localStorage stats helpers (safe parse, versioned key)
    cn.ts
  data/
    meta.ts               # titles, badges, difficulty hints, links (bachi.dev/work, github)
  hooks/
    useGame.ts            # orchestrates lib + worker + history (history as index into boards)
__tests__/
  connect4.test.ts        # win directions, full-board draw, drop/gravity, invalid cols
  ai.test.ts              # blocks immediate win, takes immediate win, prefers center opening
  history.test.ts         # undo/redo incl. vs-computer full-round + redo-clear-on-new-move
```

### 6.2 Key refactors (ordered)

1. **Pure logic first (`src/lib/connect4.ts`):** `createBoard()` factory; `checkWinner(board)` single canonical scan returning `{winner, line}`; `isFull/draw`; `dropIn(board,col,player)` immutable. Delete `checkWin` duplicate; keep `gameLogic.ts` as re-export shim during migration, remove at end.
2. **History from derivation, not stale props:** store `boards: Board[]` + `index`; turn = `boards[index]` piece-count parity (or explicit `turns` array). Undo vs computer steps back to last human turn; any new move truncates redo tail. Fixes `useGameHistory.ts` desync class of bugs.
3. **AI off main thread:** `ai.ts` pure (no React), center-first ordering, depth 4 default strong (6×7 branching ≈ depth-3 343→ depth-4 2401 nodes × eval — worker keeps UI smooth); `ai.worker.ts` + `useGame` posts board, shows "thinking" state, cancels on reset/undo/new-game (message id / worker terminate). Normal stays sync (cheap win/block/random). Fallback: sync depth-3 if Worker unavailable.
4. **Kill the timeout hack:** replace `useGame.ts:78 setTimeout` with worker-callback or cancellable `AbortController`/id-guarded timeout; cleanup on unmount; ignore clicks during computer turn.
5. **Fix `useGameSettings`:** single `setStartingPlayer` mapping human→disc correctly (`First` = you are red/player 1, `Second` = you are yellow/player 2, computer takes other); don't expose raw setters; expose `humanPlayer/computerPlayer` derived ids.
6. **De-client `page.tsx`:** shell becomes Server Component; single `'use client'` island (`game/page-state.tsx`) + worker. Everything else server-rendered static HTML (status skeleton, toolbar labels, footer).
7. **Fonts/tokens:** `next/font/google` Inter + Geist_Mono; `body` sans on zinc-950; mono only for kickers/badges/stats; delete Arial override.

### 6.3 Config / deps / scripts

- `next.config.ts`: explicit `output: 'export'`, `images: { unoptimized: true }` (Pages static export, no magic reliance). Keep no `basePath` (repo-name Pages URL works via `configure-pages` basePath injection — document why).
- Deps: add `lucide-react`; upgrade `next` 15.3.4 → match main site (15.3.5+); `vitest` + `testing-library` (`vitest run` in CI) — or `node:test` if zero-dep preferred (recommend vitest, matches modern Next).
- Scripts: `dev / build / start / typecheck (tsc --noEmit) / lint (eslint ., flat config + jsx-a11y) / format + format:check (prettier) / test (vitest run)`. Remove `next lint`, rename `tsc` → `typecheck`.
- `public/` prune: delete `next.svg vercel.svg file.svg globe.svg window.svg`; keep/decide `github.svg` (see §5.1); add `og-cover.png` (1200×630, reuse main-site generator pattern), `icon.svg` + `manifest`.
- Workflow `.github/workflows/nextjs.yml`: add `typecheck + lint + test` job before build; keep Pages deploy; decide `master`→`main` migration (one-time rename + workflow branch update + Pages re-point; else leave `master` and document).

### 6.4 SEO

- `layout.tsx` metadata: title `"Connect-4 · Fabian Bachmayer"`, description (~150 chars, "Play Connect-4 vs a friend or a minimax AI…"), `metadataBase: https://bachidev.github.io/Connect-4` (or custom domain if ever mapped), canonical `/`, OG + Twitter cards with `/og-cover.png`, `authors`, `robots`, `theme-color #09090b`.
- `robots.ts` + `sitemap.ts` (single URL) + `manifest.ts` + `icon.svg`; JSON-LD `Game` (+ `author Person` → bachi.dev, `sameAs` GitHub/LinkedIn); one `h1`, descriptive `aria-label`s, alt text on social/disc swatches where meaningful.

### 6.5 Accessibility (acceptance: axe clean, keyboard-only full game)

- Column buttons focusable with visible violet `:focus-visible` rings; `aria-label="Drop disc in column N"` + `aria-disabled` when unavailable; grid `role=grid` optional (buttons suffice — keep semantics simple and correct).
- `aria-live="polite"` status + `role=dialog aria-modal` game-over with focus trap/return; thinking state `aria-busy`.
- Contrast: body zinc-300+, status text zinc-100, badges zinc-300 on zinc-900 — verify ≥4.5:1; win ring + icon, never color-alone.
- `prefers-reduced-motion`: disable fall/radiate; worker delay / thinking spinner becomes static text.

### 6.6 Performance budget

- Target: ≤150 kB first-load JS (page is one game, no particles), LCP < 2s on Moto G4/4G, zero CLS (fixed board aspect).
- Levers: server shell, worker for AI, no new heavy deps (only lucide-react icons used), lazy-load dialog (already tiny), `loading=lazy` nowhere needed (no images except OG).

### 6.7 Quality gates

- ESLint (next + `jsx-a11y`), Prettier, `tsc --noEmit` in CI before `next build`; `vitest run` covering win/AI/history; manual checklist in PR template (keyboard pass, mobile 360px, reduced-motion, dialog focus, undo/redo vs computer, stats reset).

---

## 7. Content plan (voice & copy)

- **Voice:** match main site — direct, senior, friendly. Short sentences. No emojis (Lucide only).
- Copy lives in `src/data/meta.ts`: title, lede, badges, difficulty hints (`Normal — blocks & wins, then improvises` / `Strong — minimax, thinks ahead`), How-to-play (3 bullets), stats labels, footer lines.
- **Proof/honesty:** "Strong" label never claims unbeatable — note Connect-4 is solved, this AI is depth-limited. Keep README's honest framing, tighten it.
- README rewrite: how to run, scripts table, architecture (lib/ai/worker), deployment, backlink to bachi.dev/work.

---

## 8. Phased roadmap (each phase shippable to Pages)

### Phase 0 — Foundations (done 2026-09-29)

- [x] `next.config.ts`: explicit `output:'export'` + `images.unoptimized` (document `configure-pages` basePath behavior).
- [x] Scripts: `typecheck / lint (eslint .) / format / test` + Prettier + `eslint-plugin-jsx-a11y`; drop `next lint`; add `lucide-react` (+ `vitest`).
- [x] Branch decision: stay on `master` (rename deemed not worth it).
- [x] Test scaffolding: `gameLogic.test.ts` (19 tests, locked behavior before refactor; superseded by `connect4/ai/history` suites in Phase 1).
- [x] CI `Quality gates` step (typecheck + lint + format-check + tests) before build.

### Phase 1 — Logic hardening (done 2026-09-29)

- [x] `src/lib/connect4.ts`: `createBoard`, canonical `checkWinner`, `dropIn`, `validMoves`; remove `initialBoard` singleton + `checkWin` duplicate.
- [x] History rewrite: boards-array + parity-derived turn; full-round vs-computer undo/redo; truncate-on-new-move.
- [x] `ai.ts` pure + center ordering; tests: takes win, blocks loss, prefers center; depth constant centralized.
- [x] `useGameSettings` fix: correct First/Second mapping, derived human/computer ids, no raw setters.
- [x] DoD: `typecheck+lint+test` green, manual game still plays identically.

### Phase 2 — AI worker + game-state robustness (done 2026-09-29)

- [x] `ai.worker.ts` + `useGame` integration: thinking state, cancellation on reset/undo/mode-change, sync fallback.
- [x] Guards: ignore board clicks during computer turn/game-over; full-column no-op; effect-loop cleanup (no `winner/draw` in deps).
- [x] Depth 3 → 4 (worker keeps it smooth); single `HistoryState` object closes a same-frame double-click race; verified worker chunk emitted in `out/`.
- [x] DoD: Strong mode never janks (rapid clicks, mobile), no double computer moves under StrictMode.

### Phase 3 — Design-system reskin + chrome (done 2026-09-29)

- [x] Tokens/fonts/globals (Inter + mono accent, zinc-950 base, reduced-motion rules).
- [x] Primitives: `Button`/`SegmentedControl`/`Card`/`Pill`/`Dialog` (+ `StatusBanner` as game component).
- [x] Chrome: `SiteHeader` (← bachi.dev/work + source) + `SiteFooter`; delete FAB; prune `public/`.
- [x] Toolbar + StatusBanner + Board (column buttons, ghost preview on hover/focus, win ring) + GameOverDialog + ConfirmDialog + StatsStrip + HowToPlay.
- [x] `page.tsx` → server shell + client island (`GameIsland`).
- [x] DoD: `typecheck+lint+format+test+build` green, 109 kB first load, shell verified server-rendered. Still to run in a real browser: visual pass vs bachi.dev on 360px + desktop, axe + keyboard-only walkthrough.

### Phase 4 — SEO / PWA / perf hardening (done 2026-09-29, Lighthouse pending)

- [x] Full metadata (title template, description, `metadataBase`, OG + Twitter cards with generated `og-cover.png` via `scripts/generate-og-cover.mjs` + `npm run og-cover`) + JSON-LD `Game` + `robots.ts`/`sitemap.ts`/`manifest.ts` (all `force-static`) + `icon.svg`; default `favicon.ico` removed. All verified in `out/`.
- [x] README rewrite (run/scripts/architecture/deploy + backlink); stale light-theme `image.png` deleted (no headless screenshot available — take a fresh dark-theme shot after deploy if wanted).
- [ ] Lighthouse in a real browser on the deployed URL (target 95+/95+/95+/100); OG unfurl check. Statically covered already: zinc-300+ body text on zinc-950 (contrast), ≥44px touch targets, fixed board aspect (no CLS), 109 kB first load, axe-relevant semantics (radiogroup, dialog, live regions) — but needs a live pass to confirm.
- [x] DoD (static part): `out/` verified (OG tags with absolute URLs, JSON-LD, robots, sitemap, manifest, icon, worker chunk), live deploy smoke test → Phase 5.

### Phase 5 — Launch & iterate (ongoing)

- [ ] Merge → Pages deploy; verify live (toolbar flows, dialog, undo/redo, stats, OG unfurl, 404-free).
- [ ] Consider (only if wanted): online 2-player (needs backend — out of scope for static demo, would break no-backend principle; skip unless re-platformed), sound effects (off by default, `prefers-reduced-motion`-aware), difficulty depth selector, share-game-link (encode moves in URL hash — static-friendly, nice stretch).
- [ ] Quarterly: dep bumps alongside main site, re-run Lighthouse.

**Estimated total:** 3–5 focused days solo. Phase 3 alone delivers ~70% of perceived upgrade.

---

## 9. Risks & decisions needed

| #   | Decision                                        | Recommendation                                                                                 | Owner |
| --- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----- |
| 1   | Branch `master` → `main`?                       | Rename to `main` to match main site (cheap, one-time) — or keep `master` and document          | You   |
| 2   | Board look: classic blue vs dark wells?         | Dark wells (`zinc-950` sockets on `zinc-900` board) — fits violet brand, pieces pop            | You   |
| 3   | Strong AI depth 4 vs 5?                         | Ship depth 4 in worker (fast, solid); depth 5 as stretch behind constant                       | You   |
| 4   | Mid-game option-change confirm?                 | Inline "starts a new game" hint + confirm dialog only when game in progress                    | You   |
| 5   | Stats in localStorage — ok under "no tracking"? | Yes (browser-local only, disclosed in footer) — no cookies/analytics regardless                | You   |
| 6   | Online multiplayer?                             | Out of scope — static demo, would need backend; URL-hash share-link is the static-friendly max | You   |

---

## 10. Acceptance criteria (ship gate)

- [ ] One palette (zinc + violet), two fonts (Inter + mono accent), one card/button/dialog pattern — visual review mobile + desktop vs bachi.dev.
- [ ] Header links back to https://bachi.dev/work; footer has source link; FAB removed; no dead `public/` assets; no emojis.
- [ ] Full game playable keyboard-only (columns, drop, new game, undo/redo, dialog); axe clean; focus visible; reduced-motion respected.
- [ ] Status announces turns/thinking/win/draw via `aria-live`; win line marked by ring + icon, not color alone.
- [ ] AI: normal blocks/takes wins; strong plays sensibly at depth ≥4 without blocking UI; no double-moves; thinking state shown; cancellation correct.
- [ ] Undo/redo correct in both modes (full-round vs computer, truncate on new move); stats persist + reset; draw handled.
- [ ] SEO: OG card unfurls, robots/sitemap/manifest live, JSON-LD valid, single H1.
- [ ] Perf: Lighthouse ≥95/95/95/100, no CLS, AI never blocks paint.
- [ ] Repo: `typecheck+lint+test+build` green in CI, README updated (run, scripts, architecture, deploy), no secrets, no tracking.

---

## 11. Immediate next actions (if you say "go")

1. Phase 0 foundations PR (config + scripts + a11y lint + test scaffold + branch decision).
2. Phase 1 logic-hardening PR (`lib/connect4` + history rewrite + settings fix + tests).
3. Phase 2 worker PR (strong AI off main thread + guards).
4. Phase 3 reskin PR (tokens + primitives + chrome + board + dialog) — the demo-worthy diff.
5. Phase 4 SEO/perf PR, then launch + verify live.

_Suggested commit flow: one PR per phase above; each deployable to Pages independently._

---

### Appendix — files to touch (quick index)

- Keep & refactor: `src/app/page.tsx` (→ server shell), `layout.tsx`, `globals.css`, `hooks/useGame.ts` (worker + guards), `hooks/useGameHistory.ts` (rewrite), `hooks/useGameSettings.ts` (fix mapping), `hooks/gameLogic.ts` (→ `src/lib/connect4.ts` + `src/lib/ai.ts`, delete duplicate), `components/GameBoard|GameCell|GamePiece|GameStatusDisplay|GameModeSelection|ComputerOptions|UndoRedoButtons|NewGameButton.tsx` (rebuild on primitives), `next.config.ts`, `package.json`, `.github/workflows/nextjs.yml`, `README.md`, `public/` (prune + OG/icon).
- Delete: `components/FloatingActionButton.tsx`, `public/{next,vercel,file,globe,window}.svg`, `image.png` (refresh after reskin).
- Add: `src/app/game/page-state.tsx`, `src/components/{chrome,game,ui}/*`, `src/lib/{connect4,ai,ai.worker,stats,cn}.ts`, `src/data/meta.ts`, `src/app/{robots,sitemap,manifest}.ts`, `icon.svg`, `og-cover.png`, `__tests__/{connect4,ai,history}.test.ts`, `.env` never needed (no keys) — document that.
