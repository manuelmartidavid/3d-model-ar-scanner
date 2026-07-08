"use client";

import { useEffect, useRef, useState } from "react";
import type { Kit } from "@/lib/kits";
import { dimLabel } from "@/lib/kits";
import type { ModelViewerElement } from "@/types/model-viewer";

export default function Viewer({ kit }: { kit: Kit }) {
  const mvRef = useRef<ModelViewerElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [arUnavailable, setArUnavailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // model-viewer is SSR-unsafe: register the custom element only on the client.
    import("@google/model-viewer");
  }, []);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    setArUnavailable(false);
    setProgress(0);
    const mv = mvRef.current;
    if (!mv) return;
    const onProgress = (e: Event) => {
      const detail = (e as CustomEvent<{ totalProgress: number }>).detail;
      setProgress(detail?.totalProgress ?? 0);
    };
    const onLoad = () => {
      if (!mv.canActivateAR) setArUnavailable(true);
    };
    mv.addEventListener("progress", onProgress);
    mv.addEventListener("load", onLoad);
    return () => {
      mv.removeEventListener("progress", onProgress);
      mv.removeEventListener("load", onLoad);
    };
  }, [kit.id]);

  return (
    <>
      <div
        className="loadbar"
        style={{
          width: `${progress * 100}%`,
          opacity: progress < 1 ? 1 : 0,
        }}
      />
      <div className="stage">
        <div className="frame">
          <span className="br1" />
          <span className="br2" />
          <span className="dim dim-w">
            <span className="cap">W</span>
            <span className="v">{dimLabel(kit.dims.w)}</span>
          </span>
          <span className="dim dim-h">
            <span className="cap">H</span>
            <span className="v">{dimLabel(kit.dims.h)}</span>
          </span>
          <span className="dim dim-d">
            <span className="cap">D</span>
            <span className="v">{dimLabel(kit.dims.d)}</span>
          </span>

          <model-viewer
            ref={mvRef}
            src={kit.glb}
            ios-src={kit.usdz}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="fixed"
            ar-placement="floor"
            camera-controls
            touch-action="pan-y"
            {...(reducedMotion ? {} : { "auto-rotate": true })}
            rotation-per-second="16deg"
            interaction-prompt="none"
            shadow-intensity="0.85"
            exposure="1.05"
            environment-image="neutral"
            alt={`3D preview of ${kit.name}`}
          >
            {!arUnavailable && (
              <button slot="ar-button" className="cta" style={{ position: "static" }}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
                  <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
                </svg>
                View in your room
              </button>
            )}
          </model-viewer>
        </div>
      </div>
      {arUnavailable && (
        <p className="hint desk" style={{ display: "block" }}>
          ↳ open this page on your phone to place it at real scale
        </p>
      )}
    </>
  );
}
