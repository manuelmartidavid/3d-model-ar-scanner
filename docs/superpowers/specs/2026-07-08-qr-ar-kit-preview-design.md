# QR → AR Kit Preview — Design Spec

**Date:** 2026-07-08
**Status:** Approved to build
**Source of truth:** `CLAUDE.md` (handoff brief) + `ar-preview.html` (prototype — behavior & visual design)

## Goal

Rebuild the working single-file prototype (`ar-preview.html`) as a production Next.js app. Scanning a kit's QR opens `/ar/<kit-id>`, which renders the finished 3D-print model in an orbitable viewer and launches it in AR at true real-world scale — no native app, no install.

## Scope for this build

Full app, **stopping before deploy**. Vercel deployment + real model assets are handled by the user afterward. The app runs end-to-end locally against a built-in placeholder kit (the public modelviewer.dev Astronaut GLB/USDZ).

## Decisions resolved (deltas from the two sources)

| Topic | Decision | Rationale |
|---|---|---|
| Routing | Path param `app/ar/[kit]/page.tsx` (`/ar/astronaut`) | Brief wins over prototype's `?kit=` query param |
| Unknown kit | Fall back to default kit + visible amber notice banner | Brief says "match prototype"; prototype falls back rather than 404 |
| Registry field names | `glb` / `usdz` / `printTime` / `filament` | Brief's `Kit` type wins over prototype's `src`/`ios`/`time` |
| `<model-viewer>` loading | npm package `@google/model-viewer`, pinned, dynamic-imported in `useEffect` on mount inside a `'use client'` component | Version tracked in repo, works offline, no external runtime origin to trust |
| Fonts | `next/font/google` (Chakra Petch, Inter, JetBrains Mono) | Self-hosted, no CDN flash/round-trip; matches prototype faces exactly |
| Placeholder assets | Public modelviewer.dev Astronaut `.glb` + `.usdz` referenced by URL in the seed registry entry | Everything runs immediately; swapping real kits = editing the registry |

## Architecture

```
app/
  layout.tsx            fonts (next/font) + <html>/<body> + build-plate background
  globals.css           Tailwind base + design tokens + build-plate grid + keyframes
  page.tsx              redirect("/ar/astronaut") — root convenience
  ar/[kit]/page.tsx     server component: resolve kit via getKit(), render shell + <Viewer>
components/
  Viewer.tsx            'use client' — dynamic import of @google/model-viewer; wires progress/load/canActivateAR; renders <model-viewer> + slotted AR CTA + dimension frame
  Hud.tsx               top bar: AR PREVIEW eyebrow + status dot + "READY · <id>"
  Readouts.tsx          footprint / print-time / filament row (pure, from Kit)
  NoticeBanner.tsx      unknown-kit amber notice (conditional)
  DesktopHint.tsx       "open on your phone" hint (shown when canActivateAR is false)
lib/
  kits.ts               Kit type + KITS registry + getKit(id) + resolveKit(param)
types/
  model-viewer.d.ts     JSX intrinsic element declaration adapted to React 19 JSX namespace
scripts/
  qr.ts                 batch-generate one QR (PNG + SVG) per kit id → public/qr/
public/qr/              generated QR assets (gitignored or committed — committed for v1)
```

### Data model (`lib/kits.ts`)

```ts
export type Kit = {
  id: string;
  name: string;
  tagline: string;
  glb: string;    // Android / WebXR — authored at true metric scale (1 unit = 1 m)
  usdz: string;   // iOS Quick Look
  dims: { w: number; d: number; h: number }; // millimetres — drives on-screen callouts
  printTime: string;
  filament: string;
};

export const KITS: Record<string, Kit>;
export const DEFAULT_KIT_ID = "astronaut";
export const getKit = (id: string): Kit | null;              // exact lookup, lowercased
export const resolveKit = (param: string):
  { kit: Kit; requestedId: string; isFallback: boolean };    // fallback + notice logic
```

Seed entry (`astronaut`), remapped from the prototype:
`name: "Orbital Astronaut"`, tagline, `glb`/`usdz` = modelviewer.dev Astronaut assets, `dims: {w:470, d:300, h:1780}`, `printTime: "18h 40m"`, `filament: "312 g"`.

## Component behavior (ported from prototype)

**`Viewer.tsx`** (`'use client'`):
- `useEffect(() => { import('@google/model-viewer'); }, [])`.
- Renders `<model-viewer>` with the exact attributes from the brief/prototype:
  `ar` · `ar-modes="webxr scene-viewer quick-look"` · `ar-scale="fixed"` · `ar-placement="floor"` · `camera-controls` · `touch-action="pan-y"` · `auto-rotate` · `rotation-per-second="16deg"` · `interaction-prompt="none"` · `shadow-intensity="0.85"` · `exposure="1.05"` · `environment-image="neutral"` · `alt`. `src={kit.glb}`, `ios-src={kit.usdz}`.
- Slots the custom amber AR CTA via `slot="ar-button"` ("View in your room" + cube SVG).
- `progress` event → drives the top load bar width/opacity.
- `load` event → if `!mv.canActivateAR`, reveal the desktop hint and hide the AR button.
- `prefers-reduced-motion: reduce` → drop `auto-rotate` (checked client-side).
- Dimension callouts (W/H/D in mm) positioned around the corner-bracket frame.

**States covered:** loading progress bar · desktop fallback hint · reduced-motion · unknown-kit notice · normal AR-capable mobile.

## Design system (faithful port of prototype identity)

Ported exactly into Tailwind theme tokens + `globals.css`:
- **Base:** graphite `#0E1116`, panels `#141922`/`#161C26`, build-plate grid (28px minor / 140px major white lines) + radial top glow.
- **Accent:** heated amber `#FF7A18 → #FFB04A`, used only on AR CTA, status dot, corner brackets, load bar, notice.
- **Ink:** `#E9EEF6` / dim `#8792A6` / faint `#5A6474`. Lines: `rgba(255,255,255,.10)` / `.055`.
- **Type:** Chakra Petch (display/HUD) · Inter (body) · JetBrains Mono (all coordinates/readouts/status).
- **Signature element:** mono dimension callouts + corner-bracket bounding box around the model.
- Keyframes: status-dot `pulse`; load-bar transitions. Reduced-motion disables dot animation + CTA transition.

## TypeScript for the custom element (`types/model-viewer.d.ts`)

Declare `<model-viewer>` in React 19's JSX namespace with the attribute set from the brief (kebab-case attrs typed as optional strings/booleans), plus a typed ref exposing `canActivateAR: boolean` and the `load`/`progress` events. The `progress` event detail is `{ totalProgress: number }`.

## QR generation (`scripts/qr.ts`)

- Uses the `qrcode` npm package. Reads `BASE_URL` from env (default `http://localhost:3000`), iterates `KITS`, and writes `public/qr/<id>.png` + `public/qr/<id>.svg`, each encoding `${BASE_URL}/ar/${id}`.
- Run via `npm run qr`. Amber-on-graphite styling optional; default black/white is fine for scannability.

## Testing strategy

- **TDD on pure logic** (Vitest): `lib/kits.ts` — `getKit` (hit, miss, case-insensitivity), `resolveKit` (known id, unknown id → fallback + `isFallback:true` + `requestedId` preserved). This is where the real branching lives.
- **Display formatting** helpers (footprint `"470 × 300 mm"`, dimension strings) unit-tested pure.
- `<model-viewer>` / AR behavior is **not** unit-tested — it's a third-party custom element requiring a real device. Verified manually per acceptance criteria; desktop viewer verified via `/run`.

## Acceptance criteria (from brief)

- [ ] Scanning a kit's QR opens `/ar/<id>` with an orbitable viewer.
- [ ] iPhone Safari over HTTPS: CTA → Quick Look, model at real scale on floor. *(user device test, post-deploy)*
- [ ] Android Chrome: CTA → Scene Viewer at real scale. *(user device test, post-deploy)*
- [ ] Desktop shows viewer + "open on your phone" hint, no broken AR button.
- [ ] Dimension callouts + readouts reflect the kit record.
- [ ] Unknown kit id handled gracefully (default + notice).
- [ ] Adding a kit = 1 registry entry + 2 hosted files + 1 generated QR.

## Out of scope (v2)

Scale slider + live print estimate · marker-anchored AR · physical-part recognition · scan analytics. (Per brief.)
