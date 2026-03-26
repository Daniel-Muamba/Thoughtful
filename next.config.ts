import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  outputFileTracingIncludes: {
    // Include the seed DB with every API route so it's available in /tmp seeding on Vercel
    "/api/*": ["./src/lib/db.json"],
  },
};

export default nextConfig;
