import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: { authInterrupts: true },
  devIndicators: false,
};
export default config;
