# Connect-4

A polished, accessible Connect-4 demo — play locally with a friend or face a
minimax AI. Part of [Fabian Bachmayer's portfolio](https://bachi.dev/work).

**[Play live](https://bachi.dev/Connect-4/)**

## Features

- **Two modes:** local two-player, or vs computer (First/red or Second/yellow).
- **Two difficulties:** Normal (takes wins, blocks threats, then improvises) and
  Strong (alpha-beta minimax, depth 4 — computed in a Web Worker, never blocks
  the UI).
- **Full undo/redo**, including full-round steps vs the computer, and undo after
  game over.
- **Accessible board:** real column buttons, arrow-key navigation, ghost preview
  on hover and keyboard focus, screen-reader announcements, reduced-motion
  support, 5+ run highlights.
- **Session stats** in `localStorage` only — no cookies, no tracking.
- **Mid-game guard:** changing mode/difficulty/seat asks before discarding the
  live game.

## Tech & architecture

Next.js 15 + React 19 + TypeScript + Tailwind v4, statically exported to GitHub
Pages (branch `master`). Server shell + one client island (`GameIsland`).

```
src/
  app/            # layout (fonts, metadata, JSON-LD), page (server shell),
                  # icon, robots, sitemap, manifest
  components/
    chrome/       # SiteHeader (links back to bachi.dev/work), SiteFooter
    game/         # GameIsland, Toolbar, StatusBanner, Board, dialogs, stats
    ui/           # Button, SegmentedControl, Card, Pill, Dialog
  lib/            # connect4 (rules), ai (minimax), ai.worker, history, stats, cn
  data/           # meta.ts (copy deck + links)
  hooks/          # useGame (orchestrator), useGameSettings
__tests__/        # 54 tests: rules, AI, history, worker protocol, stats
scripts/          # generate-og-cover.mjs (link-preview image)
```

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script          | What it does                                                              |
| --------------- | ------------------------------------------------------------------------- |
| `dev` / `build` | Start dev server / static production build                                |
| `typecheck`     | `tsc --noEmit`                                                            |
| `lint`          | ESLint (Next + jsx-a11y)                                                  |
| `format`        | Prettier write (check with `format:check`)                                |
| `test`          | Vitest suite                                                              |
| `og-cover`      | Regenerate `public/og-cover.png` (needs no install — uses Next's `sharp`) |

CI runs typecheck + lint + format-check + tests before every Pages build
(see `.github/workflows/nextjs.yml`).

## Deployment

Push to `master` → GitHub Actions builds (`output: 'export'`) and deploys to
GitHub Pages at `https://bachi.dev/Connect-4/`. No environment
variables, no backend.

## Privacy

No analytics, no cookies. Game state lives in memory; aggregate session stats
live only in your browser's `localStorage` (`connect4:stats:v1`, resettable
in-game).
