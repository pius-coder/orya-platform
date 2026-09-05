import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    // Emit a self-contained server (.next/standalone) so the Docker runtime image
    // ships only the files it needs — no full node_modules.
    output: "standalone",
    reactCompiler: true,
};

export default nextConfig;
