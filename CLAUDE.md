# QR → AR Kit Preview — Claude Code Handoff Brief

**Goal:** Ship a web app where scanning a QR code opens a page that renders a 3D-print kit's finished model in AR, placed in the user's room at true real-world scale. No native app, no install.

**Reference implementation:** a working single-file prototype exists (`ar-preview.html`) — it's the source of truth for behavior and visual design. This brief is to rebuild it properly in the production stack.

---

## Decisions already made — do not relitigate

- **Web only, no native.** iOS Safari still has no handheld WebXR AR (confirmed 2026, unchanged by iOS 27). So AR runs through native viewers, not WebXR.
- **AR path:** Google `<model-viewer>` → **AR Quick Look (USDZ)** on iOS, **Scene Viewer (glTF)** on Android, WebXR where available. `<model-viewer>` handles the per-platform routing.
- **QR is a launcher, not a marker.** It encodes a URL. The model is placed on the floor plane in the user's room — it is *not* image-tracked/anchored to the physical card. (Marker tracking would require MindAR/8th Wall and a live WebAR session; explicitly out of scope.)
- **One page serves all kits** via a route param / registry. Adding a kit = adding a data entry + hosting 2 model files.

---

## Stack

- Next.js 15.5 (App Router) · React 19 · TypeScript · Tailwind · deploy on Vercel
- `@google/model-viewer` (web component)
- No backend required for v1 — registry is static typed data. (Vercel serves the model files as static assets or from a CDN.)

---

## Routing & data model

Dynamic route: `app/ar/[kit]/page.tsx` → resolves `kit` param against the registry. Unknown id → render `notFound()` or fall back to a default with a visible notice (match prototype: default + notice banner).

```ts
// lib/kits.ts
export type Kit = {
  id: string;
  name: string;
  tagline: string;
  glb: string;   // Android / WebXR — authored at true metric scale (1 unit = 1 m)
  usdz: string;  // iOS Quick Look
  dims: { w: number; d: number; h: number }; // millimetres — drives on-screen callouts
  printTime: string;   // e.g. "18h 40m"
  filament: string;    // e.g. "312 g"
};

export const KITS: Record<string, Kit> = { /* one entry per kit */ };
export const getKit = (id: string) => KITS[id?.toLowerCase()] ?? null;
```

QR content per kit: `https://<domain>/ar/<kit-id>`. Generate one QR per kit (see task 6).

---

## Build tasks (ordered)

1. **Scaffold** the route `app/ar/[kit]/page.tsx` + `lib/kits.ts` registry + Tailwind theme tokens (below).
2. **Integrate `<model-viewer>` in Next.js** — it's a client-side custom element and is SSR-unsafe. Wrap it in a `'use client'` component that imports the package on mount:
   ```tsx
   'use client';
   import { useEffect } from 'react';
   export default function Viewer(props: {...}) {
     useEffect(() => { import('@google/model-viewer'); }, []);
     return (/* <model-viewer .../> */);
   }
   ```
   (Alternative: load via `next/script` from a pinned CDN URL. Pick one, pin the version either way.)
3. **TypeScript for the custom element** — declare the intrinsic element so `<model-viewer>` type-checks. Adapt the declaration to React 19's JSX namespace in this project; the important part is the attribute set:
   `src, ios-src, ar, ar-modes, ar-scale, ar-placement, camera-controls, auto-rotate, rotation-per-second, shadow-intensity, exposure, environment-image, interaction-prompt, alt` — plus the `canActivateAR` instance property and the `load`/`progress` events.
4. **The AR viewer** with these attributes (real-scale is the whole point):
   `ar` · `ar-modes="webxr scene-viewer quick-look"` · `ar-scale="fixed"` · `ar-placement="floor"` · `camera-controls` · `auto-rotate` · `shadow-intensity="0.85"` · `exposure="1.05"` · `environment-image="neutral"`. Set `src={kit.glb}` and `ios-src={kit.usdz}`. Slot the custom AR button via `slot="ar-button"`.
5. **UI / states** (port from prototype):
   - Dimension callouts (W/H/D in mm) framing the viewer + footprint/print-time/filament readout row, all fed from the kit record.
   - **Desktop fallback:** if `mv.canActivateAR` is false after `load`, hide the AR button and show "open on your phone" hint.
   - Loading progress bar wired to the `progress` event.
   - `prefers-reduced-motion` → drop `auto-rotate`.
   - Unknown-kit notice.
6. **QR generation utility** — a small script (`scripts/qr.ts`, using `qrcode`) or an on-demand route that outputs a PNG/SVG QR per kit id, encoding `${BASE_URL}/ar/${id}`. Batch over `KITS`.
7. **Deploy to Vercel**, confirm model files are served over HTTPS with correct MIME types (`.usdz` → `model/vnd.usdz+zip`, `.glb` → `model/gltf-binary`).

---

## Design system (slicer / build-plate identity)

Carry the prototype's identity — this is intentional, not a default template.

- **Base:** graphite `#0E1116` with a faint build-plate grid (28px minor / 140px major lines).
- **Accent (single, used sparingly):** heated amber `#FF7A18` → `#FFB04A`, on the AR CTA, status dot, and viewer corner brackets only.
- **Ink:** `#E9EEF6` / dim `#8792A6` / faint `#5A6474`.
- **Type:** Chakra Petch (display/HUD, squared technical face) · Inter (body) · JetBrains Mono (all coordinates, dimensions, readouts, status).
- **Signature element:** mono dimension callouts + corner-bracket bounding box around the model — reads like a slicer's object bounds and encodes the product's truth (true scale before printing).
- Quality floor: responsive to mobile, visible focus states, reduced-motion respected.

---

## Content pipeline (per kit) — the real work

- **GLB** authored at **true metric scale** in Blender (metric units, 1 unit = 1 m) so `ar-scale="fixed"` places it life-size. Verify bounding box matches the physical print's target dimensions.
- **USDZ** — `<model-viewer>` does **not** auto-convert. Produce it from the same source (Mac: Reality Converter; or `usdzconvert` / Apple `usd_from_gltf`).
- Host both per kit (Vercel static or CDN). Keep file sizes lean — decimate/compress for mobile download over cellular.

---

## Acceptance criteria

- [ ] Scanning a kit's QR opens `/ar/<id>` and shows the model in an orbitable viewer.
- [ ] On a real iPhone (Safari, over HTTPS): tapping the CTA opens Quick Look and places the model **at real scale** on the floor.
- [ ] On a real Android (Chrome): tapping the CTA opens Scene Viewer and places the model at real scale.
- [ ] Desktop shows the 3D viewer + "open on your phone" hint, no broken AR button.
- [ ] Dimension callouts and readouts reflect the kit record.
- [ ] Unknown kit id is handled gracefully.
- [ ] Adding a new kit requires only: 1 registry entry + 2 hosted files + 1 generated QR.

---

## Known gotchas

- AR **will not launch inside an iframe/embedded preview** — always test on a real device against the deployed HTTPS URL.
- Quick Look silently fails on a malformed/missing USDZ — validate each USDZ opens standalone on iOS first.
- Pin the `@google/model-viewer` version; custom-element + SSR interactions are version-sensitive.
- Serve models with correct MIME types or Scene Viewer/Quick Look may refuse them.
- If models are cross-origin, set CORS headers on the model host.

---

## Out of scope (v2 candidates)

- **Scale slider + live print estimate** (filament/time recompute) — turns preview into a print-decision tool. Bolts onto the readout row.
- Marker-anchored AR (model pinned to the physical card) — needs 8th Wall / MindAR.
- Physical-part recognition ("verify you have all the pieces") — needs native ARKit object detection.
- Scan analytics / per-kit view counts.
