import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    resolveAlias: {
      "mapbox-gl": "mapbox-gl/dist/mapbox-gl.js",
    },
  },
};

export default nextConfig;
