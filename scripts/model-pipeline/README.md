# Model pipeline: STL → GLB + USDZ

Converts a print STL into the two web-AR assets a kit needs, at true metric
scale. Requires **Blender 4.2+** (uses the native STL importer and USD exporter).

Assumes the STL is authored in **millimetres** (standard for 3D-print STLs).

## 1. STL → GLB (Android / WebXR)

Scales mm→m, converts Z-up→Y-up, centres the model on the floor, decimates to a
mobile-friendly triangle budget, applies a neutral print-gray material, and
exports a Draco-compressed GLB.

```bash
blender --background --factory-startup \
  --python scripts/model-pipeline/stl_to_glb.py -- \
  "/path/to/model.stl" \
  "public/models/<kit-id>/<kit-id>.glb" \
  150000   # target triangle count (optional, default 150000)
```

The script prints the final GLB dimensions in metres — multiply by 1000 to get
the `dims` (w/d/h in mm) for the registry entry. (X→w, Y→h/height, Z→d.)

## 2. GLB → USDZ (iOS Quick Look)

Re-imports the finished GLB and exports a Quick Look-shaped USDZ (Y-up,
`metersPerUnit = 1`, `.usdc` stored uncompressed as the first zip member).

```bash
blender --background --factory-startup \
  --python scripts/model-pipeline/glb_to_usdz.py -- \
  "public/models/<kit-id>/<kit-id>.glb" \
  "public/models/<kit-id>/<kit-id>.usdz"
```

USDZ does not support mesh compression, so it will be larger than the GLB
(the geometry ships uncompressed). Decimate harder in step 1 if the USDZ is too
heavy for cellular.

## 3. Wire it up

1. Add a `KITS` entry in `lib/kits.ts` with `glb`/`usdz` = `/models/<kit-id>/…`
   and the `dims` from step 1.
2. `npm run qr` to generate the QR.
3. MIME types for `/models/**` are already set in `next.config.ts`.

## Notes / gotchas

- **Verify on a real device.** Quick Look fails silently on a malformed USDZ —
  open `<kit-id>.usdz` standalone on an iPhone before trusting it.
- **Color/material:** the script applies a flat neutral gray. Edit the
  `Base Color` in `stl_to_glb.py` for a different filament look (STL carries no
  color of its own).
- **Orientation:** assumes the STL's +Z is the model's up. If a model imports
  lying down, it was authored Y-up — rotate before export.
- Blender emits a `Material.use_nodes` deprecation warning on 5.x; harmless.
