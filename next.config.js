/** @type {import('next').NextConfig} */
const nextConfig = {
  // React 19 compiler (moved from experimental in Next.js 16)
  reactCompiler: true,
  
  // Next.js 16 experimental features
  experimental: {
    // Use new caching strategy
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Turbopack configuration - fixed
  turbopack: {
    // Specify correct root to avoid lockfile warning
    root: process.cwd(),
    resolveAlias: {
      '@': './app',
    },
  },
}

module.exports = nextConfig;

