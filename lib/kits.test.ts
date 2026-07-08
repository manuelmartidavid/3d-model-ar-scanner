import { describe, it, expect } from "vitest";
import { KITS, DEFAULT_KIT_ID, getKit, resolveKit, footprint, dimLabel } from "@/lib/kits";

describe("registry", () => {
  it("has the seed astronaut kit with required fields", () => {
    const k = KITS["astronaut"];
    expect(k).toBeDefined();
    expect(k.id).toBe("astronaut");
    expect(k.glb).toMatch(/\.glb($|\?)/);
    expect(k.usdz).toMatch(/\.usdz($|\?)/);
    expect(k.dims).toEqual({ w: 470, d: 300, h: 1780 });
    expect(k.printTime).toBe("18h 40m");
    expect(k.filament).toBe("312 g");
  });
});

describe("getKit", () => {
  it("returns the kit for a known id", () => {
    expect(getKit("astronaut")?.id).toBe("astronaut");
  });
  it("is case-insensitive", () => {
    expect(getKit("ASTRONAUT")?.id).toBe("astronaut");
  });
  it("returns null for an unknown id", () => {
    expect(getKit("nope")).toBeNull();
  });
});

describe("resolveKit", () => {
  it("resolves a known id without fallback", () => {
    const r = resolveKit("astronaut");
    expect(r.kit.id).toBe("astronaut");
    expect(r.requestedId).toBe("astronaut");
    expect(r.isFallback).toBe(false);
  });
  it("falls back to default for unknown id and preserves the requested id", () => {
    const r = resolveKit("banana");
    expect(r.kit.id).toBe(DEFAULT_KIT_ID);
    expect(r.requestedId).toBe("banana");
    expect(r.isFallback).toBe(true);
  });
  it("falls back for an empty/undefined param", () => {
    expect(resolveKit(undefined).isFallback).toBe(true);
    expect(resolveKit(undefined).kit.id).toBe(DEFAULT_KIT_ID);
  });
});

describe("formatting", () => {
  it("formats footprint from width and depth", () => {
    expect(footprint(KITS["astronaut"])).toBe("470 × 300 mm");
  });
  it("formats a single dimension label", () => {
    expect(dimLabel(470)).toBe("470 mm");
  });
});
