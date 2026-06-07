import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Client-side Router Cache: reuse a visited page's payload for N seconds so
    // back/forward and quick re-visits are instant (no server round-trip).
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
