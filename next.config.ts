import type { NextConfig } from "next";

// Serve self-hosted model files with the MIME types AR viewers require.
// Scene Viewer (Android) / Quick Look (iOS) may refuse a model with the wrong
// Content-Type. Range support (Accept-Ranges) helps Quick Look stream USDZ.
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/models/:path*.glb",
        headers: [
          { key: "Content-Type", value: "model/gltf-binary" },
          { key: "Accept-Ranges", value: "bytes" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/models/:path*.usdz",
        headers: [
          { key: "Content-Type", value: "model/vnd.usdz+zip" },
          { key: "Accept-Ranges", value: "bytes" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
