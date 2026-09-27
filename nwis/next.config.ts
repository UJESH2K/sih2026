import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // deck.gl's interleaved MapboxOverlay cannot re-attach to the same WebGL
  // context when StrictMode double-mounts effects in development.
  reactStrictMode: false,
  devIndicators: false,
};

export default nextConfig;
