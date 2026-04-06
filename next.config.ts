import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // HTTP 응답 gzip 압축 활성화
  compress: true,

  // 이미지 최적화 설정
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24시간 캐시
    deviceSizes: [390, 640, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 64, 128, 256],
  },

  // 프로덕션 빌드 최적화
  compiler: {
    // 프로덕션에서 console.log 제거
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 패키지 임포트 최적화 (tree-shaking 강화)
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
