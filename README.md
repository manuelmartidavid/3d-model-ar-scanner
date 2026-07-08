# QR → AR Kit Preview

Scanning a 3D-print kit's QR code opens `/ar/<kit-id>`, a page that previews the
finished model in AR at true real-world scale in the user's room. It's web-only —
no native app, no install — powered by Google `<model-viewer>`, which routes to
AR Quick Look on iOS, Scene Viewer on Android, and WebXR where available.

## Commands

```bash
npm install      # install dependencies
npm run dev      # start the Next.js dev server at http://localhost:3000
npm test         # run the Vitest test suite
npm run qr       # generate a QR code (PNG + SVG) per kit into public/qr/
```

`npm run qr` encodes `${BASE_URL}/ar/<kit-id>` for every entry in the kit
registry. `BASE_URL` defaults to `http://localhost:3000`; set it to the
deployed HTTPS origin when generating production QR codes, e.g.:

```bash
BASE_URL=https://your-domain.example npm run qr
```

## Adding a kit

Adding a new kit requires exactly three steps:

1. **Add one entry to `KITS` in `lib/kits.ts`** with hosted `glb` and `usdz`
   URLs and `dims` (width/depth/height in millimetres). The GLB must be
   authored at true metric scale (1 unit = 1 m) so `ar-scale="fixed"` places
   it life-size.
2. **Host the two model files** (Vercel static assets or a CDN) with the
   correct MIME types: `.glb` → `model/gltf-binary`, `.usdz` →
   `model/vnd.usdz+zip`. If the files are cross-origin, set CORS headers on
   the model host.
3. **Run `npm run qr`** to generate that kit's QR code into `public/qr/`.

No other code changes are needed — the `/ar/[kit]` route resolves the kit
param against the registry automatically.

## Verifying AR on-device

AR will not launch inside an iframe or embedded preview. After deploying:

- Validate each kit's USDZ opens standalone on a real iPhone (Safari) via
  AR Quick Look, placing the model at real scale on the floor.
- Validate each kit's GLB opens via Scene Viewer on a real Android device
  (Chrome), placing the model at real scale.
- Do both checks against the deployed HTTPS URL, not localhost or a preview
  embed.

## Out of scope (v2 candidates)

Scale slider with live print-time/filament recompute, marker-anchored AR
(model pinned to the physical card), physical-part recognition, and scan
analytics are explicitly out of scope for this build.
