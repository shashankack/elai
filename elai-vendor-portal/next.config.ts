import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin project root so Tailwind/PostCSS resolve from this app, not a parent (e.g. elai_onboard)
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
