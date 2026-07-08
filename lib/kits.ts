export type Kit = {
  id: string;
  name: string;
  tagline: string;
  glb: string; // Android / WebXR — authored at true metric scale (1 unit = 1 m)
  usdz: string; // iOS Quick Look
  dims: { w: number; d: number; h: number }; // millimetres — drives on-screen callouts
  printTime: string;
  filament: string;
};

// Add one entry per kit. glb = Android/WebXR, usdz = iOS Quick Look.
// dims in millimetres drive the dimension callouts.
// IMPORTANT: author the GLB at true real-world scale so ar-scale="fixed" places it life-size.
export const KITS: Record<string, Kit> = {
  astronaut: {
    id: "astronaut",
    name: "Orbital Astronaut",
    tagline: "1:1 scale — see it stand in your room before you commit the filament.",
    glb: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    usdz: "https://modelviewer.dev/shared-assets/models/Astronaut.usdz",
    dims: { w: 470, d: 300, h: 1780 },
    printTime: "18h 40m",
    filament: "312 g",
  },
};

export const DEFAULT_KIT_ID = "astronaut";

export function getKit(id: string): Kit | null {
  if (!id) return null;
  return KITS[id.toLowerCase()] ?? null;
}

export function resolveKit(param: string | undefined): {
  kit: Kit;
  requestedId: string;
  isFallback: boolean;
} {
  const requestedId = (param ?? "").toLowerCase();
  const hit = getKit(requestedId);
  if (hit) return { kit: hit, requestedId, isFallback: false };
  return { kit: KITS[DEFAULT_KIT_ID], requestedId, isFallback: true };
}

export function dimLabel(mm: number): string {
  return `${mm} mm`;
}

export function footprint(kit: Kit): string {
  return `${kit.dims.w} × ${kit.dims.d} mm`;
}
