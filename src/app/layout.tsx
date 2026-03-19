import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  metadataBase: new URL("https://zestpair.com"),
  title: {
    default: "영양제 궁합 분석 & 추천 | ZestPair (비타민 시너지 AI 분석)",
    template: "%s | ZestPair (영양제 궁합)",
  },
  description:
    "ZestPair(제스트페어)는 AI 기반 영양제 궁합 분석 서비스입니다. 내가 먹는 비타민의 조화를 체크하여 효과는 높이고 부작용은 피하세요. 똑똑한 영양 관리를 위한 AI 가이드.",
  keywords: [
    "영양제 궁합",
    "비타민 궁합",
    "영양제 조합",
    "AI 영양제 분석",
    "비타민 상호작용",
    "영양제 조화 분석",
    "제스트페어",
    "ZestPair",
    "Supplement Synergy",
    "Vitamin Interaction Checker",
    "Supplement Compatibility Check",
    "AI Supplement Analysis",
    "Drug Interactions",
    "Personalized Nutrition Guide",
  ],
  authors: [{ name: "ZestPair AI" }],
  creator: "ZestPair Team",
  publisher: "ZestPair AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "ZestPair",
    title: "ZestPair | AI 기반 영양제 궁합 분석 & 시너지 체크",
    description: "내 영양제, 제대로 먹고 있을까요? AI가 분석하는 실시간 영양제 궁합과 최적의 조합 추천.",
    images: [
      {
        url: "/hero-illustration.png",
        width: 1200,
        height: 630,
        alt: "ZestPair AI 영양제 궁합 분석",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZestPair | AI 기반 영양제 궁합 분석 & 시너지 체크",
    description: "AI로 확인하는 비타민 상호작용과 똑똑한 영양제 조합.",
    images: ["/hero-illustration.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "GOOGLE_VERIFICATION_CODE",
    other: {
      "naver-site-verification": "NAVER_VERIFICATION_CODE",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#10b981",
};

import ScrollToTop from "@/components/ScrollToTop";
import LanguageDetector from "@/components/LanguageDetector";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Pretendard: modern, premium Korean/English optimized font */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="antialiased font-sans bg-white" suppressHydrationWarning>
        <LanguageDetector />
        <TooltipProvider delayDuration={300}>

          <main className="relative">
            {children}
          </main>

        </TooltipProvider>
      </body>
    </html>
  );
}
