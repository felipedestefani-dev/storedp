import type { NextConfig } from 'next'
import { fileURLToPath } from 'node:url'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Avoid incorrect monorepo root inference when other lockfiles exist.
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
}

export default nextConfig

