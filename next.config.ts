import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 確保 Turbopack 正確處理外部依賴
    externalDir: true,
  },
  // 確保靜態資源正確處理
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma-generated/**/*'],
  },
};

export default nextConfig;
